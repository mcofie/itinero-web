"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useMemo, useState, useTransition } from "react";
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
} from "lucide-react";
import { AddItemUnderDay } from "@/app/[locale]/(main)/trips/AddItemUnderDay";
import { DestinationMeta, TripConfig } from "@/app/[locale]/(main)/trips/TripActionsClient";
import { formatDateRange } from "@/lib/trip-dates";
import { WeatherWidget } from "@/components/trips/WeatherWidget";
import { ExchangeRateCard } from "@/components/trips/ExchangeRateCard";

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

export default function TripViewerClient({
    tripId,
    startDate,
    data,
    userPreferredCurrency,
    userPassportCountry,
}: {
    tripId: string;
    data: PreviewLike;
    startDate?: string;
    userPreferredCurrency?: string;
    userPassportCountry?: string | null;
}) {
    const { resolvedTheme } = useTheme();
    const theme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";
    const t = useTranslations("TripDetails");

    // Extract Trip Currency
    const tripCurrency = data.trip_summary.currency ?? "USD";

    const [activeDayIdx, setActiveDayIdx] = useState(0);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [fxSnapshot, setFxSnapshot] = useState<FxSnapshot | null>(null);

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
        <Card className="overflow-hidden border-none shadow-none bg-transparent pb-20">
            <CardContent className="p-0 space-y-8">

                {/* 1. Progress & Header Section */}
                <div
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden group">
                    {/* Subtle decorative gradient blob */}
                    <div
                        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-50/50 dark:bg-blue-900/20 blur-3xl transition-all group-hover:bg-blue-100/50 dark:group-hover:bg-blue-800/20" />

                    <div className="relative z-10 mb-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div className="space-y-2">
                            <div
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                <Clock3 className="h-3.5 w-3.5" />
                                {t("Progress.label")}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {t("Progress.day")} {Math.min(activeDayIdx + 1, Math.max(1, totalDays))}
                                </span>
                                <span className="text-lg font-medium text-slate-400 dark:text-slate-500">
                                    / {totalDays || "—"}
                                </span>
                            </div>
                        </div>

                        {hasInterests(inputs) && inputs.interests.length > 0 && (
                            <div className="flex flex-wrap justify-end gap-2 max-w-md">
                                {inputs.interests.map((t) => (
                                    <Badge
                                        key={t}
                                        variant="secondary"
                                        className="bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 px-3 py-1.5 text-xs font-medium capitalize border border-slate-200/50 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-300 dark:border-slate-700/50"
                                    >
                                        {emojiFor(t)} {t}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div
                        className="relative z-10 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all duration-700 ease-out"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>

                {/* 2. Floating Pill Navigation */}
                <Tabs defaultValue="overview" className="w-full">
                    <div className="sticky top-4 z-30 flex justify-center mb-8 pointer-events-none">
                        <TabsList
                            className="pointer-events-auto inline-flex h-14 items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 p-1.5 shadow-sm overflow-x-auto max-w-full">
                            <TabsTrigger
                                value="overview"
                                className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                            >
                                {t("Tabs.overview")}
                            </TabsTrigger>
                            <TabsTrigger
                                value="story"
                                className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                            >
                                {t("Tabs.story")}
                            </TabsTrigger>
                            <TabsTrigger
                                value="days"
                                className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                            >
                                {t("Tabs.itinerary")}
                            </TabsTrigger>
                            <TabsTrigger
                                value="map"
                                className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                            >
                                {t("Tabs.map")}
                            </TabsTrigger>
                            <TabsTrigger
                                value="calendar"
                                className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                            >
                                {t("Tabs.calendar")}
                            </TabsTrigger>
                            <TabsTrigger
                                value="places"
                                className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                            >
                                {t("Tabs.places")}
                            </TabsTrigger>
                            <TabsTrigger
                                value="raw"
                                className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                            >
                                {t("Tabs.tours")}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ---------- OVERVIEW TAB ---------- */}
                    <TabsContent
                        value="overview"
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
                            <div className="space-y-8">
                                {/* Trip Highlights */}
                                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                                    <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                        {t("Highlights.title")}
                                    </h2>

                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        <MetricTile
                                            label={t("Highlights.dates")}
                                            value={formatDateRange(metricStart, metricEnd)}
                                            icon={CalendarDays}
                                        />
                                        <MetricTile
                                            label={t("Highlights.duration")}
                                            value={`${totalDays} Days`}
                                            icon={Clock3}
                                        />
                                        <MetricTile
                                            label={t("Highlights.places")}
                                            value={String(data.places.length)}
                                            icon={MapPin}
                                        />
                                        <MetricTile
                                            label={t("Highlights.totalCost")}
                                            value={
                                                <span>
                                                    {tripCurrency} {totals.estCost}
                                                    {getConvertedCost(totals.estCost) !== null && (
                                                        <span className="ml-1.5 opacity-70 text-sm font-normal">
                                                            (~ {userPreferredCurrency} {getConvertedCost(totals.estCost)})
                                                        </span>
                                                    )}
                                                </span>
                                            }
                                            highlight
                                            icon={DollarSign}
                                        />
                                        <MetricTile
                                            label={t("Highlights.activityTime")}
                                            value={`${Math.round(totals.durationMin / 60)}h`}
                                            icon={Star}
                                        />
                                        <MetricTile
                                            label={t("Highlights.travelTime")}
                                            value={`${Math.round(totals.travelMin / 60)}h`}
                                            icon={MoveRight}
                                        />
                                    </div>
                                </div>

                                {/* Collapsible About & History - Editorial Style */}
                                <div className="space-y-3">
                                    <Accordion type="single" collapsible className="w-full space-y-3">
                                        <AccordionItem value="about" className="border-none">
                                            <AccordionTrigger className="hover:no-underline rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-5 shadow-sm group transition-all hover:border-blue-500/50">
                                                <div className="flex items-center gap-4">
                                                    <Globe className="h-5 w-5 text-blue-500" />
                                                    <span className="text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">{t("About.title")}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="mt-2 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 p-8 leading-relaxed text-slate-600 dark:text-slate-300 antialiased">
                                                <div className="relative">
                                                    <div className="absolute -left-4 top-0 h-full w-0.5 bg-blue-500/20 rounded-full" />
                                                    {destinationMeta?.description || t("About.noDesc")}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>

                                        <AccordionItem value="history" className="border-none">
                                            <AccordionTrigger className="hover:no-underline rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-5 shadow-sm group transition-all hover:border-purple-500/50">
                                                <div className="flex items-center gap-4">
                                                    <Clock3 className="h-5 w-5 text-purple-500" />
                                                    <span className="text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">{t("About.historyTitle")}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="mt-2 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 p-8 leading-relaxed text-slate-600 dark:text-slate-300 antialiased">
                                                <div className="relative">
                                                    <div className="absolute -left-4 top-0 h-full w-0.5 bg-purple-500/20 rounded-full" />
                                                    {destinationMeta?.history || t("About.noHistory")}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>

                                {/* Plan & Book - Modern Hub Version */}
                                <div className="space-y-4 pt-6">
                                    <div className="flex items-center gap-4 px-2">
                                        <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] whitespace-nowrap">
                                            Travel Toolkit
                                        </h3>
                                        <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <DestinationActionCard
                                            title="Flights"
                                            subtitle="Skyscanner"
                                            icon={Plane}
                                            variant="blue"
                                            href={(() => {
                                                const destName = destinationMeta?.city || inputs?.destinations?.[0]?.name || "";
                                                const origin = inputs?.origin_city || "LHR";
                                                const start = data.trip_summary.start_date?.replace(/-/g, "").slice(2);
                                                const end = data.trip_summary.end_date?.replace(/-/g, "").slice(2);
                                                if (!destName || !start || !end) return "https://www.skyscanner.net";
                                                return `https://www.skyscanner.net/transport/flights/${origin.toLowerCase()}/${destName.toLowerCase().replace(/\s+/g, '')}/${start}/${end}/?adultsv2=1&cabinclass=economy&rtn=1`;
                                            })()}
                                        />
                                        <DestinationActionCard
                                            title="Stays"
                                            subtitle="Airbnb"
                                            icon={Home}
                                            variant="rose"
                                            href={(() => {
                                                const city = destinationMeta?.city || inputs?.destinations?.[0]?.name || "";
                                                const start = data.trip_summary.start_date;
                                                const end = data.trip_summary.end_date;
                                                if (!city) return "https://www.airbnb.com";
                                                return `https://www.airbnb.com/s/${encodeURIComponent(city)}/homes?checkin=${start}&checkout=${end}`;
                                            })()}
                                        />
                                        <DestinationActionCard
                                            title="Passports"
                                            subtitle="Index"
                                            icon={IdCard}
                                            variant="violet"
                                            href={(() => {
                                                const passport = inputs?.passport_country || userPassportCountry || "united-states";
                                                const slug = passport.toLowerCase().replace(/\s+/g, '-');
                                                return `https://www.passportindex.org/country/${slug}/`;
                                            })()}
                                        />
                                        <DestinationActionCard
                                            title="Mobile Data"
                                            subtitle={destinationMeta?.esim_provider || "Airalo"}
                                            icon={SmartphoneNfc}
                                            variant="teal"
                                            href={(() => {
                                                const countryCode = destinationMeta?.country_code;
                                                const countryName = countryCode ? getCountryName(countryCode) : null;
                                                if (countryName) {
                                                    const slug = countryName.toLowerCase().replace(/\s+/g, '-');
                                                    return `https://www.airalo.com/${slug}-esim`;
                                                }
                                                return "https://www.airalo.com/";
                                            })()}
                                        />
                                    </div>
                                </div>

                                {/* Intelligence Suite */}
                                <div className="grid gap-6 sm:grid-cols-2 pt-6">
                                    {/* Cost of Living Card */}
                                    <TravelIntelligenceCard
                                        title="Budget Insights"
                                        tag="Cost of Living"
                                        icon={Coins}
                                        accent="emerald"
                                    >
                                        <div className="space-y-4">
                                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                Local price benchmarks for {destinationMeta?.city || "your destination"}.
                                            </p>
                                            <div className="grid grid-cols-3 gap-2">
                                                <CostPill icon={Coffee} label="Coffee" value={destinationMeta?.cost_coffee ? `~${destinationMeta.cost_coffee}` : "~$4.50"} />
                                                <CostPill icon={Utensils} label="Meal" value={destinationMeta?.cost_meal ? `~${destinationMeta.cost_meal}` : "~$18.00"} />
                                                <CostPill icon={Beer} label="Pint" value={destinationMeta?.cost_beer ? `~${destinationMeta.cost_beer}` : "~$7.00"} />
                                            </div>
                                        </div>
                                    </TravelIntelligenceCard>

                                    {/* Etiquette & Tipping */}
                                    <TravelIntelligenceCard
                                        title="Social Etiquette"
                                        tag="Customs"
                                        icon={HeartHandshake}
                                        accent="blue"
                                    >
                                        <div className="space-y-3">
                                            <div className="rounded-xl bg-blue-50/50 dark:bg-blue-900/20 p-3 border border-blue-100/50 dark:border-blue-800/50">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">Tipping</span>
                                                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                                                    {destinationMeta?.tipping || "Standard 10-15% is appreciated for good service."}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(destinationMeta?.etiquette_dos ? destinationMeta.etiquette_dos.split(',') : ["Respect Punctuality", "Modest Dress"]).map((doItem, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[9px] font-extrabold uppercase py-0.5 border-slate-200">
                                                        {doItem.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </TravelIntelligenceCard>

                                    {/* Smart Packing */}
                                    <TravelIntelligenceCard
                                        title="Smart Packing"
                                        tag="Pro-Tip"
                                        icon={Shirt}
                                        accent="orange"
                                    >
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                                    <AlertCircle className="h-4 w-4" />
                                                </div>
                                                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                                    {destinationMeta?.packing_tips || (
                                                        <>
                                                            {destinationMeta?.plugs?.[0] ? `Requires Type ${destinationMeta.plugs.join('/')} adapters. ` : ""}
                                                            Weather is expected to be {destinationMeta?.weather_desc || "variable"}—bring a layer for the evenings.
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 px-2 py-1">
                                                    <Umbrella className="h-3 w-3 text-slate-400" />
                                                    <span className="text-[9px] font-bold text-slate-500">Light Jacket</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 px-2 py-1">
                                                    <Plug className="h-3 w-3 text-slate-400" />
                                                    <span className="text-[9px] font-bold text-slate-500">Universal Adapter</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TravelIntelligenceCard>

                                    {/* Medical & Emergency */}
                                    <TravelIntelligenceCard
                                        title="Emergency"
                                        tag="Peace of Mind"
                                        icon={PhoneCall}
                                        accent="rose"
                                    >
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <EmergencyButton label="Police" number={destinationMeta?.emergency_police || "911"} color="bg-rose-500" />
                                                <EmergencyButton label="Medical" number={destinationMeta?.emergency_medical || "999"} color="bg-emerald-500" />
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                                Click to call local responder
                                            </p>
                                        </div>
                                    </TravelIntelligenceCard>

                                    {/* Hidden Gem */}
                                    <div className="sm:col-span-2">
                                        <div className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-8 text-white shadow-xl transition-all hover:scale-[1.01]">
                                            <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
                                            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-amber-500 text-white shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                                                    <Lightbulb className="h-8 w-8" />
                                                </div>
                                                <div className="flex-1 text-center sm:text-left">
                                                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Did you know?</span>
                                                    </div>
                                                    <h4 className="text-xl font-black mb-2 antialiased">
                                                        {destinationMeta?.hidden_gem_title || `The local secret of ${destinationMeta?.city || "your destination"}`}
                                                    </h4>
                                                    <p className="text-sm text-slate-400 leading-relaxed font-semibold">
                                                        {destinationMeta?.hidden_gem_desc || "Most tourists miss the backstreet evening markets. Ask a local for the \"Night Lantern Trail\" for the best street food experience in the city."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                {/* Know Before You Go - Cultural Insights */}
                                <KnowBeforeYouGo meta={destinationMeta ?? undefined} />
                            </div>

                            {/* Sidebar Info */}
                            <aside className="relative">
                                <div className="sticky top-24 space-y-4 flex flex-col">
                                    {/* Trip General Notes */}
                                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/10 p-6 shadow-sm shrink-0">
                                        <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
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

                                    {/* LOCAL GUIDE SECTION */}
                                    <div className="px-2">
                                        <h3 className="mb-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                            <Globe className="h-3 w-3" />
                                            {t("Sidebar.localGuide")}
                                        </h3>
                                        <div className="space-y-3">
                                            <PowerPlugFacts plugs={destinationMeta?.plugs} />
                                            <SidebarFact
                                                value={joinArr(destinationMeta?.languages)}
                                                sub="Local Languages"
                                                icon={LanguagesIcon}
                                            />
                                            <SidebarFact
                                                value={joinArr(destinationMeta?.transport)}
                                                sub="Common Transport"
                                                icon={TrainFront}
                                            />
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
                        <div className="grid h-[calc(100vh-240px)] gap-6 lg:grid-cols-2">
                            <div
                                className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                <div
                                    className="shrink-0 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                                    <ScrollArea className="w-full whitespace-nowrap">
                                        <div className="flex w-max gap-2 pb-2">
                                            {data.days.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActiveDayIdx(i)}
                                                    className={cn(
                                                        "rounded-full border px-5 py-2 text-xs font-bold transition-all",
                                                        activeDayIdx === i
                                                            ? "border-slate-900 bg-slate-900 text-white shadow-md dark:border-white dark:bg-white dark:text-slate-900"
                                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
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
                                className="hidden h-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden shadow-sm lg:block sticky top-24">
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

                    {/* ---------- CALENDAR TAB ---------- */}
                    <TabsContent
                        value="calendar"
                        className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm overflow-hidden">
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
                            className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t("Places.allPlaces")}</h2>
                                <span
                                    className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
                                    {data.places?.length ?? 0} {t("Places.locations")}
                                </span>
                            </div>
                            <PlacesList places={data.places} />
                        </div>
                    </TabsContent>

                    {/* ---------- TOURS TAB ---------- */}
                    <TabsContent
                        value="raw"
                        className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <div
                            className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-12 text-center shadow-sm">
                            <div className="relative z-10 mx-auto max-w-lg">
                                <div
                                    className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                    {t("Tours.comingSoon")}
                                </div>
                                <h2 className="mb-4 text-3xl font-extrabold text-slate-900 dark:text-white">
                                    {t("Tours.title")}
                                </h2>
                                <p className="mb-10 leading-relaxed text-slate-600 dark:text-slate-400">
                                    {t("Tours.desc")}
                                </p>

                                <div className="grid gap-4 text-left sm:grid-cols-2">
                                    <div
                                        className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                                        <Users2 className="mb-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {t("Tours.verifiedGuides")}
                                        </h4>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {t("Tours.verifiedGuidesDesc")}
                                        </p>
                                    </div>
                                    <div
                                        className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                                        <Compass className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {t("Tours.curatedTours")}
                                        </h4>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            {t("Tours.curatedToursDesc")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

/* =========================
   Sub-Components
========================= */

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
}: {
    label: string;
    value: React.ReactNode;
    highlight?: boolean;
    icon?: React.ElementType;
}) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl p-4 transition-all",
                highlight
                    ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-700 dark:bg-blue-600 dark:ring-blue-500"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 dark:text-white dark:hover:bg-slate-800"
            )}
        >
            <div className="flex flex-col gap-1 relative z-10">
                <span
                    className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        highlight ? "text-blue-200" : "text-slate-400 dark:text-slate-500"
                    )}
                >
                    {label}
                </span>
                <span
                    suppressHydrationWarning
                    className="text-lg font-bold truncate leading-tight"
                >
                    {value}
                </span>
            </div>
            {Icon && (
                <Icon
                    className={cn(
                        "absolute -bottom-2 -right-2 h-12 w-12 opacity-10",
                        highlight ? "text-white" : "text-slate-900 dark:text-white"
                    )}
                />
            )}
        </div>
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
            color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
            dot: "bg-emerald-500"
        },
        {
            title: "Payment Dominance",
            value: meta.payment,
            icon: CreditCard,
            color: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
            dot: "bg-blue-500"
        },
        {
            title: "Photography Rules",
            value: meta.photography,
            icon: Camera,
            color: "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
            dot: "bg-orange-500"
        },
        {
            title: "The Gesture Guide",
            value: meta.gestures,
            icon: Hand,
            color: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
            dot: "bg-purple-500"
        },
        {
            title: "Dress Code",
            value: meta.dress_code,
            icon: Shirt,
            color: "bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400",
            dot: "bg-pink-500"
        }
    ].filter(i => i.value);

    if (items.length === 0) return null;

    return (
        <div className="mt-8 space-y-6">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Know Before You Go
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-blue-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", item.color)}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                {item.title}
                            </h4>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {item.value}
                        </p>
                        <div className={cn("absolute bottom-0 right-0 h-1.5 w-12 rounded-tl-full opacity-20 transition-opacity group-hover:opacity-100", item.dot)} />
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
                    <SidebarCard
                        key={p}
                        icon={Plug}
                        title={data?.label || p}
                        subtitle={data ? "Tap to view plug details" : "Power Outlet Style"}
                        onClick={data ? () => setSelectedPlug(data) : undefined}
                    />
                );
            })}

            <Dialog open={!!selectedPlug} onOpenChange={(open) => !open && setSelectedPlug(null)}>
                <DialogContent className="max-w-md rounded-3xl p-6 border-none bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
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
                            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50">
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
        emerald: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
        blue: "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5",
        rose: "border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/5",
        orange: "border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/5",
    };
    const acc = accents[accent as keyof typeof accents] || accents.blue;

    return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", acc)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tag}</span>
                        <h4 className="text-[15px] font-black text-slate-900 dark:text-white leading-none mt-0.5">{title}</h4>
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
}

