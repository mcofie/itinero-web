"use client";

import * as React from "react";
import {useEffect, useMemo, useState, useCallback} from "react";
import Image from "next/image";
import {createClientBrowser} from "@/lib/supabase/browser";

import AppShell from "@/components/layout/AppShell";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {Loader2, Star, Wallet, User2, CalendarClock} from "lucide-react";

/* ---------- Types ---------- */
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
    points_balance?: number | null;
};

export default function ProfilePage() {
    const sb = React.useMemo(() => createClientBrowser(), []);

    const [loading, setLoading] = useState(true);
    const [authed, setAuthed] = useState(false);
    const [uid, setUid] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    const [points, setPoints] = useState(0);
    const [pointsBusy, setPointsBusy] = useState(false);

    const [profile, setProfile] = useState<ProfileRow | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);

    const [history, setHistory] = useState<LedgerRow[]>([]);
    const [historyBusy, setHistoryBusy] = useState(false);

    const [topupOpen, setTopupOpen] = useState(false);
    const [topupAmt, setTopupAmt] = useState<string>("");
    const [topupBusy, setTopupBusy] = useState(false);

    const fmtInt = useCallback((n: number) => new Intl.NumberFormat().format(n), []);
    const prettyPoints = useMemo(() => fmtInt(points), [points, fmtInt]);

    /* ---------- Init & live updates ---------- */
    useEffect(() => {
        let mounted = true;
        (async () => {
            const {data: {user}} = await sb.auth.getUser();
            const userId = user?.id ?? null;
            if (!mounted) return;
            setAuthed(!!userId);
            setUid(userId);
            setEmail(user?.email ?? null);
            if (userId) {
                await Promise.all([refreshPoints(userId), refreshProfile(userId), refreshHistory(userId)]);
            }
            setLoading(false);
        })();
        return () => {
            mounted = false;
        };
    }, [sb]);

    useEffect(() => {
        if (!uid) return;
        const ch = sb
            .channel("profile-points-live")
            .on(
                "postgres_changes",
                {event: "*", schema: "itinero", table: "points_ledger", filter: `user_id=eq.${uid}`},
                () => {
                    void refreshPoints(uid);
                    void refreshHistory(uid);
                }
            )
            .subscribe();
        return () => {
            void sb.removeChannel(ch);
        };
    }, [uid, sb]);

    /* ---------- Data loaders ---------- */
    async function refreshPoints(userId: string) {
        setPointsBusy(true);
        try {
            const {data, error} = await sb
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

            const {data: rows, error: listErr} = await sb
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
        const {data, error} = await sb
            .from("profiles")
            .select("id, full_name, username, avatar_url, points_balance")
            .eq("id", userId)
            .maybeSingle();
        if (!error && data) {
            setProfile(data as ProfileRow);
            if (typeof data.points_balance === "number") setPoints(data.points_balance);
        }
    }

    async function refreshHistory(userId: string) {
        setHistoryBusy(true);
        try {
            const {data, error} = await sb
                .schema("itinero")
                .from("points_ledger")
                .select("id, created_at, user_id, delta, reason")
                .eq("user_id", userId)
                .order("created_at", {ascending: false})
                .limit(200);
            setHistory(!error && Array.isArray(data) ? (data as LedgerRow[]) : []);
        } finally {
            setHistoryBusy(false);
        }
    }

    /* ---------- Actions ---------- */
    async function handleSaveProfile() {
        if (!uid || !profile) return;
        setSavingProfile(true);
        try {
            const {error} = await sb
                .from("profiles")
                .update({full_name: profile.full_name, username: profile.username})
                .eq("id", uid);
            if (!error) await refreshProfile(uid);
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
            const {error} = await sb
                .schema("itinero")
                .from("points_ledger")
                .insert({user_id: uid, delta: amount, reason: "manual_topup", source: "profile"});
            if (!error) {
                setTopupAmt("");
                setTopupOpen(false);
                await Promise.all([refreshPoints(uid), refreshHistory(uid)]);
            }
        } finally {
            setTopupBusy(false);
        }
    }

    const onTopupKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            void handleTopup();
        }
    };

    /* ---------- Loading / Auth ---------- */
    if (loading) {
        return (
            <div className="mx-auto grid min-h-[60vh] max-w-4xl place-items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin"/> Loading profile…
                </div>
            </div>
        );
    }

    if (!authed) {
        return (
            <div className="mx-auto mt-10 max-w-lg">
                <Card>
                    <CardHeader><CardTitle>Sign in required</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>You need to be signed in to view your profile.</p>
                        <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    /* ---------- View ---------- */
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
                            <Star className="h-4 w-4"/>
                            {pointsBusy ? "…" : `${prettyPoints} pts`}
                        </Badge>
                        <Button variant="outline" onClick={() => setTopupOpen(true)}>
                            <Wallet className="mr-2 h-4 w-4"/>
                            Top up
                        </Button>
                    </div>
                </div>

                {/* Grid: Profile / Points / History */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Profile card */}
                    <Card className="border border-border bg-card/60 lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User2 className="h-5 w-5"/>
                                Profile details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className="relative h-16 w-16 overflow-hidden rounded-full border border-border bg-muted">
                                    {profile?.avatar_url ? (
                                        <Image src={profile.avatar_url} alt="avatar" fill sizes="64px"
                                               className="object-cover"/>
                                    ) : (
                                        <div
                                            className="grid h-full w-full place-items-center text-sm text-muted-foreground">👤</div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-base font-medium">{profile?.full_name || "—"}</div>
                                    <div className="text-sm text-muted-foreground">{email || "—"}</div>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Full name</Label>
                                    <Input
                                        value={profile?.full_name ?? ""}
                                        onChange={(e) => setProfile((p) => (p ? {...p, full_name: e.target.value} : p))}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Username</Label>
                                    <Input
                                        value={profile?.username ?? ""}
                                        onChange={(e) => setProfile((p) => (p ? {...p, username: e.target.value} : p))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                                    {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    Save changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Points summary (stats) */}
                    <Card className="border border-border bg-card/60 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5"/>
                                Points summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <StatTile label="Current balance" value={pointsBusy ? "…" : prettyPoints} big/>
                                <StatTile label="Last top up" value={formatLastTopup(history)}/>
                                <StatTile
                                    label="Last activity"
                                    value={
                                        history.length
                                            ? new Date(history[0].created_at).toLocaleString()
                                            : "—"
                                    }
                                    icon={<CalendarClock className="h-4 w-4"/>}
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button variant="outline" onClick={() => setTopupOpen(true)}>Quick top up</Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* History table */}
                    <Card className="border border-border bg-card/60 shadow-sm lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Top-up & activity history</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-border  overflow-hidden">
                                {/* Fixed height so it always scrolls when content exceeds */}
                                <ScrollArea className="h-[420px] rounded-xl">
                                    {/* Keep horizontal safety for narrow screens */}
                                    <div className="min-w-full overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead
                                                className="sticky top-0 z-10 bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-muted/40">
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
                                                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin"/>
                                                        Loading…
                                                    </td>
                                                </tr>
                                            ) : history.length ? (
                                                history.map((r) => (
                                                    <tr key={r.id} className="border-t border-border">
                                                        <td className="whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                                                        <td className={r.delta >= 0 ? "text-emerald-600" : "text-red-600"}>
                                                            <DeltaPill value={r.delta}/>
                                                        </td>
                                                        <td>
                                                            {r.reason ? (
                                                                <Badge variant="outline"
                                                                       className="capitalize">{r.reason}</Badge>
                                                            ) : "—"}
                                                        </td>
                                                        <td className="uppercase text-muted-foreground">{r.source ?? "—"}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center text-muted-foreground">No
                                                        history yet
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Show a vertical scrollbar */}
                                    <ScrollBar orientation="vertical"/>
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card></div>
            </section>

            {/* Top up dialog */}
            <Dialog open={topupOpen} onOpenChange={setTopupOpen}>
                <DialogContent className="sm:max-w-sm border border-border">
                    <DialogHeader><DialogTitle>Top up points</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                        <Label htmlFor="topup-amount" className="text-xs text-muted-foreground">Amount (pts)</Label>
                        <Input
                            id="topup-amount"
                            type="number"
                            inputMode="decimal"
                            min={1}
                            placeholder="e.g., 100"
                            value={topupAmt}
                            onChange={(e) => setTopupAmt(e.target.value)}
                            onKeyDown={onTopupKeyDown}
                        />
                        <div className="text-xs text-muted-foreground">
                            Creates a credit row in <span className="font-medium">itinero.points_ledger</span>.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setTopupOpen(false)} disabled={topupBusy}>Cancel</Button>
                        <Button onClick={handleTopup}
                                disabled={topupBusy || !Number(topupAmt) || Number(topupAmt) <= 0}>
                            {topupBusy ? "Processing…" : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}

/* ---------- Small UI bits ---------- */
function StatTile({label, value, big, icon}: {
    label: string;
    value: React.ReactNode;
    big?: boolean;
    icon?: React.ReactNode
}) {
    return (
        <div className="rounded-2xl border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-1 flex items-center gap-2">
                {icon}
                <div className={big ? "text-3xl font-bold tabular-nums" : "text-sm font-medium"}>{value}</div>
            </div>
        </div>
    );
}

function DeltaPill({value}: { value: number }) {
    const positive = value >= 0;
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${positive ? "bg-emerald-50 text-emerald-700 border-gray-200 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
      {positive ? "+" : ""}
            {new Intl.NumberFormat().format(value)} pts
    </span>
    );
}

/* ---------- helpers ---------- */
function formatLastTopup(history: LedgerRow[]) {
    const credit = history.find((r) => r.delta > 0);
    if (!credit) return "—";
    const amount = new Intl.NumberFormat().format(credit.delta);
    const when = new Date(credit.created_at).toLocaleDateString();
    return `+${amount} pts on ${when}`;
}