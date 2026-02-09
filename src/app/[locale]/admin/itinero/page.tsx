// app/admin/itinero/page.tsx
import * as React from "react";
// import { redirect } from "next/navigation";
import { createClientServerRSC } from "@/lib/supabase/server";
import ItineroDashboardClient from "./ItineroDashboardClient";
import { DestinationOption, PlaceOption } from "./types";

export const dynamic = "force-dynamic";

export default async function ItineroAdminPage() {
    const sb = await createClientServerRSC();

    // Fetch minimal lists for selects
    const { data: destRows } = await sb
        .schema("itinero")
        .from("destinations")
        .select(
            "id,name,country_code,lat,lng,cover_url,image_attribution,current_history_id,timezone,category,popularity"
        )
        .order("name", { ascending: true })
        .returns<DestinationOption[]>();

    const { data: placeRows } = await sb
        .schema("itinero")
        .from("places")
        .select(
            "id,name,category,lat,lng,tags,description,destination_id,popularity,cost_typical,cost_currency,kind,url,booking_url,is_partner"
        )
        .order("name", { ascending: true })
        .returns<PlaceOption[]>();

    const { data: userData } = await sb.auth.getUser();
    const user = userData?.user;

    return (
        <ItineroDashboardClient
            initialDestinations={destRows ?? []}
            initialPlaces={placeRows ?? []}
            adminDetails={{
                email: user?.email || "",
                name: user?.user_metadata?.full_name || "Admin"
            }}
        />
    );
}