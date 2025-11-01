// app/auth/callback/page.tsx
"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {createClientBrowser} from "@/lib/supabase/browser";
import {Loader2} from "lucide-react";

export default function AuthCallback() {
    const sb = createClientBrowser();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            // wait for Supabase to parse URL/hash & hydrate the session
            await sb.auth.getSession();
            router.replace("/preview");
            router.refresh();
            // hard fallback if router is stubborn
            setTimeout(() => (window.location.href = "/preview"), 150);
        })();
    }, [sb, router]);

    return (
        <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin"/> Finishing sign-in…
            </div>
        </div>
    );
}