"use client";

import * as React from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {getSupabaseBrowser} from "@/lib/supabase/browser-singleton";
import {cn} from "@/lib/utils";

import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
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
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

import {
    LogOut,
    User,
    Map,
    Calendar,
    Star,
    Plus,
    Menu,
    Crown,
    Sparkles,
    Globe,
    Heart,
    Plane,
    Settings,
    CreditCard,
} from "lucide-react";
import {ThemeToggle} from "@/components/ThemeToggle";
import {TopupDialogFxAware} from "@/components/layout/TopupDialogFxAware";
import {FxSnapshot} from "@/lib/fx/types";
import {convertUsingSnapshot, getLatestFxSnapshot} from "@/lib/fx/fx";
import {useEffect} from "react";

type Props = {
    children: React.ReactNode;
    userEmail?: string | null;
};

const POINT_UNIT_PRICE_GHS = 0.4; // 40 pesewas per point

export default function AppShell({children, userEmail}: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const sb = React.useMemo(() => getSupabaseBrowser(), []);

    const [uid, setUid] = React.useState<string | null>(null);
    const [points, setPoints] = React.useState<number>(0);
    const [loadingPoints, setLoadingPoints] = React.useState<boolean>(true);

    const [topupOpen, setTopupOpen] = React.useState(false);
    const [pointsInput, setPointsInput] = React.useState<string>("");
    const [topupBusy, setTopupBusy] = React.useState(false);

    // user’s preferred planning currency (overwritten by profile)
    const [userCurrency, setUserCurrency] = React.useState("GHS");

    // FX snapshot & preview indicator
    const [fxSnapshot, setFxSnapshot] = React.useState<FxSnapshot | null>(null);
    const [hasPreview, setHasPreview] = React.useState(false);

    const fmtInt = React.useCallback(
        (n: number) =>
            new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 0,
            }).format(n),
        []
    );

    // -------- Helper: reset broken Supabase auth + localStorage --------
    const resetAuthAndStorage = React.useCallback(async () => {
        if (typeof window !== "undefined") {
            try {
                // Remove Supabase + app-specific keys that are most likely involved.
                for (const key of Object.keys(window.localStorage)) {
                    if (
                        key.startsWith("sb-") || // supabase-js v2
                        key.startsWith("supabase.") || // older patterns
                        key.startsWith("itinero:")
                    ) {
                        window.localStorage.removeItem(key);
                    }
                }
            } catch (e) {
                console.error("[resetAuthAndStorage] error clearing storage:", e);
            }
        }

        try {
            await sb.auth.signOut();
        } catch (e) {
            console.error("[resetAuthAndStorage] signOut error:", e);
        }

        setUid(null);
        // Send user to landing/login so they can re-auth cleanly
        router.replace("/");
    }, [router, sb]);

    // -------- Points refresh (RPC) --------
    const refreshPoints = React.useCallback(
        async (userId: string | null) => {
            if (!userId) {
                setPoints(0);
                setLoadingPoints(false);
                return;
            }

            setLoadingPoints(true);
            try {
                const {data: sumValue, error} = await sb.rpc("sum_points_for_user", {
                    uid: userId,
                });

                if (error) {
                    console.error("[refreshPoints] RPC error:", error);
                    return;
                }

                const rpcPoints = Number(sumValue ?? 0);
                if (Number.isFinite(rpcPoints)) {
                    setPoints(rpcPoints);
                }
            } catch (e) {
                console.error("[refreshPoints] RPC threw:", e);
            } finally {
                setLoadingPoints(false);
            }
        },
        [sb]
    );

    // -------- preferred_currency from profile --------
    const refreshPreferredCurrency = React.useCallback(
        async (userId: string | null) => {
            if (!userId) return;

            try {
                const {data, error} = await sb
                    .schema("itinero")
                    .from("profiles")
                    .select("preferred_currency")
                    .eq("id", userId)
                    .maybeSingle<{ preferred_currency: string | null }>();

                if (error) {
                    console.error("[refreshPreferredCurrency] error:", error);
                    return;
                }

                if (data?.preferred_currency) {
                    const code = data.preferred_currency.toUpperCase();
                    setUserCurrency(code);
                } else {
                    // fallback default
                    setUserCurrency("USD");
                }
            } catch (e) {
                console.error("[refreshPreferredCurrency] threw:", e);
            }
        },
        [sb]
    );

    // -------- FX snapshot + derived GHS -> userCurrency --------
    useEffect(() => {
        const cancelled = {current: false};

        (async () => {
            try {
                const snap = await getLatestFxSnapshot("USD"); // or your base
                if (!cancelled.current) {
                    setFxSnapshot(snap);
                }
            } catch (e) {
                console.error("[FX] getLatestFxSnapshot threw:", e);
            }
        })();

        return () => {
            cancelled.current = true;
        };
    }, []);

    const ghsToUserRate = React.useMemo(() => {
        if (!fxSnapshot) return null;
        // 1 GHS -> userCurrency
        const val = convertUsingSnapshot(fxSnapshot, 1, "GHS", userCurrency);
        return val;
    }, [fxSnapshot, userCurrency]);

    // -------- Session init + auth listener (single effect, hardened) --------
    React.useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const {data, error} = await sb.auth.getSession();
                if (!mounted) return;

                if (error) {
                    console.error("[auth.getSession] error:", error);
                    // If the session can't even be read, reset everything
                    await resetAuthAndStorage();
                    return;
                }

                const userId = data?.session?.user?.id ?? null;
                console.log("[auth.getSession] uid:", userId);
                setUid(userId);

                await Promise.all([
                    refreshPoints(userId),
                    refreshPreferredCurrency(userId),
                ]);
            } catch (e) {
                console.error("[auth.getSession] threw:", e);
                if (mounted) {
                    await resetAuthAndStorage();
                }
            }
        })();

        const {data: sub} = sb.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;
                console.log("[auth.onAuthStateChange]", event, session?.user?.id);

                // If Supabase reports an invalid session, just reset.
                if (!session || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
                    // session will be null on SIGNED_OUT, non-null on TOKEN_REFRESHED
                    // For SIGNED_OUT, treat user as logged out.
                    const userId = session?.user?.id ?? null;
                    setUid(userId);

                    if (event === "SIGNED_OUT") {
                        // ensure storage is clean
                        await resetAuthAndStorage();
                        return;
                    }

                    if (event === "TOKEN_REFRESHED") {
                        // Just refresh data for the (possibly new) user
                        await Promise.all([
                            refreshPoints(userId),
                            refreshPreferredCurrency(userId),
                        ]);
                        return;
                    }
                } else {
                    const userId = session.user?.id ?? null;
                    setUid(userId);
                    await Promise.all([
                        refreshPoints(userId),
                        refreshPreferredCurrency(userId),
                    ]);
                }
            }
        );

        return () => {
            mounted = false;
            sub?.subscription?.unsubscribe();
        };
    }, [sb, refreshPoints, refreshPreferredCurrency, resetAuthAndStorage]);

    // -------- Preview indicator (localStorage) --------
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

    // -------- Live updates: points + preferred_currency --------
    React.useEffect(() => {
        if (!uid) return;

        const chLedger = sb
            .channel("points-ledger-live")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "itinero",
                    table: "points_ledger",
                    filter: `user_id=eq.${uid}`,
                },
                () => void refreshPoints(uid)
            )
            .subscribe();

        const chProfiles = sb
            .channel("profiles-live")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "itinero",
                    table: "profiles",
                    filter: `id=eq.${uid}`,
                },
                () => {
                    void refreshPoints(uid);
                    void refreshPreferredCurrency(uid);
                }
            )
            .subscribe();

        return () => {
            void sb.removeChannel(chLedger);
            void sb.removeChannel(chProfiles);
        };
    }, [uid, sb, refreshPoints, refreshPreferredCurrency]);

    // -------- Auth: logout --------
    const logout = React.useCallback(async () => {
        try {
            await sb.auth.signOut();
        } catch (e) {
            console.error("[logout] signOut error:", e);
        } finally {
            // Also clean local storage, just to be safe
            await resetAuthAndStorage();
        }
    }, [resetAuthAndStorage, sb]);

    // -------- Top-up → quote → Paystack init --------
    const startTopup = React.useCallback(async () => {
        const pts = Number(pointsInput);

        // If uid is missing, don't silently fail: force user to re-auth
        if (!uid) {
            console.warn("[startTopup] No uid – resetting auth & redirecting");
            await resetAuthAndStorage();
            return;
        }

        if (!Number.isFinite(pts) || pts <= 0 || topupBusy) return;

        setTopupBusy(true);
        try {
            const qRes = await fetch("/api/points/quote", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({points: pts}),
            });

            if (!qRes.ok) {
                const err = await qRes.json().catch(() => ({}));
                console.error("Quote failed", err);
                return;
            }
            const q = await qRes.json();

            const initRes = await fetch("/api/paystack/init", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    quoteId: q.quoteId,
                    email: userEmail ?? "user@example.com",
                }),
            });

            if (!initRes.ok) {
                const err = await initRes.json().catch(() => ({}));
                console.error("Paystack init failed", err);
                return;
            }

            const init = await initRes.json();
            window.location.href = init.authorization_url;
        } catch (e) {
            console.error(e);
        } finally {
            setTopupBusy(false);
        }
    }, [pointsInput, uid, topupBusy, userEmail, resetAuthAndStorage]);

    const onPointsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            void startTopup();
        }
    };

    const initials = (email?: string | null) =>
        (email?.[0] ?? "U").toUpperCase() +
        (email?.split("@")?.[0]?.[1]?.toUpperCase() ?? "");

    const pointsToBuy = Number(pointsInput) || 0;
    const ghsPreview =
        Math.round(pointsToBuy * POINT_UNIT_PRICE_GHS * 100) / 100;

    const year = new Date().getFullYear();

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
                                        <Menu className="h-4 w-4"/>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="w-72 p-0 border-r-slate-200 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                        <Link
                                            href="/"
                                            className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400"
                                        >
                      <span
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                        <Plane className="h-4 w-4"/>
                      </span>
                                            Itinero
                                        </Link>
                                    </div>
                                    <div className="p-4 flex flex-col gap-1">
                                        <MobileNavItem
                                            href="/trips"
                                            active={pathname?.startsWith("/trips")}
                                        >
                                            <Calendar className="mr-3 h-4 w-4"/> Trips
                                        </MobileNavItem>
                                        <MobileNavItem
                                            href="/preview"
                                            active={pathname === "/preview"}
                                        >
                                            <Sparkles className="mr-3 h-4 w-4"/>
                                            Preview
                                            {hasPreview && (
                                                <span
                                                    className="ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse"/>
                                            )}
                                        </MobileNavItem>
                                        <MobileNavItem
                                            href="/rewards"
                                            active={pathname === "/rewards"}
                                        >
                                            <Star className="mr-3 h-4 w-4"/> Rewards
                                        </MobileNavItem>
                                        <MobileNavItem
                                            href="/profile"
                                            active={pathname === "/profile"}
                                        >
                                            <User className="mr-3 h-4 w-4"/> Profile
                                        </MobileNavItem>
                                    </div>
                                    <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-800">
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                                            onClick={() => router.push("/trip-maker")}
                                        >
                                            <Plus className="mr-2 h-4 w-4"/> New Trip
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Link
                                href="/trips"
                                className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400"
                            >
                <span
                    className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                  <Plane className="h-4 w-4"/>
                </span>
                                <span className="hidden sm:inline-block">Itinero</span>
                            </Link>
                        </div>

                        {/* Center: Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            <NavItem href="/preview" active={pathname === "/preview"}>
                                Preview
                                {hasPreview && (
                                    <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"/>
                                )}
                            </NavItem>
                            <NavItem href="/trips" active={pathname?.startsWith("/trips")}>
                                Trips
                            </NavItem>
                            <NavItem href="/rewards" active={pathname === "/rewards"}>
                                Rewards
                            </NavItem>
                        </nav>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 rounded-full p-0 text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                                    onClick={() => router.push("/trip-maker")}
                                    title="New Trip"
                                >
                                    <Plus className="h-5 w-5"/>
                                </Button>
                            </div>

                            <div className="h-4 w-px bg-slate-200 hidden sm:block dark:bg-slate-800"></div>

                            {/* --- FIXED TOP UP BUTTON --- */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 rounded-full gap-0 px-3 border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
                                        onClick={() => setTopupOpen(true)}
                                    >
                                        {/* Balance Section */}
                                        <div className="flex items-center gap-1.5 mr-2">
                <span className="text-sm font-bold tabular-nums">
                    {loadingPoints ? "..." : fmtInt(points)}
                </span>
                                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400"/>
                                        </div>

                                        {/* Separator */}
                                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mr-2"/>

                                        {/* Action Section */}
                                        <div className="flex items-center gap-1">
                                            <Plus className="h-3.5 w-3.5" strokeWidth={3}/>
                                            <span
                                                className="hidden lg:inline text-xs font-bold uppercase tracking-wide">Top Up</span>
                                        </div>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Top up your balance</TooltipContent>
                            </Tooltip>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full p-0 ml-1 ring-2 ring-transparent hover:ring-slate-100 dark:hover:ring-slate-800"
                                    >
                                        <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                                            <AvatarImage src=""/>
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
                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800"/>
                                    <DropdownMenuItem
                                        onClick={() => router.push("/profile")}
                                        className="rounded-lg cursor-pointer text-slate-600 focus:text-blue-600 focus:bg-blue-50 dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-blue-400"
                                    >
                                        <User className="mr-2 h-4 w-4"/> Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push("/pricing")}
                                        className="rounded-lg cursor-pointer text-slate-600 focus:text-blue-600 focus:bg-blue-50 dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-blue-400"
                                    >
                                        <CreditCard className="mr-2 h-4 w-4"/> Billing
                                    </DropdownMenuItem>
                                    <div
                                        className="flex items-center justify-between px-2 py-1.5 text-slate-600 dark:text-slate-300">
                                        <span className="text-sm">Theme</span>
                                        <ThemeToggle/>
                                    </div>
                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800"/>
                                    <DropdownMenuItem
                                        onClick={logout}
                                        className="rounded-lg cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:text-rose-400 dark:focus:bg-rose-900/20"
                                    >
                                        <LogOut className="mr-2 h-4 w-4"/> Log out
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
                                <Plane className="h-3 w-3"/>
                            </div>
                            Itinero
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            © {year} Itinero Inc. All rights reserved.
                        </div>
                        <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <Link
                                href="/terms"
                                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                Terms
                            </Link>
                            <Link
                                href="/privacy"
                                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                Privacy
                            </Link>
                            <div className="flex items-center gap-1 text-slate-400 cursor-default">
                                Made with{" "}
                                <Heart className="h-3 w-3 text-rose-500 fill-rose-500"/>
                            </div>
                        </div>
                    </div>
                </footer>

                {/* Top up dialog */}
                <TopupDialogFxAware
                    topupOpen={topupOpen}
                    setTopupOpen={setTopupOpen}
                    topupBusy={topupBusy}
                    pointsInput={pointsInput}
                    setPointsInput={setPointsInput}
                    onPointsKeyDown={onPointsKeyDown}
                    startTopup={startTopup}
                    ghsPreview={ghsPreview}
                    userCurrency={userCurrency}
                    ghsToUserRate={ghsToUserRate}
                />
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
                "relative px-4 py-2 text-sm font-medium transition-all rounded-full",
                active
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            )}
        >
            {children}
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