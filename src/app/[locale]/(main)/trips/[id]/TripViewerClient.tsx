"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import type { PreviewLike, Day, Place } from "./page";

import "leaflet/dist/leaflet.css";

// --- Server Actions Import ---
import { updateTripNote, updateDayNote, updateItemNote } from "@/app/[locale]/(main)/trips/[id]/actions";

import { BlockActions, ItemRowLite } from "@/app/[locale]/(main)/trips/BlockEditControls";
import { cn } from "@/lib/utils";
import {
    Cloud,
    DollarSign,
    Globe,
    MoveRight,
    SmartphoneNfc,
    TrainFront,
    Plug,
    Languages as LanguagesIcon,
    MapPin,
    Star,
    Clock3,
    CalendarDays,
    Calendar,
    Users2,
    Compass,
    NotebookPen,
    Pencil,
    Sun,
    Moon,
    Check,
    X,
    Loader2,
    ExternalLink,
    Sparkles,
    Coins,
    CreditCard,
    Camera,
    Hand,
    Shirt,
    Plane,
    Home,
    IdCard,
    Coffee,
    Utensils,
    Beer,
    HeartHandshake,
    AlertCircle,
    Umbrella,
    Lightbulb,
    PhoneCall,
    Briefcase,
    ChevronRight,
    BookOpen,
    History,
    ShieldCheck,
} from "lucide-react";
import { AddItemUnderDay } from "@/app/[locale]/(main)/trips/AddItemUnderDay";
import { DestinationMeta, TripConfig } from "@/app/[locale]/(main)/trips/TripActionsClient";
import { formatDateRange } from "@/lib/trip-dates";
import { WeatherWidget } from "@/components/trips/WeatherWidget";
import { ExchangeRateCard } from "@/components/trips/ExchangeRateCard";
import { FlightSearchDialog } from "./FlightSearchDialog";

// Dynamic import for StoryView - only loads when Story tab is active
const StoryView = dynamic(
    () => import("./StoryView").then(mod => ({ default: mod.StoryView })),
    { ssr: false, loading: () => <div className="flex h-96 items-center justify-center"><div className="text-sm text-slate-500">Loading story...</div></div> }
);

// Dynamic import for ImmersiveMap - only loads when Map tab is active
const ImmersiveMap = dynamic(
    () => import("./ImmersiveMap").then(mod => ({ default: mod.ImmersiveMap })),
    { ssr: false, loading: () => <div className="flex h-96 items-center justify-center"><div className="text-sm text-slate-500">Loading map...</div></div> }
);
import { getLatestFxSnapshot, convertUsingSnapshot } from "@/lib/fx/fx";
import type { FxSnapshot } from "@/lib/fx/types";

/* ---------- Map (allow nullable day) ---------- */
type LeafletMapProps = {
    theme?: "light" | "dark";
    day: Day | null;
    placesById: Map<string, Place>;
    selectedItemId?: string | null;
    onMarkerClick?: (itemId: string) => void;
};

const LeafletMap = dynamic<LeafletMapProps>(
    () => import("@/app/[locale]/(main)/preview/_leaflet/LeafletMap"),
    { ssr: false }
);

type StatKind = "cost" | "duration" | "travel";

/** ---------- helpers for safe inputs typing ---------- */
type TripInputs = {
    interests?: string[];
    day_notes?: Record<string, string>;
    notes?: string;
} | undefined;

function hasInterests(v: unknown): v is { interests: string[] } {
    if (!v || typeof v !== "object") return false;
    const maybe = v as { interests?: unknown };
    return (
        Array.isArray(maybe.interests) &&
        maybe.interests.every((t): t is string => typeof t === "string")
    );
}

interface TourGuide {
    id: string;
    user_id: string;
    country: string;
    city: string;
    available_times: string;
    status: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | {
        full_name: string | null;
        avatar_url: string | null;
    }[];
}

