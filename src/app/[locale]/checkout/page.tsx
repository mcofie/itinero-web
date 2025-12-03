import * as React from "react";
import {redirect} from "next/navigation";
import {createClientServerRSC} from "@/lib/supabase/server";
import CheckoutClient from "./checkout-client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
                                               searchParams,
                                           }: {
    searchParams: Promise<{ points?: string }>;
}) {
    const sb = await createClientServerRSC();

    // Server-side auth check
    const {
        data: {user},
    } = await sb.auth.getUser();

    if (!user) {
        const params = await searchParams;
        const pointsParam = params?.points ? `?points=${params.points}` : "";
        const returnUrl = encodeURIComponent(`/checkout${pointsParam}`);
        redirect(`/login?next=${returnUrl}`);
    }

    return <CheckoutClient userEmail={user.email ?? ""}/>;
}