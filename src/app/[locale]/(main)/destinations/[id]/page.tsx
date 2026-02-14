import * as React from "react";
import { createClientServerRSC } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
    Clock,
    Calendar,
    MapPin,
    ArrowRight,
    Sparkles,
    Compass,
    ShieldCheck,
    Coins,
    Plane,
    ArrowLeft,
    Utensils,
    History,
    Home,
    Palmtree,
    ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DestinationIdPage({
    params
}: {
    params: Promise<{ id: string, locale: string }>
}) {
    const { id, locale } = await params;
    const sb = await createClientServerRSC();

    const { data: dest } = await sb
        .schema("itinero")
        .from("destinations")
        .select("*")
        .eq("id", id)
        .single();

    if (!dest) notFound();

    const curatedOptions = [
        {
            slug: "24h",
            title: "The 24-Hour Blitz",
            desc: "The absolute must-sees for a quick stopover.",
            duration: "1 Day",
            icon: Clock,
            color: "blue"
        },
        {
            slug: "3d",
            title: "Long Weekend Escape",
            desc: "Perfect balance of icons and hidden neighborhood gems.",
            duration: "3 Days",
            icon: Calendar,
            color: "indigo"
        },
        {
            slug: "7d",
            title: "Complete Discovery",
            desc: "Full immersion into the culture, food, and secret spots.",
            duration: "7 Days",
            icon: Compass,
            color: "purple"
        },
        {
            slug: "14d",
            title: "The Ultimate Journey",
            desc: "Slow travel through the city and surrounding areas.",
            duration: "14 Days",
            icon: Sparkles,
            color: "emerald"
        }
    ];

    const personas = [
        { id: "foodie", label: "Foodie", icon: Utensils, desc: "Markets & Fine Dining" },
        { id: "historian", label: "Historian", icon: History, desc: "Museums & Ruins" },
        { id: "family", label: "Family", icon: Home, desc: "Kid-friendly & Safe" },
        { id: "luxury", label: "Luxury", icon: Palmtree, desc: "Premium & Relaxed" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero Section */}
            <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                <Image
                    src={dest.cover_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828"}
                    alt={dest.name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end pb-16">
                    <div className="mx-auto max-w-7xl px-6 w-full">
                        <Link
                            href="/destinations"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="font-semibold text-sm">All Destinations</span>
                        </Link>

                        <div className="max-w-3xl">
                            <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-none mb-4 px-4 py-1 text-xs font-bold uppercase tracking-wider">
                                Featured Destination
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
                                {dest.name}
                            </h1>
                            <p className="text-xl text-slate-200 font-medium leading-relaxed max-w-2xl">
                                {dest.category || "Explore the wonders of this beautiful destination through our expert-curated itineraries."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="mx-auto max-w-7xl px-6 py-20">
                <div className="grid lg:grid-cols-3 gap-16">
                    {/* Left: Curated Itineraries */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                                Curated Itineraries
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                                Handcrafted journeys designed to help you experience the very best of {dest.name}, no matter how long you stay.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {curatedOptions.map((opt) => (
                                <Link
                                    key={opt.slug}
                                    href={`/destinations/${id}/curated/${opt.slug}`}
                                    className="group relative block p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-bl-[4rem] -mr-8 -mt-8 transition-colors group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10" />

                                    <div className={`relative h-14 w-14 rounded-2xl bg-${opt.color}-100 dark:bg-${opt.color}-900/20 flex items-center justify-center text-${opt.color}-600 dark:text-${opt.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                                        <opt.icon className="h-7 w-7" />
                                    </div>
                                    <Badge variant="secondary" className="relative mb-3 bg-slate-100 dark:bg-slate-800 text-slate-500 border-none font-bold px-3">
                                        {opt.duration}
                                    </Badge>
                                    <h3 className="relative text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                                        {opt.title}
                                    </h3>
                                    <p className="relative text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed mb-6">
                                        {opt.desc}
                                    </p>
                                    <div className="relative flex items-center gap-2 text-blue-600 font-bold text-sm">
                                        View Itinerary <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Persona Section */}
                        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                <Sparkles className="h-6 w-6 text-amber-500" />
                                Explore by Vibe
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {personas.map((p) => (
                                    <Link
                                        key={p.id}
                                        href={`/destinations/${id}/curated/3d?persona=${p.id}`}
                                        className="p-6 rounded-3xl bg-slate-50 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-center group"
                                    >
                                        <div className="mx-auto h-12 w-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all shadow-sm">
                                            <p.icon className="h-6 w-6" />
                                        </div>
                                        <div className="mt-4">
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{p.label}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-1">{p.desc}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Destination Quick Facts */}
                    <div className="space-y-8">
                        <div className="sticky top-24 space-y-8">
                            <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative">
                                <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <ShieldCheck className="h-6 w-6 text-blue-400" />
                                    The Itinero Edge
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Coins className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm mb-1">Budget Precision</p>
                                            <p className="text-xs text-slate-400 leading-relaxed">Expertly verified cost benchmarks for all {dest.name} activities.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Plane className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm mb-1">Visa-Ready Exports</p>
                                            <p className="text-xs text-slate-400 leading-relaxed">Get a professional PDF itinerary for your visa application in one click.</p>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-8 rounded-xl bg-white text-slate-900 hover:bg-blue-50 font-bold transition-all">
                                    Start Planning Free
                                </Button>
                            </div>

                            <div className="p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <h3 className="text-lg font-bold mb-6">About {dest.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                    {dest.description || "Detailed destination information coming soon. We're currently vetting the best local guides and experiences for this region."}
                                </p>
                                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    <MapPin className="h-3 w-3" />
                                    Verified Destination
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
