import { createClientServerRSC } from "@/lib/supabase/server";
import CreatorsClient, { CreatorStat } from "./CreatorsClient";

export const dynamic = "force-dynamic";

export default async function CreatorsPage() {
    const sb = await createClientServerRSC();

    // 1. Fetch all trips (columns: user_id only needed for grouping, plus created_at for stats)
    // We fetch minimal data to be efficient.
    const { data: trips, error } = await sb
        .schema("itinero")
        .from("trips")
        .select("user_id, created_at") as { data: { user_id: string; created_at: string }[] | null; error: any };

    if (error) {
        console.error("Error fetching trips:", error);
    }

    // Group by user
    const stats: Record<string, { count: number; lastDate: string }> = {};
    trips?.forEach((t) => {
        const uid = t.user_id;
        if (!uid) return;
        if (!stats[uid]) stats[uid] = { count: 0, lastDate: t.created_at };
        stats[uid].count++;
        // Track latest trip date
        if (new Date(t.created_at) > new Date(stats[uid].lastDate)) {
            stats[uid].lastDate = t.created_at;
        }
    });

    // 2. Fetch profiles for these users
    const userIds = Object.keys(stats);
    let profilesMap: Record<string, any> = {};

    if (userIds.length > 0) {
        const { data: profiles } = await sb
            .schema("itinero")
            .from("profiles")
            .select("id, full_name, username, avatar_url")
            .in("id", userIds);

        profiles?.forEach((p: any) => {
            profilesMap[p.id] = p;
        });
    }

    // 3. Assemble rows
    const rows: CreatorStat[] = userIds.map(uid => {
        const p = profilesMap[uid];
        return {
            userId: uid,
            fullName: p?.full_name || null,
            username: p?.username || null,
            avatarUrl: p?.avatar_url || null,
            tripCount: stats[uid].count,
            lastTripDate: stats[uid].lastDate,
        };
    }).sort((a, b) => b.tripCount - a.tripCount); // Sort by most prolific

    return <CreatorsClient creators={rows} />;
}
