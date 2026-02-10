
import { createClientServerRSC } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import CreatorDetailsClient, { CreatorDetails } from "./CreatorDetailsClient";

export const dynamic = "force-dynamic";

export default async function CreatorDetailsPage({
    params,
    searchParams
}: {
    params: Promise<{ userId: string }>;
    searchParams: Promise<{ tpage?: string; lpage?: string }>;
}) {
    const { userId } = await params;
    const { tpage: tpageStr, lpage: lpageStr } = await searchParams;

    // Pagination for Trips
    const tpage = Math.max(1, parseInt(tpageStr || "1"));
    const tpageSize = 6;
    const tOffset = (tpage - 1) * tpageSize;

    // Pagination for Ledger
    const lpage = Math.max(1, parseInt(lpageStr || "1"));
    const lpageSize = 10;
    const lOffset = (lpage - 1) * lpageSize;

    const sb = await createClientServerRSC();
    const adminSb = createAdminClient();

    // 1. Fetch Profile
    const { data: profile } = await sb
        .schema("itinero")
        .from("profiles")
        .select("id, full_name, username, avatar_url, points_balance")
        .eq("id", userId)
        .single();

    if (!profile) {
        return notFound();
    }

    // 2. Fetch Auth User (Email & Created At)
    let email: string | null = null;
    let createdAt: string | null = null;

    if (adminSb) {
        try {
            const resp = await adminSb.auth.admin.getUserById(userId);
            if (resp && resp.data && resp.data.user) {
                email = resp.data.user.email || null;
                createdAt = resp.data.user.created_at || null;
            }
        } catch (err) {
            console.error("Error fetching auth user via admin client:", err);
        }
    }

    // 3. Fetch Trips (Paginated)
    const { data: trips, count: tripCount } = await sb
        .schema("itinero")
        .from("trips")
        .select(`
            id, 
            title, 
            cover_url, 
            start_date, 
            end_date, 
            est_total_cost, 
            currency, 
            public_id, 
            created_at
        `, { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(tOffset, tOffset + tpageSize - 1);

    // 4. Fetch Ledger (Paginated)
    const { data: ledger, count: ledgerCount } = await sb
        .schema("itinero")
        .from("points_ledger")
        .select("id, delta, reason, ref_type, created_at, meta", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(lOffset, lOffset + lpageSize - 1);

    const creatorData: CreatorDetails = {
        id: profile.id,
        fullName: profile.full_name,
        username: profile.username,
        email,
        avatarUrl: profile.avatar_url,
        bio: null,
        joinedAt: createdAt,
        totalPoints: profile.points_balance || 0,
        trips: (trips || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            startDate: t.start_date,
            endDate: t.end_date,
            isPublic: !!t.public_id,
            publicId: t.public_id,
            estCost: Number(t.est_total_cost || 0),
            currency: t.currency || "GHS",
            coverUrl: t.cover_url,
            createdAt: t.created_at,
        })),
        ledger: (ledger || []).map((l: any) => ({
            id: l.id,
            delta: l.delta,
            reason: l.reason,
            ref_type: l.ref_type,
            created_at: l.created_at,
            meta: l.meta
        })),
    };

    return (
        <CreatorDetailsClient
            creator={creatorData}
            totalTripsCount={tripCount || 0}
            tripsPage={tpage}
            totalLedgerCount={ledgerCount || 0}
            ledgerPage={lpage}
        />
    );
}

