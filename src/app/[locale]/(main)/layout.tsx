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

    let avatarUrl: string | null = null;
    let fullName: string | null = null;

    if (user) {
        const { data: profile } = await sb
            .schema("itinero")
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", user.id)
            .maybeSingle();

        // 1) Set defaults from metadata
        avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;

        // 2) Override with DB if row exists
        if (profile) {
            avatarUrl = profile.avatar_url ?? avatarUrl;
            fullName = profile.full_name ?? fullName;
        }
    }

    return (
        <AppShell
            userEmail={user?.email ?? null}
            avatarUrl={avatarUrl}
            fullName={fullName}
        >
            {children}
        </AppShell>
    );
}
