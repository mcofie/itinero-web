// app/auth/callback/page.tsx
import {Suspense} from "react";
import AuthCallbackClient from "../AuthCallbackClient";
import AlbumMessage from "@/components/album/AlbumMessage";

// This page depends on runtime URL params; don’share prerender it.
export const dynamic = "force-dynamic";
// (optional) if you use caching elsewhere, ensure this stays live:
// export const revalidate = 0;

export default function AuthCallback() {
    return (
        <Suspense fallback={<AlbumMessage note="one moment" title="Signing you in…" />}>
            <AuthCallbackClient/>
        </Suspense>
    );
}