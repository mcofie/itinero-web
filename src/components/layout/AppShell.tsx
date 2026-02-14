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
import { Footer } from "@/components/layout/Footer";


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

                <Footer className="mt-auto" />


            </div>
        </TooltipProvider>
    );
}
