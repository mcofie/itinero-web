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

    // 🔔 Preview indicator state
    const [hasPreview, setHasPreview] = React.useState(false);

    const fmtInt = React.useCallback(
        (n: number) =>
            new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 0,
            }).format(n),
        []
    );

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
                () => void refreshPoints(uid)
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
                () => void refreshPoints(uid)
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

    return (
        <TooltipProvider delayDuration={150}>
            <div
                className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background/70 to-background text-foreground">
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
                          className="grid h-8 w-8 place-items-center rounded-md bg-primary/90 text-primary-foreground shadow-sm">
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
                                  className="ml-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
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
                            className="ml-2 h-2 w-2 rounded-full bg-emerald-500 animate-pulse"
                            aria-hidden
                        />
                    )}
                </span>
                            </NavItem>

                            <NavItem href="/trips" active={pathname?.startsWith("/trips")}>
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
                                            <span className="tabular-nums">{fmtInt(points)}</span>
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
                                            <AvatarFallback>{initials(userEmail)}</AvatarFallback>
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
                                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                                        <User className="mr-2 h-4 w-4"/>
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push("/rewards")}>
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
                    className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10"
                >
                    {children}
                </main>

                {/* Footer */}
                <footer className="mt-auto border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Itinero
                </footer>

                {/* Top up dialog (POINTS → GHS) */}
                <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Top up points</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3">
                            <div className="flex items-baseline justify-between">
                                <label
                                    htmlFor="pts"
                                    className="text-xs text-muted-foreground"
                                >
                                    Points to buy
                                </label>
                                <span className="text-xs text-muted-foreground">
                  1 pt = GHS {POINT_UNIT_PRICE_GHS.toFixed(2)}
                </span>
                            </div>

                            <Input
                                id="pts"
                                type="number"
                                inputMode="numeric"
                                min={1}
                                placeholder="e.g., 100"
                                value={pointsInput}
                                onChange={(e) => setPointsInput(e.target.value)}
                                onKeyDown={onPointsKeyDown}
                                aria-label="Points to purchase"
                            />

                            <div className="text-sm">
                                You’ll be charged{" "}
                                <span className="font-semibold">
                  GHS {ghsPreview.toFixed(2)}
                </span>
                                <span className="text-muted-foreground"> via Paystack</span>.
                            </div>
                            <p className="text-xs text-muted-foreground">
                                After a successful payment, your points balance will update
                                automatically.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setTopupOpen(false)}
                                disabled={topupBusy}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={startTopup}
                                disabled={
                                    topupBusy || !Number(pointsInput) || Number(pointsInput) <= 0
                                }
                            >
                                {topupBusy ? "Processing…" : "Confirm & Pay"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                active ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground"
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
                    : "text-muted-foreground hover:bg-accent"
            )}
            aria-current={active ? "page" : undefined}
        >
            {children}
        </Link>
    );
}