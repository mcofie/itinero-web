
import * as React from "react";
import { createClientServerRSC } from "@/lib/supabase/server";
import DestinationsClient from "./DestinationsClient";
import { DestinationOption } from "../types";

export const dynamic = "force-dynamic";

export default async function DestinationsPage() {
    const sb = await createClientServerRSC();

    // Fetch destinations
    const { data: destRows } = await sb
        .schema("itinero")
        .from("destinations")
        .select(
            "id,name,country_code,lat,lng,cover_url,image_attribution,current_history_id,timezone,category,popularity"
        )
        .order("name", { ascending: true })
        .returns<DestinationOption[]>();

    return (
        <DestinationsClient initialDestinations={destRows ?? []} />
    );
}
