"use server";

export async function getLandingStatsAction() {
    return {
        countries: 120,
        itineraries: 50000,
        travelers: 1000000,
        rating: 4.9,
    };
}
