import * as React from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";

import { createClientServerRSC } from "@/lib/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Profile",
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./ProfileForm";
import { ProfileBackdrop } from "./ProfileBackdrop";
import { AddPointsButton } from "./AddPointsButton";
import {
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Settings,
    User2,
    Wallet,
    Zap,
    Unlock,
    RotateCcw,
    CreditCard,
    PlusCircle,
    Info,
    ShieldCheck
} from "lucide-react";

import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

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

    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/* ---------------- Components ---------------- */

function DeltaPill({ value }: { value: number }) {
    const positive = value >= 0;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-tight border shadow-sm",
                positive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
            )}
        >
            {positive ? (
                <PlusCircle className="h-3 w-3" />
            ) : (
                <ArrowDownLeft className="h-3 w-3" />
            )}
            {positive ? "+" : ""}
            {new Intl.NumberFormat().format(Math.abs(value))}
        </span>
    );
}

function getTransactionMeta(reason: string | null) {
    const r = reason?.toLowerCase() || "";

    if (r.includes("paystack_topup")) {
        return {
            label: "Wallet Top-up",
            subLabel: "via Paystack",
            icon: CreditCard,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        };
    }
    if (r.includes("manual_topup")) {
        return {
            label: "Points Added",
            subLabel: "Admin manual credit",
            icon: Zap,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20"
        };
    }
    if (r.includes("save_trip")) {
        return {
            label: "Itinerary Unlock",
            subLabel: "Points spent",
            icon: Unlock,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-50 dark:bg-indigo-900/20"
        };
    }
    if (r.includes("refund")) {
        return {
            label: "Refund Issued",
            subLabel: "Failed operation",
            icon: RotateCcw,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-900/20"
        };
    }
    if (r.includes("bonus") || r.includes("registration")) {
        return {
            label: "Welcome Bonus",
            subLabel: "Registration reward",
            icon: ShieldCheck,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        };
    }

    // Fallback
    const formatted = r.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return {
        label: formatted || "Transaction",
        subLabel: "System balance adjust",
        icon: Info,
        color: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-50 dark:bg-slate-800"
    };
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
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20 dark:bg-blue-600 dark:border-blue-500"
                    : "bg-white border-slate-200 text-slate-900 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-white",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {accent && (
                <div
                    className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            )}

            <div className="flex items-start justify-between mb-4">
                <div
                    className={`p-2.5 rounded-xl ${accent
                        ? "bg-white/20 text-white"
                        : "bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        }`}
                >
                    {icon}
                </div>
                {accent && (
                    <span
                        className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                        Wallet
                    </span>
                )}
            </div>

            <div>
                <div
                    className={`text-xs font-bold uppercase tracking-widest mb-1 ${accent ? "text-blue-100" : "text-slate-400 dark:text-slate-500"
                        }`}
                >
                    {label}
                </div>
                <div className="text-3xl font-extrabold tracking-tight leading-none">
                    {value}
                </div>
                {subValue && (
                    <div
                        className={`text-xs mt-2 font-medium ${accent ? "text-blue-100" : "text-slate-500 dark:text-slate-400"
                            }`}
                    >
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

    const { data: fetchedProfile } = await sb
        .schema("itinero")
        .from("profiles")
        .select(
            "id, full_name, username, avatar_url, points_balance, preferred_currency"
        )
        .eq("id", userId)
        .maybeSingle<ProfileRow>();

    // Merge with user metadata fallback
    // We check for undefined instead of falsy to allow empty strings if desired
    const profileRow: ProfileRow = {
        id: userId,
        full_name: fetchedProfile?.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        username: fetchedProfile?.username ?? user.user_metadata?.user_name ?? null,
        avatar_url: fetchedProfile?.avatar_url ?? user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
        points_balance: fetchedProfile?.points_balance ?? 0,
        preferred_currency: fetchedProfile?.preferred_currency ?? null,
    };

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

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">

            {/* Decorative Background Blob (Subtle) */}
            <div
                className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/10 dark:to-transparent -z-10 pointer-events-none" />

            <section className="mx-auto w-full max-w-6xl px-4 py-6 md:py-12 space-y-6 md:space-y-8">

                {/* Header Section */}
                <div
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 pt-4 border-b border-slate-200/60 dark:border-slate-800">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <span
                                className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20">
                                My Account
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Profile & Wallet
                        </h1>
                        <p className="mt-2 text-slate-500 max-w-lg text-sm md:text-base font-medium dark:text-slate-400">
                            Manage your personal details and track your reward points balance.
                        </p>
                    </div>

                    {/* Top Level Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <Settings className="mr-2 h-4 w-4" /> Settings
                        </Button>
                        <AddPointsButton
                            userEmail={email}
                            userCurrency={profileRow?.preferred_currency}
                        />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">

                    {/* LEFT COLUMN: Profile Card */}
                    <div className="lg:col-span-1">
                        <Card
                            className="h-full border-slate-200 bg-white shadow-sm rounded-3xl overflow-hidden flex flex-col p-0 gap-0 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                            <div
                                className="h-32 relative border-b border-slate-200 dark:border-slate-800 overflow-hidden">
                                <ProfileBackdrop avatarUrl={profileRow?.avatar_url} />
                            </div>

                            <div className="px-6 pb-6 -mt-16 relative z-10 flex-1 flex flex-col">
                                <div
                                    className="relative h-32 w-32 rounded-3xl border-4 border-white shadow-xl bg-white overflow-hidden mb-4 dark:border-slate-900 dark:bg-slate-800 mx-auto lg:mx-0">
                                    {profileRow?.avatar_url ? (
                                        <Image
                                            src={profileRow.avatar_url}
                                            alt="avatar"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
                                            <User2 className="h-12 w-12" />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-6 text-center lg:text-left">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {profileRow?.full_name || "Traveler"}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium dark:text-slate-400">
                                        @{profileRow?.username || userId.slice(0, 8)}
                                    </p>
                                    <div className="mt-3 flex flex-wrap justify-center lg:justify-start gap-2">
                                        <Badge
                                            variant="outline"
                                            className="rounded-md border-slate-200 text-slate-500 bg-slate-50 font-normal dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
                                        >
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
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                            <StatTile
                                label="Available Points"
                                value={fmtInt(points)}
                                icon={<Wallet className="h-5 w-5" />}
                                accent
                                subValue="Ready to redeem"
                            />
                            <StatTile
                                label="Last Top-up"
                                value={
                                    history.find((r) => r.delta > 0)
                                        ? fmtInt(history.find((r) => r.delta > 0)!.delta)
                                        : "0"
                                }
                                icon={<ArrowUpRight className="h-5 w-5" />}
                                subValue={
                                    history.find((r) => r.delta > 0)
                                        ? formatDateTime(
                                            history.find((r) => r.delta > 0)!.created_at
                                        )
                                        : "—"
                                }
                            />
                            <StatTile
                                label="History"
                                value={history.length > 0 ? `${history.length}` : "0"}
                                icon={<History className="h-5 w-5" />}
                                subValue="Total transactions"
                            />
                        </div>

                        {/* 2. Ledger Table */}
                        <Card
                            className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                            <CardHeader
                                className="border-b border-slate-100 bg-white px-6 py-4 flex flex-row items-center justify-between dark:bg-slate-900 dark:border-slate-800">
                                <CardTitle
                                    className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    Transaction History
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                >
                                    Export CSV
                                </Button>
                            </CardHeader>

                            <CardContent className="p-0">
                                <ScrollArea className="h-[400px] w-full">
                                    <table className="w-full min-w-[600px] text-sm text-left">
                                        <thead
                                            className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-10 shadow-sm dark:bg-slate-950 dark:text-slate-400 dark:shadow-none">
                                            <tr>
                                                <th className="px-6 py-3">Date</th>
                                                <th className="px-6 py-3">Description</th>
                                                <th className="px-6 py-3 hidden sm:table-cell">Source</th>
                                                <th className="px-6 py-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {history.length > 0 ? (
                                                history.map((row) => (
                                                    <tr
                                                        key={row.id}
                                                        className="hover:bg-slate-50/50 transition-colors group dark:hover:bg-slate-800/50"
                                                    >
                                                        <td className="px-6 py-4 font-medium text-slate-500 whitespace-nowrap tabular-nums dark:text-slate-400">
                                                            {formatDateTime(row.created_at)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {(() => {
                                                                const meta = getTransactionMeta(row.reason);
                                                                const Icon = meta.icon;
                                                                return (
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={cn("p-2 rounded-xl border border-slate-100 transition-transform group-hover:scale-110 dark:border-slate-800", meta.bg)}>
                                                                            <Icon className={cn("h-4 w-4", meta.color)} />
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-bold text-slate-900 dark:text-white leading-tight">
                                                                                {meta.label}
                                                                            </div>
                                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                                                {meta.subLabel}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="px-6 py-4 text-xs hidden sm:table-cell">
                                                            <span
                                                                className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 font-medium uppercase tracking-wider border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
                                                                {row.source || "System"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <DeltaPill value={row.delta} />
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                                                    >
                                                        <div className="mb-3 flex justify-center">
                                                            <div
                                                                className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center dark:bg-slate-800">
                                                                <History
                                                                    className="h-6 w-6 text-slate-300 dark:text-slate-600" />
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
                        <div
                            className="text-center text-xs text-slate-400 max-w-2xl mx-auto pt-4 pb-12 dark:text-slate-500">
                            <p>
                                Points are used to generate AI itineraries, enhance
                                destinations, and unlock pro-level planning tools.
                            </p>
                            <Link
                                href="/rewards"
                                className="text-blue-600 hover:text-blue-700 font-semibold mt-1 inline-block hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                View Rewards Program →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}