export default function TripViewerClient({
    tripId,
    startDate,
    data,
    userPreferredCurrency,
    userPassportCountry,
    tourGuides,
}: {
    tripId: string;
    data: PreviewLike;
    startDate?: string;
    userPreferredCurrency?: string;
    userPassportCountry?: string | null;
    tourGuides?: TourGuide[];
}) {
    const { resolvedTheme } = useTheme();
    const theme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";
    const t = useTranslations("TripDetails");

    // Extract Trip Currency
    const tripCurrency = data.trip_summary.currency ?? "USD";

    const [activeDayIdx, setActiveDayIdx] = useState(0);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [fxSnapshot, setFxSnapshot] = useState<FxSnapshot | null>(null);
    const [isFlightSearchOpen, setIsFlightSearchOpen] = useState(false);

    React.useEffect(() => {
        getLatestFxSnapshot("USD").then(setFxSnapshot);
    }, []);

    const getConvertedCost = React.useCallback(
        (amount: number | null | undefined) => {
            if (amount == null || !userPreferredCurrency || !fxSnapshot) return null;
            if (tripCurrency === userPreferredCurrency) return null;
            const val = convertUsingSnapshot(fxSnapshot, amount, tripCurrency, userPreferredCurrency);
            return val ? Math.round(val) : null;
        },
        [userPreferredCurrency, tripCurrency, fxSnapshot]
    );

    // Scroll to item when selected from map
    const scrollToItem = (itemId: string) => {
        setSelectedItemId(itemId);
        const el = document.getElementById(`block-${itemId}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    // Clamp the active day index whenever the days length changes
    React.useEffect(() => {
        const lastIdx = Math.max(0, data.days.length - 1);
        if (activeDayIdx > lastIdx) setActiveDayIdx(lastIdx);
    }, [data.days.length, activeDayIdx]);

    const placesById = useMemo<Map<string, Place>>(
        () => new Map(data.places.map((p) => [p.id, p])),
        [data.places]
    );

    const totalDays = data.days.length;
    const progressPct = totalDays
        ? Math.min(100, Math.round(((activeDayIdx + 1) / totalDays) * 100))
        : 0;

    const inputs = data.trip_summary.inputs as any;

    const tripConfig: TripConfig | null = useMemo(() => {
        const raw = data.trip_summary.inputs;
        try {
            return (raw
                ? typeof raw === "string"
                    ? JSON.parse(raw)
                    : raw
                : null) as TripConfig | null;
        } catch {
            return null;
        }
    }, [data.trip_summary.inputs]);

    const destinationMeta = React.useMemo(() => {
        const anyCfg = tripConfig as unknown as {
            destination_meta?: DestinationMeta;
        } | null;
        return anyCfg?.destination_meta ?? null;
    }, [tripConfig]);

    const primaryDestination = tripConfig?.destinations?.[0] ?? null;

    const activeDay: Day | null = data.days[activeDayIdx] ?? null;

    const itemsForControls: ItemRowLite[] = (activeDay?.blocks ?? []).map(
        (b, i) => {
            const anyB = b as unknown as { id?: string; order_index?: number };
            return {
                id: anyB.id ?? `no-id-${i}`,
                trip_id: tripId,
                day_index: i,
                date: activeDay?.date ?? null,
                order_index: Number.isFinite(anyB.order_index)
                    ? (anyB.order_index as number)
                    : i,
                when: b.when,
                place_id: b.place_id ?? null,
                title: b.title,
                est_cost: b.est_cost ?? null,
                duration_min: b.duration_min ?? null,
                travel_min_from_prev: b.travel_min_from_prev ?? null,
                notes: b.notes ?? null,
            };
        }
    );

    const nextOrderIndex = itemsForControls.length;

    const totals = useMemo(() => {
        const allBlocks = data.days.flatMap((d) => d.blocks);
        const cost = allBlocks.reduce(
            (acc, b) => acc + (Number(b.est_cost) || 0),
            0
        );
        const duration = allBlocks.reduce(
            (acc, b) => acc + (Number(b.duration_min) || 0),
            0
        );
        const travel = allBlocks.reduce(
            (acc, b) => acc + (Number(b.travel_min_from_prev) || 0),
            0
        );
        return {
            estCost: Math.max(0, Math.round(cost)),
            durationMin: duration,
            travelMin: travel,
        };
    }, [data.days]);

    const metricStart = startDate ?? data.trip_summary.start_date;
    const metricEnd =
        data.trip_summary.end_date ?? data.days.at(-1)?.date ?? undefined;

    return (
        <div className="space-y-12">
            {/* 1. HERO SECTION */}
            {/* Hero Section Removed - Handled by ParallaxHero in page.tsx */}

            {/* 2. Premium Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <div className="mb-10 px-1">
                    <TabsList className="h-14 w-full justify-start gap-1 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm overflow-x-auto scrollbar-hide">
                        {[
                            { value: "overview", label: t("Tabs.overview"), icon: Globe },
                            { value: "days", label: t("Tabs.itinerary"), icon: Calendar },
                            { value: "map", label: t("Tabs.map"), icon: MapPin },
                            { value: "calendar", label: t("Tabs.calendar"), icon: CalendarDays },
                            { value: "places", label: t("Tabs.places"), icon: Utensils },
                            { value: "tours", label: t("Tabs.tours"), icon: Sparkles },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="flex-1 md:flex-none h-full rounded-xl gap-2 px-6 font-bold text-sm tracking-tight transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-blue-300 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                            >
                                <tab.icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* ---------- OVERVIEW TAB ---------- */}
                <TabsContent
                    value="overview"
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
                        <div className="space-y-8">
                            {/* --- OVERVIEW CARDS --- */}
                            <div className="space-y-10">
                                <div className="flex items-center gap-3 px-1">
                                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-[0.1em]">
                                        {t("Highlights.title")}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    <MetricTile
                                        label={t("Highlights.dates")}
                                        value={formatDateRange(metricStart, metricEnd)}
                                        icon={CalendarDays}
                                        delay={0}
                                    />
                                    <MetricTile
                                        label={t("Highlights.duration")}
                                        value={`${totalDays} Days`}
                                        icon={Clock3}
                                        delay={1}
                                    />
                                    <MetricTile
                                        label={t("Highlights.places")}
                                        value={String(data.places.length)}
                                        icon={MapPin}
                                        delay={2}
                                    />
                                    <MetricTile
                                        label={t("Highlights.totalCost")}
                                        value={
                                            <span className="flex flex-col">
                                                <span>{tripCurrency} {totals.estCost}</span>
                                                {getConvertedCost(totals.estCost) !== null && (
                                                    <span className="opacity-40 text-[10px] font-bold uppercase tracking-widest mt-1">
                                                        ≈ {userPreferredCurrency} {getConvertedCost(totals.estCost)}
                                                    </span>
                                                )}
                                            </span>
                                        }
                                        icon={DollarSign}
                                        delay={3}
                                    />
                                    <MetricTile
                                        label={t("Highlights.activityTime")}
                                        value={`${Math.round(totals.durationMin / 60)}h`}
                                        icon={Star}
                                        delay={4}
                                    />
                                    <MetricTile
                                        label={t("Highlights.travelTime")}
                                        value={`${Math.round(totals.travelMin / 60)}h`}
                                        icon={MoveRight}
                                        delay={5}
                                    />
                                </div>
                            </div>

                            {/* Collapsible About & History - Editorial Style */}
                            <div className="space-y-4">
                                <Accordion type="single" collapsible className="w-full space-y-3">
                                    <AccordionItem value="about" className="border-none">
                                        <AccordionTrigger className="flex items-center gap-4 px-6 py-5 text-xl font-bold bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group shadow-sm hover:shadow-md">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <span className="flex-1 text-left tracking-tight">{t("About.title")}</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-6 px-4">
                                            <div className="relative p-8 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40">
                                                <p className="text-base leading-[1.8] text-slate-600 dark:text-slate-300 font-medium antialiased">
                                                    {destinationMeta?.description || t("About.noDesc")}
                                                </p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    <AccordionItem value="history" className="border-none">
                                        <AccordionTrigger className="flex items-center gap-4 px-6 py-5 text-xl font-bold bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/60 hover:no-underline hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group shadow-sm hover:shadow-md">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                                <History className="h-5 w-5" />
                                            </div>
                                            <span className="flex-1 text-left tracking-tight">{t("About.historyTitle")}</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-6 px-4">
                                            <div className="relative p-8 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40">
                                                <p className="text-base leading-[1.8] text-slate-600 dark:text-slate-300 font-medium antialiased">
                                                    {destinationMeta?.history || t("About.noHistory")}
                                                </p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>

                            {/* --- 1. TRAVEL TOOLKIT (Refined) --- */}
                            <div className="pt-6 space-y-3">
                                <div className="flex items-center gap-3 px-1">
                                    <Briefcase className="h-5 w-5 text-indigo-500" />
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
                                    <FlightSearchDialog
                                        open={isFlightSearchOpen}
                                        onOpenChange={setIsFlightSearchOpen}
                                        destinationCity={destinationMeta?.city || inputs?.destinations?.[0]?.name || ""}
                                        startDate={data.trip_summary.start_date ?? undefined}
                                        endDate={data.trip_summary.end_date ?? undefined}
                                    />
                                    <ToolkitItem
                                        icon={Home}
                                        title="Stays"
                                        subtitle="Airbnb"
                                        href={(() => {
                                            const city = destinationMeta?.city || inputs?.destinations?.[0]?.name || "";
                                            const start = data.trip_summary.start_date;
                                            const end = data.trip_summary.end_date;
                                            if (!city) return "https://www.airbnb.com";
                                            return `https://www.airbnb.com/s/${encodeURIComponent(city)}/homes?checkin=${start}&checkout=${end}`;
                                        })()}
                                        color="rose"
                                        delay={1}
                                    />
                                    <ToolkitItem
                                        icon={IdCard}
                                        title="Passports"
                                        subtitle="Index"
                                        href={(() => {
                                            const passport = inputs?.passport_country || userPassportCountry || "united-states";
                                            const slug = passport.toLowerCase().replace(/\s+/g, '-');
                                            return `https://www.passportindex.org/country/${slug}/`;
                                        })()}
                                        color="violet"
                                        delay={2}
                                    />
                                    <ToolkitItem
                                        icon={SmartphoneNfc}
                                        title="Data"
                                        subtitle={destinationMeta?.esim_provider || "Airalo"}
                                        href={(() => {
                                            const countryCode = destinationMeta?.country_code;
                                            const countryName = countryCode && getCountryName ? getCountryName(countryCode) : null;
                                            if (countryName) {
                                                const slug = countryName.toLowerCase().replace(/\s+/g, '-');
                                                return `https://www.airalo.com/${slug}-esim`;
                                            }
                                            return "https://www.airalo.com/";
                                        })()}
                                        color="teal"
                                        delay={3}
                                    />
                                </div>
                            </div>

                            {/* --- 2. DESTINATION INTELLIGENCE (Premium Intelligence Style) --- */}
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
                                                { label: "Small Coffee", value: destinationMeta?.cost_coffee || "~$4.50", icon: "☕" },
                                                { label: "Casual Meal", value: destinationMeta?.cost_meal || "~$18.00", icon: "🍽️" },
                                                { label: "Draft Beer", value: destinationMeta?.cost_beer || "~$7.00", icon: "🍺" },
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
                                                "{destinationMeta?.tipping || "Standard 10-15% is appreciated."}"
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 relative z-10">
                                            {(destinationMeta?.etiquette_dos ? (destinationMeta.etiquette_dos as string).split(',') : ["Punctuality", "Modest Dress"]).map((doItem: string, idx: number) => (
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
                                                {destinationMeta?.packing_tips || "Weather is expected to be variable. Layering is highly recommended for all-day comfort."}
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
                                            <div className="p-5 rounded-xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-900/20 text-center group/btn cursor-pointer hover:bg-rose-500 hover:text-white transition-all duration-500 shadow-sm hover:shadow-xl" onClick={() => window.location.href = `tel:${destinationMeta?.emergency_police || '911'}`}>
                                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-2 opacity-60">Police</span>
                                                <span className="text-2xl font-bold tracking-tighter tabular-nums">{destinationMeta?.emergency_police || "911"}</span>
                                            </div>
                                            <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20 text-center group/btn cursor-pointer hover:bg-emerald-500 hover:text-white transition-all duration-500 shadow-sm hover:shadow-xl" onClick={() => window.location.href = `tel:${destinationMeta?.emergency_medical || '999'}`}>
                                                <span className="text-[9px] font-bold uppercase tracking-[0.2em] block mb-2 opacity-60">Medical</span>
                                                <span className="text-2xl font-bold tracking-tighter tabular-nums">{destinationMeta?.emergency_medical || "999"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Local Secret (Mini Card) */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
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
                                                {destinationMeta?.hidden_gem_title || `The Local Secret`}
                                            </div>
                                            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium max-w-2xl italic pr-4 antialiased">
                                                "{destinationMeta?.hidden_gem_desc || "Most tourists miss the backstreet evening markets. Ask a local for the best street food spot."}"
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                            <KnowBeforeYouGo meta={destinationMeta ?? undefined} />

                        </div>

                        {/* Sidebar Info */}
                        <aside className="relative">
                            <div className="sticky top-24 space-y-4 flex flex-col">
                                {/* Trip General Notes */}
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/10 p-4 shadow-sm shrink-0">
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                                        <NotebookPen className="h-4 w-4 text-amber-600 dark:text-amber-500" /> {t("Sidebar.tripNotes")}
                                    </h3>
                                    <InlineNoteEditor
                                        id="trip-notes"
                                        initialValue={inputs?.notes}
                                        label={t("Sidebar.tripNotes")}
                                        variant="card"
                                        onSave={async (val) => {
                                            try {
                                                await updateTripNote(tripId, val);
                                                toast.success(t("Notes.saved"));
                                            } catch {
                                                toast.error(t("Notes.failed"));
                                            }
                                        }}
                                    />
                                </div>

                                {/* Exchange Rate Card - Prominent Position */}
                                <ExchangeRateCard
                                    meta={destinationMeta}
                                    baseCurrency={userPreferredCurrency}
                                    className="shrink-0"
                                />

                                {/* FAST FACTS CARD */}
                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                                    <div className="bg-slate-50/50 dark:bg-slate-950/30 p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fast Facts</h3>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {destinationMeta?.plugs && (
                                            <div className="p-4 flex gap-4 items-start">
                                                <Plug className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                <div className="w-full">
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Power Plugs</h4>
                                                    <PowerPlugFacts plugs={destinationMeta.plugs} />
                                                </div>
                                            </div>
                                        )}
                                        <div className="p-4 flex gap-4 items-start">
                                            <LanguagesIcon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Languages</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                                    {joinArr(destinationMeta?.languages) || "English, Local Dialects"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-4 flex gap-4 items-start">
                                            <TrainFront className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Transport</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                                    {joinArr(destinationMeta?.transport) || "Taxi, Rideshare, Public Transit"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Weather Widget */}
                                <WeatherWidget
                                    meta={destinationMeta}
                                    lat={inputs?.destinations?.[0]?.lat}
                                    lng={inputs?.destinations?.[0]?.lng}
                                    startDate={data.trip_summary.start_date ?? undefined}
                                    endDate={data.trip_summary.end_date ?? undefined}
                                    className="shrink-0"
                                />
                            </div>
                        </aside>
                    </div>
                </TabsContent>

                {/* ---------- STORY TAB ---------- */}
                <TabsContent
                    value="story"
                    className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <StoryView
                        days={data.days}
                        placesById={placesById}
                        currency={tripCurrency}
                        fxSnapshot={fxSnapshot}
                        userPreferredCurrency={userPreferredCurrency}
                    />
                </TabsContent>

                {/* ---------- ITINERARY TAB ---------- */}
                <TabsContent
                    value="days"
                    className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <div className="grid h-[600px] lg:h-[calc(100vh-200px)] gap-6 lg:grid-cols-2">
                        <div
                            className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                            <div
                                className="shrink-0 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                                <ScrollArea className="w-full whitespace-nowrap">
                                    <div className="flex w-max gap-2 pb-2">
                                        {data.days.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveDayIdx(i)}
                                                className={cn(
                                                    "rounded-xl px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300",
                                                    activeDayIdx === i
                                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-blue-500/10 scale-105"
                                                        : "bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60"
                                                )}
                                            >
                                                {t("Progress.day")} {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </div>

                            <ScrollArea className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-950/30">
                                <div className="p-4 pb-20 md:p-6">
                                    <EditableDay
                                        dayIdx={activeDayIdx}
                                        day={activeDay}
                                        items={itemsForControls}
                                        nextOrderIndex={nextOrderIndex}
                                        tripId={tripId}
                                        startDate={startDate}
                                        tripConfig={tripConfig}
                                        tripInputs={inputs}
                                        placesById={placesById}
                                        tripCurrency={tripCurrency}
                                        selectedItemId={selectedItemId}
                                        onItemClick={setSelectedItemId}
                                        fxSnapshot={fxSnapshot}
                                        userPreferredCurrency={userPreferredCurrency}
                                    />
                                </div>
                            </ScrollArea>
                        </div>

                        <div
                            className="hidden h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-sm lg:block sticky top-24">
                            <LeafletMap
                                day={activeDay}
                                placesById={placesById}
                                theme={theme}
                                selectedItemId={selectedItemId}
                                onMarkerClick={scrollToItem}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* ---------- MAP TAB ---------- */}
                <TabsContent
                    value="map"
                    className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <ImmersiveMap
                        days={data.days}
                        placesById={placesById}
                        theme={theme}
                    />
                </TabsContent>

                <TabsContent
                    value="calendar"
                    className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm overflow-hidden">
                        <CalendarView
                            days={data.days}
                            placesById={placesById}
                            selectedItemId={selectedItemId}
                            onItemClick={setSelectedItemId}
                            tripCurrency={tripCurrency}
                            fxSnapshot={fxSnapshot}
                            userPreferredCurrency={userPreferredCurrency}
                        />
                    </div>
                </TabsContent>

                {/* ---------- PLACES TAB ---------- */}
                <TabsContent
                    value="places"
                    className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <div
                        className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 p-8 shadow-sm">

                        {/* Decorative Gradient Glow */}
                        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

                        <div className="relative z-10 block sm:flex items-center justify-between mb-10 pb-6 border-b border-slate-100 dark:border-slate-800/50">
                            <div className="mb-4 sm:mb-0">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                    {t("Places.allPlaces")}
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                </h2>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                    Curated spots and local favorites from your itinerary
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span
                                    className="inline-flex items-center rounded-full border border-blue-100/50 bg-blue-50/50 px-4 py-1.5 text-xs font-black text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-300 uppercase tracking-wider shadow-sm">
                                    {data.places?.length ?? 0} {t("Places.locations")}
                                </span>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <PlacesList places={data.places} />
                        </div>
                    </div>
                </TabsContent>

                {/* ---------- TOURS TAB ---------- */}
                <TabsContent
                    value="tours"
                    className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-700"
                >
                    {(tourGuides && tourGuides.length > 0) ? (
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/60 dark:border-slate-800/60 shadow-sm text-center">
                                <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900 uppercase tracking-widest px-3 py-1">
                                    Local Experts
                                </Badge>
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Meet Your Local Guides</h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                                    Verified experts in {destinationMeta?.city || "your destination"} ready to show you the hidden gems.
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {tourGuides.map((guide) => {
                                    const profile = Array.isArray(guide.profiles) ? guide.profiles[0] : guide.profiles;
                                    const availability = guide.available_times ? (typeof guide.available_times === 'string' ? JSON.parse(guide.available_times) : guide.available_times) : {};

                                    // Better availability summary
                                    const allAvailableDays = Object.entries(availability)
                                        .filter(([_, times]) => Array.isArray(times) && times.length > 0)
                                        .map(([day, times]) => ({ day, times: times as string[] }));

                                    const availableDaysStr = allAvailableDays.length > 0
                                        ? allAvailableDays.length <= 2
                                            ? allAvailableDays.map(d => `${d.day} (${d.times.join(", ")})`).join(", ")
                                            : allAvailableDays.map(d => d.day).slice(0, 3).join(", ")
                                        : "Check Calendar";

                                    const hasMoreDays = allAvailableDays.length > 3;

                                    return (
                                        <div key={guide.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <div className="absolute top-0 right-0 p-4">
                                                <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100 border-emerald-100 flex gap-1 items-center">
                                                    <ShieldCheck className="h-3 w-3" /> Verified
                                                </Badge>
                                            </div>

                                            <div className="p-6 pb-0 flex flex-col items-center text-center">
                                                <div className="relative mb-4">
                                                    <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                                        {profile?.avatar_url ? (
                                                            <Image
                                                                src={profile.avatar_url}
                                                                alt={profile.full_name || "Guide"}
                                                                width={96}
                                                                height={96}
                                                                className="object-cover h-full w-full"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                                <Users2 className="h-10 w-10" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="absolute bottom-0 right-0 h-8 w-8 bg-blue-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-sm">
                                                        <Compass className="h-4 w-4" />
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{profile?.full_name || "Local Expert"}</h3>
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {guide.city}, {guide.country}
                                                </p>

                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl italic leading-relaxed">
                                                    {`Professional guide in ${guide.city} ready to show you the best hidden gems.`}
                                                </p>
                                            </div>

                                            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Availability</p>
                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        {availableDaysStr}{hasMoreDays ? "..." : ""}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => toast.info(`Booking feature for ${profile?.full_name || "this guide"} coming soon!`)}
                                                    className="rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-slate-200"
                                                >
                                                    Book Guide
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 p-12 lg:p-20 text-center shadow-xl">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
                            <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />

                            <div className="relative z-10 mx-auto max-w-2xl">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="text-center">
                                        <div
                                            className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                                            <Compass className="h-3.5 w-3.5" />
                                            Exclusive Access
                                        </div>
                                        <h2 className="mb-6 text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter leading-tight">
                                            Expert-Led <span className="text-blue-600">Journeys</span>
                                        </h2>
                                        <p className="mx-auto max-w-2xl text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                            Unlock deeper connections with your destination through our network of local experts and curators.
                                        </p>
                                    </div>
                                </motion.div>
                                <div className="grid gap-6 text-left sm:grid-cols-2">
                                    <div className="group rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-8 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:border-blue-500/30">
                                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-110 group-hover:rotate-6">
                                            <Users2 className="h-7 w-7" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                                            {t("Tours.verifiedGuides")}
                                        </h4>
                                        <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                                            {t("Tours.verifiedGuidesDesc")}
                                        </p>
                                    </div>

                                    <div className="group rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-8 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:border-purple-500/30">
                                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-transform group-hover:scale-110 group-hover:-rotate-6">
                                            <Compass className="h-7 w-7" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                                            {t("Tours.curatedTours")}
                                        </h4>
                                        <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                                            {t("Tours.curatedToursDesc")}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-center">
                                    <Button className="h-14 px-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-xl">
                                        Get Notified
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

/* =========================
   Sub-Components
========================= */

function ToolkitItem({
    icon: Icon,
    title,
    subtitle,
    href,
    onClick,
    color = "blue",
    delay = 0
}: {
    icon: any;
    title: string;
    subtitle?: string;
    href?: string;
    onClick?: () => void;
    color?: "blue" | "rose" | "violet" | "teal" | "orange";
    delay?: number;
}) {
    const Tag = href ? motion.a : motion.button;
    const props = href ? { href, target: "_blank", rel: "noopener noreferrer" } : { onClick, type: "button" as const };

    const colorStyles = {
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100/50 hover:bg-blue-500 group-hover:text-white",
        rose: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 border-rose-100/50 hover:bg-rose-500 group-hover:text-white",
        violet: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 border-purple-100/50 hover:bg-purple-500 group-hover:text-white",
        teal: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100/50 hover:bg-emerald-500 group-hover:text-white",
        orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-100/50 hover:bg-orange-500 group-hover:text-white",
    };

    return (
        <Tag
            {...props}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay * 0.1, duration: 0.4 }}
            className="group flex items-center gap-4 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/30 text-left w-full no-underline"
        >
            <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                color === "blue" && "bg-blue-50 text-blue-500 dark:bg-blue-900/30 group-hover:bg-blue-500 group-hover:text-white",
                color === "rose" && "bg-rose-50 text-rose-500 dark:bg-rose-900/30 group-hover:bg-rose-500 group-hover:text-white",
                color === "violet" && "bg-purple-50 text-purple-500 dark:bg-purple-900/30 group-hover:bg-purple-500 group-hover:text-white",
                color === "teal" && "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 group-hover:bg-emerald-500 group-hover:text-white",
                color === "orange" && "bg-orange-50 text-orange-500 dark:bg-orange-900/30 group-hover:bg-orange-500 group-hover:text-white"
            )}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight truncate tracking-tight shrink-0">{title}</h4>
                    {subtitle && (
                        <Badge variant="outline" className="text-[9px] leading-none py-0.5 px-1.5 border-slate-200 text-slate-400 font-bold uppercase tracking-wider truncate block">
                            {subtitle}
                        </Badge>
                    )}
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 uppercase tracking-[0.05em]">Intelligence Hub</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center transition-all group-hover:bg-blue-500 group-hover:text-white">
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-white" />
            </div>
        </Tag>
    );
}

/* ---------- Reusable Inline Note Editor ---------- */
function InlineNoteEditor({
    // id,
    initialValue,
    label,
    onSave,
    variant = "default",
}: {
    id: string;
    initialValue?: string | null;
    label?: string;
    onSave: (val: string) => Promise<void>;
    variant?: "default" | "card" | "minimal";
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue || "");
    const [isSaving, startTransition] = useTransition();
    const t = useTranslations("TripDetails");

    React.useEffect(() => {
        setValue(initialValue || "");
    }, [initialValue]);

    const handleSave = () => {
        startTransition(async () => {
            await onSave(value);
            setIsEditing(false);
        });
    };

    const handleCancel = () => {
        setValue(initialValue || "");
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={t("Notes.placeholder")}
                    className="bg-white dark:bg-slate-950 min-h-[100px] text-sm border-slate-200 dark:border-slate-800 dark:text-white"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                        <X className="h-3.5 w-3.5 mr-1" /> {t("Notes.cancel")}
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> :
                            <Check className="h-3.5 w-3.5 mr-1" />}
                        {isSaving ? t("Notes.saving") : t("Notes.save")}
                    </Button>
                </div>
            </div>
        );
    }

    // View States
    if (!value) {
        return (
            <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors group"
            >
                <Pencil className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                {t("Notes.add")}
            </button>
        );
    }

    return (
        <div className="group relative">
            <div
                className={cn(
                    "text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap",
                    variant === "card" && "bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700",
                    variant === "minimal" && "pl-3 border-l-2 border-slate-200 dark:border-slate-800"
                )}
            >
                {value}
            </div>
            <button
                onClick={() => setIsEditing(true)}
                className="absolute -right-2 -top-2 p-1.5 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800"
            >
                <Pencil className="h-3 w-3" />
            </button>
        </div>
    );
}

/* ---------- Updated Metric Tile ---------- */
function MetricTile({
    label,
    value,
    highlight,
    icon: Icon,
    delay = 0
}: {
    label: string;
    value: React.ReactNode;
    highlight?: boolean;
    icon?: React.ElementType;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1, duration: 0.5, ease: "easeOut" }}
            className={cn(
                "group relative overflow-hidden rounded-2xl p-7 transition-all duration-500 border shadow-sm",
                highlight
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl hover:-translate-y-1"
                    : "bg-white dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-800/60 hover:shadow-2xl hover:-translate-y-1 hover:border-blue-500/20"
            )}
        >
            {/* Decorative element */}
            <div className={cn(
                "absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 opacity-20 group-hover:opacity-40",
                highlight ? "bg-white/20" : "bg-blue-500/10"
            )} />

            <div className="flex flex-col h-full justify-between gap-6 relative z-10">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <span
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-[0.25em] block",
                                highlight ? "text-slate-400" : "text-slate-400 dark:text-slate-500"
                            )}
                        >
                            {label}
                        </span>
                    </div>
                    {Icon && (
                        <div className={cn(
                            "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                            highlight
                                ? "bg-white/10 text-white"
                                : "bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/25"
                        )}>
                            <Icon className="h-5 w-5" />
                        </div>
                    )}
                </div>

                <div
                    suppressHydrationWarning
                    className={cn(
                        "text-2xl font-bold tracking-tight leading-none truncate antialiased",
                        highlight ? "text-white dark:text-slate-900" : "text-slate-900 dark:text-white"
                    )}
                >
                    {value}
                </div>
            </div>
        </motion.div>
    );
}


/* ---------- Know Before You Go Section ---------- */

function KnowBeforeYouGo({ meta }: { meta?: DestinationMeta }) {
    if (!meta) return null;

    const items = [
        {
            title: "Tipping Culture",
            value: meta.tipping,
            icon: Coins,
            tag: "ESSENTIAL",
            color: "blue"
        },
        {
            title: "Payment Dominance",
            value: meta.payment,
            icon: CreditCard,
            tag: "PLANNING",
            color: "emerald"
        },
        {
            title: "Photography Rules",
            value: meta.photography,
            icon: Camera,
            tag: "CULTURE",
            color: "orange"
        },
        {
            title: "The Gesture Guide",
            value: meta.gestures,
            icon: Hand,
            tag: "ETIQUETTE",
            color: "violet"
        },
        {
            title: "Dress Code",
            value: meta.dress_code,
            icon: Shirt,
            tag: "RESPECT",
            color: "rose"
        }
    ].filter(i => i.value);

    if (items.length === 0) return null;

    return (
        <div className="mt-12 space-y-8">
            <div className="flex items-center gap-3 px-1">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-[0.1em]">Intelligence & Protocol</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className="group relative flex flex-col p-5 rounded-2xl border border-slate-200/60 bg-white hover:shadow-xl transition-all duration-300 dark:border-slate-800/60 dark:bg-slate-950 cursor-default"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn(
                                "h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white",
                                item.color === "blue" && "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                                item.color === "emerald" && "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
                                item.color === "orange" && "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
                                item.color === "violet" && "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
                                item.color === "rose" && "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                            )}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <Badge variant="outline" className="text-[9px] font-bold tracking-widest bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full">
                                {item.tag}
                            </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white text-md mb-2 group-hover:text-blue-600 transition-colors tracking-tight">{item.title}</h4>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed pr-2">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------- Power Plug Facts ---------- */

const PLUG_DATA: Record<string, { label: string, description: string, image: string }> = {
    "A": {
        label: "Type A",
        description: "Two flat parallel pins. Standard in North/Central America and Japan.",
        image: "/images/plugs/type-a.png"
    },
    "B": {
        label: "Type B",
        description: "Two flat parallel pins and a round grounding pin. Standard in North America.",
        image: "/images/plugs/type-a.png" // Fallback to A if B missing
    },
    "C": {
        label: "Type C",
        description: "Two round pins (Europlug). Common across Europe, South America & Asia.",
        image: "/images/plugs/type-c.png"
    },
    "G": {
        label: "Type G",
        description: "Three rectangular pins (UK style). Used in UK, Ireland, HK, and Singapore.",
        image: "/images/plugs/type-g.png"
    },
    "M": {
        label: "Type M",
        description: "Three large round pins in a triangle. Standard in South Africa and Lesotho.",
        image: "/images/plugs/type-m.png"
    },
    "N": {
        label: "Type N",
        description: "Three round pins in a flat triangle. Standard in Brazil and South Africa.",
        image: "/images/plugs/type-c.png" // Layout similar to C
    }
};

function PowerPlugFacts({ plugs }: { plugs?: string[] }) {
    const t = useTranslations("TripDetails");
    const [selectedPlug, setSelectedPlug] = useState<{ label: string, image: string, description: string } | null>(null);

    if (!plugs?.length) return null;

    return (
        <>
            {plugs.map((p) => {
                const typeCode = p.replace(/type\s+/gi, "").toUpperCase();
                const data = PLUG_DATA[typeCode];

                return (
                    <button
                        key={p}
                        onClick={data ? () => setSelectedPlug(data) : undefined}
                        className={cn(
                            "text-xs leading-relaxed font-medium transition-colors text-left",
                            data ? "text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300" : "text-slate-500 dark:text-slate-400 cursor-default"
                        )}
                    >
                        Type {p}
                        {/* Add a subtle icon to indicate interactivity if data exists */}
                        {data && <ExternalLink className="inline-block h-3 w-3 ml-1 opacity-50" />}
                    </button>
                    // <SidebarCard
                    //     key={p}
                    //     icon={Plug}
                    //     title={data?.label || p}
                    //     subtitle={data ? "Tap to view plug details" : "Power Outlet Style"}
                    //     onClick={data ? () => setSelectedPlug(data) : undefined}
                    // />
                );
            })}

            <Dialog open={!!selectedPlug} onOpenChange={(open) => !open && setSelectedPlug(null)}>
                <DialogContent className="max-w-md rounded-2xl p-6 border-none bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Plug className="h-5 w-5 text-blue-500" />
                            {selectedPlug?.label}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                            Plug configuration for your destination.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPlug && (
                        <div className="space-y-6">
                            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 bg-slate-950/50">
                                <Image
                                    src={selectedPlug.image}
                                    alt={selectedPlug.label}
                                    fill
                                    className="object-contain p-8 animate-in zoom-in-95 duration-300"
                                    priority
                                />
                            </div>
                            <div className="rounded-2xl bg-blue-50/50 p-4 dark:bg-blue-900/20">
                                <p className="text-sm font-medium leading-relaxed text-blue-900 dark:text-blue-200">
                                    {selectedPlug.description}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

/* ---------- Updated Sidebar Fact ---------- */

function TravelIntelligenceCard({ title, tag, icon: Icon, accent, children }: { title: string, tag: string, icon: any, accent: string, children: React.ReactNode }) {
    const accents = {
        emerald: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
        blue: "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10",
        rose: "border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10",
        orange: "border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/10",
    };
    const acc = accents[accent as keyof typeof accents] || accents.blue;

    return (
        <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-sm transition-all hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105", acc)}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 block mb-1">{tag}</span>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-none tracking-tight">{title}</h4>
                    </div>
                </div>
            </div>
            <div className="relative">
                {children}
            </div>
        </div>
    );
}

function CostPill({ icon: Icon, label, value, color = "emerald" }: { icon: any, label: string, value: string, color?: "emerald" | "blue" | "orange" }) {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-500",
        blue: "bg-blue-50 text-blue-500",
        orange: "bg-orange-50 text-orange-500",
    };

    return (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-8 text-center transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 w-full group">
            <div className={cn("mb-6 flex h-14 w-14 items-center justify-center rounded-full transition-transform group-hover:scale-110 duration-500 bg-white dark:bg-slate-900 shadow-sm border border-slate-50 dark:border-slate-800 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500")}>
                <Icon className="h-6 w-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 leading-none">{label}</span>
            <span className="text-[22px] font-bold text-slate-900 dark:text-white leading-none tracking-tight">{value}</span>
        </div>
    );
}

function EmergencyButton({ label, number, color }: { label: string, number: string, color: "rose" | "emerald" | "blue" }) {
    const colors = {
        rose: {
            bg: "bg-rose-50/30",
            border: "border-t-rose-400/80",
            text: "text-rose-600",
            icon: "bg-slate-100/50 text-slate-400 dark:bg-slate-800 group-hover:bg-rose-50 group-hover:text-rose-500"
        },
        emerald: {
            bg: "bg-emerald-50/30",
            border: "border-t-emerald-400/80",
            text: "text-emerald-600",
            icon: "bg-slate-100/50 text-slate-400 dark:bg-slate-800 group-hover:bg-emerald-50 group-hover:text-emerald-500"
        },
        blue: {
            bg: "bg-blue-50/30",
            border: "border-t-blue-400/80",
            text: "text-blue-600",
            icon: "bg-slate-100/50 text-slate-400 dark:bg-slate-800 group-hover:bg-blue-50 group-hover:text-blue-500"
        }
    };

    const c = colors[color] || colors.blue;

    return (
        <button
            onClick={() => window.location.href = `tel:${number}`}
            className={cn(
                "flex flex-col items-center justify-center rounded-2xl p-8 pt-12 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden w-full border border-slate-100 border-t-[6px] dark:border-slate-800 dark:bg-slate-900/50",
                c.bg,
                c.border
            )}
        >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-8 leading-none antialiased">{label}</span>
            <div className="flex items-center gap-5">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-full shadow-sm transition-all duration-500 group-hover:rotate-[360deg]", c.icon)}>
                    <PhoneCall className="h-5 w-5" />
                </div>
                <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter leading-none">{number}</span>
            </div>
        </button>
    );
}

function DestinationActionCard({ title, subtitle, icon: Icon, href, variant = "blue", onClick }: { title: string, subtitle: string, icon: any, href?: string, variant?: "blue" | "rose" | "violet" | "teal", onClick?: () => void }) {
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

    const v = variants[variant] || variants.blue;

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

function SidebarCard({
    icon: Icon,
    title,
    subtitle,
    href,
    variant = "white",
    onClick,
    className,
}: {
    icon: any;
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    href?: string;
    variant?: "white" | "blue" | "rose" | "violet" | "teal" | "emerald" | "sky" | "amber";
    onClick?: () => void;
    className?: string;
}) {
    const variants = {
        white: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white",
        blue: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-transparent shadow-md",
        rose: "bg-gradient-to-br from-rose-500 to-pink-600 text-white border-transparent shadow-md",
        violet: "bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent shadow-md",
        teal: "bg-gradient-to-br from-teal-400 to-emerald-600 text-white border-transparent shadow-md",
        emerald: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-md",
        sky: "bg-gradient-to-br from-sky-400 to-blue-500 text-white border-transparent shadow-md",
        amber: "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-transparent shadow-md",
    };

    const isGradient = variant !== "white";

    const Content = (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-xl p-5 shadow-sm transition-all border",
                variants[variant as keyof typeof variants] || variants.white,
                (href || onClick) && "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
                className
            )}
        >
            {isGradient && (
                <Icon className="absolute -right-6 -top-6 h-24 w-24 opacity-[0.15] rotate-12 transition-transform group-hover:scale-105 group-hover:rotate-0" />
            )}
            <div className="relative z-10 flex items-center gap-4">
                <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                    isGradient
                        ? "bg-white/20 text-white backdrop-blur-md"
                        : "bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500"
                )}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className={cn(
                        "text-[15px] font-bold leading-tight tracking-tight",
                        !isGradient && "text-slate-900 dark:text-white"
                    )}>
                        {title}
                    </div>
                    {subtitle && (
                        <div className={cn(
                            "text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60",
                            isGradient ? "text-white" : "text-slate-500 dark:text-slate-500"
                        )}>
                            {subtitle}
                        </div>
                    )}
                </div>
                {(href || onClick) && (
                    <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                        isGradient ? "bg-white/10" : "bg-slate-50 dark:bg-slate-800"
                    )}>
                        <ExternalLink className={cn(
                            "h-4 w-4 shrink-0 transition-opacity",
                            isGradient ? "text-white group-hover:opacity-100" : "text-slate-300 opacity-0 group-hover:opacity-100"
                        )} />
                    </div>
                )}
            </div>
        </div>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="block no-underline">
                {Content}
            </a>
        );
    }

    return Content;
}

