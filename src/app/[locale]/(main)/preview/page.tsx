import { createClientServerRSC } from "@/lib/supabase/server"; // <-- server-side supabase helper
import PreviewClient from "./PreviewClient";
import { redirect } from "next/navigation"; // client-only child

const REQUIRED_POINTS_TO_SAVE = 100;

export const dynamic = "force-dynamic";

export default async function PreviewPage() {
    const sb = await createClientServerRSC();

    // Auth (server-side)
    const {
        data: { user },
    } = await sb.auth.getUser();

    if (!user) redirect("/login");

    // Points balance (server)
    let points: number | null = null;
    try {
        const { data: rpcBalance } = await sb.rpc("get_points_balance");
        if (typeof rpcBalance === "number") points = rpcBalance;
    } catch {
        // best-effort; keep null (client will still work)
    }

    // We cannot read preview from localStorage on the server,
    // so we render a minimal SSR shell and let the client load preview.
    // We cannot read preview from localStorage on the server,
    // so we render a minimal SSR shell and let the client load preview.
    return (
        /* Updated Theme-Aware Container */
        <div
            className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
            {/* Client component: loads preview from localStorage, renders everything,
            runs the 10s countdown, and shows a theme-aware paywall (no blur). */}
            <PreviewClient
                requiredPoints={REQUIRED_POINTS_TO_SAVE}
                initialPoints={points}
            />
        </div>
    );
}