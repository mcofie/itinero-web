// app/profile/page.tsx
import * as React from "react";
import Image from "next/image";
import {redirect} from "next/navigation";

import {createClientServer} from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {CalendarClock, Clock, MapPin, Star, User2, Wallet} from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store'; // Next 14+ only

import {saveProfileAction, topupPointsAction} from "@/app/profile/server-actions";

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

function fmtInt(n: number) {
    return new Intl.NumberFormat().format(n);
}

function formatLastTopup(history: LedgerRow[]) {
    const credit = history.find((r) => r.delta > 0);
    if (!credit) return "—";
    const amount = new Intl.NumberFormat().format(credit.delta);
    const when = new Date(credit.created_at).toLocaleDateString();
    return `+${amount} pts on ${when}`;
}

function DeltaPill({value}: { value: number }) {
    const positive = value >= 0;
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                positive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
      {positive ? "+" : ""}
            {new Intl.NumberFormat().format(value)} pts
    </span>
    );
}

function StatTile({
                      label,
                      value,
                      big,
                      icon,
                  }: {
    label: string;
    value: React.ReactNode;
    big?: boolean;
    icon?: React.ReactNode;
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

export default async function ProfilePage() {
    const sb = await createClientServer();

    // Auth (server-side)
    const {
        data: {user},
    } = await sb.auth.getUser();

    if (!user) redirect("/login");

    const userId = user.id;
    const email = user.email ?? null;


    // Profile
    const {data: profileRow} = await sb
        .schema('itinero')
        .from("profiles")
        .select("id, full_name, username, avatar_url, points_balance")
        .eq("id", userId)
        .maybeSingle<ProfileRow>();

    // Points (aggregate w/ fallback to profiles.points_balance)
    const { data: sumValue, error } = await sb.rpc("sum_points_for_user", { uid: userId });
    const points = Number(sumValue ?? 0);



    // History
    const {data: historyRows} = await sb
        .schema("itinero")
        .from("points_ledger")
        .select("id, created_at, user_id, delta, reason")
        .eq("user_id", userId)
        .order("created_at", {ascending: false})
        .limit(200);

    const history = Array.isArray(historyRows) ? (historyRows as LedgerRow[]) : [];

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
                            {fmtInt(points)} pts
                        </Badge>
                        {/* Topup (Server Action form) */}
                        <form action={topupPointsAction}>
                            <input type="hidden" name="user_id" value={userId}/>
                            <div className="flex items-center gap-2">
                                <Input
                                    name="amount"
                                    type="number"
                                    min={1}
                                    placeholder="Amount"
                                    className="h-9 w-28"
                                    aria-label="Top up amount (points)"
                                    required
                                />
                                <Button type="submit" variant="outline">
                                    <Wallet className="mr-2 h-4 w-4"/>
                                    Top up
                                </Button>
                            </div>
                        </form>
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
                                    {profileRow?.avatar_url ? (
                                        <Image
                                            src={profileRow.avatar_url}
                                            alt="avatar"
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="grid h-full w-full place-items-center text-sm text-muted-foreground">👤</div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-base font-medium">{profileRow?.full_name || "—"}</div>
                                    <div className="text-sm text-muted-foreground">{email || "—"}</div>
                                </div>
                            </div>

                            {/* Save profile (Server Action form) */}
                            <form action={saveProfileAction} className="grid gap-3">
                                <input type="hidden" name="id" value={userId}/>
                                <div>
                                    <Label className="text-xs text-muted-foreground" htmlFor="full_name">
                                        Full name
                                    </Label>
                                    <Input id="full_name" name="full_name" defaultValue={profileRow?.full_name ?? ""}/>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground" htmlFor="username">
                                        Username
                                    </Label>
                                    <Input id="username" name="username" defaultValue={profileRow?.username ?? ""}/>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit">Save changes</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Points summary */}
                    <Card className="border border-border bg-card/60 lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5"/>
                                Points summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <StatTile label="Current balance" value={fmtInt(points)} big/>
                                <StatTile label="Last top up" value={formatLastTopup(history)}/>
                                <StatTile
                                    label="Last activity"
                                    value={history.length ? new Date(history[0].created_at).toLocaleString() : "—"}
                                    icon={<CalendarClock className="h-4 w-4"/>}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* History table */}
                    <Card className="border border-border bg-card/60 shadow-sm lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Top-up & activity history</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-border overflow-hidden">
                                <ScrollArea className="h-[420px] rounded-xl">
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
                                            {history.length ? (
                                                history.map((r) => (
                                                    <tr key={r.id} className="border-t border-border">
                                                        <td className="whitespace-nowrap">
                                                            {new Date(r.created_at).toLocaleString()}
                                                        </td>
                                                        <td className={r.delta >= 0 ? "text-emerald-600" : "text-red-600"}>
                                                            <DeltaPill value={r.delta}/>
                                                        </td>
                                                        <td>
                                                            {r.reason ? (
                                                                <Badge variant="outline" className="capitalize">
                                                                    {r.reason}
                                                                </Badge>
                                                            ) : (
                                                                "—"
                                                            )}
                                                        </td>
                                                        <td className="uppercase text-muted-foreground">
                                                            {r.source ?? "—"}
                                                        </td>
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
                                    </div>
                                    <ScrollBar orientation="vertical"/>
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </AppShell>
    );
}