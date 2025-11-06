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

// Typed rows
type LedgerSumRow = { sum: number | null };
type LedgerRow = { delta: number | null };
type ProfileRow = { points_balance: number | null; points: number | null };

export default function AppShell({children, userEmail}: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const sb = React.useMemo(() => createClientBrowser(), []);

    const [uid, setUid] = React.useState<string | null>(null);
    const [points, setPoints] = React.useState<number>(0);
    const [loadingPoints, setLoadingPoints] = React.useState<boolean>(true);

    const [topupOpen, setTopupOpen] = React.useState(false);
    const [topupAmt, setTopupAmt] = React.useState<string>("");
    const [topupBusy, setTopupBusy] = React.useState(false);

    // number helpers
    const fmtInt = React.useCallback(
        (n: number) =>
            new Intl.NumberFormat(undefined, {maximumFractionDigits: 0}).format(n),
        []
    );

    // init: session + first load, and listen to auth changes
    React.useEffect(() => {
        let mounted = true;

        (async () => {
            const {data: auth} = await sb.auth.getUser();
            const userId = auth?.user?.id ?? null;
            if (!mounted) return;
            setUid(userId);
            await refreshPoints(userId);
        })();

        const {data: sub} = sb.auth.onAuthStateChange(async (_evt, sess) => {
            const userId = sess?.user?.id ?? null;
            setUid(userId);
            await refreshPoints(userId);
        });

        return () => {
            mounted = false;
            sub?.subscription?.unsubscribe();
        };
    }, [sb]);

    // live updates when ledger OR profiles change
    React.useEffect(() => {
        if (!uid) return;

        const ch1 = sb
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

        const ch2 = sb
            .channel("profiles-live")
            .on(
                "postgres_changes",                           // ← you were missing this
                { event: "*", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
                () => void refreshPoints(uid)
            )
            .subscribe();

        return () => {
            void sb.removeChannel(ch1);
            void sb.removeChannel(ch2);
        };
    }, [uid, sb]);

    const refreshPoints = React.useCallback(
        async (userId: string | null) => {
            setLoadingPoints(true);
            try {
                if (!userId) {
                    setPoints(0);
                    return;
                }

                // 1) Preferred: secure RPC
                try {
                    const {data: rpcBalance, error: rpcErr} = await sb.rpc(
                        "get_points_balance"
                    );
                    if (!rpcErr && typeof rpcBalance === "number") {
                        setPoints(rpcBalance);
                        return;
                    }
                } catch {
                    /* ignore */
                }

                // 2) Aggregate on ledger
                try {
                    const {data, error} = await sb
                        .schema("itinero")
                        .from("points_ledger")
                        .select("sum:sum(delta)")
                        .eq("user_id", userId)
                        .maybeSingle<LedgerSumRow>();

                    if (!error && data) {
                        const agg = Number(data.sum ?? 0);
                        if (Number.isFinite(agg)) {
                            setPoints(agg);
                            return;
                        }
                    }
                } catch {
                    /* ignore */
                }

                // 3) Client-side sum fallback
                try {
                    const {data: rows, error} = await sb
                        .schema("itinero")
                        .from("points_ledger")
                        .select("delta")
                        .eq("user_id", userId);

                    if (!error && Array.isArray(rows)) {
                        const typedRows = rows as LedgerRow[];
                        const total = typedRows.reduce<number>(
                            (acc, r) => acc + (Number(r.delta ?? 0) || 0),
                            0
                        );
                        setPoints(total);
                        return;
                    }
                } catch {
                    /* ignore */
                }

                // 4) Final fallback: profiles
                try {
                    const {data: prof, error: pErr} = await sb
                        .from("profiles")
                        .select("points_balance, points")
                        .eq("id", userId)
                        .maybeSingle<ProfileRow>();

                    if (!pErr && prof) {
                        const bal =
                            typeof prof.points_balance === "number"
                                ? prof.points_balance
                                : typeof prof.points === "number"
                                    ? prof.points
                                    : 0;
                        setPoints(bal);
                        return;
                    }
                } catch {
                    /* ignore */
                }

                setPoints(0);
            } finally {
                setLoadingPoints(false);
            }
        },
        [sb]
    );

    const logout = React.useCallback(async () => {
        try {
            await sb.auth.signOut();
        } finally {
            router.replace("/");
        }
    }, [router, sb]);

    const handleTopup = React.useCallback(async () => {
        const amount = Number(topupAmt);
        if (!Number.isFinite(amount) || amount <= 0 || !uid || topupBusy) return;

        setTopupBusy(true);
        try {
            const {
                data: {session},
            } = await sb.auth.getSession();
            if (!session?.access_token) {
                throw new Error("Please sign in to top up points.");
            }

            const r = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create_topup_session`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
                    },
                    body: JSON.stringify({amount, currency: "GHS"}),
                }
            );

            const data = await r.json();
            if (r.ok && data.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                console.error("Topup init failed", data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setTopupBusy(false);
        }
    }, [sb, topupAmt, uid, topupBusy]);

    const onTopupKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            void handleTopup();
        }
    };

    return (
        <TooltipProvider>
            {/* Wrapper now flexes vertically to keep footer at bottom */}
            <div
                className="min-h-dvh min-h-screen flex flex-col bg-gradient-to-b from-background via-background/70 to-background text-foreground">
                {/* Header */}
                <header
                    className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
                    <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-3 md:px-6">
                        {/* Left: Brand + Mobile Menu */}
                        <div className="flex items-center gap-2">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="mr-1 md:hidden"
                                        aria-label="Open menu"
                                    >
                                        <Menu className="h-5 w-5"/>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-72">
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center gap-2">
                                            <Map className="h-4 w-4"/>
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
                                        <MobileNavItem href="/profile" active={pathname === "/profile"}>
                                            <User className="mr-2 h-4 w-4"/>
                                            Profile
                                        </MobileNavItem>
                                        <MobileNavItem href="/rewards" active={pathname === "/rewards"}>
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
                    className="grid h-8 w-8 place-items-center rounded-md bg-primary/90 text-primary-foreground shadow-sm transition group-hover:scale-[1.02]">
                  <Map className="h-4 w-4"/>
                </span>
                                <span
                                    className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Itinero
                </span>
                            </Link>
                        </div>

                        {/* Center: Desktop nav */}
                        <nav className="hidden items-center gap-1 md:flex">
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

                        {/* Right: Theme toggle + points + user */}
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
                                <TooltipContent side="bottom">Your rewards balance</TooltipContent>
                            </Tooltip>

                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => setTopupOpen(true)}
                                aria-label="Top up points"
                            >
                                <Plus className="h-4 w-4"/>
                                Top up
                            </Button>

                            {/* User menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-1 px-2"
                                        aria-label="Open user menu"
                                    >
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage alt={userEmail ?? "User"}/>
                                            <AvatarFallback>
                                                {(userEmail ?? "U").slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-60">
                                    <DropdownMenuLabel className="flex items-center justify-between">
                                        <span className="truncate">{userEmail ?? "Signed in"}</span>
                                        <Badge variant="secondary" className="gap-1">
                                            <Crown className="h-3 w-3"/>{" "}
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

                {/* Page content */}
                <main className="flex-1 mx-auto w-full max-w-[1400px] px-3 md:px-6">
                    {children}
                </main>

                {/* Footer stays at bottom */}
                <footer className="mt-auto border-t border-border py-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Itinero
                </footer>

                {/* Top up dialog */}
                <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Top up points</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <label htmlFor="topup-amount" className="text-xs text-muted-foreground">
                                Amount (GHS)
                            </label>
                            <Input
                                id="topup-amount"
                                type="number"
                                inputMode="decimal"
                                min={1}
                                placeholder="e.g., 100"
                                value={topupAmt}
                                onChange={(e) => setTopupAmt(e.target.value)}
                                onKeyDown={onTopupKeyDown}
                                aria-label="Top up amount in Ghana cedis"
                            />
                            <p className="text-xs text-muted-foreground">
                                This creates a credit row in{" "}
                                <span className="font-medium">itinero.points_ledger</span>.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setTopupOpen(false)} disabled={topupBusy}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleTopup}
                                disabled={topupBusy || !Number(topupAmt) || Number(topupAmt) <= 0}
                            >
                                {topupBusy ? "Processing…" : "Confirm"}
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
                active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent"
            )}
            aria-current={active ? "page" : undefined}
        >
            {children}
        </Link>
    );
}