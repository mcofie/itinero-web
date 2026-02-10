"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
    Plane,
    Home,
    IdCard,
    SmartphoneNfc,
    Coins,
    HeartHandshake,
    Shirt,
    PhoneCall,
    Compass,
    Sparkles,
    Lightbulb,
    ExternalLink,
    ChevronRight,
    Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

/* --- Types --- */
type DestinationMeta = {
    description?: string;
    city?: string;
    country?: string;
    country_code?: string;
    cost_coffee?: string;
    cost_meal?: string;
    cost_beer?: string;
    tipping?: string;
    etiquette_dos?: string;
    packing_tips?: string;
    emergency_police?: string;
    emergency_medical?: string;
    hidden_gem_title?: string;
    hidden_gem_desc?: string;
    esim_provider?: string;
    [key: string]: any;
};

type Props = {
    meta?: DestinationMeta | null;
    appInputs?: any; // To access destinations, etc if needed
};

/* --- Travel Toolkit Component --- */
export function SharedTravelToolkit({ meta, appInputs }: Props) {
    const [isFlightSearchOpen, setIsFlightSearchOpen] = React.useState(false);
    const destinationCity = meta?.city || appInputs?.destinations?.[0]?.name || "";

    return (
        <div className="pt-6 space-y-4">
            <div className="flex items-center gap-3 px-1">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Plane className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-[0.1em]">Travel Logistics</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ToolkitItem
                    icon={Plane}
                    title="Flights"
                    subtitle="Skyscanner"
                    onClick={() => setIsFlightSearchOpen(true)}
                    color="blue"
                    delay={0}
                />
                {/* Simple Flight Search Modal replacement for public view */}
                <Dialog open={isFlightSearchOpen} onOpenChange={setIsFlightSearchOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Search Flights</DialogTitle>
                        </DialogHeader>
                        <div className="py-6">
                            <p className="text-sm text-slate-500 mb-4">
                                Planning a trip to <span className="font-bold text-slate-900 dark:text-white">{destinationCity}</span>?
                            </p>
                            <a
                                href={`https://www.skyscanner.com/transport/flights/everywhere/${destinationCity}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0084f7] px-6 py-3 font-bold text-white transition-all hover:bg-blue-600"
                            >
                                <Search className="h-4 w-4" />
                                Search on Skyscanner
                            </a>
                        </div>
                    </DialogContent>
                </Dialog>

                <ToolkitItem
                    icon={Home}
                    title="Stays"
                    subtitle="Airbnb"
                    href={(() => {
                        if (!destinationCity) return "https://www.airbnb.com";
                        return `https://www.airbnb.com/s/${encodeURIComponent(destinationCity)}/homes`;
                    })()}
                    color="rose"
                    delay={1}
                />
                <ToolkitItem
                    icon={IdCard}
                    title="Passports"
                    subtitle="Index"
                    href="https://www.passportindex.org/"
                    color="violet"
                    delay={2}
                />
                <ToolkitItem
                    icon={SmartphoneNfc}
                    title="Data"
                    subtitle={meta?.esim_provider || "Airalo"}
                    href={(() => {
                        const countryCode = meta?.country_code;
                        // Simple fallback for public view without country name lookup
                        return "https://www.airalo.com/";
                    })()}
                    color="teal"
                    delay={3}
                />
            </div>
        </div>
    );
}

