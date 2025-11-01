"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {createClientBrowser} from "@/lib/supabase/browser";
import {Loader2} from "lucide-react";

export default function AuthCallbackPage() {
    const sb = createClientBrowser();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            try {
                await sb.auth.exchangeCodeForSession(window.location.href);
            } catch {
                // ignore; if it fails, we'll still try to proceed
            } finally {
                router.replace("/preview");
                router.refresh();
            }
        })();
    }, [sb, router]);

    return (
        <div className="grid min-h-[60vh] place-items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin"/>
                Finishing sign-in…
            </div>
        </div>
    );
}