function CostPill({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
            <Icon className="h-4 w-4 text-slate-400 mb-1.5" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
            <span className="text-[13px] font-black text-slate-900 dark:text-white leading-none">{value}</span>
        </div>
    );
}

function EmergencyButton({ label, number, color }: { label: string, number: string, color: string }) {
    return (
        <button
            onClick={() => window.location.href = `tel:${number}`}
            className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 transition-all hover:border-rose-500 group relative overflow-hidden w-full"
        >
            <div className={cn("absolute right-0 top-0 h-1 w-full", color)} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</span>
            <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-slate-900 dark:text-white animate-pulse" />
                <span className="text-[17px] font-black text-slate-900 dark:text-white">{number}</span>
            </div>
        </button>
    );
}

function DestinationActionCard({ title, subtitle, icon: Icon, href, variant = "blue" }: { title: string, subtitle: string, icon: any, href?: string, variant?: "blue" | "rose" | "violet" | "teal" }) {
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

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-6 shadow-sm transition-all duration-300 block h-full no-underline hover:shadow-xl hover:-translate-y-1",
                v.border
            )}
        >
            <div className="flex flex-col h-full gap-6">
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                        v.icon,
                        v.hoverIcon
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all group-hover:bg-slate-100 dark:group-hover:bg-slate-700">
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                    </div>
                </div>
                <div className="mt-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">via</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{subtitle}</span>
                    </div>
                    <h4 className={cn(
                        "text-[19px] font-black text-slate-900 dark:text-white transition-colors tracking-tight leading-none",
                        v.text
                    )}>
                        {title}
                    </h4>
                </div>
            </div>
            {/* Minimalist corner accent */}
            <div className={cn(
                "absolute top-0 right-0 h-16 w-16 -mr-8 -mt-8 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-30",
                v.icon.split(' ')[0]
            )} />
        </a>
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
        blue: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-transparent shadow-sm",
        rose: "bg-gradient-to-br from-rose-500 to-pink-600 text-white border-transparent shadow-sm",
        violet: "bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent shadow-sm",
        teal: "bg-gradient-to-br from-teal-400 to-emerald-600 text-white border-transparent shadow-sm",
        emerald: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-sm",
        sky: "bg-gradient-to-br from-sky-400 to-blue-500 text-white border-transparent shadow-sm",
        amber: "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-transparent shadow-sm",
    };

    const isGradient = variant !== "white";

    const Content = (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-[2rem] p-5 shadow-sm transition-all border",
                variants[variant as keyof typeof variants] || variants.white,
                (href || onClick) && "cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
                className
            )}
        >
            {isGradient && (
                <Icon className="absolute -right-4 -top-4 h-24 w-24 opacity-20 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0" />
            )}
            <div className="relative z-10 flex items-center gap-4">
                <div className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors",
                    isGradient
                        ? "bg-white/20 text-white backdrop-blur-md"
                        : "bg-slate-50 border border-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                )}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className={cn(
                        "text-sm font-bold leading-snug",
                        !isGradient && "text-slate-900 dark:text-white"
                    )}>
                        {title}
                    </div>
                    {subtitle && (
                        <div className={cn(
                            "text-[11px] font-medium mt-0.5 opacity-80",
                            isGradient ? "text-white" : "text-slate-500 dark:text-slate-400"
                        )}>
                            {subtitle}
                        </div>
                    )}
                </div>
                {(href || onClick) && (
                    <ExternalLink className={cn(
                        "h-4 w-4 shrink-0 transition-opacity",
                        isGradient ? "text-white/40 group-hover:opacity-100" : "text-slate-300 opacity-0 group-hover:opacity-100"
                    )} />
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
        <div className="space-y-8">
            {/* Day Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{weekday}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{rest}</p>
                </div>
                <Badge
                    variant="secondary"
                    className="border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900"
                >
                    Est. {tripCurrency} {dayCost}
                    {convertedDayCost !== null && (
                        <span className="ml-1 opacity-80 font-normal">
                            (~ {userPreferredCurrency} {convertedDayCost})
                        </span>
                    )}
                </Badge>
            </div>

            {/* Day Note */}
            <div className="ml-1">
                <InlineNoteEditor
                    id={`day-${day.date}`}
                    initialValue={dayNote}
                    label="note for this day"
                    variant="minimal"
                    onSave={async (val) => {
                        if (!day.date) return;
                        try {
                            await updateDayNote(tripId, day.date, val);
                            toast.success("Day note saved");
                        } catch {
                            toast.error("Failed to save note");
                        }
                    }}
                />
            </div>

            {!hasRealIds && (
                <div
                    className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                    ⚠️ Preview mode: items cannot be edited until you save this trip.
                </div>
            )}

            {/* Add Item Top */}
            <div className="pl-8">
                <AddItemUnderDay
                    tripId={tripId}
                    dayIndex={dayIdx}
                    date={day.date}
                    tripStartDate={startDate}
                    destinationLat={tripConfig?.destinations?.[0]?.lat}
                    destinationLng={tripConfig?.destinations?.[0]?.lng}
                    preferenceTags={tripConfig?.interests}
                    nextOrderIndex={items.length > 0 ? items[0].order_index - 1 : nextOrderIndex}
                    tripCurrency={tripCurrency}
                />
            </div>

            {/* Timeline */}
            <div className="relative space-y-8 border-l-2 border-slate-200 dark:border-slate-800 pl-8">
                {blocks.map((b, i) => {
                    const place = b.place_id ? placesById.get(b.place_id) : null;
                    const forControls = items[i];

                    return (
                        <li key={`${day.date}-${i}`} className="relative list-none">
                            <div
                                className={cn(
                                    "absolute -left-[39px] top-5 h-5 w-5 rounded-full border-4 border-white dark:border-slate-900 shadow-sm z-10",
                                    whenBadgeClasses(b.when).dot
                                )}
                            />
                            <BlockCard
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
                                        label: "Est.",
                                        value: `${tripCurrency} ${Number(b.est_cost ?? 0).toFixed(2)}${fxSnapshot && userPreferredCurrency && tripCurrency !== userPreferredCurrency && b.est_cost
                                            ? ` (~ ${userPreferredCurrency} ${(convertUsingSnapshot(fxSnapshot, b.est_cost, tripCurrency, userPreferredCurrency) || 0).toFixed(2)})`
                                            : ""
                                            }${place?.cost_typical && place.cost_currency && place.cost_currency !== tripCurrency
                                                ? ` (${place.cost_currency} ${Number(place.cost_typical).toFixed(2)})`
                                                : ""
                                            }`,
                                    },
                                    {
                                        kind: "duration",
                                        label: "Duration",
                                        value: `${b.duration_min ?? 0}m`,
                                    },
                                    {
                                        kind: "travel",
                                        label: "Travel",
                                        value: `${b.travel_min_from_prev ?? 0}m`,
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
                        </li>
                    );
                })}
            </div>

            <div className="pl-8">
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
                />
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
    const whenUi = whenBadgeClasses(when);
    const hasMeta = !!place || !!coords;
    const hasStats = stats?.length > 0;

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
                isSelected
                    ? "border-blue-500 ring-1 ring-blue-500 shadow-md"
                    : "border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700"
            )}>
            {/* Header */}
            <div className="mb-3 relative z-10 flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <span
                        className={cn(
                            "mb-1 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            whenUi.badge
                        )}
                    >
                        {when}
                    </span>
                    <h3 className="text-base font-bold leading-tight text-slate-900 dark:text-white">
                        {title}
                    </h3>
                </div>
                {actions && (
                    <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                        {actions}
                    </div>
                )}
            </div>

            {/* Editable Notes */}
            <div className="relative z-10 mb-4 pl-1">
                <InlineNoteEditor
                    id={`block-${id}`}
                    initialValue={notes}
                    label="activity details"
                    variant="minimal"
                    onSave={(val) => onUpdateNote(id, val)}
                />
            </div>

            {/* Meta (Place + stats) */}
            {(hasMeta || hasStats) && (
                <div className="relative z-10 space-y-3 border-t border-slate-50 dark:border-slate-800 pt-2">
                    {place ? (
                        <div
                            className="flex w-fit items-center gap-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <MapPin className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                            <span>{place.name}</span>
                            {place.category && (
                                <span className="font-normal text-slate-400 dark:text-slate-500">
                                    • {place.category}
                                </span>
                            )}
                        </div>
                    ) : coords ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{coords}</span>
                        </div>
                    ) : null}

                    {hasStats && (
                        <div className="flex flex-wrap gap-2">
                            {stats.map((s, idx) => (
                                <StatChip
                                    key={idx}
                                    variant={s.kind}
                                    label={s.label}
                                    value={s.value}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
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
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium border",
                s.bg,
                s.text,
                s.border
            )}
        >
            <Icon className="h-3 w-3 opacity-70" />
            <span className="opacity-70">{label}:</span>
            <span>{value}</span>
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div
                    className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
                    <MapPin className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    No places added yet.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {places.map((p) => (
                <div
                    key={p.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-all hover:border-blue-200 dark:hover:border-slate-700 hover:shadow-md"
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="mb-1 text-sm font-bold text-slate-900 dark:text-white">
                                {p.name}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {p.category && (
                                    <span
                                        className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                        {p.category}
                                    </span>
                                )}
                                {p.popularity && (
                                    <span
                                        className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                                        <Star className="h-3 w-3" />
                                        {p.popularity}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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