"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/routing";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { sendSignInCode } from "@/app/actions/email-sign-in";
import ui from "@/components/album/album-ui.module.css";
import { cn } from "@/lib/utils";

const inputClass = "mt-2 block h-12 w-full rounded-[12px] border-2 border-[#d9cbbb] bg-white px-4 font-[family-name:var(--font-album-serif)] text-[16px] normal-case tracking-normal text-[#2b1a07] outline-none placeholder:text-[#b3a594] focus:border-[#423824]";
const labelClass = "block font-sans text-xs font-semibold uppercase tracking-[.12em] text-[#6d5c4b]";

const nextFromUrl = () => {
    const requested = new URLSearchParams(window.location.search).get("next") || "/photobooks";
    return requested.startsWith("/") && !requested.startsWith("//") ? requested : "/photobooks";
};

export default function AlbumLoginPage() {
    const router = useRouter();
    const [busy, setBusy] = useState<"google" | "email" | "code" | null>(null);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [linkSent, setLinkSent] = useState(false);

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

    const sendCode = async (event?: FormEvent) => {
        event?.preventDefault();
        const address = (sentTo ?? email).trim();
        setBusy("email"); setError("");
        const result = await sendSignInCode(address).catch(() => ({ ok: false as const, error: "We couldn’t send the email just now. Please try again." }));
        if (!result.ok && "useLink" in result && result.useLink) {
            // Fallback while our own email isn't available: Supabase emails a sign-in link instead.
            window.localStorage.setItem("itinero-auth-next", nextFromUrl());
            const { error: linkError } = await getSupabaseBrowser().auth.signInWithOtp({ email: address, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
            setBusy(null);
            if (linkError) { setError(linkError.message.includes("rate") ? "Too many sign-in emails. Please wait a minute and try again." : result.error); return; }
            setSentTo(address.toLowerCase()); setLinkSent(true);
            return;
        }
        setBusy(null);
        if (!result.ok) { setError(result.error); return; }
        setSentTo(address.toLowerCase()); setCode(""); setLinkSent(false);
    };

    const verifyCode = async (event: FormEvent) => {
        event.preventDefault();
        if (!sentTo) return;
        setBusy("code"); setError("");
        const { error: authError } = await getSupabaseBrowser().auth.verifyOtp({ email: sentTo, token: code.trim(), type: "email" });
        if (authError) {
            setBusy(null);
            setError(/expired|invalid/i.test(authError.message) ? "That code is wrong or has expired. Check the email, or send a new code." : authError.message);
            return;
        }
        router.replace(nextFromUrl());
        router.refresh();
    };

    return <main className="mx-auto flex max-w-6xl justify-center px-5 pb-10 pt-6 sm:px-8 sm:pt-12">
        <div className={cn(ui.card, "w-full max-w-md px-7 py-10 text-center sm:px-11 sm:py-12")}>
            <p className={cn(ui.hand, "-rotate-2")}>welcome back<br />⌄</p>
            <h1 className="mt-2 text-[36px] leading-[1.15] tracking-[-.025em] sm:text-[40px]">Pick up where your trip left off</h1>
            <p className="mx-auto mt-4 max-w-xs font-sans text-[15px] leading-6 text-[#6d5c4b]">Sign in to save your photos, order your hardcover, and follow its journey to you.</p>
            {error && <p role="alert" className="mt-6 rounded-[10px] border-2 border-[#b4441c] bg-[#fff4ef] p-3 font-sans text-sm text-[#7a2e12]">{error}</p>}
            {sentTo && linkSent ? <div role="status" className={cn(ui.rule, "mt-8 pt-6")}>
                <p className={ui.hand}>check your email!</p>
                <p className="mt-2 font-sans text-[15px] leading-6 text-[#5e4a38]">We sent a sign-in link to <strong>{sentTo}</strong>. Open it on this device to continue.</p>
                <button type="button" onClick={() => { setSentTo(null); setLinkSent(false); }} className={cn(ui.link, "mt-4 text-[15px]")}>Use a different email</button>
            </div> : sentTo ? <form onSubmit={event => void verifyCode(event)} className={cn(ui.rule, "mt-8 pt-6")}>
                <p role="status" className={ui.hand}>check your email!</p>
                <p className="mt-2 font-sans text-[15px] leading-6 text-[#5e4a38]">We sent a 6-digit code to <strong>{sentTo}</strong>.</p>
                <label className={cn(labelClass, "mt-6 text-left")}>Sign-in code
                    <input autoFocus required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" maxLength={10} value={code}
                        onChange={event => setCode(event.target.value.replace(/\D/g, ""))} placeholder="123456"
                        className={cn(inputClass, "text-center text-[26px] tracking-[.4em] placeholder:tracking-[.4em]")} />
                </label>
                <button type="submit" disabled={!!busy || code.length < 6} className={cn(ui.button, "mt-4 w-full disabled:opacity-60")}>{busy === "code" ? "Signing in…" : "Sign in"}</button>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[15px]">
                    <button type="button" disabled={!!busy} onClick={() => void sendCode()} className={ui.link}>{busy === "email" ? "Sending…" : "Send a new code"}</button>
                    <button type="button" disabled={!!busy} onClick={() => { setSentTo(null); setCode(""); setError(""); }} className={ui.link}>Use a different email</button>
                </div>
            </form> : <div className="mt-8">
                <button type="button" onClick={() => void signInGoogle()} disabled={!!busy} className={cn(ui.button, "w-full disabled:opacity-60")}>{busy === "google" ? "Opening Google…" : "Continue with Google"}</button>
                <div className="my-7 flex items-center gap-3 font-[family-name:var(--font-album-hand)] text-lg text-[#a89a8a]"><span className="flex-1 border-t-2 border-dashed border-[#dfd6ce]" />or<span className="flex-1 border-t-2 border-dashed border-[#dfd6ce]" /></div>
                <form onSubmit={event => void sendCode(event)} className="space-y-4 text-left">
                    <label className={labelClass}>Email address
                        <input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className={inputClass} />
                    </label>
                    <button type="submit" disabled={!!busy} className={cn(ui.button, "w-full disabled:opacity-60")}>{busy === "email" ? "Sending…" : "Email me a sign-in code"}</button>
                </form>
            </div>}
            <p className="mt-7 font-sans text-xs text-[#8c8174]">Your photos are private to your account.</p>
        </div>
    </main>;
}
