
"use client";

import { format } from "date-fns";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, TrendingUp, Activity, ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Transaction = {
    id: string;
    created_at: string;
    delta: number;
    ref_id: string;
    meta: any;
    user: {
        email: string | null;
        full_name: string | null;
        avatarUrl?: string | null;
    };
};

interface PaymentHistoryClientProps {
    transactions: Transaction[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
}

export default function PaymentHistoryClient({
    transactions,
    totalCount,
    currentPage,
    pageSize
}: PaymentHistoryClientProps) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const router = useRouter();
    const pathname = usePathname();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    // approximate revenue calculation (for current page or total if available, but here just summarizing the current view)
    let totalRevenueCurrent = 0;
    transactions.forEach(t => {
        const raw = t.meta?.data?.amount || t.meta?.amount;
        if (raw) totalRevenueCurrent += Number(raw);
    });

    return (
        <div className="p-6 md:p-8 lg:p-10 space-y-10 w-full max-w-[1400px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
                        Financial History
                        <Badge variant="secondary" className="h-7 px-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-none font-black text-xs uppercase tracking-widest">
                            {totalCount.toLocaleString()} Entries
                        </Badge>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Auditing real-time financial activity and point distribution across the platform.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <div className="px-4 py-2 text-sm font-bold border-r border-slate-100 dark:border-slate-800 text-slate-500">
                        Page {currentPage} of {totalPages || 1}
                    </div>
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={currentPage <= 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="rounded-xl"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="rounded-xl"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 rounded-[2rem] overflow-hidden">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                            <DollarSign className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Volume</p>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                GHS {(totalRevenueCurrent / 100).toLocaleString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 rounded-[2rem] overflow-hidden">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                            <TrendingUp className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Points Movement</p>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                {transactions.reduce((acc, curr) => acc + curr.delta, 0).toLocaleString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 rounded-[2rem] overflow-hidden">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-inner border border-slate-100 dark:border-slate-700">
                            <Activity className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Count</p>
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                {totalCount.toLocaleString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <div className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                        <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 pl-10">Beneficiary</TableHead>
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Timestamp</TableHead>
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Reference Hash</TableHead>
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Value (Pts)</TableHead>
                            <th className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-10">Fiat Equivalent</th>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => {
                            const rawAmount = tx.meta?.data?.amount || tx.meta?.amount;
                            const amount = rawAmount ? (Number(rawAmount) / 100).toFixed(2) : "-";
                            const currency = tx.meta?.data?.currency || tx.meta?.currency || "GHS";

                            return (
                                <TableRow key={tx.id} className="group border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-300">
                                    <td className="pl-10 py-5">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-slate-900 shadow-lg group-hover:ring-blue-500 transition-all">
                                                <AvatarImage src={tx.user.avatarUrl || ""} className="object-cover" />
                                                <AvatarFallback className="text-xs font-black bg-slate-100 text-blue-600 dark:bg-slate-800">
                                                    {tx.user.full_name?.[0]?.toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-black text-base text-slate-900 dark:text-white leading-tight">
                                                    {tx.user.full_name || "Anonymous"}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                                                    {tx.user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                {format(new Date(tx.created_at), "MMM d, yyyy")}
                                            </span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {format(new Date(tx.created_at), "h:mm a")}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-2 group/hash">
                                            <Hash className="h-3 w-3 text-slate-300 group-hover/hash:text-blue-500 transition-colors" />
                                            <code className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700">
                                                {tx.ref_id}
                                            </code>
                                        </div>
                                    </td>
                                    <td className="text-right py-5 px-4 font-black text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">
                                        +{tx.delta.toLocaleString()}
                                    </td>
                                    <td className="text-right pr-10 py-5">
                                        <div className="inline-flex flex-col items-end">
                                            <div className="text-base font-black text-slate-900 dark:text-white">
                                                {rawAmount ? `${currency} ${amount}` : "—"}
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Confirmed Payment</span>
                                        </div>
                                    </td>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {transactions.length === 0 && (
                    <div className="h-80 flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <CreditCard className="h-16 w-16 opacity-10" />
                        <div className="text-center">
                            <p className="font-black text-xl text-slate-900 dark:text-white">Journal empty</p>
                            <p className="text-sm font-medium">Verified payments will be recorded here automatically.</p>
                        </div>
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                        Verified Journal entries 1 - {transactions.length} of {totalCount}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl font-black text-xs h-9 px-4" asChild={currentPage > 1} disabled={currentPage <= 1}>
                            {currentPage > 1 ? <button onClick={() => handlePageChange(currentPage - 1)}>Previous</button> : <span>Previous</span>}
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl font-black text-xs h-9 px-4" asChild={currentPage < totalPages} disabled={currentPage >= totalPages}>
                            {currentPage < totalPages ? <button onClick={() => handlePageChange(currentPage + 1)}>Forward</button> : <span>Forward</span>}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
