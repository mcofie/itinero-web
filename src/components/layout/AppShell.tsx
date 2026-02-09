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


import { useEffect } from "react";

type Props = {
    children: React.ReactNode;
    userEmail?: string | null;
};



export default function AppShell({ children, userEmail }: Props) {
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




    const initials = (email?: string | null) =>
        (email?.[0] ?? "U").toUpperCase() +
        (email?.split("@")?.[0]?.[1]?.toUpperCase() ?? "");

    const year = new Date().getFullYear();



    // ... (existing imports)

    // ... (inside AppShell component, before return)

    return (
        <TooltipProvider delayDuration={150}>
            <div
                className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-white dark:selection:bg-blue-900 dark:selection:text-white transition-colors duration-300">

                {/* Header */}
                <header
                    className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

                        {/* Left: Brand & Mobile Menu */}
                        <div className="flex items-center gap-3">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden h-8 w-8 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        <Menu className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="w-72 p-0 border-r-slate-200 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                        <Link
                                            href={userEmail ? "/trips" : "/"}
                                            className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400"
                                        >
                                            <span
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                                                <Plane className="h-4 w-4" />
                                            </span>
                                            Itinero
                                        </Link>
                                    </div>
                                    <div className="p-4 flex flex-col gap-1">
                                        <MobileNavItem
                                            href="/trips"
                                            active={pathname?.startsWith("/trips")}
                                        >
                                            <Calendar className="mr-3 h-4 w-4" /> {tNav("trips")}
                                        </MobileNavItem>
                                        <MobileNavItem
                                            href="/preview"
                                            active={pathname === "/preview"}
                                        >
                                            <Sparkles className="mr-3 h-4 w-4" />
                                            {tNav("preview")}
                                            {hasPreview && (
                                                <span
                                                    className="ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                            )}
                                        </MobileNavItem>
                                        <MobileNavItem
                                            href="/rewards"
                                            active={pathname === "/rewards"}
                                        >
                                            <Star className="mr-3 h-4 w-4" /> {tNav("rewards")}
                                        </MobileNavItem>
                                        <MobileNavItem
                                            href="/profile"
                                            active={pathname === "/profile"}
                                        >
                                            <User className="mr-3 h-4 w-4" /> {tNav("profile")}
                                        </MobileNavItem>
                                    </div>
                                    <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800">
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                                            onClick={() => router.push("/trip-maker")}
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> {tActions("newTrip")}
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Link
                                href={userEmail ? "/trips" : "/"}
                                className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400"
                            >
                                <span
                                    className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                                    <Plane className="h-4 w-4" />
                                </span>
                                <span className="hidden sm:inline-block">Itinero</span>
                            </Link>
                        </div>

                        {/* Center: Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            <NavItem href="/preview" active={pathname === "/preview"}>
                                {tNav("preview")}
                                {hasPreview && (
                                    <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                )}
                            </NavItem>
                            <NavItem href="/trips" active={pathname?.startsWith("/trips")}>
                                {tNav("trips")}
                            </NavItem>
                            <NavItem href="/rewards" active={pathname === "/rewards"}>
                                {tNav("rewards")}
                            </NavItem>
                        </nav>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">

                            {/* 1. NEW TRIP BUTTON */}
                            <div className="hidden sm:flex">
                                <Button
                                    size="sm"
                                    onClick={() => router.push("/trip-maker")}
                                    className="h-9 items-center gap-2 rounded-full bg-blue-600 px-4 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md dark:bg-blue-500 dark:hover:bg-blue-400"
                                >
                                    <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                                    {tActions("newTrip")}
                                </Button>
                            </div>

                            <div className="hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-800" />



                            {/* 3. NOTIFICATIONS */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl border-slate-100 shadow-xl dark:bg-slate-900 dark:border-slate-800">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                    </div>
                                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 dark:bg-slate-800">
                                            <Bell className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm">No new notifications</p>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* 4. AVATAR MENU */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full p-0 ml-1 ring-2 ring-transparent hover:ring-slate-100 dark:hover:ring-slate-800"
                                    >
                                        <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                                            <AvatarImage src="" />
                                            <AvatarFallback
                                                className="bg-slate-100 text-slate-600 font-bold text-xs dark:bg-slate-800 dark:text-slate-300">
                                                {initials(userEmail)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 rounded-xl p-1 border-slate-100 shadow-lg dark:bg-slate-900 dark:border-slate-800"
                                >
                                    <div className="px-2 py-2 mb-1">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                            {userEmail}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Free Plan
                                        </p>
                                    </div>
                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                    <DropdownMenuItem
                                        onClick={() => router.push("/profile")}
                                        className="rounded-lg cursor-pointer text-slate-600 focus:text-blue-600 focus:bg-blue-50 dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-blue-400"
                                    >
                                        <User className="mr-2 h-4 w-4" /> {tNav("profile")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push("/pricing")}
                                        className="rounded-lg cursor-pointer text-slate-600 focus:text-blue-600 focus:bg-blue-50 dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-blue-400"
                                    >
                                        <CreditCard className="mr-2 h-4 w-4" /> {tNav("billing")}
                                    </DropdownMenuItem>
                                    <div
                                        className="flex items-center justify-between px-2 py-1.5 text-slate-600 dark:text-slate-300">
                                        <span className="text-sm">{tNav("theme")}</span>
                                        <ThemeToggle />
                                    </div>
                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                    <DropdownMenuItem
                                        onClick={logout}
                                        className="rounded-lg cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:text-rose-400 dark:focus:bg-rose-900/20"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" /> {tNav("logout")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 w-full">{children}</main>

                {/* Footer */}
                <footer className="border-t border-slate-200 bg-white py-12 dark:bg-slate-950 dark:border-slate-800">
                    <div
                        className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                            <div
                                className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                                <Plane className="h-3 w-3" />
                            </div>
                            Itinero
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            © {year} Itinero Inc. {tFooter("rights")}
                        </div>
                        <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 items-center">
                            <LocaleSwitcher />
                            <Link
                                href="/terms"
                                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {tFooter("terms")}
                            </Link>
                            <Link
                                href="/privacy"
                                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {tFooter("privacy")}
                            </Link>
                            <div className="flex items-center gap-1 text-slate-400 cursor-default">
                                {tFooter("madeWith")}{" "}
                                <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                            </div>
                        </div>
                    </div>
                </footer>


            </div>
        </TooltipProvider>
    );
}

/* ---------- Nav Items ---------- */
function NavItem({
    href,
    active,
    children,
}: {
    href: string;
    active?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors rounded-full",
                active
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            )}
        >
            {active && (
                <motion.span
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-800"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className="relative z-10">{children}</span>
        </Link>
    );
}

function MobileNavItem({
    href,
    active,
    children,
}: {
    href: string;
    active?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            )}
        >
            {children}
        </Link>
    );
}