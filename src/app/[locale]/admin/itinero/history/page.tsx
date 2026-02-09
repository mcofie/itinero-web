
import * as React from "react";
import { createClientServerRSC } from "@/lib/supabase/server";
import HistoryClient from "./HistoryClient";
import { DestinationOption } from "../types";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
    const sb = await createClientServerRSC();

    // Fetch destinations
    const { data: destRows } = await sb
        .schema("itinero")
        .from("destinations")
        .select(
            "id,name,country_code"
        )
        .order("name", { ascending: true })
        .returns<DestinationOption[]>();

    return (
        <HistoryClient
            initialDestinations={destRows ?? []}
        />
    );
}
