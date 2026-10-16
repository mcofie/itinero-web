"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { albumFontVariables } from "@/components/album/album-fonts";
import ui from "@/components/album/album-ui.module.css";
import { cn } from "@/lib/utils";

const labelClass = "block font-sans text-xs font-semibold uppercase tracking-[.12em] text-[#6d5c4b]";
const field = "mt-2 block h-12 w-full rounded-[12px] border-2 border-[#d9cbbb] bg-white px-4 font-[family-name:var(--font-album-serif)] text-[16px] normal-case tracking-normal text-[#2b1a07] outline-none placeholder:text-[#b3a594] focus:border-[#423824]";

export default function AdminLoginPage() {
    const sb = getSupabaseBrowser();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [deniedEmail, setDeniedEmail] = useState<string | null>(null);

    // Return to the admin page that sent us here; the orders admin by default.
    const nextPath = () => {
        const requested = new URLSearchParams(window.location.search).get("next") ?? "";
        return requested.startsWith("/admin/") && !requested.startsWith("//") ? requested : "/admin";
    };

    // Already signed in: continue, unless that account was just refused admin access.
    useEffect(() => {
        (async () => {
            const { data } = await sb.auth.getSession();
            if (!data.session) return;
            if (new URLSearchParams(window.location.search).has("denied")) {
                setDeniedEmail(data.session.user.email ?? "this account");
                return;
            }
            router.replace(nextPath());
            router.refresh();
        })();
    }, [sb, router]);

    async function signIn(event: FormEvent) {
        event.preventDefault();
        setBusy(true); setError("");
        const { error: authError } = await sb.auth.signInWithPassword({ email, password: pwd });
        if (authError) { setError(authError.message); setBusy(false); return; }
        router.replace(nextPath());
        router.refresh();
    }

    return <main className={cn(albumFontVariables, ui.page, "flex min-h-screen flex-col items-center justify-center px-5 py-14")}>
        <Link href="/" aria-label="Itinero home" className="mb-9 transition hover:-rotate-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/itinero-mark-animated.svg" alt="" width={76} height={46} className="drop-shadow-[0_2px_1px_#2b1a071b]" />
        </Link>
        <div className={cn(ui.card, "w-full max-w-md px-7 py-10 text-center sm:px-11 sm:py-12")}>
            <p className={cn(ui.hand, "-rotate-2")}>staff only<br />⌄</p>
            <h1 className="mt-2 text-[36px] leading-[1.15] tracking-[-.025em] sm:text-[40px]">Every album, from print to door</h1>
            <p className="mx-auto mt-4 max-w-xs font-sans text-[15px] leading-6 text-[#6d5c4b]">Sign in to review, print and deliver customer albums.</p>

            {deniedEmail && <p role="alert" className="mt-6 rounded-[10px] border-2 border-[#c99a2e] bg-[#fff8e6] p-3 text-left font-sans text-sm leading-5 text-[#6b4f05]">
                You’re signed in as {deniedEmail}, which doesn’t have admin access. Sign in with the admin account.
            </p>}
            {error && <p role="alert" className="mt-6 rounded-[10px] border-2 border-[#b4441c] bg-[#fff4ef] p-3 text-left font-sans text-sm text-[#7a2e12]">{error}</p>}

            <form onSubmit={event => void signIn(event)} className={cn(ui.rule, "mt-8 space-y-4 pt-7 text-left")}>
                <label className={labelClass}>Email address
                    <input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className={field} />
                </label>
                <label className={labelClass}>Password
                    <input type="password" required autoComplete="current-password" value={pwd} onChange={event => setPwd(event.target.value)} className={field} />
                </label>
                <button type="submit" disabled={busy} className={cn(ui.button, "!mt-7 w-full disabled:opacity-60")}>{busy ? "Signing in…" : "Sign in"}</button>
            </form>
            <p className="mt-7 font-sans text-xs text-[#8c8174]">Restricted to Itinero staff.</p>
        </div>
    </main>;
}
