
"use client";

import * as React from "react";
import { Link } from '@/i18n/routing';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Globe,
    MapPin,
    Plus,
    ArrowRight,
    TrendingUp,
    Activity,
    Flag,
    Users,
    MessageSquare,
} from "lucide-react";
import { DestinationOption, PlaceOption } from "./types";
import { TableImage } from "@/components/admin/AdminShared";

type ItineroDashboardClientProps = {
    initialDestinations: DestinationOption[];
    initialPlaces: PlaceOption[];
    adminDetails: {
        email: string;
        name: string;
    };
};

export default function ItineroDashboardClient({
    initialDestinations,
    initialPlaces,
    adminDetails,
}: ItineroDashboardClientProps) {
    // ... stats ...


    // Stats
    const totalDestinations = initialDestinations.length;
    const totalPlaces = initialPlaces.length;
    const totalCountries = new Set(initialDestinations.map(d => d.country_code).filter(Boolean)).size;
    const featuredCities = initialDestinations.filter(d => (d.popularity ?? 0) > 80).length;

    // Recent Activity (Top 5 newest by default - assuming sorted or just take first 5)
    // The initial load was sorted by name. 
    // Ideally we'd sort by created_at if we had it, but we don't have created_at in the type for destinations/places in the list fetch.
    // So we'll just show "Featured" or "Popular" instead of "Recent" for now, or just list a few.
    const popularDestinations = [...initialDestinations].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 5);

    return (
        <div className="container mx-auto max-w-[1400px] p-8 space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-2">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-transparent">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        <span>Administration</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Welcome back, {adminDetails.name}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Overview of your travel content and key metrics.
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <Button asChild className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                        <Link href="/admin/itinero/destinations">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Destination
                        </Link>
                    </Button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 rounded-xl relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 h-24 w-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                            Total Destinations
                        </CardTitle>
                        <Globe className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalDestinations}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Across {totalCountries} countries
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 rounded-xl relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 h-24 w-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                            Total Places
                        </CardTitle>
                        <MapPin className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalPlaces}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Points of interest & hotels
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 rounded-xl relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 h-24 w-24 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                            Active Countries
                        </CardTitle>
                        <Flag className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{totalCountries}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Global coverage
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 rounded-xl relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 h-24 w-24 bg-purple-50 dark:bg-purple-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                            Featured Cities
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">{featuredCities}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            High popularity score (&gt;80)
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Quick Actions Card */}
                <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 rounded-xl h-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription>
                            Common tasks and management actions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button asChild variant="outline" className="w-full justify-start h-12 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 shadow-sm group">
                            <Link href="/admin/itinero/destinations">
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-2 rounded-lg mr-3 group-hover:scale-105 transition-transform">
                                    <Globe className="h-4 w-4" />
                                </span>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-900 dark:text-white">Manage Destinations</span>
                                    <span className="text-xs text-slate-500 font-normal">Add or edit cities and regions</span>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start h-12 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 shadow-sm group">
                            <Link href="/admin/itinero/places">
                                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 p-2 rounded-lg mr-3 group-hover:scale-105 transition-transform">
                                    <MapPin className="h-4 w-4" />
                                </span>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-900 dark:text-white">Curate Places</span>
                                    <span className="text-xs text-slate-500 font-normal">Manage POIs, hotels, and activities</span>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start h-12 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 shadow-sm group">
                            <Link href="/admin/itinero/users">
                                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 p-2 rounded-lg mr-3 group-hover:scale-105 transition-transform">
                                    <Users className="h-4 w-4" />
                                </span>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-900 dark:text-white">Manage Users</span>
                                    <span className="text-xs text-slate-500 font-normal">View users & award points</span>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start h-12 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 shadow-sm group">
                            <Link href="/admin/itinero/requests">
                                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 p-2 rounded-lg mr-3 group-hover:scale-105 transition-transform">
                                    <MessageSquare className="h-4 w-4" />
                                </span>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-slate-900 dark:text-white">Guide Requests</span>
                                    <span className="text-xs text-slate-500 font-normal">Review applications</span>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Popular Destinations */}
                <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 rounded-xl h-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            Top Destinations
                        </CardTitle>
                        <CardDescription>
                            Most popular locations currently in the database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {popularDestinations.map((d) => (
                                <div key={d.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <div className="h-10 w-10 text-xs rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                                        <TableImage url={d.cover_url} alt={d.name ?? ""} icon={Globe} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{d.name}</div>
                                        <div className="text-xs text-slate-500 truncate">{d.country_code} • {d.category}</div>
                                    </div>
                                    <div className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs">
                                        {d.popularity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
