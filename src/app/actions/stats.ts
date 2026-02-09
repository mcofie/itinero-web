"use server";

import { createClientServerRSC } from "@/lib/supabase/server";

export async function getLandingStatsAction() {
    const sb = await createClientServerRSC();

    // 1. Countries (Unique country_code in destinations)
    // Note: We might want to just count unique country_code if destinations is high density
    const { data: countriesData } = await sb
        .schema("itinero")
        .from("destinations")
        .select("country_code");

    const uniqueCountries = new Set(countriesData?.map(d => d.country_code).filter(Boolean)).size;

    // 2. Itineraries (Total trips)
    const { count: tripCount } = await sb
        .schema("itinero")
        .from("trips")
        .select("id", { count: "exact", head: true });

    // 3. Travelers (Total profiles)
    const { count: profileCount } = await sb
        .schema("itinero")
        .from("profiles")
        .select("id", { count: "exact", head: true });

    return {
        countries: Math.max(uniqueCountries, 0),
        itineraries: Math.max(tripCount ?? 0, 0),
        travelers: Math.max(profileCount ?? 0, 0),
        rating: 4.9, // Static for now as no reviews table found
    };
}
