"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Search, Clock, Plane, ArrowRight, Sparkles, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type DestinationStatus = "active" | "coming_soon";

export interface Destination {
    id: string;
    name: string;
    image: string;
    status: DestinationStatus;
    description: string;
    countryCode?: string | null;
    vibe?: string;
}

function getFlagEmoji(code?: string | null) {
    if (!code || code.length !== 2) return "";
    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    try {
        return String.fromCodePoint(...codePoints);
    } catch {
        return "";
    }
}

function getCountryName(code?: string | null) {
    if (!code) return "";
    try {
        const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
        return displayNames.of(code.toUpperCase()) || code;
    } catch {
        return code;
    }
}

export default function DestinationsClient({ destinations }: { destinations: Destination[] }) {
    const [search, setSearch] = useState("");

    const filtered = destinations.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.countryCode && getCountryName(d.countryCode).toLowerCase().includes(search.toLowerCase()))
    );

    const activeDestinations = filtered.filter((d) => d.status === "active");
    const comingSoonDestinations = filtered.filter((d) => d.status === "coming_soon");

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* --- Hero Header --- */}
            <header className="relative bg-white dark:bg-slate-900 pt-20 pb-32 overflow-hidden border-b border-slate-200 dark:border-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/10" />

                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50" />
                    <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-100 dark:bg-purple-900/10 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="mb-8 pl-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-transparent"
                                >
                                    <Link href="/" className="group flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <ArrowLeft className="h-4 w-4" />
                                        </div>
                                        <span className="font-semibold">Back to Home</span>
                                    </Link>
                                </Button>

                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400">
                                    <Globe className="h-3 w-3" />
                                    Explore the World
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-[0.9]">
                                    Where to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">next?</span>
                                </h1>
                                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-xl">
                                    Discover our curated collection of extraordinary destinations.
                                    Every trip is handcrafted by experts and optimized for unforgettable experiences.
                                </p>
                            </motion.div>
                        </div>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="w-full md:w-auto md:min-w-[320px]"
                        >
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    placeholder="Search destinations..."
                                    className="pl-12 h-14 rounded-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 text-lg transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="mx-auto max-w-7xl px-6 -mt-20 relative z-20 pb-24">

                {activeDestinations.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {activeDestinations.map((dest, i) => (
                            <DestinationCard key={dest.id} destination={dest} index={i} />
                        ))}
                    </div>
                )}

                {activeDestinations.length === 0 && search && (
                    <div className="text-center py-20">
                        <div className="mx-auto h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            <Search className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No destinations found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Try adjusting your search criteria</p>
                    </div>
                )}

                {/* Coming Soon Section */}
                {comingSoonDestinations.length > 0 && (
                    <div className="mt-24 pt-10 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Coming Soon</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">We're working on these amazing locations</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {comingSoonDestinations.map((dest, i) => (
                                <ComingSoonCard key={dest.id} destination={dest} index={i} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Request Destination */}
                <div className="mt-24 relative overflow-hidden rounded-[2.5rem] bg-blue-600 text-white p-12 text-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
                    <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-blue-500 rounded-full blur-3xl opacity-50" />

                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <div className="mx-auto h-20 w-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/20 shadow-2xl">
                            <Plane className="h-10 w-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Don't see your destination?</h2>
                            <p className="text-xl text-blue-100 font-medium">
                                We are constantly adding new cities and countries. Let us know where you want to travel next.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="h-14 px-8 rounded-full text-blue-700 font-bold text-lg shadow-xl shadow-blue-900/20 hover:scale-105 transition-transform"
                        >
                            Request a Destination
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}

function DestinationCard({ destination, index }: { destination: Destination; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
        >
            <Link href={`/destinations/${destination.id}`} className="group block h-full relative">
                <div className="relative h-[480px] w-full overflow-hidden rounded-[2rem] bg-slate-900 shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl ring-1 ring-black/5 dark:ring-white/10">

                    {/* Background Image */}
                    <Image
                        src={destination.image}
                        alt={destination.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                    {/* Floating Country Badge */}
                    <div className="absolute top-4 left-4">
                        <div className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                            <span className="text-base">{getFlagEmoji(destination.countryCode)}</span>
                            {getCountryName(destination.countryCode)}
                        </div>
                    </div>

                    {/* Vibe Badge */}
                    {destination.vibe && (
                        <div className="absolute top-4 right-4">
                            <div className="px-3 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-md border border-blue-400/30 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                                {destination.vibe}
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-4xl font-black text-white mb-2 tracking-tight group-hover:text-blue-100 transition-colors">
                            {destination.name}
                        </h3>

                        <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100">
                            <p className="text-slate-300 font-medium text-sm leading-relaxed mb-6 line-clamp-2">
                                {destination.description}
                            </p>
                            <Button className="w-full rounded-xl bg-white text-slate-900 hover:bg-blue-50 font-bold">
                                Plan Trip <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function ComingSoonCard({ destination, index }: { destination: Destination; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + (index * 0.05), duration: 0.4 }}
            className="group relative h-[300px] overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700"
        >
            <div className="absolute inset-0 opacity-50 grayscale contrast-125 transition-all duration-500 group-hover:opacity-40 group-hover:grayscale-0">
                <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="mb-4 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 drop-shadow-md">
                    {destination.name}
                </h3>
                <Badge variant="secondary" className="bg-slate-900/50 text-white backdrop-blur-sm border-none">
                    Coming Soon
                </Badge>
            </div>
        </motion.div>
    );
}
