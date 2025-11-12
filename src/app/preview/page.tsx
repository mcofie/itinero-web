// app/preview/page.tsx
import Image from "next/image";
import {cookies} from "next/headers";
import {createClientServer, createClientServerRSC} from "@/lib/supabase/server"; // <-- server-side supabase helper
import AppShell from "@/components/layout/AppShell";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {CalendarDays, MapPin, DollarSign, Clock3} from "lucide-react";
import PreviewClient from "./PreviewClient";
import {redirect} from "next/navigation"; // client-only child

const HERO_FALLBACK =
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop";

const REQUIRED_POINTS_TO_SAVE = 100;

export default async function PreviewPage() {
    const sb = await createClientServerRSC();

    // Auth (server-side)
    const {
        data: {user},
    } = await sb.auth.getUser();

    if (!user) redirect("/login");


    // Points balance (server)
    let points: number | null = null;
    try {
        const {data: rpcBalance} = await sb.rpc("get_points_balance");
        if (typeof rpcBalance === "number") points = rpcBalance;
    } catch {
        // best-effort; keep null (client will still work)
    }

    // We cannot read preview from localStorage on the server,
    // so we render a minimal SSR shell and let the client load preview.
    return (
        <AppShell userEmail={user.email ?? null}>
            <div className="min-h-dvh bg-background text-foreground">

                {/* Client component: loads preview from localStorage, renders everything,
            runs the 10s countdown, and shows a theme-aware paywall (no blur). */}
                <PreviewClient requiredPoints={REQUIRED_POINTS_TO_SAVE} initialPoints={points}/>
            </div>
        </AppShell>
    );
}