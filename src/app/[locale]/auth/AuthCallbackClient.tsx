// app/auth/callback/AuthCallbackClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";

export default function AuthCallbackClient() {
    const params = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const code = params.get("code");
        const error = params.get("error");
        // Email links can open in a new tab, so the destination is also kept in localStorage.
        const requestedNext = params.get("next") || window.sessionStorage.getItem("itinero-auth-next") || window.localStorage.getItem("itinero-auth-next") || "/photobooks";
        window.sessionStorage.removeItem("itinero-auth-next");
        window.localStorage.removeItem("itinero-auth-next");
        const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/photobooks";
        const errorDestination = next.startsWith("/make-album") || next.startsWith("/photobooks")
            ? "/album-login" : "/login";
        const errorNext = errorDestination === "/album-login" ? `&next=${encodeURIComponent(next)}` : "";

        const run = async () => {
            const sb = getSupabaseBrowser();

            // If OAuth provider returned an error in the URL, bail nicely
            if (error) {
                console.error("OAuth error:", error);
                router.replace(`${errorDestination}?error=${encodeURIComponent(error)}${errorNext}`);
                return;
            }

            // Exchange the code for a session (Supabase)
            if (code) {
                try {
                    const { error: exchangeError } = await sb.auth.exchangeCodeForSession(code);
                    if (exchangeError) throw exchangeError;
                } catch (e) {
                    console.error("exchangeCodeForSession failed", e);
                    router.replace(`${errorDestination}?error=auth_failed${errorNext}`);
                    return;
                }
            }

            // Send the user on their way
            router.replace(next);
        };

        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Simple loading state while we exchange code & redirect
    return (
        <div className="mx-auto max-w-md p-8 text-center">
            <div className="text-lg font-semibold">Signing you in…</div>
            <p className="mt-2 text-sm text-muted-foreground">
                Please wait while we complete your sign-in.
            </p>
        </div>
    );
}
