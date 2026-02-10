"use client";

import * as React from "react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { getSupabaseBrowser, resetSupabaseClient } from "@/lib/supabase/browser-singleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
    LogOut,
    User,
    Calendar,
    Star,
    Plus,
    Menu,
    Sparkles,
    Plane,
    CreditCard,
    Heart,
    Bell,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { Navbar } from "@/components/layout/Navbar";


import { useEffect } from "react";

type Props = {
    children: React.ReactNode;
    userEmail?: string | null;
    avatarUrl?: string | null;
    fullName?: string | null;
};



export default function AppShell({ children, userEmail, avatarUrl, fullName }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const tNav = useTranslations("Navigation");
    const tActions = useTranslations("Actions");
    const tFooter = useTranslations("Footer");
    const sb = React.useMemo(() => getSupabaseBrowser(), []);

    const [uid, setUid] = React.useState<string | null>(null);


    const [hasPreview, setHasPreview] = React.useState(false);


    // -------- Helper: Unified Logout with Hard Redirect --------
    // This is the "cleanup" phase, safe to call from anywhere (button or event)
    const finalizeLogout = React.useCallback(() => {
        if (typeof window !== "undefined") {
            // 1. Clear storage
            try {
                window.localStorage.clear();
            } catch (e) {
                console.error("[finalizeLogout] error clearing storage:", e);
            }

            // 2. Hard Redirect ONLY if not already on login
            const isLoginPage = window.location.pathname.includes("/login");
            if (!isLoginPage) {
                console.log("[finalizeLogout] Forcing hard redirect to /login");
                window.location.href = "/login";
            }
        }
    }, []);

    // This is the "user action" phase
    const handleLogout = React.useCallback(() => {
        // 1. Sign out (this triggers the SIGNED_OUT event)
        sb.auth.signOut().catch((err) => {
            console.error("[handleLogout] signOut error:", err);
            // If network fails, we still want to clean up locally
            finalizeLogout();
        });

        // 2. We don't strictly *need* to call finalizeLogout here if the event fires,
        // but it's safer to call it explicitly just in case the event listener is slow 
        // or if we want immediate feedback. However, to avoid double-redirects, 
        // we can rely on the event OR just call it.
        // Let's rely on the event listener for the "official" handling, 
        // but we can force it if we want immediate reaction. 
        // Since the user reported "unresponsive", breaking the loop is key.
        // The safe approach: Call it here, and ensure the event listener works too.
        // BUT, we must ensure finalizeLogout is idempotent enough or that it doesn't hurt to run twice.
        // Redirecting twice might be annoying but not infinite loop.
        // The previous bug was: handleLogout handles signOut -> Event fires -> Calls handleLogout -> calls signOut ... loop.

        // Correct pattern:
        // handleLogout -> signOut. 
        // Event listener (SIGNED_OUT) -> finalizeLogout.

        // Just strictly call signOut here.
    }, [sb, finalizeLogout]);







    // -------- Session init + auth listener --------
    React.useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const { data, error } = await sb.auth.getSession();
                if (!mounted) return;

                if (error) {
                    console.error("[auth.getSession] error:", error);
                    finalizeLogout(); // Use finalizeLogout instead of handleLogout
                    return;
                }

                const userId = data?.session?.user?.id ?? null;
                setUid(userId);

            } catch (e) {
                console.error("[auth.getSession] threw:", e);
                if (mounted) {
                    finalizeLogout(); // Use finalizeLogout instead of handleLogout
                }
            }
        })();

        const { data: sub } = sb.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (!session || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
                const userId = session?.user?.id ?? null;
                setUid(userId);

                if (event === "SIGNED_OUT") {
                    // CRITICAL: Call finalizeLogout, NOT handleLogout
                    // This breaks the loop (SIGNED_OUT -> handleLogout -> signOut -> SIGNED_OUT...)
                    finalizeLogout();
                    return;
                }

                if (event === "TOKEN_REFRESHED") {
                    return;
                }
            } else {
                const userId = session.user?.id ?? null;
                setUid(userId);
            }
        });

        return () => {
            mounted = false;
            sub?.subscription?.unsubscribe();
        };
    }, [sb, finalizeLogout]);

    // -------- Preview indicator --------
    React.useEffect(() => {
        try {
            if (typeof window !== "undefined") {
                const raw = window.localStorage.getItem("itinero:latest_preview");
                setHasPreview(!!raw);
            }
        } catch (e) {
            console.error("[preview] localStorage error:", e);
            setHasPreview(false);
        }
    }, [pathname]);



    // -------- Handle tab visibility changes (client recreation fix) --------
    const handleVisibilityChange = React.useCallback(async () => {
        if (document.visibilityState === 'visible' && uid) {
            try {
                console.log('[AppShell] Tab visible - recreating Supabase client');

                // Reset the singleton to force client recreation
                // This fixes the "corrupted state" issue where the client stops responding
                resetSupabaseClient();

                // Get a fresh client instance
                const freshClient = getSupabaseBrowser();

                // Verify session with new client
                const { data } = await freshClient.auth.getSession();
                const userId = data?.session?.user?.id ?? null;

                if (userId !== uid) {
                    console.log('[AppShell] User ID changed after client recreation');
                    setUid(userId);
                }

                console.log('[AppShell] Successfully recovered from tab switch');
            } catch (error) {
                console.error('[AppShell] Error recovering from tab switch:', error);
            }
        }
    }, [uid]);

    React.useEffect(() => {
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [handleVisibilityChange]);

    // -------- Logout --------
    const logout = React.useCallback(() => {
        handleLogout();
    }, [handleLogout]);




    const initials = (email?: string | null, name?: string | null) => {
        if (name) {
            const parts = name.split(" ");
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return parts[0][0].toUpperCase();
        }
        return (email?.[0] ?? "U").toUpperCase() +
            (email?.split("@")?.[0]?.[1]?.toUpperCase() ?? "");
    };
    const year = new Date().getFullYear();



    // ... (existing imports)

    // ... (inside AppShell component, before return)

    return (
        <TooltipProvider delayDuration={150}>
            <div
                className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-white dark:selection:bg-blue-900 dark:selection:text-white transition-colors duration-300">

                {/* Header */}
                <Navbar
                    userEmail={userEmail}
                    avatarUrl={avatarUrl}
                    fullName={fullName}
                    hasPreview={hasPreview}
                    onLogout={logout}
                />

                {/* Main Content */}
                <main className="flex-1 w-full">{children}</main>

                <footer className="border-t border-slate-200 bg-white py-16 dark:bg-slate-950 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                            <div className="flex flex-col items-center md:items-start gap-4">
                                <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 dark:text-white group">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                                        <Plane className="h-4 w-4" />
                                    </div>
                                    Itinero
                                </Link>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center md:text-left leading-relaxed">
                                    Plan smarter trips with AI. Build complete itineraries in minutes.
                                </p>
                            </div>

                            <div className="flex flex-col items-center md:items-end gap-6">
                                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                    <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]">
                                        {tFooter("terms")}
                                    </Link>
                                    <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]">
                                        {tFooter("privacy")}
                                    </Link>
                                    <Link href="/resources" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]">
                                        Resources
                                    </Link>
                                    <div className="flex items-center gap-1.5 text-slate-400 cursor-default uppercase tracking-widest text-[10px]">
                                        {tFooter("madeWith")}{" "}
                                        <Heart className="h-3 w-3 text-rose-500 fill-rose-500 animate-pulse" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <LocaleSwitcher />
                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                                    <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                        © {year} Itinero Inc.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>


            </div>
        </TooltipProvider>
    );
}
