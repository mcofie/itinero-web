"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/routing";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import ui from "@/components/album/album-ui.module.css";
import { cn } from "@/lib/utils";

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

    return <main className="mx-auto flex max-w-6xl justify-center px-5 pb-10 pt-6 sm:px-8 sm:pt-12">
        <div className={cn(ui.card, "w-full max-w-md px-7 py-10 text-center sm:px-11 sm:py-12")}>
            <p className={cn(ui.hand, "-rotate-2")}>welcome back<br />⌄</p>
            <h1 className="mt-2 text-[36px] leading-[1.15] tracking-[-.025em] sm:text-[40px]">Pick up where your trip left off</h1>
            <p className="mx-auto mt-4 max-w-xs font-sans text-[15px] leading-6 text-[#6d5c4b]">Sign in to save your photos, order your hardcover, and follow its journey to you.</p>
            {error && <p role="alert" className="mt-6 rounded-[10px] border-2 border-[#b4441c] bg-[#fff4ef] p-3 font-sans text-sm text-[#7a2e12]">{error}</p>}
            {sentTo ? <div role="status" className={cn(ui.rule, "mt-8 pt-6")}>
                <p className={ui.hand}>check your email!</p>
                <p className="mt-2 font-sans text-[15px] leading-6 text-[#5e4a38]">We sent a sign-in link to <strong>{sentTo}</strong>. Open it on this device to continue.</p>
                <button type="button" onClick={() => setSentTo(null)} className={cn(ui.link, "mt-4 text-[15px]")}>Use a different email</button>
            </div> : <div className="mt-8">
                <button type="button" onClick={() => void signInGoogle()} disabled={!!busy} className={cn(ui.button, "w-full disabled:opacity-60")}>{busy === "google" ? "Opening Google…" : "Continue with Google"}</button>
                <div className="my-7 flex items-center gap-3 font-[family-name:var(--font-album-hand)] text-lg text-[#a89a8a]"><span className="flex-1 border-t-2 border-dashed border-[#dfd6ce]" />or<span className="flex-1 border-t-2 border-dashed border-[#dfd6ce]" /></div>
                <form onSubmit={event => void sendEmailLink(event)} className="space-y-4 text-left">
                    <label className="block font-sans text-xs font-semibold uppercase tracking-[.12em] text-[#6d5c4b]">Email address
                        <input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com"
                            className="mt-2 block h-12 w-full rounded-[12px] border-2 border-[#d9cbbb] bg-white px-4 font-[family-name:var(--font-album-serif)] text-[16px] normal-case tracking-normal text-[#2b1a07] outline-none placeholder:text-[#b3a594] focus:border-[#423824]" />
                    </label>
                    <button type="submit" disabled={!!busy} className={cn(ui.button, "w-full disabled:opacity-60")}>{busy === "email" ? "Sending…" : "Email me a sign-in link"}</button>
                </form>
            </div>}
            <p className="mt-7 font-sans text-xs text-[#8c8174]">Your photos are private to your account.</p>
        </div>
    </main>;
}
