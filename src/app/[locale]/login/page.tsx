"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { toast } from "sonner";
import { Loader2, Plane, ShieldCheck, ArrowLeft, Star } from "lucide-react";
import { motion } from "framer-motion";
import Script from "next/script";
import { handleGoogleAuthAction } from "@/app/actions/google-auth";
import Image from "next/image";
import { Footer } from "@/components/layout/Footer";

declare global {
    interface Window {
        google: any;
    }
}

export default function LoginPage() {
    const sb = getSupabaseBrowser();
    const router = useRouter();
    const tAuth = useTranslations("Auth");
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

    const renderGoogleButton = () => {
        if (typeof window !== "undefined" && window.google && !busy) {
            try {
                const btn = document.getElementById("google-button-container");
                if (btn) {
                    // Use getBoundingClientRect for precise width, floor it to avoid subpixel issues
                    const rect = btn.getBoundingClientRect();
                    const width = Math.floor(rect.width);

                    // Google button min width is 200, max is 400 provided by their API.
                    // We shouldn't send 0 or undefined.
                    if (width > 0) {
                        // Clear previous content
                        btn.innerHTML = '';
                        window.google.accounts.id.renderButton(btn, {
                            theme: "outline",
                            size: "large",
                            width: width.toString(),
                            shape: "pill",
                            text: "continue_with",
                            logo_alignment: "left"
                        });
                    }
                }
            } catch (e) {
                console.error("Google button render error:", e);
            }
        }
    };

    const initGoogle = () => {
        if (typeof window !== "undefined" && window.google) {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            window.google.accounts.id.initialize({
                client_id: clientId || "YOUR_GOOGLE_CLIENT_ID",
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true,
            });
            renderGoogleButton();
        }
    };

    useEffect(() => {
        // Initial init attempt
        initGoogle();

        // Polling for script load
        const interval = setInterval(() => {
            if (typeof window !== "undefined" && window.google) {
                if (!document.getElementById("google-button-container")?.hasChildNodes()) {
                    initGoogle();
                }
                clearInterval(interval);
            }
        }, 500);

        // Robust Resize Observer to handle all layout changes
        const btnContainer = document.getElementById("google-button-container");
        let resizeObserver: ResizeObserver | null = null;

        if (btnContainer) {
            resizeObserver = new ResizeObserver(() => {
                if (window.google) {
                    // Debounce slightly or just call render
                    renderGoogleButton();
                }
            });
            resizeObserver.observe(btnContainer);
        }

        return () => {
            clearInterval(interval);
            if (resizeObserver) resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col bg-white dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
            <Scripts onReady={initGoogle} />

            {/* Background Accents (Global) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 dark:bg-blue-900/10 blur-3xl opacity-60" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/40 dark:bg-purple-900/10 blur-3xl opacity-60" />
            </div>

            {/* Spacer for vertical centering logic */}
            <div className="flex-1 flex items-center justify-center w-full p-4 sm:p-6 relative z-10">

                {/* Centered Card Container */}
                <div className="w-full max-w-lg">

                    {/* Header / Brand */}
                    <div className="flex flex-col items-center mb-10 text-center">
                        <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-2xl tracking-tight text-slate-900 dark:text-white group mb-6">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                <Plane className="h-5 w-5" />
                            </div>
                            Itinero
                        </Link>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-sm mx-auto">
                                Sign in to access your curated trips and AI travel plans.
                            </p>
                        </motion.div>
                    </div>

                    {/* Main Card Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-xl"
                    >
                        <div className="space-y-8">
                            {/* Google Button Container */}
                            <div className="min-h-[58px] relative flex justify-center">
                                {busy ? (
                                    <div className="absolute inset-0 flex items-center gap-3 text-slate-500 font-bold bg-slate-50 dark:bg-slate-900 px-6 rounded-full border border-slate-200 dark:border-slate-800 justify-center w-full">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <div className="relative z-10 w-full flex justify-center">
                                        <div id="google-button-container" className="h-[50px] w-full" />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trusted by 10k+ Travelers</span>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                            </div>

                            {/* Value Props Small */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-2 group transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-emerald-900/20 shadow-sm flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Bank-Level Security</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center gap-2 group transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-white dark:bg-amber-900/20 shadow-sm flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <Star className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Top Rated App</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Back to Home Link */}
                    <div className="text-center mt-8">
                        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900/50">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer Component */}
            <div className="relative z-10 w-full">
                <Footer />
            </div>
        </div>
    );
}

function Scripts({ onReady }: { onReady: () => void }) {
    return (
        <Script
            src="https://accounts.google.com/gsi/client"
            onLoad={onReady}
            strategy="afterInteractive"
        />
    );
}