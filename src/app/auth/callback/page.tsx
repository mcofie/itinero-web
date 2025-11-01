// app/auth/callback/page.tsx
import {Suspense} from "react";
import AuthCallbackClient from "../AuthCallbackClient";

// This page depends on runtime URL params; don’t prerender it.
export const dynamic = "force-dynamic";
// (optional) if you use caching elsewhere, ensure this stays live:
// export const revalidate = 0;

export default function AuthCallback() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-md p-8 text-center">
                    <div className="text-lg font-semibold">Loading…</div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Preparing your session.
                    </p>
                </div>
            }
        >
            <AuthCallbackClient/>
        </Suspense>
    );
}