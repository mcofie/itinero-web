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
import { Loader2, Plane, ArrowRight, CheckCircle2, Globe2, ShieldCheck, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLoginPage() {
    const sb = getSupabaseBrowser();
    const router = useRouter();
    // const tAuth = useTranslations("Auth"); // Might not have specific "Auth" keys for admin, reuse generic ones.

    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [busy, setBusy] = useState(false);

    // If already signed-in, bounce to /admin/itinero
    useEffect(() => {
        (async () => {
            const { data } = await sb.auth.getSession();
            if (data.session) {
                // Ideally check if user is admin first, but layout will handle if not authorized.
                router.replace("/admin/itinero");
                router.refresh();
            }
        })();

        const { data: sub } = sb.auth.onAuthStateChange((evt) => {
            if (evt === "SIGNED_IN") {
                router.replace("/admin/itinero");
                router.refresh();
            }
        });
        return () => sub.subscription.unsubscribe();
    }, [sb, router]);

    async function handleEmail() {
        setBusy(true);
        try {
            const result = await sb.auth.signInWithPassword({ email, password: pwd });

            if (result.error) throw result.error;

            toast.success("Signed in successfully");
            router.replace("/admin/itinero");
            router.refresh();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Authentication failed", { description: msg });
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
            toast.error("Google sign-in failed", { description: msg });
            setBusy(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-background font-sans text-foreground overflow-hidden">
            {/* Left Side - Visual/Brand - Darker theme for Admin */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483366774580-c49d38f1acf1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900/90" />

                <div className="relative z-10 flex flex-col justify-between w-full p-12 text-slate-100">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-3 font-bold text-3xl tracking-tight text-white">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-xl">
                                <Lock className="h-6 w-6 text-white" />
                            </span>
                            Itinero Admin
                        </Link>
                    </div>

                    <div className="space-y-8 max-w-lg">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl font-extrabold leading-tight tracking-tight"
                        >
                            Secure Dashboard Access
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-slate-300 leading-relaxed"
                        >
                            Restricted area for authorized personnel only. Manage users, itineraries, and system settings securely.
                        </motion.p>
                    </div>

                    <div className="text-sm text-slate-400">
                        © 2026 Itinero Inc. Admin Portal.
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 dark:bg-background">
                {/* Mobile Logo */}
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Lock className="h-4 w-4" />
                        </span>
                        Itinero Admin
                    </Link>
                </div>

                <div className="w-full max-w-[420px] space-y-8 bg-white dark:bg-slate-900/50 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Admin Sign In
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Enter your credentials to access the dashboard.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 rounded-xl bg-muted/30 border-input focus-visible:ring-primary/30 transition-all"
                                    placeholder="admin@itinero.app"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="pwd">Password</Label>
                                </div>
                                <Input
                                    id="pwd"
                                    type="password"
                                    autoComplete="current-password"
                                    value={pwd}
                                    onChange={(e) => setPwd(e.target.value)}
                                    className="h-12 rounded-xl bg-muted/30 border-input focus-visible:ring-primary/30 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={handleEmail}
                                disabled={busy}
                                className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                            >
                                {busy ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authenticating...</>
                                ) : (
                                    <>Sign In <ArrowRight className="ml-2 h-5 w-5" /></>
                                )}
                            </Button>

                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleGoogle}
                                disabled={busy}
                                className="h-12 rounded-xl border-border bg-background hover:bg-muted/50 text-foreground font-medium transition-all hover:-translate-y-0.5"
                            >
                                <svg className="mr-2 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                                Google
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
