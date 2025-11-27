import * as React from "react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { createClientServerRSC } from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CalendarClock, Star, User2, Wallet, ArrowUpRight, ArrowDownLeft, History, CreditCard, Settings } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

import Link from "next/link";
import { ProfileForm } from "@/app/profile/ProfileForm";
import { Button } from "@/components/ui/button";

/* ---------------- Types ---------------- */

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

/* ---------------- Helpers ---------------- */

function fmtInt(n: number) {
    return new Intl.NumberFormat().format(n);
}

function formatDateTime(raw: string | Date | null | undefined): string {
    if (!raw) return "—";
    const d = typeof raw === "string" ? new Date(raw) : raw;
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "—";

    const datePart = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return datePart;
}

/* ---------------- Components ---------------- */

function DeltaPill({ value }: { value: number }) {
    const positive = value >= 0;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide border ${
                positive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900"
                    : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-900"
            }`}
        >
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
            {positive ? "+" : ""}
            {new Intl.NumberFormat().format(value)}
    </span>
    );
}

function StatTile({
                      label,
                      value,
                      subValue,
                      icon,
                      accent,
                  }: {
    label: string;
    value: React.ReactNode;
    subValue?: React.ReactNode;
    icon?: React.ReactNode;
    accent?: boolean;
}) {
    return (
        <div
            className={[
                "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                accent
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20 dark:bg-blue-700 dark:border-blue-600"
                    : "bg-white border-slate-200 text-slate-900 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-white",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {accent && (
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            )}

            <div className="flex items-start justify-between mb-4">
                <div
                    className={`p-2.5 rounded-xl ${
                        accent
                            ? "bg-white/20 text-white"
                            : "bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                    }`}
                >
                    {icon}
                </div>
                {accent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
            Wallet
          </span>
                )}
            </div>

            <div>
                <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${accent ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>
                    {label}
                </div>
                <div className="text-3xl font-extrabold tracking-tight leading-none">{value}</div>
                {subValue && (
                    <div className={`text-xs mt-2 font-medium ${accent ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                        {subValue}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---------------- Main Page ---------------- */

export default async function ProfilePage() {
    const sb = await createClientServerRSC();

    const {
        data: { user },
    } = await sb.auth.getUser();

    if (!user) redirect("/login");

    const userId = user.id;
    const email = user.email ?? null;

    const { data: profileRow } = await sb
        .schema("itinero")
        .from("profiles")
        .select(
            "id, full_name, username, avatar_url, points_balance, preferred_currency",
        )
        .eq("id", userId)
        .maybeSingle<ProfileRow>();

    const { data: sumValue } = await sb.rpc("sum_points_for_user", {
        uid: userId,
    });
    const points = Number(sumValue ?? 0);

    const { data: historyRows } = await sb
        .schema("itinero")
        .from("points_ledger")
        .select("id, created_at, user_id, delta, reason")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200);

    const history = Array.isArray(historyRows)
        ? (historyRows as LedgerRow[])
        : [];

    const lastActivity = history.length
        ? formatDateTime(history[0].created_at)
        : "No activity";

    return (
        <AppShell userEmail={email}>
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
                {/* Decorative Header Background - UPDATED to Blue for Light Mode consistency */}
                <div className="h-64 bg-blue-600 w-full absolute top-0 left-0 -z-10 overflow-hidden dark:bg-slate-900">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                    <div className="absolute top-[-50%] left-[-10%] w-[600px] h-[600px] rounded-full bg-white/10 blur-[100px]"></div>
                    <div className="absolute bottom-[-50%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[100px]"></div>
                </div>

                <section className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12 space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 text-white pt-4">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-white/10 text-white/90 text-[10px] font-bold uppercase tracking-wider border border-white/20">My Account</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                                Profile & Wallet
                            </h1>
                            <p className="mt-2 text-blue-100 max-w-lg text-sm md:text-base font-medium dark:text-slate-400">
                                Manage your personal details and track your reward points balance.
                            </p>
                        </div>

                        {/* Top Level Actions */}
                        <div className="flex gap-3">
                            <Button variant="secondary" className="rounded-xl bg-white/10 text-white hover:bg-white/20 border-white/10 backdrop-blur-md shadow-sm">
                                <Settings className="mr-2 h-4 w-4" /> Settings
                            </Button>
                            <Button className="rounded-xl bg-white hover:bg-blue-50 text-blue-600 font-bold shadow-lg border border-transparent dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500" asChild>
                                <Link href="/pricing">Add Points</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">

                        {/* LEFT COLUMN: Profile Card */}
                        <div className="lg:col-span-1">
                            <Card className="h-full border-slate-200 bg-white shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden flex flex-col dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                                <div className="h-24 bg-slate-50 border-b border-slate-100 relative dark:bg-slate-950 dark:border-slate-800">
                                    {/* Cover Pattern */}
                                    <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(45deg,#000_0,#000_1px,transparent_0,transparent_50%)] [background-size:10px_10px] dark:bg-[repeating-linear-gradient(45deg,#fff_0,#fff_1px,transparent_0,transparent_50%)]"></div>
                                </div>

                                <div className="px-6 pb-6 -mt-12 relative z-10 flex-1 flex flex-col">
                                    <div className="relative h-24 w-24 rounded-2xl border-4 border-white shadow-md bg-slate-100 overflow-hidden mb-4 dark:border-slate-900 dark:bg-slate-800">
                                        {profileRow?.avatar_url ? (
                                            <Image
                                                src={profileRow.avatar_url}
                                                alt="avatar"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                <User2 className="h-10 w-10" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profileRow?.full_name || 'Traveler'}</h2>
                                        <p className="text-sm text-slate-500 font-medium dark:text-slate-400">@{profileRow?.username || userId.slice(0, 8)}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Badge variant="outline" className="rounded-md border-slate-200 text-slate-500 bg-slate-50 font-normal dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                                                {email}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <ProfileForm
                                            userId={userId}
                                            fullName={profileRow?.full_name ?? null}
                                            username={profileRow?.username ?? null}
                                            preferredCurrency={profileRow?.preferred_currency ?? null}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: Stats & History */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* 1. Stats Grid */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <StatTile
                                    label="Available Points"
                                    value={fmtInt(points)}
                                    icon={<Wallet className="h-5 w-5" />}
                                    accent
                                    subValue="Ready to redeem"
                                />
                                <StatTile
                                    label="Last Top-up"
                                    value={history.find(r => r.delta > 0) ? fmtInt(history.find(r => r.delta > 0)!.delta) : '0'}
                                    icon={<ArrowUpRight className="h-5 w-5" />}
                                    subValue={history.find(r => r.delta > 0) ? formatDateTime(history.find(r => r.delta > 0)!.created_at) : '—'}
                                />
                                <StatTile
                                    label="History"
                                    value={history.length > 0 ? `${history.length}` : '0'}
                                    icon={<History className="h-5 w-5" />}
                                    subValue="Total transactions"
                                />
                            </div>

                            {/* 2. Ledger Table */}
                            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                                <CardHeader className="border-b border-slate-100 bg-white px-6 py-4 flex flex-row items-center justify-between dark:bg-slate-900 dark:border-slate-800">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Transaction History</CardTitle>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">Export CSV</Button>
                                </CardHeader>

                                <CardContent className="p-0">
                                    <ScrollArea className="h-[400px] w-full">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-10 shadow-sm dark:bg-slate-950 dark:text-slate-400 dark:shadow-none">
                                            <tr>
                                                <th className="px-6 py-3">Date</th>
                                                <th className="px-6 py-3">Description</th>
                                                <th className="px-6 py-3">Source</th>
                                                <th className="px-6 py-3 text-right">Amount</th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {history.length > 0 ? (
                                                history.map((row) => (
                                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group dark:hover:bg-slate-800/50">
                                                        <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap tabular-nums dark:text-slate-400">
                                                            {formatDateTime(row.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors dark:text-slate-200 dark:group-hover:text-blue-400">{row.reason || 'Transaction'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs">
                                <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 font-medium uppercase tracking-wider border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                                  {row.source || 'System'}
                                </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <DeltaPill value={row.delta} />
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                        <div className="mb-3 flex justify-center">
                                                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800">
                                                                <History className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                                                            </div>
                                                        </div>
                                                        No transactions found.
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                        <ScrollBar orientation="vertical" />
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Info Footer */}
                            <div className="text-center text-xs text-slate-400 max-w-2xl mx-auto pt-4 pb-12 dark:text-slate-500">
                                <p>Points are used to generate AI itineraries, enhance destinations, and unlock pro-level planning tools.</p>
                                <Link href="/rewards" className="text-blue-600 hover:text-blue-700 font-semibold mt-1 inline-block hover:underline dark:text-blue-400 dark:hover:text-blue-300">
                                    View Rewards Program →
                                </Link>
                            </div>

                        </div>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}