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
import { Loader2, Plane, ArrowRight, CheckCircle2, Globe, ShieldCheck, Mail, Sparkles, Zap, ArrowLeft, ArrowUpRight, Lock, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import { handleGoogleAuthAction } from "@/app/actions/google-auth";
import { sendMagicLink } from "@/app/actions/auth-magic";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
                    width: "360",
                    shape: "rectangular",
                    text: "continue_with",
                });
            }
        }
    };

    useEffect(() => {
        initGoogle();
    }, [isSent]);

    async function handleEmail() {
        if (!email) return;
        setBusy(true);
        try {
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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900">

            {/* --- Hero Header (Resources Style) --- */}
            <div className="bg-slate-900 pt-24 pb-48 text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                        alt="Auth background"
                        fill
                        className="object-cover opacity-20 blur-sm scale-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-900/80 to-slate-950" />
                </div>

                <div className="container mx-auto px-6 relative z-10 max-w-6xl text-center">
                    <div className="inline-flex items-center gap-3 text-blue-400 font-bold tracking-widest uppercase text-xs mb-6">
                        <Lock className="h-4 w-4" />
                        Secure Entry Point
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Traveler's Login
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
                        Access your synchronized itineraries, reward points, and offline intelligence from any device.
                    </p>
                </div>
            </div>

            {/* --- Main Content Grid --- */}
            <div className="container mx-auto px-6 -mt-24 relative z-20 max-w-4xl">
                <AnimatePresence mode="wait">
                    {isSent ? (
                        <SuccessView key="success" email={email} onBack={() => setIsSent(false)} />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-xl border border-slate-200 dark:border-slate-800"
                            >
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 text-center">Fast Connect</div>
                                        <div className="flex justify-center">
                                            <div id="google-button-container" className="h-[48px] overflow-hidden" />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                                        </div>
                                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                                            <span className="bg-white dark:bg-slate-900 px-4 text-slate-300">or magic link</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email address</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="h-12 pl-12 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-950 focus:border-blue-500/50 transition-all font-medium focus-visible:ring-0"
                                                    placeholder="traveler@example.com"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleEmail()}
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleEmail}
                                            disabled={busy || !email}
                                            className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold transition-all"
                                        >
                                            {busy ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    Continue with Email
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <InfoBlock
                                    icon={Key}
                                    title="Passwordless Access"
                                    desc="We use magic links for maximum security. No passwords to remember or lose."
                                />
                                <InfoBlock
                                    icon={ShieldCheck}
                                    title="Privacy First"
                                    desc="Your data is encrypted and synced only when you authorize a device."
                                />
                                <div className="p-6 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Plane className="h-12 w-12" />
                                    </div>
                                    <h4 className="font-bold text-sm mb-2">New to Itinero?</h4>
                                    <p className="text-xs text-slate-400 mb-6">Create an account to start building AI-powered itineraries today.</p>
                                    <Link href="/signup" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                        Create Traveler Profile <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <Script
                src="https://accounts.google.com/gsi/client"
                onLoad={initGoogle}
            />
        </div>
    );
}

function SuccessView({ email, onBack }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-xl mx-auto text-center"
        >
            <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Check your Email</h2>
            <p className="text-slate-500 mb-10 leading-relaxed font-medium">
                We've sent a magic link to <span className="font-bold text-slate-900 dark:text-white">{email}</span>.<br />
                Click the link in the message to sign in instantly.
            </p>
            <Button onClick={onBack} variant="outline" className="h-12 px-8 rounded-xl border-slate-200">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Button>
        </motion.div>
    );
}

function InfoBlock({ icon: Icon, title, desc }: any) {
    return (
        <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-10 w-10 shrink-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}