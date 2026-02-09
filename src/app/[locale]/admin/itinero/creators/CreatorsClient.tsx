"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export type CreatorStat = {
    userId: string;
    fullName: string | null;
    username: string | null;
    avatarUrl: string | null;
    tripCount: number;
    totalViews?: number;
    lastTripDate?: string | null;
};

export default function CreatorsClient({ creators }: { creators: CreatorStat[] }) {
    return (
        <div className="p-8 space-y-6 w-full max-w-[1600px] mx-auto bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        Creators & Guides
                        <span className="text-sm font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {creators.length}
                        </span>
                    </h1>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        Overview of users who have published itineraries.
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="w-[350px] pl-6">Creator</TableHead>
                            <TableHead className="text-center">Trips Published</TableHead>
                            <TableHead className="text-right">Last Activity</TableHead>
                            <TableHead className="text-right pr-6">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {creators.map((c) => (
                            <TableRow key={c.userId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                <TableCell className="pl-6">
                                    <div className="flex items-center gap-4">
                                        <Link href={`/admin/itinero/creators/${c.userId}`}>
                                            <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-900 shadow-sm cursor-pointer hover:ring-blue-500 transition-all">
                                                <AvatarImage src={c.avatarUrl || ""} />
                                                <AvatarFallback className="text-xs font-bold bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200">
                                                    {c.fullName?.[0]?.toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex flex-col">
                                            <Link href={`/admin/itinero/creators/${c.userId}`} className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                {c.fullName || "Anonymous User"}
                                            </Link>
                                            <span className="text-xs text-slate-500 font-mono">
                                                @{c.username || "user"}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm">
                                        {c.tripCount} Trips
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    {c.lastTripDate ? new Date(c.lastTripDate).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    }) : "—"}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium text-xs">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        Active
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {creators.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 dark:bg-slate-800">
                                            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-white">No creators found</p>
                                        <p className="text-sm">Users who create trips will appear here.</p>
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
