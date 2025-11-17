"use client";

import * as React from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {createClientBrowser} from "@/lib/supabase/browser";
import {cn} from "@/lib/utils";

import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
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
} from "lucide-react";
import {ThemeToggle} from "@/components/ThemeToggle";
import {TopupDialogFxAware} from "@/components/layout/TopupDialogFxAware";
import {useEffect, useMemo, useState} from "react";
import {FxSnapshot} from "@/lib/fx/types";
import {convertUsingSnapshot, getLatestFxSnapshot} from "@/lib/fx/fx";

type Props = {
    children: React.ReactNode;
    userEmail?: string | null;
};

const POINT_UNIT_PRICE_GHS = 0.4; // 40 pesewas per point

export default function AppShell({children, userEmail}: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const sb = React.useMemo(() => createClientBrowser(), []);

    const [uid, setUid] = React.useState<string | null>(null);
    const [points, setPoints] = React.useState<number>(0);
    const [loadingPoints, setLoadingPoints] = React.useState<boolean>(true);

    const [topupOpen, setTopupOpen] = React.useState(false);
    const [pointsInput, setPointsInput] = React.useState<string>("");
    const [topupBusy, setTopupBusy] = React.useState(false);

    // const [ghsPreview, setGhsPreview] = useState(0);

    // 👉 whatever you already use as the user's planning currency
    const [userCurrency, setUserCurrency] = useState("USD");

    // 🔹 FX snapshot state
    const [fxSnapshot, setFxSnapshot] = useState<FxSnapshot | null>(null);

    // 🔔 Preview indicator state
    const [hasPreview, setHasPreview] = React.useState(false);

    const fmtInt = React.useCallback(
        (n: number) =>
            new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 0,
            }).format(n),
        [],
    );

    // Derive 1 GHS -> userCurrency rate
    const ghsToUserRate = useMemo(() => {
        if (!fxSnapshot) return null;
        const val = convertUsingSnapshot(fxSnapshot, 1, "GHS", userCurrency);
        return val;
    }, [fxSnapshot, userCurrency]);


    // Fetch once on mount (or when base changes, if you ever change it)
    useEffect(() => {
        let cancelled = false;

        (async () => {
            const snap = await getLatestFxSnapshot("USD"); // or "GHS" or your default base
            if (!cancelled) {
                setFxSnapshot(snap);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);


    // Check localStorage for preview whenever route changes
    React.useEffect(() => {
        try {
            if (typeof window !== "undefined") {
                const raw = window.localStorage.getItem("itinero:latest_preview");
                setHasPreview(!!raw);
            }
        } catch {
            setHasPreview(false);
        }
    }, [pathname]);

    // Consolidated refresh: use RPC; if it fails, keep current points
    const refreshPoints = React.useCallback(
        async (userId: string | null) => {
            if (!userId) {
                setPoints(0);
                setLoadingPoints(false);
                return;
            }

            setLoadingPoints(true);
            try {
                const {data: sumValue, error} = await sb.rpc(
                    "sum_points_for_user",
                    {
                        uid: userId,
                    },
                );

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
        [sb],
    );

    // Session init + auth listener
    React.useEffect(() => {
        let mounted = true;

        (async () => {
            const {data: auth} = await sb.auth.getUser();
            if (!mounted) return;

            const userId = auth?.user?.id ?? null;
            setUid(userId);
            await refreshPoints(userId);
        })();

        const {data: sub} = sb.auth.onAuthStateChange(async (_evt, sess) => {
            if (!mounted) return;
            const userId = sess?.user?.id ?? null;
            setUid(userId);
            await refreshPoints(userId);
        });

        return () => {
            mounted = false;
            sub?.subscription?.unsubscribe();
        };
    }, [sb, refreshPoints]);

    // Live updates for points changes
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
                () => void refreshPoints(uid),
            )
            .subscribe();

        const chProfiles = sb
            .channel("profiles-live")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${uid}`,
                },
                () => void refreshPoints(uid),
            )
            .subscribe();

        return () => {
            void sb.removeChannel(chLedger);
            void sb.removeChannel(chProfiles);
        };
    }, [uid, sb, refreshPoints]);

    const logout = React.useCallback(async () => {
        try {
            await sb.auth.signOut();
        } finally {
            router.replace("/");
        }
    }, [router, sb]);

    // Top-up → quote → Paystack init
    const startTopup = React.useCallback(async () => {
        const pts = Number(pointsInput);
        if (!Number.isFinite(pts) || pts <= 0 || !uid || topupBusy) return;

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
    }, [pointsInput, uid, topupBusy, userEmail]);

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
                className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background/70 to-background text-foreground">
                {/* Header */}
                <header
                    className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
                    <div
                        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        {/* Left: Mobile menu + Brand */}
                        <div className="flex items-center gap-2">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden"
                                        aria-label="Open menu"
                                    >
                                        <Menu className="h-5 w-5"/>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-80">
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center gap-2">
                      <span
                          className="grid h-8 w-8 place-items-center rounded-md bg-primary/90 text-primary-foreground">
                        <Map className="h-4 w-4"/>
                      </span>
                                            Itinero
                                        </SheetTitle>
                                    </SheetHeader>

                                    <nav className="mt-6 grid gap-1">
                                        <MobileNavItem
                                            href="/trips"
                                            active={pathname?.startsWith("/trips")}
                                        >
                                            <Calendar className="mr-2 h-4 w-4"/>
                                            Trips
                                        </MobileNavItem>

                                        {/* Mobile: Preview */}
                                        <MobileNavItem
                                            href="/preview"
                                            active={pathname === "/preview"}
                                        >
                      <span className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4"/>
                        Preview
                          {hasPreview && (
                              <span
                                  className="ml-2 h-2 w-2 animate-pulse rounded-full bg-red-500"
                                  aria-hidden
                              />
                          )}
                      </span>
                                        </MobileNavItem>

                                        <MobileNavItem
                                            href="/profile"
                                            active={pathname === "/profile"}
                                        >
                                            <User className="mr-2 h-4 w-4"/>
                                            Profile
                                        </MobileNavItem>
                                        <MobileNavItem
                                            href="/rewards"
                                            active={pathname === "/rewards"}
                                        >
                                            <Star className="mr-2 h-4 w-4"/>
                                            Rewards
                                        </MobileNavItem>
                                    </nav>

                                    <div className="mt-6">
                                        <Button
                                            className="w-full gap-1"
                                            onClick={() => router.push("/trip-maker")}
                                        >
                                            <Plus className="h-4 w-4"/>
                                            New Trip
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <Link
                                href="/trips"
                                className="group flex items-center gap-2 text-sm font-semibold"
                            >
                <span
                    className="grid h-9 w-9 place-items-center rounded-md bg-primary/90 text-primary-foreground shadow-sm transition group-hover:scale-[1.02]">
                  <Map className="h-4 w-4"/>
                </span>
                                <span
                                    className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-base text-transparent">
                  Itinero
                </span>
                            </Link>
                        </div>

                        {/* Center: Desktop Nav */}
                        <nav className="hidden items-center gap-1 md:flex">
                            {/* Desktop: Preview */}
                            <NavItem href="/preview" active={pathname === "/preview"}>
                <span className="inline-flex items-center">
                  Preview
                    {hasPreview && (
                        <span
                            className="ml-2 h-2 w-2 animate-pulse rounded-full bg-emerald-500"
                            aria-hidden
                        />
                    )}
                </span>
                            </NavItem>

                            <NavItem
                                href="/trips"
                                active={pathname?.startsWith("/trips")}
                            >
                                <Calendar className="mr-2 h-4 w-4"/>
                                Trips
                            </NavItem>

                            <Button
                                size="sm"
                                className="ml-1 gap-1"
                                onClick={() => router.push("/trip-maker")}
                                aria-label="Create new trip"
                                title="Create new trip"
                            >
                                <Plus className="h-4 w-4"/>
                                New Trip
                            </Button>

                            <NavItem href="/profile" active={pathname === "/profile"}>
                                <User className="mr-2 h-4 w-4"/>
                                Profile
                            </NavItem>
                        </nav>

                        {/* Right: Theme + Points + User */}
                        <div className="flex items-center gap-1">
                            <ThemeToggle/>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="gap-1"
                                        onClick={() => router.push("/rewards")}
                                        title="View rewards"
                                        aria-label="View rewards"
                                    >
                                        <Star className="h-4 w-4"/>
                                        {loadingPoints ? (
                                            <span className="inline-flex h-4 w-10 animate-pulse rounded-sm bg-muted"/>
                                        ) : (
                                            <span className="tabular-nums">
                        {fmtInt(points)}
                      </span>
                                        )}
                                        <span className="hidden sm:inline">pts</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    Your rewards balance
                                </TooltipContent>
                            </Tooltip>

                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 border-border"
                                onClick={() => {
                                    setPointsInput("");
                                    setTopupOpen(true);
                                }}
                                aria-label="Top up points"
                            >
                                <Plus className="h-4 w-4"/>
                                Top up
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-1 px-2"
                                        aria-label="Open user menu"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage alt={userEmail ?? "User"}/>
                                            <AvatarFallback>
                                                {initials(userEmail)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-64 border-border"
                                >
                                    <DropdownMenuLabel className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      {userEmail ?? "Signed in"}
                    </span>
                                        <Badge variant="secondary" className="gap-1">
                                            <Crown className="h-3 w-3"/>
                                            {loadingPoints ? "…" : fmtInt(points)}
                                        </Badge>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem
                                        onClick={() => router.push("/profile")}
                                    >
                                        <User className="mr-2 h-4 w-4"/>
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => router.push("/rewards")}
                                    >
                                        <Star className="mr-2 h-4 w-4"/>
                                        Rewards
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem onClick={logout}>
                                        <LogOut className="mr-2 h-4 w-4"/>
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Main */}
                <main
                    id="app-content"
                    className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-6 md:py-10 lg:px-8"
                >
                    {children}
                </main>

                {/* Footer */}
                <footer className="mt-auto border-t border-border/60 bg-background/80">
                    <div
                        className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-4 text-xs text-muted-foreground">
                        {/* Top row */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            {/* Brand + tagline */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="grid h-8 w-8 place-items-center rounded-md bg-primary/90 text-primary-foreground">
                                    <Map className="h-4 w-4"/>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-foreground">
                                        Itinero
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Plan smarter, wander farther.
                                    </p>
                                </div>
                            </div>

                            {/* Quick links */}
                            <div className="flex flex-wrap items-center gap-3 text-[11px]">
                                <FooterLink
                                    href="/trips"
                                    label="Trips"
                                    active={pathname?.startsWith("/trips")}
                                />
                                <FooterLink
                                    href="/preview"
                                    label={
                                        <span className="inline-flex items-center gap-1">
                      Preview
                                            {hasPreview && (
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>
                                            )}
                    </span>
                                    }
                                    active={pathname === "/preview"}
                                />
                                <FooterLink
                                    href="/rewards"
                                    label="Rewards"
                                    active={pathname === "/rewards"}
                                />
                                <FooterLink
                                    href="/profile"
                                    label="Profile"
                                    active={pathname === "/profile"}
                                />
                            </div>

                            {/* Status badge */}
                            <div className="flex items-center justify-start gap-2 sm:justify-end">
                <span className="hidden text-[11px] text-muted-foreground sm:inline">
                  Rewards balance
                </span>
                                <div
                                    className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-[11px]">
                                    <Star className="h-3 w-3 text-amber-500"/>
                                    {loadingPoints ? (
                                        <span className="inline-flex h-3 w-8 animate-pulse rounded-sm bg-muted"/>
                                    ) : (
                                        <span className="tabular-nums font-semibold text-foreground">
                      {fmtInt(points)}
                    </span>
                                    )}
                                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    pts
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border/60"/>

                        {/* Bottom row */}
                        <div
                            className="flex flex-col gap-2 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                            <p>
                                © {year}{" "}
                                <span className="font-medium text-foreground">
                  Itinero
                </span>
                                . All rights reserved.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <p className="flex items-center gap-1">
                                    <span aria-hidden>❤️</span>
                                    <span>Built for curious travellers.</span>
                                </p>
                                <Link
                                    href="/about"
                                    className="underline-offset-2 hover:text-foreground hover:underline"
                                >
                                    About Itinero
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>

                {/* Top up dialog (POINTS → GHS) */}

                <TopupDialogFxAware
                    topupOpen={topupOpen}
                    setTopupOpen={setTopupOpen}
                    topupBusy={topupBusy}
                    pointsInput={pointsInput}
                    setPointsInput={setPointsInput}
                    onPointsKeyDown={onPointsKeyDown}
                    startTopup={startTopup}
                    ghsPreview={ghsPreview}
                    userCurrency={"USD"}        // or from user profile
                    ghsToUserRate={ghsToUserRate} // e.g. 1 GHS -> ? userCurrency
                />
            </div>
        </TooltipProvider>
    );
}

/* ---------- Nav items ---------- */
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
                "inline-flex items-center rounded-md px-3 py-1.5 text-sm transition",
                "hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                    ? "bg-accent text-foreground shadow-sm"
                    : "text-muted-foreground",
            )}
            aria-current={active ? "page" : undefined}
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
                "inline-flex items-center rounded-md px-3 py-2 text-sm",
                active
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent",
            )}
            aria-current={active ? "page" : undefined}
        >
            {children}
        </Link>
    );
}

/* ---------- Footer link helper ---------- */

function FooterLink({
                        href,
                        label,
                        active,
                    }: {
    href: string;
    label: React.ReactNode;
    active?: boolean;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "text-[11px] transition hover:text-foreground",
                active ? "text-foreground font-medium" : "text-muted-foreground",
            )}
        >
            {label}
        </Link>
    );
}