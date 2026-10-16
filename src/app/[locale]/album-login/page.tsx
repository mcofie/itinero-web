"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/routing";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import Image from "next/image";

const nextFromUrl = () => {
    const requested = new URLSearchParams(window.location.search).get("next") || "/photobooks";
    return requested.startsWith("/") && !requested.startsWith("//") ? requested : "/photobooks";
};

export default function AlbumLoginPage() {
    const router = useRouter();
    const [busy, setBusy] = useState<"google" | "email" | null>(null);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [sentTo, setSentTo] = useState<string | null>(null);

    useEffect(() => {
        if (new URLSearchParams(window.location.search).has("error")) setError("Sign-in didn’t finish. Please try again.");
        void getSupabaseBrowser().auth.getUser().then(({ data: { user } }) => { if (user) router.replace(nextFromUrl()); });
    }, [router]);

    const signInGoogle = async () => {
        setBusy("google"); setError("");
        window.sessionStorage.setItem("itinero-auth-next", nextFromUrl());
        const { error: authError } = await getSupabaseBrowser().auth.signInWithOAuth({
            provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (authError) { window.sessionStorage.removeItem("itinero-auth-next"); setError(authError.message); setBusy(null); }
    };

    const sendEmailLink = async (event: FormEvent) => {
        event.preventDefault();
        setBusy("email"); setError("");
        // The link may open in another tab, which can't see sessionStorage.
        window.localStorage.setItem("itinero-auth-next", nextFromUrl());
        const { error: authError } = await getSupabaseBrowser().auth.signInWithOtp({
            email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        setBusy(null);
        if (authError) setError(authError.message.includes("rate") ? "Too many sign-in emails. Please wait a minute and try again." : authError.message);
        else setSentTo(email.trim());
    };

    return <main className="flex min-h-screen items-center justify-center bg-[#f6f2ec] px-5 py-16 text-[#2b1a07]">
        <div className="w-full max-w-md rounded-[28px] border border-[#e7d9c8] bg-[#fdfbf8] p-8 text-center shadow-[0_20px_60px_#2b1a0714] sm:p-12">
            <Image src="/brand/itinero-mark-animated.svg" width={70} height={52} alt="Itinero" className="mx-auto mb-7" />
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#c36e36]">Your albums, together</p>
            <h1 className="mb-4 font-[Georgia] text-4xl leading-tight">Pick up where your<br />trip left off.</h1>
            <p className="mx-auto mb-8 max-w-xs text-sm leading-6 text-[#766b5f]">Sign in to save your photos, order your hardcover, and follow its journey to you.</p>
            {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {sentTo ? <div role="status" className="rounded-2xl bg-[#eef3e8] p-5 text-sm leading-6 text-[#2f4a35]">
                <strong className="block font-[Georgia] text-lg">Check your email</strong>
                We sent a sign-in link to <strong>{sentTo}</strong>. Open it on this device to continue.
                <button type="button" onClick={() => setSentTo(null)} className="mt-3 block w-full text-xs font-semibold text-[#5e7a62] underline underline-offset-2">Use a different email</button>
            </div> : <>
                <button type="button" onClick={() => void signInGoogle()} disabled={!!busy} className="w-full rounded-xl bg-[#2b1a07] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#53330e] disabled:opacity-60">{busy === "google" ? "Opening Google…" : "Continue with Google"}</button>
                <div className="my-5 flex items-center gap-3 text-xs text-[#a89a8a]"><span className="h-px flex-1 bg-[#e7d9c8]" />or<span className="h-px flex-1 bg-[#e7d9c8]" /></div>
                <form onSubmit={event => void sendEmailLink(event)} className="space-y-3 text-left">
                    <label className="block text-xs font-semibold text-[#6d5c4b]">Email address
                        <input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"
                            className="mt-1.5 block h-12 w-full rounded-xl border border-[#e2d6c7] bg-white px-4 text-sm text-[#2b1a07] outline-none placeholder:text-[#b3a594] focus:border-[#c16b36]" />
                    </label>
                    <button type="submit" disabled={!!busy} className="w-full rounded-xl border-2 border-[#2b1a07] px-5 py-3.5 text-sm font-bold text-[#2b1a07] transition hover:bg-[#f3ebe0] disabled:opacity-60">{busy === "email" ? "Sending…" : "Email me a sign-in link"}</button>
                </form>
            </>}
            <p className="mt-5 text-xs text-[#8c8174]">Your photos are private to your account.</p>
        </div>
    </main>;
}
