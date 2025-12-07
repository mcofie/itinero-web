"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plane, ArrowRight, CheckCircle2, Globe2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
    const sb = getSupabaseBrowser();
    const router = useRouter();
    const tAuth = useTranslations("Auth");

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [busy, setBusy] = useState(false);

    // If already signed-in, bounce to /preview
    useEffect(() => {
        (async () => {
            const { data } = await sb.auth.getSession();
            if (data.session) {
                router.replace("/preview");
                router.refresh();
            }
        })();

        const { data: sub } = sb.auth.onAuthStateChange((evt) => {
            if (evt === "SIGNED_IN") {
                router.replace("/preview");
                router.refresh();
            }
        });
        return () => sub.subscription.unsubscribe();
    }, [sb, router]);

    async function handleEmail() {
        setBusy(true);
        try {
            const result =
                mode === "login"
                    ? await sb.auth.signInWithPassword({ email, password: pwd })
                    : await sb.auth.signUp({ email, password: pwd });

            if (result.error) throw result.error;

            toast.success(mode === "login" ? tAuth("successSignIn") : tAuth("successSignUp"));
            router.replace("/trips");
            router.refresh();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error(tAuth("errorAuth"), { description: msg });
        } finally {
            setBusy(false);
        }
    }

    async function handleGoogle() {
        setBusy(true);
        try {
            const { error } = await sb.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: { prompt: "consent", access_type: "offline" }
                },

            });
            if (error) throw error;
            // Redirect handled by OAuth; no-op here.
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error(tAuth("errorGoogle"), { description: msg });
            setBusy(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-background font-sans text-foreground overflow-hidden">
            {/* Left Side - Visual/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-primary/90 mix-blend-hard-light" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                <div className="relative z-10 flex flex-col justify-between w-full p-12 text-primary-foreground">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-3 font-bold text-3xl tracking-tight text-white">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/10 shadow-xl">
                                <Plane className="h-6 w-6 text-white" />
                            </span>
                            Itinero
                        </Link>
                    </div>

                    <div className="space-y-8 max-w-lg">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl font-extrabold leading-tight tracking-tight"
                        >
                            {tAuth("startJourney")}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-primary-foreground/80 leading-relaxed"
                        >
                            Join thousands of travelers planning their next adventure with Itinero. Experience seamless trip organization like never before.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4 pt-4"
                        >
                            {[
                                { icon: Globe2, text: "Explore destinations worldwide" },
                                { icon: CheckCircle2, text: "Smart itinerary planning" },
                                { icon: ShieldCheck, text: "Secure and reliable" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">{item.text}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <div className="text-sm text-primary-foreground/60">
                        © 2025 Itinero Inc. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                {/* Mobile Logo */}
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Plane className="h-4 w-4" />
                        </span>
                        Itinero
                    </Link>
                </div>

                <div className="w-full max-w-[420px] space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {mode === "login" ? tAuth("welcome") : tAuth("createAccount")}
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            {mode === "login" ? tAuth("signInDesc") : tAuth("signUpDesc")}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode}
                                initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 rounded-xl bg-muted/30 border-input focus-visible:ring-primary/30 transition-all"
                                        placeholder="name@example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="pwd">{tAuth("password")}</Label>
                                        {mode === "login" && (
                                            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <Input
                                        id="pwd"
                                        type="password"
                                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                                        value={pwd}
                                        onChange={(e) => setPwd(e.target.value)}
                                        className="h-12 rounded-xl bg-muted/30 border-input focus-visible:ring-primary/30 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleEmail}
                                disabled={busy}
                                className="h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                            >
                                {busy ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {tAuth("wait")}</>
                                ) : mode === "login" ? (
                                    <>{tAuth("signIn")} <ArrowRight className="ml-2 h-5 w-5" /></>
                                ) : (
                                    tAuth("createAccount")
                                )}
                            </Button>

                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground font-medium">{tAuth("continueWith")}</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleGoogle}
                                disabled={busy}
                                className="h-12 rounded-xl border-border bg-background hover:bg-muted/50 text-foreground font-medium transition-all hover:-translate-y-0.5"
                            >
                                <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                                {tAuth("google")}
                            </Button>
                        </div>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">
                            {mode === "login" ? tAuth("noAccount") : tAuth("hasAccount")}{" "}
                        </span>
                        <button
                            type="button"
                            className="font-semibold text-primary hover:underline transition-all"
                            onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
                        >
                            {mode === "login" ? "Sign up" : "Sign in"}
                        </button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground px-8">
                        {tAuth("agreement")} <Link href="/terms" className="underline hover:text-foreground">{tAuth("terms")}</Link> and <Link href="/privacy" className="underline hover:text-foreground">{tAuth("privacy")}</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
}