
import * as React from "react";
import { createClientServerRSC } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddPointsDialog } from "../admin-client";
import { User2, Calendar, Mail, Globe, Eye, Wallet, ChevronLeft, ChevronRight, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; size?: string }>;
}) {
    const { page: pageStr, size: sizeStr } = await searchParams;
    const page = Math.max(1, parseInt(pageStr || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(sizeStr || "20")));
    const offset = (page - 1) * pageSize;


    const sb = await createClientServerRSC();
    const adminSb = createAdminClient();

    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect("/login");

    // Fetch users with range for pagination
    // Use admin client if available to bypass RLS for the directory view
    const fetchClient = adminSb || sb;
    const { data: users, count, error: userError } = await fetchClient
        .schema("itinero")
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

    if (userError) {
        console.error("Error fetching users", userError);
    }

    const totalPages = Math.ceil((count || 0) / pageSize);

    // Fetch auth users to get emails (if admin client available)
    let emailMap = new Map<string, string>();
    let ledgerBalanceMap = new Map<string, number>();

    if (adminSb && users && users.length > 0) {
        const userIds = users.map(u => u.id);
        try {
            // 1. Fetch Auth Emails
            const { data: { users: authUsers }, error: authError } = await adminSb.auth.admin.listUsers();
            if (!authError && authUsers) {
                authUsers.forEach(au => {
                    if (au.email) emailMap.set(au.id, au.email);
                });
            }

            // 2. Fetch Real Ledger Sums for these users (Truth from Ledger)
            const { data: ledgerEntries } = await adminSb
                .schema("itinero")
                .from("points_ledger")
                .select("user_id, delta")
                .in("user_id", userIds);

            ledgerEntries?.forEach(entry => {
                const current = ledgerBalanceMap.get(entry.user_id) || 0;
                ledgerBalanceMap.set(entry.user_id, current + (entry.delta || 0));
            });
        } catch (e) {
            console.error("Failed to fetch admin data:", e);
        }
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6 md:p-8 lg:p-10 space-y-8 w-full max-w-[1400px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
                        User Directory
                        <Badge variant="secondary" className="h-7 px-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-none font-black text-xs uppercase tracking-widest">
                            {(count || 0).toLocaleString()} Registered
                        </Badge>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Comprehensive management of all platform participants and wallets.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    <div className="px-4 py-2 text-sm font-bold border-r border-slate-100 dark:border-slate-800 text-slate-500">
                        Page {page} of {totalPages || 1}
                    </div>
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={page <= 1}
                            asChild={page > 1}
                            className="rounded-xl"
                        >
                            {page > 1 ? (
                                <Link href={`/admin/itinero/users?page=${page - 1}`}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                            ) : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={page >= totalPages}
                            asChild={page < totalPages}
                            className="rounded-xl"
                        >
                            {page < totalPages ? (
                                <Link href={`/admin/itinero/users?page=${page + 1}`}>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Table Content */}
            <div className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 pl-10">Identity</th>
                                <th className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Contact & Locale</th>
                                <th className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Join Date</th>
                                <th className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Wallet</th>
                                <th className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {users?.map((u) => (
                                <tr key={u.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-300">
                                    <td className="pl-10 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 relative rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-white dark:ring-slate-900 shadow-lg group-hover:ring-blue-500 transition-all">
                                                {u.avatar_url ? (
                                                    <Image
                                                        src={u.avatar_url}
                                                        alt={u.full_name || "User"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                        <User2 className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                                    {u.full_name || "Anonymous User"}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-tighter">
                                                    @{u.username || "unset"} • {u.id.slice(0, 8)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                                                <Mail className="h-3.5 w-3.5 text-blue-500/70" />
                                                {emailMap.get(u.id) || <span className="text-slate-400 italic font-medium">Hidden</span>}
                                            </div>
                                            {u.passport_country && (
                                                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400">
                                                    <Globe className="h-3 w-3" />
                                                    {u.passport_country}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(u.created_at)}
                                        </div>
                                    </td>


                                    <td className="py-5">
                                        <div className="inline-flex flex-col">
                                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100/50 dark:border-emerald-800/50">
                                                <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                                <span className="text-base font-black text-slate-900 dark:text-white">
                                                    {new Intl.NumberFormat().format(ledgerBalanceMap.get(u.id) ?? u.points_balance ?? 0)}
                                                </span>
                                                <span className="text-[10px] font-black text-emerald-600/50 dark:text-emerald-400/50 uppercase tracking-tight">pts</span>
                                            </div>
                                            <div className="mt-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1">
                                                Currency: {u.preferred_currency || "USD"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="pr-10 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/admin/itinero/creators/${u.id}`} passHref>
                                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600">
                                                    <Eye className="h-5 w-5" />
                                                    <span className="sr-only">Inspect Profile</span>
                                                </Button>
                                            </Link>
                                            <div className="scale-90 origin-right">
                                                <AddPointsDialog
                                                    userId={u.id}
                                                    userName={u.full_name || u.username || "User"}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(!users || users.length === 0) && (
                    <div className="h-80 flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <Users className="h-16 w-16 opacity-10" />
                        <div className="text-center">
                            <p className="font-black text-xl text-slate-900 dark:text-white">Empty directory</p>
                            <p className="text-sm font-medium">New users will appear here once registered.</p>
                        </div>
                    </div>
                )}

                <div className="p-6 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Showing {users?.length || 0} of {count || 0} participants
                    </div>
                    <div className="flex gap-2">
                        {/* Simple Next/Prev only to keep it clean */}
                        <Button variant="outline" size="sm" className="rounded-xl font-black text-xs h-9" asChild={page > 1} disabled={page <= 1}>
                            {page > 1 ? <Link href={`/admin/itinero/users?page=${page - 1}`}>Previous</Link> : <span>Previous</span>}
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl font-black text-xs h-9" asChild={page < totalPages} disabled={page >= totalPages}>
                            {page < totalPages ? <Link href={`/admin/itinero/users?page=${page + 1}`}>Next Page</Link> : <span>Next Page</span>}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
