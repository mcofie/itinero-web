"use client";

import { format } from "date-fns";
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
import { CreditCard, DollarSign, TrendingUp, Activity } from "lucide-react";

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

export default function PaymentHistoryClient({ transactions }: { transactions: Transaction[] }) {
    // Calculate stats
    const totalTransactions = transactions.length;
    const totalPoints = transactions.reduce((acc, curr) => acc + curr.delta, 0);

    // approximate revenue calculation
    let totalRevenue = 0;
    transactions.forEach(t => {
        const raw = t.meta?.data?.amount || t.meta?.amount;
        if (raw) {
            totalRevenue += Number(raw); // usually in smallest unit (e.g. kobo)
        }
    });
    // Assuming GHS (cedis) and amount in pesewas/cents
    const totalRevenueFormatted = (totalRevenue / 100).toLocaleString('en-GH', { style: 'currency', currency: 'GHS' });

    return (
        <div className="p-8 space-y-8 w-full max-w-[1600px] mx-auto bg-slate-50/50 dark:bg-slate-950/50">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Transactions
                </h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Monitor real-time financial activity and point distribution.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Total Revenue (Est.)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalRevenueFormatted}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Gross volume from point sales
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Points Distributed
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {totalPoints.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Total points added to user wallets
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Transactions
                        </CardTitle>
                        <Activity className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {totalTransactions}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Life-time successful payments
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
                </div>
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="w-[250px] pl-6">User</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead className="text-right">Points</TableHead>
                            <TableHead className="text-right pr-6">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => {
                            const rawAmount = tx.meta?.data?.amount || tx.meta?.amount;
                            const amount = rawAmount ? (Number(rawAmount) / 100).toFixed(2) : "-";
                            const currency = tx.meta?.data?.currency || tx.meta?.currency || "GHS";

                            return (
                                <TableRow key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 ring-1 ring-slate-200 dark:ring-slate-800">
                                                <AvatarImage src={tx.user.avatarUrl || ""} />
                                                <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-900">
                                                    {tx.user.full_name?.[0]?.toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm text-slate-900 dark:text-white">
                                                    {tx.user.full_name || "Unknown User"}
                                                </span>
                                                <span className="text-xs text-slate-500 font-mono">
                                                    {tx.user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{format(new Date(tx.created_at), "MMM d, yyyy")}</span>
                                            <span className="text-xs text-slate-400">{format(new Date(tx.created_at), "h:mm a")}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                            {tx.ref_id}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                            +{tx.delta}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 font-medium text-slate-900 dark:text-white tabular-nums">
                                        {rawAmount ? `${currency} ${amount}` : "—"}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 dark:bg-slate-800">
                                            <CreditCard className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">No transactions yet</p>
                                        <p className="text-sm">Payments will appear here once processed.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
