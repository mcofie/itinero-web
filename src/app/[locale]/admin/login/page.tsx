"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { LoaderCircle } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";

const field = "mt-1.5 block h-12 w-full rounded-xl border border-[#e2d6c7] bg-white px-4 text-sm text-[#2b1a07] outline-none transition placeholder:text-[#b3a594] focus:border-[#c16b36] focus:ring-2 focus:ring-[#c16b36]/15";

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

    return <main className="flex min-h-screen items-center justify-center bg-[#f6f2ec] px-5 py-16 text-[#2b1a07]">
        <div className="w-full max-w-md rounded-[28px] border border-[#e7d9c8] bg-[#fdfbf8] p-8 shadow-[0_20px_60px_#2b1a0714] sm:p-12">
            <Link href="/" aria-label="Itinero home" className="mx-auto mb-7 block w-fit">
                <Image src="/brand/itinero-mark-animated.svg" width={70} height={52} alt="Itinero" />
            </Link>
            <div className="text-center">
                <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#c36e36]">Orders admin</p>
                <h1 className="mb-4 font-[Georgia] text-4xl leading-tight tracking-[-.02em]">Every album,<br />from print to door.</h1>
                <p className="mx-auto mb-8 max-w-xs text-sm leading-6 text-[#766b5f]">Sign in to review, print and deliver customer albums.</p>
            </div>

            {deniedEmail && <p role="alert" className="mb-5 rounded-xl bg-[#fbecc2]/70 p-3 text-sm leading-5 text-[#6b4f05]">
                You’re signed in as {deniedEmail}, which doesn’t have admin access. Sign in with the admin account.
            </p>}
            {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <form onSubmit={event => void signIn(event)} className="space-y-4">
                <label className="block text-xs font-semibold text-[#6d5c4b]">Email address
                    <input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className={field} />
                </label>
                <label className="block text-xs font-semibold text-[#6d5c4b]">Password
                    <input type="password" required autoComplete="current-password" value={pwd} onChange={event => setPwd(event.target.value)} className={field} />
                </label>
                <button type="submit" disabled={busy} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2b1a07] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#53330e] disabled:opacity-60">
                    {busy ? <><LoaderCircle size={17} className="animate-spin" /> Signing in…</> : "Sign in"}
                </button>
            </form>
            <p className="mt-6 text-center text-xs text-[#8c8174]">Restricted to Itinero staff.</p>
        </div>
    </main>;
}
