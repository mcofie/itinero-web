import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Sparkles, Clock, Plane, ArrowRight } from "lucide-react";
import { createClientServerRSC } from "@/lib/supabase/server";

/* --- Data Configuration --- */

type DestinationStatus = "active" | "coming_soon";

interface Destination {
    id: string;
    name: string;
    image: string;
    status: DestinationStatus;
    description: string;
}

const DESTINATIONS: Destination[] = [
    // --- Active ---
    {
        id: "france",
        name: "France",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "From the romance of Paris to the lavender fields of Provence."
    },
    {
        id: "italy",
        name: "Italy",
        image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "Ancient history, exquisite cuisine, and the rolling hills of Tuscany."
    },
    {
        id: "turkey",
        name: "Turkey",
        image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "Where East meets West, featuring bazaars, mosques, and fairy chimneys."
    },
    {
        id: "ghana",
        name: "Ghana",
        image: "https://images.unsplash.com/photo-1532302989211-173c1d2d5445?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "Experience the vibrant culture, history, and coastlines of West Africa."
    },
    {
        id: "kenya",
        name: "Kenya",
        image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "Home to the classic safari, vast savannahs, and the Maasai Mara."
    },
    {
        id: "south-africa",
        name: "South Africa",
        image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "From Cape Town's table mountain to wineries and wildlife."
    },
    {
        id: "tanzania",
        name: "Tanzania",
        image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "Witness the Serengeti migration and the heights of Kilimanjaro."
    },
    {
        id: "morocco",
        name: "Morocco",
        image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "Get lost in the colorful medinas, deserts, and Atlas mountains."
    },
    {
        id: "rwanda",
        name: "Rwanda",
        image: "https://images.unsplash.com/photo-1565372954320-44076d647781?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "The land of a thousand hills and majestic mountain gorillas."
    },
    {
        id: "thailand",
        name: "Thailand",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "Tropical beaches, opulent royal palaces, and ancient ruins."
    },
    {
        id: "dubai",
        name: "Dubai",
        image: "https://images.unsplash.com/photo-1512453979798-5ea904f18431?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "Ultramodern architecture, luxury shopping, and lively nightlife."
    },
    {
        id: "singapore",
        name: "Singapore",
        image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800&auto=format&fit=crop",
        status: "active",
        description: "A melting pot of culture, futuristic gardens, and world-class food."
    },
    // --- Coming Soon ---
    {
        id: "japan",
        name: "Japan",
        image: "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800&auto=format&fit=crop",
        status: "coming_soon",
        description: "Cherry blossoms, ancient temples, and neon-lit cities."
    },
    {
        id: "uganda",
        name: "Uganda",
        image: "https://images.unsplash.com/photo-1573122350758-f622c465342b?q=80&w=800&auto=format&fit=crop",
        status: "coming_soon",
        description: "The pearl of Africa, featuring the source of the Nile."
    },
    {
        id: "malaysia",
        name: "Malaysia",
        image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=800&auto=format&fit=crop",
        status: "coming_soon",
        description: "Rainforests, beaches, and the iconic Petronas Twin Towers."
    },
];

export default async function DestinationsPage() {
    const sb = await createClientServerRSC();
    const { data: { user } } = await sb.auth.getUser();

    const activeDestinations = DESTINATIONS.filter((d) => d.status === "active");
    const comingSoonDestinations = DESTINATIONS.filter((d) => d.status === "coming_soon");

    return (
        <AppShell userEmail={user?.email ?? null}>
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">

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
        </AppShell>
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
            className="group block h-full cursor-not-allowed opacity-80 grayscale hover:grayscale-0 transition-all duration-500">{children}</div>;
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
                                    className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                                    <Sparkles className="mr-1.5 h-3 w-3 text-yellow-300" /> Popular
                                </Badge>
                            ) : (
                                <Badge className="bg-slate-800/80 text-slate-300 border-slate-700 backdrop-blur-md">
                                    Coming Soon
                                </Badge>
                            )}
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">
                            {destination.name}
                        </h3>

                        <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
                            {destination.description}
                        </p>
                    </div>

                    {/* Hover Action */}
                    {isActive && (
                        <div
                            className="mt-4 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                            <Button size="sm"
                                className="w-full rounded-full bg-white text-slate-900 hover:bg-blue-50 font-bold">
                                Plan Trip <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </CardWrapper>
    );
}