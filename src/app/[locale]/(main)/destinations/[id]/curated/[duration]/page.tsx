import * as React from "react";
import { createClientServerRSC } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
    Calendar,
    ArrowLeft,
    MapPin,
    Clock,
    Plane,
    Share2,
    Download,
    Sparkles,
    CheckCircle2,
    Users,
    Utensils,
    History,
    Home,
    Palmtree,
    Map as MapIcon,
    ChevronRight,
    ArrowUpRight,
    CloudSun
} from "lucide-react";
import DynamicItineraryMap from "@/components/maps/DynamicMap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicItineraryClient from "@/app/[locale]/trips/share/[publicId]/public-itinerary-client";

export const dynamic = "force-dynamic";

export default async function CuratedItineraryPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string, duration: string, locale: string }>,
    searchParams: Promise<{ persona?: string }>
}) {
    const { id, duration, locale } = await params;
    const { persona = "all" } = await searchParams;
    const sb = await createClientServerRSC();

    // 1. Fetch Destination
    const { data: dest } = await sb
        .schema("itinero")
        .from("destinations")
        .select("*")
        .eq("id", id)
        .single();

    if (!dest) notFound();

    // 2. Fetch Places
    const { data: places } = await sb
        .schema("itinero")
        .from("places")
        .select("*")
        .eq("destination_id", id)
        .order("popularity", { ascending: false });

    if (!places || places.length === 0) {
        // Fallback or empty state if no places exist for this destination yet
    }

    // 3. Determine Duration
    let dayCount = 1;
    let label = "24 Hour Blitz";
    if (duration === "3d") { dayCount = 3; label = "3 Day Long Weekend"; }
    else if (duration === "7d") { dayCount = 7; label = "7 Day Discovery"; }
    else if (duration === "14d") { dayCount = 14; label = "14 Day Ultimate Journey"; }

    // 4. Persona Selection
    const personas = [
        { id: "all", label: "Balanced", icon: Sparkles, color: "blue" },
        { id: "foodie", label: "Foodie", icon: Utensils, color: "orange" },
        { id: "historian", label: "Historian", icon: History, color: "amber" },
        { id: "family", label: "Family", icon: Home, color: "emerald" },
        { id: "luxury", label: "Luxury", icon: Palmtree, color: "purple" },
    ];
    const currentPersona = personas.find(p => p.id === persona) || personas[0];

    // 5. Filter & Sort Logic (Geospatial & Category)
    // In a real app, this would be a more complex clustering algorithm.
    // For now, we'll slice based on weighted score if we had more metadata.
    const placesPerDay = 3;
    const sortedPlaces = [...(places || [])].sort((a, b) => {
        // Boost based on persona
        if (persona === "foodie" && a.category?.toLowerCase().includes("food")) return -1;
        if (persona === "historian" && a.category?.toLowerCase().includes("history")) return -1;
        return (b.popularity || 0) - (a.popularity || 0);
    });

    const totalNeeded = Math.min(sortedPlaces.length, dayCount * placesPerDay);
    const topPlaces = sortedPlaces.slice(0, totalNeeded);

    // 6. Generate Curated Days with Geospatial Awareness
    // Helper to group by proximity
    const curatedDays = Array.from({ length: dayCount }).map((_, i) => {
        let dayPlaces = topPlaces.slice(i * placesPerDay, (i + 1) * placesPerDay);

        // Simple "Clustering" Sort: Sort by Lat/Lng within the day to minimize travel
        dayPlaces = dayPlaces.sort((a, b) => (a.lat || 0) - (b.lat || 0));

        return {
            date: null,
            blocks: dayPlaces.map((p, j) => ({
                id: p.id,
                title: p.name,
                notes: p.description || "A must-visit spot in " + dest.name,
                when: j === 0 ? "morning" : j === 1 ? "afternoon" : "evening",
                place_id: p.id,
                est_cost: p.cost_typical || 0,
                duration_min: 120
            }))
        };
    });

    const placeDetails = topPlaces.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        lat: p.lat,
        lng: p.lng,
        address: p.description?.slice(0, 50) + "..." // Fallback address
    }));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Header / Hero */}
            <div className="bg-slate-900 text-white relative overflow-hidden pt-20 pb-16">
                <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
                <div className="mx-auto max-w-7xl px-6 relative z-10">
                    <Link
                        href={`/destinations/${id}`}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors group"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="font-semibold text-sm">Back to {dest.name}</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className="bg-blue-600 border-none text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                    Curated Trip
                                </Badge>
                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    <Clock className="h-3 w-3" />
                                    {dayCount === 1 ? "24 Hours" : `${dayCount} Days`}
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                                {label} in <span className="text-blue-400">{dest.name}</span>
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl font-medium">
                                {persona === "foodie"
                                    ? "A gastronomic adventure through the city's best markets, hidden kitchens, and fine dining icons."
                                    : "A perfectly balanced itinerary featuring the most iconic landmarks and vetted local secrets. Optimized for timing, distance, and discovery."}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" className="rounded-xl border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
                                <Share2 className="h-4 w-4 mr-2" /> Share
                            </Button>
                            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                                <Download className="h-4 w-4 mr-2" /> Export PDF
                            </Button>
                        </div>
                    </div>

                    {/* Persona Selector */}
                    <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Themed For:</span>
                        {personas.map((p) => (
                            <Link
                                key={p.id}
                                href={`/destinations/${id}/curated/${duration}?persona=${p.id}`}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all whitespace-nowrap border ${persona === p.id
                                    ? `bg-white text-slate-900 border-white font-bold shadow-lg`
                                    : `bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600`
                                    }`}
                            >
                                <p.icon className={`h-4 w-4 ${persona === p.id ? `text-${p.color}-600` : ""}`} />
                                {p.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Timeline Wrapper */}
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-10 px-4">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                The Itinerary
                            </h2>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Expert Vetted
                            </div>
                        </div>

                        {/* We use the shared PublicItineraryClient but pass it curated days */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-8">
                            {places && places.length > 0 ? (
                                <PublicItineraryClient
                                    currency="USD"
                                    estTotalCost={topPlaces.reduce((acc, p) => acc + (p.cost_typical || 0), 0)}
                                    days={curatedDays as any}
                                    places={topPlaces as any}
                                    placeDetails={placeDetails as any}
                                    tripSummary={null}
                                />
                            ) : (
                                <div className="text-center py-20">
                                    <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 dark:bg-slate-800">
                                        <MapPin className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Verified Places Yet</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
                                        We are currently vetting and verifying the best spots in {dest.name}. Check back soon for the full curated experience.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-6">
                            {/* Trip Summary Card */}
                            <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="text-xl font-black mb-6 tracking-tight">Trip Summary</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-500 font-medium">Total Stops</span>
                                        <span className="font-bold">{topPlaces.length} Places</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                                        <span className="text-slate-500 font-medium">Est. Cost</span>
                                        <span className="font-bold text-emerald-600">
                                            ${topPlaces.reduce((acc, p) => acc + (p.cost_typical || 0), 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-slate-500 font-medium">Distance</span>
                                        <span className="font-bold">Optimized Route</span>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Plan Card */}
                            <div className="p-8 rounded-[2.5rem] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                                <h4 className="flex items-center gap-2 font-black text-blue-700 dark:text-blue-400 text-sm mb-2">
                                    <Sparkles className="h-4 w-4" />
                                    Custom Plan
                                </h4>
                                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium leading-relaxed mb-4">
                                    Love this route? You can use this as a template and customize it to your own dates and group size.
                                </p>
                                <Button asChild className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-11">
                                    <Link href={`/trip-maker?dest=${dest.name}&template=${id}-${duration}-${persona}`}>
                                        Copy to My Trips
                                    </Link>
                                </Button>
                            </div>

                            {/* Vibe Check Card */}
                            <div className="p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                                    <CloudSun className="h-5 w-5 text-indigo-500" />
                                    The Vibe Check
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Typical Weather</span>
                                        <span className="font-bold">24°C • Sunny</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Crowd Level</span>
                                        <span className="font-bold text-orange-600">Moderate</span>
                                    </div>
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-800 text-[11px] font-medium text-slate-500 leading-relaxed italic">
                                        "Expect heavy foot traffic around the {topPlaces[0]?.name || "main square"} in the morning. Best to start early!"
                                    </div>
                                </div>
                            </div>

                            {/* Map Card */}
                            <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group border border-slate-800 shadow-sm">
                                <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                                <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                                    <MapIcon className="h-5 w-5 text-blue-400" />
                                    Route Map
                                </h3>
                                <div className="aspect-square rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center relative overflow-hidden">
                                    <DynamicItineraryMap
                                        places={topPlaces.filter(p => p.lat && p.lng).map(p => ({
                                            id: p.id,
                                            name: p.name,
                                            lat: p.lat!,
                                            lng: p.lng!
                                        }))}
                                    />
                                </div>
                                <Button variant="ghost" className="w-full mt-4 text-slate-400 hover:text-white text-xs font-bold group">
                                    Open in Google Maps <ArrowUpRight className="ml-2 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <div className="h-16 w-16 mx-auto rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 mb-8 dark:bg-blue-900/20">
                        <Plane className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                        More secrets in {dest.name}?
                    </h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 font-medium max-w-2xl mx-auto">
                        Our intelligence engine tracks thousands of local events and seasonal highlights. Start a custom trip to unlock real-time recommendations.
                    </p>
                    <Button asChild size="lg" className="h-14 px-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-900/20">
                        <Link href={`/trip-maker?dest=${dest.name}`}>Plan Custom Itinerary</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
