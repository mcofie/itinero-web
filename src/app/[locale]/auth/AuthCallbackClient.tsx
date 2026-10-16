// app/auth/callback/AuthCallbackClient.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";

export default function AuthCallbackClient() {
    const params = useSearchParams();

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

            // If the provider returned an error in the URL, bail nicely
            if (error) {
                console.error("OAuth error:", error);
                window.location.replace(`${errorDestination}?error=${encodeURIComponent(error)}${errorNext}`);
                return;
            }

            // The browser client exchanges ?code= for a session by itself when it starts
            // (detectSessionInUrl). getSession() waits for that. Exchanging the same code again
            // races it: a code works once, so the loser failed and sent signed-in people to an
            // error page. Only exchange here if the client didn't.
            let { data: { session } } = await sb.auth.getSession();
            if (!session && code) {
                const { data, error: exchangeError } = await sb.auth.exchangeCodeForSession(code);
                if (exchangeError) console.error("exchangeCodeForSession failed", exchangeError);
                session = data.session;
            }
            if (!session) {
                window.location.replace(`${errorDestination}?error=auth_failed${errorNext}`);
                return;
            }

            // A full page load, so the next page renders with the new session rather than a
            // cached signed-out version.
            window.location.replace(next);
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
