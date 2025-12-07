// app/admin/itinero/page.tsx
import * as React from "react";
import { redirect } from "next/navigation";
import { createClientServerRSC } from "@/lib/supabase/server";
import ItineroDashboardClient, {
    DestinationOption,
    PlaceOption,
} from "./ItineroDashboardClient";

export const dynamic = "force-dynamic";

export default async function ItineroAdminPage() {
    const sb = await createClientServerRSC();
    const {
        data: { user },
    } = await sb.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && user.email !== adminEmail) {
        redirect("/");
    }

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

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <h1 className="mb-2 text-2xl font-semibold">Itinero Admin</h1>
            <p className="mb-6 text-sm text-muted-foreground">
                Manage destinations, destination history and places used by the planner.
            </p>
            <ItineroDashboardClient
                initialDestinations={destRows ?? []}
                initialPlaces={placeRows ?? []}
            />
        </div>
    );
}