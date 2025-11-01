"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { LogOut, User, Map, Calendar, Star, Plus } from "lucide-react";

type Props = {
    children: React.ReactNode;
    userEmail?: string | null;
};

// Shapes used for typed Supabase responses
type LedgerSumRow = { sum: number | null };
type LedgerRow = { delta: number | null };
type ProfileRow = { points_balance: number | null; points: number | null };

export default function AppShell({ children, userEmail }: Props) {
    const pathname = usePathname();
    const router = useRouter();
    const sb = createClientBrowser();

    const [uid, setUid] = React.useState<string | null>(null);

    const [points, setPoints] = React.useState<number>(0);
    const [loadingPoints, setLoadingPoints] = React.useState<boolean>(true);

    const [topupOpen, setTopupOpen] = React.useState(false);
    const [topupAmt, setTopupAmt] = React.useState<string>("");
    const [topupBusy, setTopupBusy] = React.useState(false);

    // init: pick up session + first load
    React.useEffect(() => {
        (async () => {
            const { data: auth } = await sb.auth.getUser();
            const userId = auth?.user?.id ?? null;
            setUid(userId);
            await refreshPoints(userId);
        })();

        // refresh on auth changes
        const { data: sub } = sb.auth.onAuthStateChange(async (_evt, sess) => {
            const userId = sess?.user?.id ?? null;
            setUid(userId);
            await refreshPoints(userId);
        });

        return () => sub?.subscription?.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // live update when ledger OR profiles changes
    React.useEffect(() => {
        if (!uid) return;

        const ch1 = sb
            .channel("points-ledger-live")
            .on(
                "postgres_changes",
                { event: "*", schema: "itinero", table: "points_ledger", filter: `user_id=eq.${uid}` },
                () => void refreshPoints(uid)
            )
            .subscribe();

        const ch2 = sb
            .channel("profiles-live")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
                () => void refreshPoints(uid)
            )
            .subscribe();

        return () => {
            void sb.removeChannel(ch1);
            void sb.removeChannel(ch2);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uid]);

    async function refreshPoints(userId: string | null) {
        setLoadingPoints(true);
        try {
            if (!userId) {
                setPoints(0);
                return;
            }

            // 1) Try secure RPC first (if you have one)
            try {
                const { data: rpcBalance, error: rpcErr } = await sb.rpc("get_points_balance");
                if (!rpcErr && typeof rpcBalance === "number") {
                    setPoints(rpcBalance);
                    return;
                }
            } catch {
                /* ignore */
            }

            // 2) Try aggregate on itinero.points_ledger (typed)
            try {
                const { data, error } = await sb
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

            // 3) Fallback to client-side sum (typed)
            try {
                const { data: rows, error } = await sb
                    .schema("itinero")
                    .from("points_ledger")
                    .select("delta")
                    .eq("user_id", userId);

                if (!error && Array.isArray(rows)) {
                    const typedRows = rows as LedgerRow[];
                    const total = typedRows.reduce<number>((acc, r) => acc + (Number(r.delta ?? 0) || 0), 0);
                    setPoints(total);
                    return;
                }
            } catch {
                /* ignore */
            }

            // 4) Final fallback: profiles.points_balance (or profiles.points)
            try {
                const { data: prof, error: pErr } = await sb
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

            // If everything fails, show 0 (but UI still renders)
            setPoints(0);
        } finally {
            setLoadingPoints(false);
        }
    }

    async function logout() {
        await sb.auth.signOut();
        router.replace("/");
    }

    async function handleTopup() {
        const amount = Number(topupAmt);
        if (!Number.isFinite(amount) || amount <= 0 || !uid) return;

        setTopupBusy(true);
        try {
            // Insert credit row in ledger
            const { error } = await sb
                .schema("itinero")
                .from("points_ledger")
                .insert({
                    user_id: uid,
                    delta: amount,
                    reason: "manual_topup",
                    source: "ui",
                });

            if (!error) {
                await refreshPoints(uid);
                setTopupOpen(false);
                setTopupAmt("");
            }
        } finally {
            setTopupBusy(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Top bar */}
            <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 md:px-6">
                    <Link href="/trips" className="flex items-center gap-2 text-sm font-semibold">
                        <Map className="h-4 w-4" />
                        Itinero
                    </Link>

                    <nav className="flex items-center gap-1">
                        <NavItem href="/trips" active={pathname?.startsWith("/trips")}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Trips
                        </NavItem>
                        <NavItem href="/profile" active={pathname === "/profile"}>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </NavItem>

                        {/* Points + Top up */}
                        <div className="ml-1 flex items-center gap-1">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1"
                                onClick={() => router.push("/rewards")}
                                title="View rewards"
                            >
                                <Star className="h-4 w-4" />
                                <span className="tabular-nums">
                  {loadingPoints ? "…" : new Intl.NumberFormat().format(points)}
                </span>
                                <span className="hidden sm:inline"> pts</span>
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => setTopupOpen(true)}>
                                <Plus className="h-4 w-4" />
                                Top up
                            </Button>
                        </div>

                        <Button variant="outline" size="sm" className="ml-1" onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </nav>

                    {userEmail ? (
                        <Badge variant="outline" className="hidden md:inline-flex">
                            {userEmail}
                        </Badge>
                    ) : (
                        <span />
                    )}
                </div>
            </header>

            {/* Page content */}
            <main className="mx-auto max-w-[1400px] px-0 md:px-0">{children}</main>

            {/* Subtle footer */}
            <footer className="border-t py-6 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Itinero
            </footer>

            {/* Top up dialog */}
            <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Top up points</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <label className="text-xs text-muted-foreground">Amount</label>
                        <Input
                            type="number"
                            inputMode="decimal"
                            min={1}
                            placeholder="e.g., 100"
                            value={topupAmt}
                            onChange={(e) => setTopupAmt(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            This creates a credit row in <span className="font-medium">itinero.points_ledger</span>.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setTopupOpen(false)} disabled={topupBusy}>
                            Cancel
                        </Button>
                        <Button onClick={handleTopup} disabled={topupBusy || !Number(topupAmt) || Number(topupAmt) <= 0}>
                            {topupBusy ? "Processing…" : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

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
                "inline-flex items-center rounded-md px-3 py-1.5 text-sm hover:bg-accent",
                active ? "bg-accent text-foreground" : "text-muted-foreground"
            )}
        >
            {children}
        </Link>
    );
}