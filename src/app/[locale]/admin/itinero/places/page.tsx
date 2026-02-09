
import * as React from "react";
import { createClientServerRSC } from "@/lib/supabase/server";
import PlacesClient from "./PlacesClient";
import { DestinationOption, PlaceOption } from "../types";

export const dynamic = "force-dynamic";

export default async function PlacesPage() {
    const sb = await createClientServerRSC();

    // Fetch destinations for dropdowns
    const { data: destRows } = await sb
        .schema("itinero")
        .from("destinations")
        .select(
            "id,name,country_code"
        )
        .order("name", { ascending: true })
        .returns<DestinationOption[]>();

    // Fetch places
    const { data: placeRows } = await sb
        .schema("itinero")
        .from("places")
        .select(
            "id,name,category,lat,lng,tags,description,destination_id,popularity,cost_typical,cost_currency,kind,url,booking_url,is_partner"
        )
        .order("name", { ascending: true })
        .returns<PlaceOption[]>();

    return (
        <PlacesClient
            initialDestinations={destRows ?? []}
            initialPlaces={placeRows ?? []}
        />
    );
}