function SidebarFact({
    value,
    sub,
    icon: Icon,
    href,
}: {
    value?: React.ReactNode;
    sub?: React.ReactNode;
    icon: React.ElementType;
    href?: string;
}) {
    if (!value && !sub) return null;
    return (
        <SidebarCard
            icon={Icon}
            title={value}
            subtitle={sub}
            href={href}
        />
    );
}

/* ---------- Editable day renderer ---------- */

function EditableDay({
    dayIdx,
    day,
    items,
    nextOrderIndex,
    tripId,
    placesById,
    startDate,
    tripConfig,
    tripInputs,
    tripCurrency,
    selectedItemId,
    onItemClick,
    fxSnapshot,
    userPreferredCurrency,
}: {
    dayIdx: number;
    day: Day | null;
    items: ItemRowLite[];
    nextOrderIndex: number;
    tripId: string;
    placesById: Map<string, Place>;
    startDate?: string;
    tripConfig: TripConfig | null;
    tripInputs: TripInputs;
    tripCurrency: string;
    selectedItemId?: string | null;
    onItemClick?: (id: string) => void;
    fxSnapshot?: FxSnapshot | null;
    userPreferredCurrency?: string;
}) {
    const blocks = React.useMemo(() => day?.blocks ?? [], [day?.blocks]);

    const dayCost = useMemo(
        () =>
            Math.max(
                0,
                Math.round(
                    blocks.reduce((acc, b) => acc + (Number(b.est_cost) || 0), 0)
                )
            ),
        [blocks]
    );

    const convertedDayCost = React.useMemo(() => {
        if (!fxSnapshot || !userPreferredCurrency || tripCurrency === userPreferredCurrency) return null;
        const val = convertUsingSnapshot(fxSnapshot, dayCost, tripCurrency, userPreferredCurrency);
        return val ? Math.round(val) : null;
    }, [fxSnapshot, userPreferredCurrency, tripCurrency, dayCost]);

    const hasRealIds = items.every((it) => !String(it.id).startsWith("no-id-"));

    if (!day) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <CalendarDays className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">Empty Day</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Add your first activity to get started.
                    </p>
                </div>
                <AddItemUnderDay
                    tripId={tripId}
                    dayIndex={dayIdx}
                    date={null}
                    tripStartDate={startDate}
                    destinationLat={tripConfig?.destinations?.[0]?.lat as number | undefined}
                    destinationLng={tripConfig?.destinations?.[0]?.lng as number | undefined}
                    preferenceTags={tripConfig?.interests as string[] | undefined}
                    nextOrderIndex={nextOrderIndex}
                    tripCurrency={tripCurrency}
                />
            </div>
        );
    }

    const formatted = formatISODate(day.date);
    const [weekday, rest] = splitDayLabel(formatted);
    const dayNote = tripInputs?.day_notes?.[day.date || ""] || "";

    return (
        <div className="space-y-12">
            {/* Day Header - Centered & Clean */}
            <div className="flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800 pb-8 text-center">
                <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                    {weekday}
                </h3>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <CalendarDays className="h-4 w-4" />
                    {rest}
                    {dayCost > 0 && (
                        <>
                            <span className="mx-2 h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {tripCurrency} {dayCost}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Timeline Groups */}
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[29px] top-4 bottom-4 w-[2px] bg-indigo-50 dark:bg-slate-800/50 hidden md:block" />

                {(["morning", "afternoon", "evening"] as const).map((period) => {
                    const periodBlocks = blocks
                        .map((b, i) => ({ ...b, originalIndex: i }))
                        .filter((b) => b.when === period);

                    const Icon =
                        period === "morning"
                            ? Sun
                            : period === "afternoon"
                                ? Sun
                                : Moon; // Using Sun for Afternoon as generic bright icon, ideally CloudSun if available

                    const periodColor =
                        period === "morning"
                            ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
                            : period === "afternoon"
                                ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20";

                    const iconColor =
                        period === "morning"
                            ? "text-amber-500"
                            : period === "afternoon"
                                ? "text-blue-500"
                                : "text-indigo-500";

                    return (
                        <div key={period} className="relative mb-12 grid gap-8 md:grid-cols-[60px_1fr]">
                            {/* Left Column: Icon & Label */}
                            <div className="hidden md:flex flex-col items-center pt-2 relative z-10">
                                <div className={cn(
                                    "flex h-14 w-14 items-center justify-center rounded-full border-4 border-white dark:border-slate-950 shadow-sm mb-3 bg-white dark:bg-slate-900",
                                    iconColor
                                )}>
                                    <Icon className={cn("h-6 w-6")} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 rotate-0">
                                    {period}
                                </span>
                            </div>

                            {/* Mobile Header for Period */}
                            <div className="flex md:hidden items-center gap-3 mb-4">
                                <Icon className={cn("h-5 w-5", iconColor)} />
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                    {period}
                                </span>
                            </div>

                            {/* Right Column: Cards */}
                            <div className="space-y-6">
                                {periodBlocks.length === 0 ? (
                                    <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-900/20">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-400 dark:text-slate-600">
                                                Nothing planned for the {period}
                                            </p>
                                            <AddItemUnderDay
                                                tripId={tripId}
                                                dayIndex={dayIdx}
                                                date={day.date}
                                                tripStartDate={startDate}
                                                destinationLat={tripConfig?.destinations?.[0]?.lat}
                                                destinationLng={tripConfig?.destinations?.[0]?.lng}
                                                preferenceTags={tripConfig?.interests}
                                                nextOrderIndex={nextOrderIndex}
                                                tripCurrency={tripCurrency}
                                                defaultWhen={period}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    periodBlocks.map((b) => {
                                        const place = b.place_id ? placesById.get(b.place_id) : null;
                                        const forControls = items[b.originalIndex];

                                        return (
                                            <BlockCard
                                                key={b.id}
                                                id={forControls.id}
                                                title={b.title}
                                                when={b.when}
                                                place={place ?? null}
                                                notes={b.notes ?? ""}
                                                coords={
                                                    place && place.lat != null && place.lng != null
                                                        ? `${place.lat.toFixed(3)}, ${place.lng.toFixed(3)}`
                                                        : null
                                                }
                                                stats={[
                                                    {
                                                        kind: "cost",
                                                        label: "Cost",
                                                        value: b.est_cost ? `${tripCurrency} ${Number(b.est_cost).toFixed(2)}` : (place?.cost_typical ? `${place.cost_currency || '$'} ${place.cost_typical}` : "Free"),
                                                    },
                                                    {
                                                        kind: "duration",
                                                        label: "Duration",
                                                        value: `${b.duration_min ?? 60}`, // Default to 60 if null
                                                    },
                                                ]}
                                                actions={<BlockActions item={forControls} />}
                                                onUpdateNote={async (id, val) => {
                                                    try {
                                                        await updateItemNote(id, val);
                                                        toast.success("Note updated");
                                                    } catch {
                                                        toast.error("Failed to save note");
                                                    }
                                                }}
                                                isSelected={b.id === selectedItemId}
                                                onClick={() => b.id && onItemClick?.(b.id)}
                                            />
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ---------- Block Card Component ---------- */

function BlockCard({
    id,
    title,
    when,
    place,
    notes,
    coords,
    stats,
    actions,
    onUpdateNote,
    isSelected,
    onClick
}: {
    id: string;
    title: string;
    when: "morning" | "afternoon" | "evening";
    place: Place | null;
    notes?: string;
    coords?: string | null;
    stats: Array<{ kind: StatKind; label: string; value: string | number }>;
    actions?: React.ReactNode;
    onUpdateNote: (id: string, note: string) => Promise<void>;
    isSelected?: boolean;
    onClick?: () => void;
}) {
    const durationStat = stats.find(s => s.kind === "duration");
    const costStat = stats.find(s => s.kind === "cost");

    // Determine card styling based on category or type if needed, strict white for now as per screenshot
    const isFree = costStat && (String(costStat.value).toLowerCase().includes("free") || String(costStat.value).includes("0.00"));

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-[20px] bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300 hover:shadow-xl cursor-pointer border",
                isSelected
                    ? "border-blue-500 ring-1 ring-blue-500/50"
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            )}>

            {/* Top Row: Category Tag & Duration */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-widest",
                        place?.category?.toLowerCase().includes("bridge") ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :
                            place?.category?.toLowerCase().includes("museum") ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                                place?.category?.toLowerCase().includes("castle") ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" :
                                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                        {place?.category ? place.category : (place ? "Place" : "Activity")}
                    </span>
                </div>

                {durationStat && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>{durationStat.value}m</span>
                    </div>
                )}
            </div>

            {/* Main Content: Title & Location */}
            <div className="mb-6">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <MapPin className="h-3 w-3" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1">
                            {title}
                        </h3>
                        {notes && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                {notes}
                            </p>
                        )}
                        {/* Remove address as it does not exist on Place type */}

                    </div>
                </div>
            </div>

            {/* Bottom Row: Cost & Edit */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
                <div className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold tabular-nums",
                    isFree
                        ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                )}>
                    {costStat ? costStat.value : "Free"}
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {actions}
                </div>
            </div>
        </div>
    );
}
function StatChip({
    variant,
    label,
    value,
}: {
    variant: StatKind;
    label: string;
    value: string | number;
}) {
    const styles: Record<
        StatKind,
        { bg: string; text: string; border: string; icon: React.ElementType }
    > = {
        cost: {
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            text: "text-emerald-700 dark:text-emerald-400",
            border: "border-emerald-100 dark:border-emerald-900",
            icon: DollarSign,
        },
        duration: {
            bg: "bg-slate-50 dark:bg-slate-800",
            text: "text-slate-600 dark:text-slate-300",
            border: "border-slate-200 dark:border-slate-700",
            icon: Clock3,
        },
        travel: {
            bg: "bg-slate-50 dark:bg-slate-800",
            text: "text-slate-600 dark:text-slate-300",
            border: "border-slate-200 dark:border-slate-700",
            icon: MoveRight,
        },
    };
    const s = styles[variant];
    const Icon = s.icon;

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border",
                s.bg,
                s.text,
                s.border
            )}
        >
            <Icon className="h-3 w-3 opacity-60" />
            <span className="opacity-40">{label}</span>
            <span className="tabular-nums">{value}</span>
        </div>
    );
}



/* ---------- Calendar View ---------- */

function CalendarView({
    days,
    placesById,
    selectedItemId,
    onItemClick,
    tripCurrency,
    fxSnapshot,
    userPreferredCurrency,
}: {
    days: Day[];
    placesById: Map<string, Place>;
    selectedItemId?: string | null;
    onItemClick?: (id: string) => void;
    tripCurrency?: string;
    fxSnapshot?: FxSnapshot | null;
    userPreferredCurrency?: string;
}) {
    const timeSlots = ["morning", "afternoon", "evening"] as const;

    if (!days?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Calendar className="mb-4 h-12 w-12 text-slate-200 dark:text-slate-700" />
                <p className="text-slate-500 dark:text-slate-400">No itinerary days found.</p>
            </div>
        );
    }

    return (
        <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex gap-6 min-w-max px-2">
                {/* Time Labels Column */}
                <div className="sticky left-0 z-20 flex flex-col gap-4 pt-14 bg-white dark:bg-slate-900 pr-6 border-r border-slate-100 dark:border-slate-800">
                    {timeSlots.map((slot) => (
                        <div
                            key={slot}
                            className="flex h-56 w-24 items-center justify-center"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500",
                                    slot === "morning" && "text-orange-400 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400",
                                    slot === "afternoon" && "text-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
                                    slot === "evening" && "text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400",
                                )}>
                                    {slot === "morning" && <Sun className="h-5 w-5" />}
                                    {slot === "afternoon" && <Sun className="h-5 w-5" />}
                                    {slot === "evening" && <Moon className="h-5 w-5" />}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    {slot}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                {days.map((day, i) => {
                    const dateLabel = formatISODate(day.date);
                    const [weekday, rest] = splitDayLabel(dateLabel);

                    return (
                        <div key={day.date} className="flex w-80 flex-col gap-4">
                            {/* Day Header */}
                            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 pb-6 text-center border-b border-slate-100 dark:border-slate-800">
                                <div className="inline-flex flex-col items-center">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                                        Day {i + 1}
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                            {weekday}
                                        </span>
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {rest}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Time Slots */}
                            {timeSlots.map((slot) => {
                                const blocks = day.blocks.filter((b) => b.when === slot);
                                return (
                                    <div
                                        key={`${day.date}-${slot}`}
                                        className="relative flex h-56 flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/30 p-3 dark:border-slate-800 dark:bg-slate-900/30 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50"
                                    >
                                        {blocks.length > 0 ? (
                                            blocks.map((b, idx) => {
                                                const place = b.place_id ? placesById.get(b.place_id) : null;
                                                const badgeColor = whenBadgeClasses(slot);
                                                const isSelected = b.id === selectedItemId;

                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => b.id && onItemClick?.(b.id)}
                                                        className={cn(
                                                            "group shrink-0 cursor-pointer rounded-xl border bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-800",
                                                            isSelected
                                                                ? "border-blue-500 ring-1 ring-blue-500 shadow-md z-10"
                                                                : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-600"
                                                        )}
                                                    >
                                                        <div className="mb-2 flex items-start justify-between gap-2">
                                                            <span className={cn(
                                                                "inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                                                                badgeColor.badge
                                                            )}>
                                                                {b.title}
                                                            </span>
                                                            {b.duration_min > 0 && (
                                                                <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                                                                    <Clock3 className="h-3 w-3" />
                                                                    {b.duration_min}m
                                                                </span>
                                                            )}
                                                        </div>

                                                        {place && (
                                                            <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                <span className="truncate font-medium">{place.name}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-2 dark:border-slate-700/50">
                                                            {b.est_cost > 0 ? (
                                                                <div className="flex flex-col items-end gap-0.5">
                                                                    {place?.cost_typical && place.cost_currency && place.cost_currency !== tripCurrency && (
                                                                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                                            {place.cost_currency} {Number(place.cost_typical).toFixed(2)}
                                                                        </span>
                                                                    )}
                                                                    <span
                                                                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded leading-none">
                                                                        {tripCurrency} {Number(b.est_cost).toFixed(2)}
                                                                        {fxSnapshot && userPreferredCurrency && tripCurrency && tripCurrency !== userPreferredCurrency && (
                                                                            <span className="opacity-70 font-normal ml-1">
                                                                                (~ {userPreferredCurrency} {(convertUsingSnapshot(fxSnapshot, b.est_cost, tripCurrency, userPreferredCurrency) || 0).toFixed(2)})
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-400">Free</span>
                                                            )}

                                                            {b.notes && (
                                                                <NotebookPen className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-300 dark:text-slate-700">
                                                <div className="h-1 w-1 rounded-full bg-current opacity-50" />
                                                <span className="text-[10px] font-medium uppercase tracking-widest opacity-50">Free</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}

/* ---------- Places List ---------- */

function PlacesList({ places }: { places: Place[] }) {
    if (!places?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-200 dark:text-slate-700">
                    <MapPin className="h-8 w-8" />
                </motion.div>
                <p className="text-base font-medium text-slate-500 dark:text-slate-400">
                    No places added yet.
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Your discoveries will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((p, idx) => (
                <motion.div
                    key={p.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 p-6 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1.5 hover:border-blue-500/30"
                >
                    {/* Decorative Background Accent */}
                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <MapPin className="h-5 w-5" />
                            </div>
                            {p.popularity && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-800/30 transition-colors group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40">
                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 tabular-nums">{p.popularity}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {p.name}
                            </h3>
                            {p.category && (
                                <p className="mt-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-blue-500" />
                                    {p.category}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between relative z-10">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-700" />
                                </div>
                            ))}
                        </div>
                        <button className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

/* ---------- Date & misc utils ---------- */

function formatISODate(x?: string) {
    if (!x) return "—";
    const [y, m, d] = x.split("-").map((n) => Number(n));
    if (!y || !m || !d) return x;
    const date = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    try {
        return new Intl.DateTimeFormat("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        }).format(date);
    } catch {
        return x;
    }
}

function splitDayLabel(label: string): [string, string] {
    const parts = label.split(",");
    if (parts.length <= 1) return [label, ""];
    const [weekday, ...rest] = parts;
    return [weekday.trim(), rest.join(",").trim()];
}

function emojiFor(tag: string) {
    const t = tag.toLowerCase();
    if (t.includes("beach")) return "🏝️";
    if (t.includes("food")) return "🍽️";
    if (t.includes("culture")) return "🏛";
    if (t.includes("nature")) return "🌿";
    return "✨";
}

function joinArr(arr?: string[]) {
    if (!arr || arr.length === 0) return undefined;
    return arr.join(", ");
}

function getCountryName(countryCode: string) {
    try {
        return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode);
    } catch {
        return countryCode;
    }
}

function whenBadgeClasses(w: string) {
    if (w === "morning")
        return {
            badge: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            dot: "bg-amber-400 border-amber-100 dark:bg-amber-500 dark:border-amber-900",
        };
    if (w === "afternoon")
        return {
            badge: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            dot: "bg-orange-400 border-orange-100 dark:bg-orange-500 dark:border-orange-900",
        };
    return {
        badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        dot: "bg-indigo-400 border-indigo-100 dark:bg-indigo-500 dark:border-indigo-900",
    };
}