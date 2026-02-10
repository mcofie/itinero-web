import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { createClientServerRSC } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Sparkles, Clock, Plane, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

/* --- Data Configuration --- */

type DestinationStatus = "active" | "coming_soon";

interface Destination {
    id: string;
    name: string;
    image: string;
    status: DestinationStatus;
    description: string;
    countryCode?: string | null;
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

export default async function DestinationsPage() {
    const sb = await createClientServerRSC();
    const { data: { user: _user } } = await sb.auth.getUser();

    // Fetch destinations from the DB
    const { data: destRows } = await sb
        .schema("itinero")
        .from("destinations")
        .select("id, name, cover_url, category, popularity, country_code")
        .order("popularity", { ascending: false });

    const destinations: Destination[] = (destRows || []).map(row => ({
        id: row.id,
        name: row.name || "Unknown",
        image: row.cover_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
        status: (row.popularity || 0) > 0 ? "active" : "coming_soon",
        description: row.category || "Explore the wonders of this beautiful destination.",
        countryCode: row.country_code
    }));

    const activeDestinations = destinations.filter((d) => d.status === "active");
    const comingSoonDestinations = destinations.filter((d) => d.status === "coming_soon");

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Header Section */}
            <section
                className="relative bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-12 pb-16 px-6">
                <div className="mx-auto max-w-7xl">
                    <Button
                        asChild
                        variant="ghost"
                        className="mb-6 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white -ml-4"
                    >
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                        </Link>
                    </Button>

                    <div className="max-w-3xl">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                            <MapPin className="h-3 w-3" />
                            Explore the World
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                            Where will you go next?
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                            We currently support curated itineraries for these amazing destinations.
                            Select a location to start building your dream trip instantly.
                        </p>
                    </div>
                </div>
            </section>

            {/* Active Destinations */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {activeDestinations.map((dest) => (
                            <DestinationCard key={dest.id} destination={dest} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Coming Soon Section */}
            <section
                className="px-6 py-16 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center gap-3 mb-10">
                        <div
                            className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Coming Soon</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">We are working hard to add
                                these locations.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {comingSoonDestinations.map((dest) => (
                            <DestinationCard key={dest.id} destination={dest} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Request Footer */}
            <section className="py-24 px-6 text-center">
                <div className="mx-auto max-w-2xl space-y-6">
                    <div
                        className="mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4 dark:bg-blue-900/20 dark:text-blue-400">
                        <Plane className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Don&apos;t see your
                        destination?</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        We are constantly adding new cities and countries. Let us know where you want to travel
                        next.
                    </p>
                    <Button variant="outline" size="lg"
                        className="rounded-full border-slate-300 dark:border-slate-700">
                        Request a Destination
                    </Button>
                </div>
            </section>

        </div>
    );
}

/* ---------------- Sub-components ---------------- */

function DestinationCard({ destination }: { destination: Destination }) {
    const isActive = destination.status === "active";

    // Base card wrapper
    const CardWrapper = ({ children }: { children: React.ReactNode }) => {
        if (isActive) {
            return (
                <Link href={`/trip-maker?dest=${destination.name}`} className="group block h-full">
                    {children}
                </Link>
            );
        }
        return <div
            className="group block h-full cursor-not-allowed opacity-80 grayscale hover:grayscale-0 transition-all duration-700">{children}</div>;
    };

    return (
        <CardWrapper>
            <div
                className="relative h-[320px] w-full overflow-hidden rounded-[2rem] shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl bg-slate-900">

                {/* Background Image */}
                <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-70 transition-opacity" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="transform transition-transform duration-300 group-hover:-translate-y-2">

                        {/* Badges */}
                        <div className="mb-3">
                            {isActive ? (
                                <Badge
                                    className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg">
                                    <Sparkles className="mr-1.5 h-3 w-3 text-yellow-300" /> Popular
                                </Badge>
                            ) : (
                                <Badge className="bg-slate-800 text-slate-300 border-slate-700">
                                    Coming Soon
                                </Badge>
                            )}
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-0.5">
                            {destination.name}
                        </h3>

                        <p className="text-slate-300 text-sm font-medium opacity-80 mb-2">
                            {getFlagEmoji(destination.countryCode)} {getCountryName(destination.countryCode)}
                        </p>
                    </div>

                    {/* Hover Action */}
                    {isActive && (
                        <div
                            className="mt-4 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                            <Button size="sm"
                                className="w-full rounded-full bg-white text-slate-900 hover:bg-blue-50 font-bold">
                                View curated trips <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </CardWrapper>
    );
}