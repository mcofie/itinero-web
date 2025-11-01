"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/browser";

export default function AuthCallback() {
    const sb = createClientBrowser();
    const router = useRouter();
    const sp = useSearchParams();

    useEffect(() => {
        (async () => {
            // If Supabase already exchanged, there will be *no* error/callback code and you’ll already be signed in.
            // If there’s an error from Supabase, it comes in the URL — handle it for debugging:
            const err = sp.get("error");
            const desc = sp.get("error_description");

            if (err) {
                console.error("[auth-callback] error:", err, desc);
                // optionally show a toast
                router.replace("/login");
                return;
            }

            // For SSR-safe exchange when Supabase sends code directly to your app:
            await sb.auth.exchangeCodeForSession(window.location.href).catch(() => { /* already exchanged is fine */ });

            router.replace("/preview");
            router.refresh();
        })();
    }, [sb, router, sp]);

    return null;
}