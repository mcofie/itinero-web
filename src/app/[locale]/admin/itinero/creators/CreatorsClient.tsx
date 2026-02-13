
"use client";

import React from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
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
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plane, Wallet, Calendar, User, Search } from "lucide-react";

export type CreatorStat = {
    userId: string;
    fullName: string | null;
    username: string | null;
    avatarUrl: string | null;
    tripCount: number;
    points: number;
    lastTripDate?: string | null;
};


interface CreatorsClientProps {
    creators: CreatorStat[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
}

export default function CreatorsClient({
    creators,
    totalCount,
    currentPage,
    pageSize
}: CreatorsClientProps) {
    const totalPages = Math.ceil(totalCount / pageSize);
    const router = useRouter();
    const pathname = usePathname();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleFilterChange = (filter: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set("filter", filter);
        params.set("page", "1"); // reset to page 1
        router.push(`${pathname}?${params.toString()}`);
    };

    const currentFilter = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("filter") : null) || "all";

    return (
        <div className="p-6 md:p-8 lg:p-10 space-y-8 w-full max-w-[1400px] mx-auto min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4">
                        Creators & Guides
                        <Badge variant="secondary" className="h-7 px-3 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-none font-black text-xs uppercase tracking-widest">
                            {totalCount.toLocaleString()} Total
                        </Badge>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Insight into the architects of the world's best itineraries.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* Filter Tabs */}
                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm ring-1 ring-border">
                        <Button
                            variant={currentFilter === "all" ? "default" : "ghost"}
                            size="sm"
                            className="rounded-xl font-bold text-xs"
                            onClick={() => handleFilterChange("all")}
                        >
                            All
                        </Button>
                        <Button
                            variant={currentFilter === "active" ? "default" : "ghost"}
                            size="sm"
                            className="rounded-xl font-bold text-xs"
                            onClick={() => handleFilterChange("active")}
                        >
                            Active
                        </Button>
                        <Button
                            variant={currentFilter === "inactive" ? "default" : "ghost"}
                            size="sm"
                            className="rounded-xl font-bold text-xs"
                            onClick={() => handleFilterChange("inactive")}
                        >
                            Inactive
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm ring-1 ring-border">
                        <div className="px-4 py-2 text-sm font-bold border-r border-border text-slate-500">
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
            </div>

            {/* Main Table Content */}
            <div className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-border overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/30">
                        <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 pl-10">Architect</TableHead>
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Itineraries</TableHead>
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 text-center">Experience Points</TableHead>
                            <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-10">Profile</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {creators.map((c) => (
                            <TableRow key={c.userId} className="group border-border/50 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-300">
                                <TableCell className="pl-10 py-5">
                                    <div className="flex items-center gap-5">
                                        <Link href={`/admin/itinero/creators/${c.userId}`}>
                                            <Avatar className="h-14 w-14 ring-4 ring-white dark:ring-slate-900 shadow-xl group-hover:ring-blue-500 transition-all duration-500">
                                                <AvatarImage src={c.avatarUrl || ""} className="object-cover" />
                                                <AvatarFallback className="text-lg font-black bg-slate-100 text-blue-600 dark:bg-slate-800">
                                                    {c.fullName?.[0]?.toUpperCase() || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex flex-col">
                                            <Link href={`/admin/itinero/creators/${c.userId}`} className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
                                                {c.fullName || "Anonymous User"}
                                            </Link>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                                @{c.username || "unset"}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center py-5">
                                    <div className="inline-flex flex-col items-center">
                                        <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            <Plane className="h-4 w-4 text-blue-500" />
                                            {c.tripCount}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Creations</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center py-5">
                                    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors border border-transparent group-hover:border-blue-100 dark:group-hover:border-blue-900/50">
                                        <Wallet className="h-5 w-5 text-blue-500" />
                                        <div className="flex flex-col items-start leading-none gap-1">
                                            <span className="text-lg font-black text-slate-900 dark:text-white">
                                                {c.points.toLocaleString()}
                                            </span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Points</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-10 py-5">
                                    <Button variant="ghost" asChild className="rounded-2xl h-11 px-6 group/btn hover:bg-blue-600 hover:text-white transition-all shadow-none">
                                        <Link href={`/admin/itinero/creators/${c.userId}`} className="flex items-center gap-2">
                                            <span className="font-black text-xs uppercase tracking-widest">Inspect</span>
                                            <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {creators.length === 0 && (
                    <div className="h-80 flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <User className="h-16 w-16 opacity-10" />
                        <div className="text-center">
                            <p className="font-black text-xl text-slate-900 dark:text-white">No architects found</p>
                            <p className="text-sm font-medium">Try adjusting your filters or expanding your search.</p>
                        </div>
                    </div>
                )}

                {/* Visual Footer for pagination (redundant but aesthetic) */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-between border-t border-border">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Showing {creators.length} of {totalCount} records
                    </div>
                    <div className="flex gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const p = i + 1;
                            // Simplistic Logic: just show first few
                            return (
                                <Button
                                    key={p}
                                    variant={currentPage === p ? "default" : "ghost"}
                                    size="icon-sm"
                                    className="rounded-xl font-black text-xs"
                                    onClick={() => handlePageChange(p)}
                                >
                                    {p}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
