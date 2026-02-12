
import * as React from "react";
import { createClientServerRSC } from "@/lib/supabase/server";
import ItineroDashboardClient from "./ItineroDashboardClient";
import { DestinationOption, PlaceOption } from "./types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminItineroPage() {
    const sb = await createClientServerRSC();

    const {
        data: { user },
    } = await sb.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    // Fetch Destinations
    const { data: destinationsData, error: destError } = await sb
        .schema("itinero")
        .from("destinations")
        .select("*")
        .order("name", { ascending: true });

    if (destError) {
        console.error("Error fetching destinations:", destError);
    }

    // Fetch Places
    const { data: placesData, error: placesError } = await sb
        .schema("itinero")
        .from("places")
        .select("*")
        .limit(2000); // Reasonable limit for now

    if (placesError) {
        console.error("Error fetching places:", placesError);
    }

    const destinations: DestinationOption[] = (destinationsData as any[])?.map(d => ({
        id: d.id,
        name: d.name,
        country_code: d.country_code,
        lat: d.lat,
        lng: d.lng,
        cover_url: d.cover_url,
        image_attribution: d.image_attribution,
        current_history_id: d.current_history_id,
        timezone: d.timezone,
        category: d.category,
        popularity: d.popularity
    })) || [];

    const places: PlaceOption[] = (placesData as any[])?.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        lat: p.lat,
        lng: p.lng,
        tags: p.tags,
        description: p.description,
        destination_id: p.destination_id,
        popularity: p.popularity,
        cost_typical: p.cost_typical,
        cost_currency: p.cost_currency,
        kind: p.kind,
        url: p.url,
        booking_url: p.booking_url,
        is_partner: p.is_partner
    })) || [];

    const adminDetails = {
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin",
        email: user.email || "",
    };

    return (
        <ItineroDashboardClient
            initialDestinations={destinations}
            initialPlaces={places}
            adminDetails={adminDetails}
        />
    );
}