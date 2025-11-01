"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClientBrowser } from "@/lib/supabase/browser";

import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Star, Wallet, User2, CalendarClock } from "lucide-react";

/** ---------- Types (match your DB) ---------- */
type LedgerRow = {
    id: string;
    created_at: string;
    user_id: string;
    delta: number;
    reason: string | null;
    source: string | null;
};

type ProfileRow = {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    // optional legacy fields
    points_balance?: number | null;
};

export default function ProfilePage() {
    const sb = createClientBrowser();

    const [loading, setLoading] = useState(true);
    const [authed, setAuthed] = useState(false);
    const [uid, setUid] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    // points
    const [points, setPoints] = useState(0);
    const [pointsBusy, setPointsBusy] = useState(false);

    // profile
    const [profile, setProfile] = useState<ProfileRow | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);

    // ledger
    const [history, setHistory] = useState<LedgerRow[]>([]);
    const [historyBusy, setHistoryBusy] = useState(false);

    // top up
    const [topupOpen, setTopupOpen] = useState(false);
    const [topupAmt, setTopupAmt] = useState<string>("");
    const [topupBusy, setTopupBusy] = useState(false);

    // init auth & load
    useEffect(() => {
        (async () => {
            try {
                const {
                    data: { user },
                } = await sb.auth.getUser();
                const userId = user?.id ?? null;
                setAuthed(!!userId);
                setUid(userId);
                setEmail(user?.email ?? null);
                if (userId) {
                    await Promise.all([refreshPoints(userId), refreshProfile(userId), refreshHistory(userId)]);
                }
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // live updates on points ledger
    useEffect(() => {
        if (!uid) return;
        const ch = sb
            .channel("profile-points-live")
            .on(
                "postgres_changes",
                { event: "*", schema: "itinero", table: "points_ledger", filter: `user_id=eq.${uid}` },
                () => {
                    void refreshPoints(uid);
                    void refreshHistory(uid);
                }
            )
            .subscribe();
        return () => {
            void sb.removeChannel(ch);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uid]);

    async function refreshPoints(userId: string) {
        setPointsBusy(true);
        try {
            // Prefer quick aggregate
            const { data, error } = await sb
                .schema("itinero")
                .from("points_ledger")
                .select("sum:sum(delta)")
                .eq("user_id", userId)
                .maybeSingle();

            if (!error) {
                const sumVal = Number((data as { sum: number | null } | null)?.sum ?? 0);
                setPoints(Number.isFinite(sumVal) ? sumVal : 0);
                return;
            }
            // fallback: sum on client
            const { data: rows, error: listErr } = await sb
                .schema("itinero")
                .from("points_ledger")
                .select("delta")
                .eq("user_id", userId);

            if (!listErr && Array.isArray(rows)) {
                const total = rows.reduce((acc, r) => acc + Number((r as { delta: number }).delta || 0), 0);
                setPoints(total);
            } else {
                setPoints(0);
            }
        } finally {
            setPointsBusy(false);
        }
    }

    async function refreshProfile(userId: string) {
        const { data, error } = await sb
            .from("profiles")
            .select("id, full_name, username, avatar_url, points_balance")
            .eq("id", userId)
            .maybeSingle();
        if (!error && data) {
            setProfile(data as ProfileRow);
            // if you mirror into profiles.points_balance, prefer it when present
            if (typeof data.points_balance === "number") {
                setPoints(data.points_balance);
            }
        }
    }

    async function refreshHistory(userId: string) {
        setHistoryBusy(true);
        try {
            const { data, error } = await sb
                .schema("itinero")
                .from("points_ledger")
                .select("id, created_at, user_id, delta, reason")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(100);

            if (!error && Array.isArray(data)) setHistory(data as LedgerRow[]);
            else setHistory([]);
        } finally {
            setHistoryBusy(false);
        }
    }

    async function handleSaveProfile() {
        if (!uid || !profile) return;
        setSavingProfile(true);
        try {
            const { error } = await sb
                .from("profiles")
                .update({
                    full_name: profile.full_name,
                    username: profile.username,
                })
                .eq("id", uid);

            if (!error) {
                await refreshProfile(uid);
            }
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleTopup() {
        if (!uid) return;
        const amount = Number(topupAmt);
        if (!Number.isFinite(amount) || amount <= 0) return;

        setTopupBusy(true);
        try {
            const { error } = await sb
                .schema("itinero")
                .from("points_ledger")
                .insert({
                    user_id: uid,
                    delta: amount,
                    reason: "manual_topup",
                });

            if (!error) {
                setTopupAmt("");
                setTopupOpen(false);
                await Promise.all([refreshPoints(uid), refreshHistory(uid)]);
            }
        } finally {
            setTopupBusy(false);
        }
    }

    const prettyPoints = useMemo(() => new Intl.NumberFormat().format(points), [points]);

    if (loading) {
        return (
            <div className="mx-auto grid min-h-[60vh] max-w-4xl place-items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
                </div>
            </div>
        );
    }

    if (!authed) {
        return (
            <div className="mx-auto mt-10 max-w-lg">
                <Card>
                    <CardHeader>
                        <CardTitle>Sign in required</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>You need to be signed in to view your profile.</p>
                        <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <AppShell userEmail={email}>
            <section className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Profile</div>
                        <h1 className="text-2xl font-bold md:text-3xl">Account & Points</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 px-3 py-1.5 text-sm">
                            <Star className="h-4 w-4" />
                            {pointsBusy ? "…" : `${prettyPoints} pts`}
                        </Badge>
                        <Button variant="outline" onClick={() => setTopupOpen(true)}>
                            <Wallet className="mr-2 h-4 w-4" />
                            Top up
                        </Button>
                    </div>
                </div>

                {/* Grid: Profile / Points / History */}
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                    {/* Profile card */}
                    <Card className="border bg-card/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User2 className="h-5 w-5" />
                                Profile details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative h-16 w-16 overflow-hidden rounded-full border bg-muted">
                                    {profile?.avatar_url ? (
                                        <Image src={profile.avatar_url} alt="avatar" fill sizes="64px" className="object-cover" />
                                    ) : (
                                        <div className="grid h-full w-full place-items-center text-sm text-muted-foreground">👤</div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-base font-medium">{profile?.full_name || "—"}</div>
                                    <div className="text-sm text-muted-foreground">{email || "—"}</div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Full name</Label>
                                    <Input
                                        value={profile?.full_name ?? ""}
                                        onChange={(e) => setProfile((p) => (p ? { ...p, full_name: e.target.value } : p))}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Username</Label>
                                    <Input
                                        value={profile?.username ?? ""}
                                        onChange={(e) => setProfile((p) => (p ? { ...p, username: e.target.value } : p))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                                    {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Points summary */}
                    <Card className="border bg-card/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Points summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-2xl border bg-background p-4">
                                <div className="text-xs uppercase tracking-wider text-muted-foreground">Current balance</div>
                                <div className="mt-1 text-3xl font-bold tabular-nums">{pointsBusy ? "…" : prettyPoints}</div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border p-3">
                                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Last top up</div>
                                    <div className="mt-1 text-sm">
                                        {formatLastTopup(history)}
                                    </div>
                                </div>
                                <div className="rounded-xl border p-3">
                                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Last activity</div>
                                    <div className="mt-1 flex items-center gap-2 text-sm">
                                        <CalendarClock className="h-4 w-4" />
                                        {history.length ? new Date(history[0].created_at).toLocaleString() : "—"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button variant="outline" onClick={() => setTopupOpen(true)}>
                                    Quick top up
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* History */}
                    <Card className="border bg-card/60 shadow-sm lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Top-up & activity history</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border">
                                <ScrollArea className="max-h-[420px] rounded-xl">
                                    <table className="min-w-full text-sm">
                                        <thead className="sticky top-0 bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                                        <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left">
                                            <th>Date</th>
                                            <th>Change</th>
                                            <th>Reason</th>
                                            <th>Source</th>
                                        </tr>
                                        </thead>
                                        <tbody className="[&>tr>td]:px-3 [&>tr>td]:py-2">
                                        {historyBusy ? (
                                            <tr>
                                                <td colSpan={4} className="text-center text-muted-foreground">
                                                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                                                    Loading…
                                                </td>
                                            </tr>
                                        ) : history.length ? (
                                            history.map((r) => (
                                                <tr key={r.id} className="border-t">
                                                    <td className="whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                                                    <td className={r.delta >= 0 ? "text-emerald-600" : "text-red-600"}>
                                                        {r.delta >= 0 ? "+" : ""}
                                                        {new Intl.NumberFormat().format(r.delta)} pts
                                                    </td>
                                                    <td className="capitalize">{r.reason ?? "—"}</td>
                                                    <td className="uppercase text-muted-foreground">{r.source ?? "—"}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="text-center text-muted-foreground">
                                                    No history yet
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Top up dialog */}
            <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Top up points</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Label className="text-xs text-muted-foreground">Amount</Label>
                        <Input
                            type="number"
                            inputMode="decimal"
                            min={1}
                            placeholder="e.g., 100"
                            value={topupAmt}
                            onChange={(e) => setTopupAmt(e.target.value)}
                        />
                        <div className="text-xs text-muted-foreground">
                            Creates a credit row in <span className="font-medium">itinero.points_ledger</span>.
                        </div>
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
        </AppShell>
    );
}

/** ---------- helpers ---------- */
function formatLastTopup(history: LedgerRow[]) {
    const credit = history.find((r) => r.delta > 0);
    if (!credit) return "—";
    const amount = new Intl.NumberFormat().format(credit.delta);
    const when = new Date(credit.created_at).toLocaleDateString();
    return `+${amount} pts on ${when}`;
}