import * as React from "react";
import AppShell from "@/components/layout/AppShell";
import { createClientServerRSC } from "@/lib/supabase/server";

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const sb = await createClientServerRSC();
    const { data: { user } } = await sb.auth.getUser();

    return (
        <AppShell userEmail={user?.email ?? null}>
            {children}
        </AppShell>
    );
}
