import * as React from "react";
import Image from "next/image";
import {redirect} from "next/navigation";

import {createClientServerRSC} from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {CalendarClock, Star, User2} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

import Link from "next/link";
import {ProfileForm} from "@/app/profile/ProfileForm";

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
    preferred_currency?: string | null;
};

function fmtInt(n: number) {
    return new Intl.NumberFormat().format(n);
}

function formatDateTime(raw: string | Date | null | undefined): string {
    if (!raw) return "—";
    const d = typeof raw === "string" ? new Date(raw) : raw;
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "—";

    const datePart = d.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    });

    const timePart = d.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    return `${datePart} - ${timePart}`;
}

function formatLastTopup(history: LedgerRow[]) {
    const credit = history.find((r) => r.delta > 0);
    if (!credit) return "—";
    const amount = new Intl.NumberFormat().format(credit.delta);
    const when = formatDateTime(credit.created_at);
    return `+${amount} pts on ${when}`;
}

function DeltaPill({value}: { value: number }) {
    const positive = value >= 0;
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                positive
                    ? "border-emerald-300/70 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-200"
                    : "border-red-300/70 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-200"
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
                      accent,
                  }: {
    label: string;
    value: React.ReactNode;
    big?: boolean;
    icon?: React.ReactNode;
    accent?: boolean;
}) {
    return (
        <div
            className={[
                "relative overflow-hidden rounded-2xl border bg-card",
                "border-border/70",
                accent ? "shadow-md shadow-primary/10 ring-1 ring-primary/10" : "shadow-sm",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {accent && (
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_top_left,var(--primary)_0,transparent_55%),radial-gradient(circle_at_bottom_right,var(--primary)_0,transparent_55%)]"/>
            )}
            <div className="relative p-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        {label}
                    </div>
                    {icon && (
                        <div
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                    <div
                        className={
                            big ? "text-3xl font-bold tabular-nums" : "text-sm font-semibold tabular-nums"
                        }
                    >
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default async function ProfilePage() {
    const sb = await createClientServerRSC();

    const {
        data: {user},
    } = await sb.auth.getUser();

    if (!user) redirect("/login");

    const userId = user.id;
    const email = user.email ?? null;

    const {data: profileRow} = await sb
        .schema("itinero")
        .from("profiles")
        .select(
            "id, full_name, username, avatar_url, points_balance, preferred_currency",
        )
        .eq("id", userId)
        .maybeSingle<ProfileRow>();

    const {data: sumValue} = await sb.rpc("sum_points_for_user", {
        uid: userId,
    });
    const points = Number(sumValue ?? 0);

    const {data: historyRows} = await sb
        .schema("itinero")
        .from("points_ledger")
        .select("id, created_at, user_id, delta, reason")
        .eq("user_id", userId)
        .order("created_at", {ascending: false})
        .limit(200);

    const history = Array.isArray(historyRows)
        ? (historyRows as LedgerRow[])
        : [];

    const lastActivity = history.length
        ? formatDateTime(history[0].created_at)
        : "—";

    return (
        <AppShell userEmail={email}>
            <section className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                            Profile
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                            Account &amp; Points
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your profile details and see every point earned or spent.
                        </p>
                    </div>
                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                        <Badge
                            variant="secondary"
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm"
                        >
                            <Star className="h-4 w-4 text-amber-500"/>
                            <span className="tabular-nums font-semibold">
                {fmtInt(points)}
              </span>
                            <span className="text-xs text-muted-foreground">pts</span>
                        </Badge>
                    </div>
                </div>

                {/* Grid: Profile / Points / History */}
                <div className="grid gap-5 lg:grid-cols-3">
                    {/* Profile card */}
                    <Card
                        className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-background via-background to-background lg:col-span-1 shadow-sm">
                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_top_left,var(--primary)_0,transparent_55%),radial-gradient(circle_at_bottom_right,var(--primary)_0,transparent_55%)]"/>
                        <CardHeader className="relative pb-2">
                            <div className="flex items-center justify-between gap-2">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                  <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User2 className="h-4 w-4"/>
                  </span>
                                    Profile details
                                </CardTitle>
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-border/60 bg-background/80 text-[11px]"
                                >
                                    ID • {userId.slice(0, 6)}…
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="relative space-y-4">
                            <div className="flex items-center gap-4">
                                <div
                                    className="relative h-16 w-16 overflow-hidden rounded-full border border-border/70 bg-muted/60 shadow-sm">
                                    {profileRow?.avatar_url ? (
                                        <Image
                                            src={profileRow.avatar_url}
                                            alt="avatar"
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-full w-full place-items-center text-lg">
                      <span role="img" aria-label="Avatar">
                        👤
                      </span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-base font-semibold">
                                        {profileRow?.full_name || "Unnamed traveller"}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {email || "No email on file"}
                                    </div>
                                    {profileRow?.username && (
                                        <div className="text-xs text-muted-foreground">
                                            @{profileRow.username}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 🔁 Profile form (client) */}
                            <ProfileForm
                                userId={userId}
                                fullName={profileRow?.full_name ?? null}
                                username={profileRow?.username ?? null}
                                preferredCurrency={profileRow?.preferred_currency ?? null}
                            />
                        </CardContent>
                    </Card>

                    {/* Points summary */}
                    <Card
                        className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 lg:col-span-2 shadow-sm">
                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_top_right,var(--primary)_0,transparent_55%)]"/>
                        <CardHeader className="relative pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Star className="h-4 w-4"/>
                </span>
                                Points summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative space-y-4">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <StatTile
                                    label="Current balance"
                                    value={`${fmtInt(points)} pts`}
                                    big
                                    accent
                                    icon={<Star className="h-4 w-4 text-amber-500"/>}
                                />
                                <StatTile label="Last top up" value={formatLastTopup(history)}/>
                                <StatTile
                                    label="Last activity"
                                    value={lastActivity}
                                    icon={<CalendarClock className="h-4 w-4"/>}
                                />
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Points are used to generate AI itineraries, enhance destinations, and
                                unlock pro-level planning tools in Itinero.
                            </p>

                            <p className="text-[11px] text-muted-foreground">
                                Saving a trip or exporting a printable itinerary typically costs{" "}
                                <span className="font-semibold">around 100+ points</span>, depending on
                                the length and features used. For a full breakdown of how points are
                                earned and spent,{" "}
                                <Link
                                    href="/rewards"
                                    className="font-medium text-primary underline-offset-2 hover:underline"
                                >
                                    visit the Rewards page
                                </Link>
                                .
                            </p>
                        </CardContent>
                    </Card>

                    {/* History table */}
                    <Card className="border border-border/70 bg-card/80 shadow-sm lg:col-span-3 rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wide">
                                Top-up &amp; activity history
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/60">
                                <ScrollArea className="h-[420px] rounded-2xl">
                                    <div className="min-w-full overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead
                                                className="sticky top-0 z-10 bg-muted/70 text-xs uppercase tracking-[0.16em] text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-muted/60">
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
                                                    <tr key={r.id} className="border-t border-border/60">
                                                        <td className="whitespace-nowrap text-xs sm:text-sm">
                                                            {formatDateTime(r.created_at)}
                                                        </td>
                                                        <td
                                                            className={
                                                                r.delta >= 0
                                                                    ? "text-emerald-600 dark:text-emerald-300"
                                                                    : "text-red-600 dark:text-red-300"
                                                            }
                                                        >
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
                                                        <td className="text-xs uppercase text-muted-foreground">
                                                            {r.source ?? "—"}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="py-10 text-center text-sm text-muted-foreground"
                                                    >
                                                        No activity yet. Top up or use points to see your history
                                                        here.
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