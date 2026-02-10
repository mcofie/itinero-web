"use client";

import React from "react";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
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
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Trophy,
    ExternalLink,
    Plane,
    CreditCard,
    Mail,
    User,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Zap,
    Wallet
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type CreatorDetails = {
    id: string;
    fullName: string | null;
    username: string | null;
    email?: string | null;
    avatarUrl: string | null;
    bio: string | null;
    joinedAt: string | null;
    totalPoints: number;
    trips: {
        id: string;
        title: string;
        startDate: string | null;
        endDate: string | null;
        isPublic: boolean;
        publicId: string | null;
        estCost: number;
        currency: string;
        coverUrl: string | null;
        createdAt: string;
    }[];
    ledger: {
        id: string;
        delta: number;
        reason: string | null;
        ref_type: string | null;
        created_at: string;
        meta?: any;
    }[];
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

interface CreatorDetailsClientProps {
    creator: CreatorDetails;
    totalTripsCount: number;
    tripsPage: number;
    totalLedgerCount: number;
    ledgerPage: number;
}

export default function CreatorDetailsClient({
    creator,
    totalTripsCount,
    tripsPage,
    totalLedgerCount,
    ledgerPage
}: CreatorDetailsClientProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handlePageChange = (type: 'tpage' | 'lpage', newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set(type, newPage.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const totalTripsPages = Math.ceil(totalTripsCount / 6);
    const totalLedgerPages = Math.ceil(totalLedgerCount / 10);

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-6 md:p-8 lg:p-12 w-full max-w-[1400px] mx-auto space-y-10"
        >
            {/* Header / Nav */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Button variant="ghost" asChild className="pl-0 text-slate-500 hover:text-blue-600 group mb-2">
                        <Link href="/admin/itinero/users">
                            <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Users
                        </Link>
                    </Button>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        User Intelligence
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-4 py-2 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-full font-bold uppercase tracking-widest text-slate-500">
                        Admin Monitor
                    </Badge>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Profile Card */}
                <motion.div variants={item} className="lg:col-span-4 space-y-6">
                    <Card className="border-none bg-white dark:bg-slate-900 overflow-hidden shadow-2xl shadow-blue-500/5 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-[2rem]">
                        <div className="h-40 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-20 blur-2xl" />

                            <div className="absolute -bottom-16 left-8">
                                <Avatar className="h-32 w-32 ring-8 ring-white dark:ring-slate-900 shadow-2xl">
                                    <AvatarImage src={creator.avatarUrl || ""} className="object-cover" />
                                    <AvatarFallback className="text-4xl font-black bg-slate-100 dark:bg-slate-800 text-blue-600">
                                        {creator.fullName?.[0]?.toUpperCase() || "?"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>

                        <CardContent className="pt-20 pb-10 px-8 space-y-8">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                    {creator.fullName || "Anonymous User"}
                                </h2>
                                <p className="text-blue-600 dark:text-blue-400 font-bold tracking-tight text-lg">
                                    @{creator.username || "unset"}
                                </p>
                            </div>

                            <div className="grid gap-4">
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</span>
                                        <span className="font-medium truncate max-w-[200px]">{creator.email || "No email available"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Member Since</span>
                                        <span className="font-medium">{creator.joinedAt ? format(new Date(creator.joinedAt), "PP") : "Unknown"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/50 group hover:shadow-lg transition-all duration-300">
                                    <div className="space-y-0.5">
                                        <div className="text-xs font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-widest">Available Points</div>
                                        <div className="text-3xl font-black text-blue-700 dark:text-blue-400 flex items-baseline gap-1">
                                            {creator.totalPoints.toLocaleString()}
                                            <span className="text-sm font-bold opacity-60">pts</span>
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform">
                                        <Zap className="h-6 w-6 fill-current" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-1">
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">{totalTripsCount}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Trips</div>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-center space-y-1">
                                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalLedgerCount}</div>
                                    <div className="text-[10px] font-black text-emerald-600/50 dark:text-emerald-400/50 uppercase tracking-widest">Events</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Column: Trips & Activity */}
                <motion.div variants={item} className="lg:col-span-8 space-y-8">
                    <Tabs defaultValue="trips" className="w-full">
                        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-8 w-fit mx-auto lg:mx-0 ring-1 ring-slate-200 dark:ring-slate-800">
                            <TabsTrigger value="trips" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg font-bold text-sm">
                                <Plane className="h-4 w-4 mr-2" />
                                Trips ({totalTripsCount})
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg font-bold text-sm">
                                <History className="h-4 w-4 mr-2" />
                                Ledger ({totalLedgerCount})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="trips" className="outline-none space-y-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`trips-${tripsPage}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    {creator.trips.map((trip) => (
                                        <Card key={trip.id} className="group border-none bg-white dark:bg-slate-900 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl hover:ring-blue-500 dark:hover:ring-blue-500 transition-all duration-300">
                                            <div className="h-40 relative">
                                                {trip.coverUrl ? (
                                                    <Image
                                                        src={trip.coverUrl}
                                                        alt={trip.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                                        <Plane className="h-12 w-12" />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-4">
                                                    {trip.isPublic ? (
                                                        <Badge className="bg-emerald-500/90 hover:bg-emerald-600 text-white border-none shadow-lg backdrop-blur-md">Shared</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-slate-900/60 hover:bg-slate-900/80 text-white border-none shadow-lg backdrop-blur-md">Private</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="space-y-1">
                                                    <h3 className="font-black text-xl text-slate-900 dark:text-white line-clamp-1">
                                                        {trip.title || "Untitled Trip"}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1.5 uppercase font-bold tracking-wider">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(trip.createdAt), "MMM d, yyyy")}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="text-sm font-black text-blue-600 dark:text-blue-400">
                                                        {trip.currency} {trip.estCost.toLocaleString()}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {trip.isPublic && trip.publicId && (
                                                            <Button size="icon" variant="ghost" className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl" asChild>
                                                                <Link href={`/trips/share/${trip.publicId}`} target="_blank">
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {creator.trips.length === 0 && (
                                        <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-400 space-y-4 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                            <Plane className="h-12 w-12 opacity-20" />
                                            <p className="font-bold">No trips found for this user.</p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {totalTripsPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={tripsPage <= 1}
                                        onClick={() => handlePageChange('tpage', tripsPage - 1)}
                                        className="rounded-xl font-bold"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                                    </Button>
                                    <div className="px-4 text-sm font-black text-slate-400 uppercase tracking-widest">
                                        Page {tripsPage} / {totalTripsPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={tripsPage >= totalTripsPages}
                                        onClick={() => handlePageChange('tpage', tripsPage + 1)}
                                        className="rounded-xl font-bold"
                                    >
                                        Next <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="activity" className="outline-none space-y-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`ledger-${ledgerPage}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white dark:bg-slate-900 rounded-[2rem] border-none ring-1 ring-slate-200 dark:ring-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none"
                                >
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                                            <h3 className="font-black text-2xl text-slate-900 dark:text-white">Transaction History</h3>
                                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 font-bold uppercase tracking-widest text-[10px]">
                                                {totalLedgerCount} Records
                                            </Badge>
                                        </div>

                                        <div className="space-y-4">
                                            {creator.ledger.map((log) => (
                                                <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${log.delta >= 0
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                                            }`}>
                                                            {log.delta >= 0 ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <div className="font-bold text-slate-900 dark:text-white capitalize">
                                                                {log.reason?.replace(/_/g, ' ') || 'Points Update'}
                                                            </div>
                                                            <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                                                                <span className="uppercase tracking-widest bold text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-black">{log.ref_type || 'system'}</span>
                                                                • {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`text-xl font-black font-mono tracking-tighter ${log.delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                                        }`}>
                                                        {log.delta >= 0 ? '+' : ''}{log.delta.toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                            {creator.ledger.length === 0 && (
                                                <div className="h-40 flex flex-col items-center justify-center text-slate-400 space-y-4">
                                                    <CreditCard className="h-10 w-10 opacity-20" />
                                                    <p className="font-bold uppercase tracking-widest text-xs">No transactions found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {totalLedgerPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={ledgerPage <= 1}
                                        onClick={() => handlePageChange('lpage', ledgerPage - 1)}
                                        className="rounded-xl font-bold"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                                    </Button>
                                    <div className="px-4 text-sm font-black text-slate-400 uppercase tracking-widest">
                                        Page {ledgerPage} / {totalLedgerPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={ledgerPage >= totalLedgerPages}
                                        onClick={() => handlePageChange('lpage', ledgerPage + 1)}
                                        className="rounded-xl font-bold"
                                    >
                                        Next <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </motion.div>
    );
}