/* --- Shared Trip Intelligence Component --- */
export function SharedTripIntelligence({ meta }: Props) {
    if (!meta) return null;

    return (
        <div className="pt-10 space-y-8">
            <div className="flex items-center gap-3 px-1">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Compass className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Intelligence Hub</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {/* Budget & Costs */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 p-8 shadow-sm hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                    <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
                            <Coins className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Budget & Costs</h4>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Local Spending Guide</p>
                        </div>
                    </div>
                    <div className="space-y-3 relative z-10">
                        {[
                            { label: "Small Coffee", value: meta?.cost_coffee || "~$4.50", icon: "☕" },
                            { label: "Casual Meal", value: meta?.cost_meal || "~$18.00", icon: "🍽️" },
                            { label: "Draft Beer", value: meta?.cost_beer || "~$7.00", icon: "🍺" },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all group/item hover:bg-white dark:hover:bg-slate-900">
                                <div className="flex items-center gap-3">
                                    <span className="text-base grayscale group-hover/item:grayscale-0 transition-all">{item.icon}</span>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.label}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social Etiquette */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 p-8 shadow-sm hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                    <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white group-hover:-rotate-6 transition-all duration-500">
                            <HeartHandshake className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Social Etiquette</h4>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Protocol & Customs</p>
                        </div>
                    </div>
                    <div className="relative z-10 mb-8 p-5 rounded-xl bg-blue-50/50 dark:bg-blue-900/5 border border-blue-100/30 dark:border-blue-900/20">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic pr-2">
                            "{meta?.tipping || "Standard 10-15% is appreciated."}"
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 relative z-10">
                        {(meta?.etiquette_dos ? meta.etiquette_dos.split(',') : ["Punctuality", "Modest Dress"]).map((doItem, idx) => (
                            <Badge key={idx} variant="outline" className="text-[9px] font-bold uppercase tracking-[0.1em] px-4 py-2 rounded-xl border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10 transition-all hover:bg-blue-500 hover:text-white">
                                {doItem.trim()}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Packing Tips */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 p-8 shadow-sm hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-orange-500/5 blur-3xl group-hover:bg-orange-500/10 transition-colors" />
                    <div className="flex items-center gap-5 mb-6 relative z-10">
                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                            <Shirt className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Packing Tips</h4>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Essential Wardrobe</p>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl bg-orange-50/30 dark:bg-orange-900/5 border border-orange-100/20 dark:border-orange-900/20 relative z-10">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                            {meta?.packing_tips || "Weather is expected to be variable. Layering is highly recommended for all-day comfort."}
                        </p>
                    </div>
                </div>

                {/* Emergency Numbers */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 p-8 shadow-sm hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-rose-500/5 blur-3xl group-hover:bg-rose-500/10 transition-colors" />
                    <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                            <PhoneCall className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Emergency</h4>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Quick Dial Support</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="p-5 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-900/20 text-center group/btn cursor-pointer hover:bg-rose-500 hover:text-white transition-all duration-500 shadow-sm hover:shadow-xl" onClick={() => window.location.href = `tel:${meta?.emergency_police || '911'}`}>
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-2 opacity-60">Police</span>
                            <span className="text-2xl font-bold tracking-tighter tabular-nums">{meta?.emergency_police || "911"}</span>
                        </div>
                        <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20 text-center group/btn cursor-pointer hover:bg-emerald-500 hover:text-white transition-all duration-500 shadow-sm hover:shadow-xl" onClick={() => window.location.href = `tel:${meta?.emergency_medical || '999'}`}>
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-2 opacity-60">Medical</span>
                            <span className="text-2xl font-bold tracking-tighter tabular-nums">{meta?.emergency_medical || "999"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Local Secret (Mini Card) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden rounded-2xl border border-amber-200/40 bg-white dark:bg-slate-950 p-10 shadow-sm group hover:shadow-2xl transition-all duration-500"
            >
                <div className="absolute top-0 right-0 h-64 w-64 -mr-16 -mt-16 rounded-full bg-amber-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="rounded-xl bg-amber-50 p-6 shadow-sm border border-amber-100 text-amber-500 dark:bg-amber-900/20 dark:border-amber-900/30 shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <Lightbulb className="h-10 w-10" />
                    </div>
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-[0.22em] mb-5 shadow-lg shadow-amber-500/20">
                            <Sparkles className="h-3 w-3" />
                            {meta?.hidden_gem_title || `The Local Secret`}
                        </div>
                        <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium max-w-2xl italic pr-4 antialiased">
                            "{meta?.hidden_gem_desc || "Most tourists miss the backstreet evening markets. Ask a local for the best street food spot."}"
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/* --- Toolkit Item Helper --- */
function ToolkitItem({
    icon: Icon,
    title,
    subtitle,
    href,
    color,
    onClick,
    delay
}: {
    icon: any;
    title: string;
    subtitle: string;
    href?: string;
    color: "blue" | "rose" | "violet" | "teal";
    onClick?: () => void;
    delay?: number;
}) {
    const isGradient = false; // Simplified for this view

    const variants = {
        blue: {
            border: "hover:border-blue-500/50 dark:hover:border-blue-500/60",
            icon: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
            hoverIcon: "group-hover:bg-blue-600 group-hover:text-white",
            text: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
        },
        rose: {
            border: "hover:border-rose-500/50 dark:hover:border-rose-500/60",
            icon: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
            hoverIcon: "group-hover:bg-rose-600 group-hover:text-white",
            text: "group-hover:text-rose-600 dark:group-hover:text-rose-400"
        },
        violet: {
            border: "hover:border-violet-500/50 dark:hover:border-violet-500/60",
            icon: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
            hoverIcon: "group-hover:bg-violet-600 group-hover:text-white",
            text: "group-hover:text-violet-600 dark:group-hover:text-violet-400"
        },
        teal: {
            border: "hover:border-teal-500/50 dark:hover:border-teal-500/60",
            icon: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
            hoverIcon: "group-hover:bg-teal-600 group-hover:text-white",
            text: "group-hover:text-teal-600 dark:group-hover:text-teal-400"
        }
    };

    const v = variants[color] || variants.blue;

    const Tag = href ? "a" : "button";
    const props = href ? { href, target: "_blank", rel: "noopener noreferrer" } : { onClick, type: "button" as const };

    return (
        <Tag
            {...props}
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-8 shadow-sm transition-all duration-500 block h-full no-underline hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-left w-full",
                v.border
            )}
        >
            <div className="flex flex-col h-full gap-8">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-500 shadow-sm",
                        v.icon,
                        v.hoverIcon
                    )}>
                        <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all group-hover:bg-slate-100 dark:group-hover:bg-slate-700">
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">via</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">{subtitle}</span>
                    </div>
                    <h4 className={cn(
                        "text-2xl font-bold text-slate-900 dark:text-white transition-colors tracking-tighter leading-none antialiased",
                        v.text
                    )}>
                        {title}
                    </h4>
                </div>
            </div>
            {/* Minimalist corner accent */}
            <div className={cn(
                "absolute top-0 right-0 h-24 w-24 -mr-12 -mt-12 rounded-full blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-40",
                v.icon.split(' ')[0]
            )} />
        </Tag>
    )
}
