"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import Image from "next/image";

export default function AlbumLoginPage() {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has("error")) {
            setError("Google sign-in did not finish. Please try again.");
        }
        void getSupabaseBrowser().auth.getUser().then(({ data: { user } }) => {
            const requested = params.get("next") || "/photobooks";
            const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/photobooks";
            if (user) router.replace(next);
        });
    }, [router]);

    const signIn = async () => {
        setBusy(true); setError("");
        const requested = new URLSearchParams(window.location.search).get("next") || "/photobooks";
        const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/photobooks";
        window.sessionStorage.setItem("itinero-auth-next", next);
        const { error: authError } = await getSupabaseBrowser().auth.signInWithOAuth({
            provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (authError) { window.sessionStorage.removeItem("itinero-auth-next"); setError(authError.message); setBusy(false); }
    };

    return <main className="flex min-h-screen items-center justify-center bg-[#f6f2ec] px-5 py-16 text-[#2b1a07]">
        <div className="w-full max-w-md rounded-[28px] border border-[#e7d9c8] bg-[#fdfbf8] p-8 text-center shadow-[0_20px_60px_#2b1a0714] sm:p-12">
            <Image src="/brand/itinero-mark-animated.svg" width={70} height={52} alt="Itinero" className="mx-auto mb-7" />
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#c36e36]">Your albums, together</p>
            <h1 className="mb-4 font-[Georgia] text-4xl leading-tight">Pick up where your<br />trip left off.</h1>
            <p className="mx-auto mb-8 max-w-xs text-sm leading-6 text-[#766b5f]">Sign in with Google to save your photos, order your hardcover, and follow its journey to you.</p>
            {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button type="button" onClick={() => void signIn()} disabled={busy} className="w-full rounded-xl bg-[#2b1a07] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#53330e] disabled:opacity-60">{busy ? "Opening Google…" : "Continue with Google"}</button>
            <p className="mt-5 text-xs text-[#8c8174]">Your photos are private to your account.</p>
        </div>
    </main>;
}
