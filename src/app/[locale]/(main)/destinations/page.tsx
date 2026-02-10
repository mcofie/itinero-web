import * as React from "react";
import { createClientServerRSC } from "@/lib/supabase/server";
import DestinationsClient, { Destination } from "./DestinationsClient";

export const dynamic = "force-dynamic";

export default async function DestinationsPage() {
    const sb = await createClientServerRSC();

    // Fetch destinations from the DB
    const { data: destRows } = await sb
        .schema("itinero")
        .from("destinations")
        .select("id, name, cover_url, category, popularity, country_code")
        .order("popularity", { ascending: false });

    const destinations: Destination[] = (destRows || []).map(row => ({
        id: row.id,
        name: row.name || "Unknown",
        image: row.cover_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
        status: (row.popularity || 0) > 0 ? "active" : "coming_soon",
        description: row.category || "Explore the wonders of this beautiful destination.",
        countryCode: row.country_code
    }));

    return <DestinationsClient destinations={destinations} />;
}