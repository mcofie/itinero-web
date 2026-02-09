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
import Script from "next/script";
import { handleGoogleAuthAction } from "@/app/actions/google-auth";
import { sendMagicLink } from "@/app/actions/auth-magic";

declare global {
    interface Window {
        google: any;
    }
}

export default function LoginPage() {
    const sb = getSupabaseBrowser();
    const router = useRouter();
    const tAuth = useTranslations("Auth");

    const [email, setEmail] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [busy, setBusy] = useState(false);

    // If already signed-in, bounce to /trips
    useEffect(() => {
        (async () => {
            const { data } = await sb.auth.getSession();
            if (data.session) {
                router.replace("/trips");
                router.refresh();
            }
        })();

        const { data: sub } = sb.auth.onAuthStateChange((evt) => {
            if (evt === "SIGNED_IN") {
                router.replace("/trips");
                router.refresh();
            }
        });
        return () => sub.subscription.unsubscribe();
    }, [sb, router]);

    async function handleCredentialResponse(response: any) {
        setBusy(true);
        try {
            await handleGoogleAuthAction(response.credential);
            toast.success(tAuth("successSignIn"));
            router.refresh();
            router.replace("/trips");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error(tAuth("errorGoogle"), { description: msg });
        } finally {
            setBusy(false);
        }
    }

    const initGoogle = () => {
        if (typeof window !== "undefined" && window.google) {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (!clientId) {
                console.warn("Google Client ID is missing. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.");
            }
            window.google.accounts.id.initialize({
                client_id: clientId || "YOUR_GOOGLE_CLIENT_ID",
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
            });
            const btn = document.getElementById("google-button-container");
            if (btn) {
                window.google.accounts.id.renderButton(btn, {
                    theme: "outline",
                    size: "large",
                    width: "420", // Matches max-w-[420px] container
                    shape: "rectangular",
                    text: "continue_with",
                });
            }
        }
    };

    useEffect(() => {
        initGoogle();
    }, [isSent]); // Re-init google button if we switch back from sent state

    async function handleEmail() {
        if (!email) return;
        setBusy(true);
        try {
            // Updated to use custom server action for multi-tenancy support
            const { error } = await sendMagicLink({
                email,
                redirectTo: `${window.location.origin}/auth/callback`,
            });

            if (error) throw new Error(String(error));

            setIsSent(true);
            toast.success("Magic link sent!");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error(tAuth("errorAuth"), { description: msg });
        } finally {
            setBusy(false);
        }
    }

    if (isSent) {
        return (
            <div className="min-h-screen w-full flex bg-background font-sans text-foreground overflow-hidden">
                {/* Left Side (Same as before) - could extract to component but keeping inline for simplicity */}
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
                        <div className="max-w-lg space-y-4">
                            <h1 className="text-4xl font-bold">Check your inbox</h1>
                            <p className="text-lg opacity-90">We've sent a magic link to your email.</p>
                        </div>
                        <div className="text-sm opacity-60">© 2025 Itinero Inc.</div>
                    </div>
                </div>

                {/* Right Side - Success State */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50 dark:bg-slate-900">
                    <div className="w-full max-w-[420px] text-center space-y-6">
                        <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Check your email</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            We've sent a magic link to <span className="font-bold text-slate-900 dark:text-white">{email}</span>. Click the link to sign in.
                        </p>
                        <div className="pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsSent(false)}
                                className="h-12 w-full rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            >
                                Back to login
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
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

                        <div className="grid grid-cols-1 gap-4 pt-4">
                            {[
                                { icon: Globe2, text: "Explore destinations worldwide" },
                                { icon: CheckCircle2, text: "Smart itinerary planning" },
                                { icon: ShieldCheck, text: "Secure and reliable" }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.1) }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
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
                            Get started
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Enter your email to sign in or create an account.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div id="google-button-container" className="w-full h-[40px] flex justify-center overflow-hidden rounded-xl" />

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground font-medium">{tAuth("continueWith")}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 rounded-xl bg-muted/30 border-input focus-visible:ring-primary/30 transition-all font-medium"
                                    placeholder="name@example.com"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleEmail();
                                    }}
                                />
                            </div>

                            <Button
                                onClick={handleEmail}
                                disabled={busy || !email}
                                className="h-12 w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                            >
                                {busy ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {tAuth("wait")}</>
                                ) : (
                                    <>Continue with Email <ArrowRight className="ml-2 h-5 w-5" /></>
                                )}
                            </Button>
                        </div>
                    </div>

                    <p className="text-center text-xs text-muted-foreground px-8">
                        {tAuth("agreement")} <Link href="/terms" className="underline hover:text-foreground">{tAuth("terms")}</Link> and <Link href="/privacy" className="underline hover:text-foreground">{tAuth("privacy")}</Link>.
                    </p>
                </div>
            </div>
            <Script
                src="https://accounts.google.com/gsi/client"
                onLoad={initGoogle}
            />
        </div>
    );
}