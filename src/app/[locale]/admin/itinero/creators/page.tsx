
import { createClientServerRSC } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import CreatorsClient, { CreatorStat } from "./CreatorsClient";

export const dynamic = "force-dynamic";


export default async function CreatorsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; size?: string; filter?: string }>;
}) {
    const { page: pageStr, size: sizeStr, filter } = await searchParams;
    const page = Math.max(1, parseInt(pageStr || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(sizeStr || "20")));
    const offset = (page - 1) * pageSize;

    const sb = await createClientServerRSC();
    const adminSb = createAdminClient(); // Added admin client
    const fetchClient = adminSb || sb; // Use admin client if available, otherwise standard client

    // To implement "inactive" (0 trips) or "active" (>0 trips) filtering server-side
    // without a View, we can use a select with count and filter if possible,
    // but its often easier to fetch slightly more and filter, or use an RPC.
    // For now, let's try a clever select.

    let query = fetchClient // Changed sb to fetchClient
        .schema("itinero")
        .from("profiles")
        .select(`
            id, 
            full_name, 
            username, 
            avatar_url, 
            points_balance,
            trips:trips(count)
        `, { count: "exact" });

    // Note: Supabase doesn't support .gt("trips.count", 0) directly in JS filters.
    // One workaround for "Active" is to query the trips table instead and join profiles.
    // However, for "Inactive", we'll just sort and filter in code if count is low, 
    // or ideally use a negative join if we had SQL.

    // For "Active" filter, we perform a different query to ensure we only get creators
    if (filter === "active") {
        const { data: creatorIdsData } = await fetchClient
            .schema("itinero")
            .from("trips")
            .select("user_id");

        const creatorIds = Array.from(new Set(creatorIdsData?.map(t => t.user_id) || []));
        if (creatorIds.length > 0) {
            query = query.in("id", creatorIds);
        } else {
            // No creators exist at all
            return <CreatorsClient creators={[]} totalCount={0} currentPage={page} pageSize={pageSize} />;
        }
    } else if (filter === "inactive") {
        const { data: creatorIdsData } = await fetchClient
            .schema("itinero")
            .from("trips")
            .select("user_id");

        const creatorIds = Array.from(new Set(creatorIdsData?.map(t => t.user_id) || []));
        if (creatorIds.length > 0) {
            // Using array instead of manual string formatting for safer Supabase query
            query = query.not("id", "in", creatorIds);
        }
    }

    const { data: rawUsers, count, error } = await query
        .order("points_balance", { ascending: false })
        .range(offset, offset + pageSize - 1);

    if (error) {
        console.error("Error fetching creators:", JSON.stringify(error, null, 2));
    }


    const userIds = rawUsers?.map(u => u.id) || [];
    let ledgerBalanceMap = new Map<string, number>();

    if (userIds.length > 0) {
        const { data: ledgerEntries } = await fetchClient
            .schema("itinero")
            .from("points_ledger")
            .select("user_id, delta")
            .in("user_id", userIds);

        ledgerEntries?.forEach(entry => {
            const current = ledgerBalanceMap.get(entry.user_id) || 0;
            ledgerBalanceMap.set(entry.user_id, current + (entry.delta || 0));
        });
    }

    // 2. Assemble rows
    const rows: CreatorStat[] = (rawUsers || []).map((u: any) => {
        const tripCount = Array.isArray(u.trips) ? (u.trips[0]?.count || 0) : (u.trips?.count || 0);

        return {
            userId: u.id,
            fullName: u.full_name,
            username: u.username,
            avatarUrl: u.avatar_url,
            tripCount: tripCount,
            points: ledgerBalanceMap.get(u.id) ?? u.points_balance ?? 0,
        };
    });

    return (
        <CreatorsClient
            creators={rows}
            totalCount={count || 0}
            currentPage={page}
            pageSize={pageSize}
        />
    );
}

