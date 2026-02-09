"use server";

import { createClientServerRSC } from "@/lib/supabase/server";

export async function getLandingStatsAction() {
    try {
        const sb = await createClientServerRSC();

        // 1. Countries (Unique country_code in destinations)
        const { data: countriesData, error: countriesError } = await sb
            .schema("itinero")
            .from("destinations")
            .select("country_code");

        if (countriesError) console.error("Error fetching countries stats:", countriesError);
        const uniqueCountries = new Set(countriesData?.map(d => d.country_code).filter(Boolean)).size;

        // 2. Itineraries (Total trips)
        const { count: tripCount, error: tripsError } = await sb
            .schema("itinero")
            .from("trips")
            .select("id", { count: "exact", head: true });

        if (tripsError) console.error("Error fetching trips stats:", tripsError);

        // 3. Travelers (Total profiles)
        const { count: profileCount, error: profilesError } = await sb
            .schema("itinero")
            .from("profiles")
            .select("id", { count: "exact", head: true });

        if (profilesError) console.error("Error fetching profiles stats:", profilesError);

        return {
            countries: Math.max(uniqueCountries || 0, 0),
            itineraries: Math.max(tripCount ?? 0, 0),
            travelers: Math.max(profileCount ?? 0, 0),
            rating: 4.9,
        };
    } catch (e) {
        console.error("Critical error in getLandingStatsAction:", e);
        return {
            countries: 120,
            itineraries: 50000,
            travelers: 1000000,
            rating: 4.9,
        };
    }
}
