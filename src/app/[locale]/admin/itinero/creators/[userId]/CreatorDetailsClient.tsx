"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
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
import { Button } from "@/components/ui/button";
import {
    Calendar,
    ArrowLeft,
    MapPin,
    Trophy,
    ExternalLink,
    Plane,
    CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type CreatorDetails = {
    id: string;
    fullName: string | null;
    username: string | null;
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
};

export default function CreatorDetailsClient({ creator }: { creator: CreatorDetails }) {
    const totalTrips = creator.trips.length;
    const publicTrips = creator.trips.filter(t => t.isPublic).length;

    // Sort trips by date desc
    const sortedTrips = [...creator.trips].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <div className="bg-slate-50/50 dark:bg-slate-950/50 p-8 w-full max-w-[1600px] mx-auto space-y-8">
            {/* Header / Nav */}
            <div>
                <Button variant="ghost" asChild className="pl-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4">
                    <Link href="/admin/itinero/creators">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Creators
                    </Link>
                </Button>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Profile Card */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                            <div className="h-32 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
                                <div className="absolute -bottom-12 left-6">
                                    <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-slate-900 shadow-xl">
                                        <AvatarImage src={creator.avatarUrl || ""} />
                                        <AvatarFallback className="text-2xl font-bold bg-slate-100 text-slate-900">
                                            {creator.fullName?.[0]?.toUpperCase() || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                            <CardContent className="pt-16 pb-6 px-6 space-y-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {creator.fullName || "Anonymous User"}
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        @{creator.username || "user"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>Joined {creator.joinedAt ? format(new Date(creator.joinedAt), "MMM yyyy") : "Unknown"}</span>
                                </div>

                                {creator.bio && (
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                        {creator.bio}
                                    </p>
                                )}

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalTrips}</div>
                                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Trips</div>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{creator.totalPoints}</div>
                                        <div className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wide">Points</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Content Area */}
                    <div className="w-full md:w-2/3 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Plane className="h-5 w-5 text-slate-400" />
                                Trip History
                            </h2>
                            <Badge variant="outline" className="bg-white dark:bg-slate-900">
                                {publicTrips} Public / {totalTrips} Total
                            </Badge>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                    <TableRow>
                                        <TableHead className="w-[300px]">Trip</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead className="text-right">Est. Cost</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedTrips.map((trip) => (
                                        <TableRow key={trip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                                                        {trip.coverUrl ? (
                                                            <Image
                                                                src={trip.coverUrl}
                                                                alt=""
                                                                fill
                                                                className="object-cover"
                                                                sizes="40px"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-slate-200 text-slate-400">
                                                                <Plane className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                            {trip.title || "Untitled Trip"}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            Created {format(new Date(trip.createdAt), "MMM d, yyyy")}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                                {trip.startDate ? (
                                                    <span>
                                                        {format(new Date(trip.startDate), "MMM d")}
                                                        {trip.endDate && ` - ${format(new Date(trip.endDate), "MMM d, yyyy")}`}
                                                    </span>
                                                ) : "—"}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-xs font-medium text-slate-600 dark:text-slate-300">
                                                {trip.currency} {trip.estCost.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {trip.isPublic ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30">
                                                        Public
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                        Private
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {trip.isPublic && trip.publicId && (
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600" asChild>
                                                        <Link href={`/trips/share/${trip.publicId}`} target="_blank">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {sortedTrips.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                                No trips created yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
