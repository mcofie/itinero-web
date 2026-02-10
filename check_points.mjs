
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkUserPoints() {
    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing env vars");
        return;
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const username = "maxcofie_912";

    // Find the user
    const { data: profiles } = await supabase
        .schema("itinero")
        .from("profiles")
        .select("id, username, points_balance, full_name")
        .or(`username.eq.${username},full_name.ilike.%${username}%`);

    console.log("Profiles found:", profiles);

    if (profiles && profiles.length > 0) {
        const userIds = profiles.map(p => p.id);
        const { data: agg, error } = await supabase
            .schema("itinero")
            .from("points_ledger")
            .select("user_id, sum:delta.sum()")
            .in("user_id", userIds);

        console.log("Aggregate Query Result:", agg);
        console.log("Aggregate Query Error:", error);
    }
}

checkUserPoints();
