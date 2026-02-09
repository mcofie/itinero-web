import { createClientServerRSC } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import CreatorDetailsClient, { CreatorDetails } from "./CreatorDetailsClient";

export const dynamic = "force-dynamic";

export default async function CreatorDetailsPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const sb = await createClientServerRSC();
    const adminSb = createAdminClient();

    // 1. Fetch Profile
    const { data: profile } = await sb
        .schema("itinero")
        .from("profiles")
        .select("id, full_name, username, avatar_url, bio")
        .eq("id", userId)
        .single();

    if (!profile) {
        return notFound();
    }

    // 2. Fetch Auth User (Email & Created At)
    // We use admin client because standard client cannot access auth.users
    const { data: { user: authUser }, error: authError } = await adminSb.auth.admin.getUserById(userId);
    const email = authUser?.email || null;
    const createdAt = authUser?.created_at || null;

    // 3. Fetch Trips
    const { data: trips } = await sb
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
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    // 4. Fetch Points Balance
    let totalPoints = 0;
    const { data: pointsAgg } = await sb
        .schema("itinero")
        .from("points_ledger")
        .select("sum:sum(delta)")
        .eq("user_id", userId)
        .maybeSingle<{ sum: number | null }>();

    if (pointsAgg?.sum) {
        totalPoints = Number(pointsAgg.sum);
    }

    const creatorData: CreatorDetails = {
        id: profile.id,
        fullName: profile.full_name,
        username: profile.username,
        email,
        avatarUrl: profile.avatar_url,
        bio: profile.bio || null,
        joinedAt: createdAt,
        totalPoints,
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
    };

    return <CreatorDetailsClient creator={creatorData} />;
}
