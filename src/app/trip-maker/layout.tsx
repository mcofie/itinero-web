// src/app/trip-maker/layout.tsx
"use client";

import * as React from "react";
import AppShell from "@/components/layout/AppShell";
import { createClientBrowser } from "@/lib/supabase/browser";

export default function TripMakerLayout({ children }: { children: React.ReactNode }) {
    // If you also want to show the email in AppShell:
    const sb = createClientBrowser();
    const [email, setEmail] = React.useState<string | null>(null);

    React.useEffect(() => {
        (async () => {
            const { data } = await sb.auth.getUser();
            setEmail(data.user?.email ?? null);
        })();
    }, [sb]);

    return <AppShell userEmail={email}>{children}</AppShell>;
}