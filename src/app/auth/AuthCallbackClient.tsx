// app/auth/callback/AuthCallbackClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/browser";

export default function AuthCallbackClient() {
    const params = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const code = params.get("code");
        const error = params.get("error");
        const next = params.get("next") || "/trips";

        const run = async () => {
            const sb = createClientBrowser();

            // If OAuth provider returned an error in the URL, bail nicely
            if (error) {
                console.error("OAuth error:", error);
                router.replace(`/login?error=${encodeURIComponent(error)}`);
                return;
            }

            // Exchange the code for a session (Supabase)
            if (code) {
                try {
                    await sb.auth.exchangeCodeForSession(code);
                } catch (e) {
                    console.error("exchangeCodeForSession failed", e);
                    router.replace("/login?error=auth_failed");
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