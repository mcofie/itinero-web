"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useMemo, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { PreviewLike, Day, Place } from "./page";

import "leaflet/dist/leaflet.css";

// --- Server Actions Import ---
import { updateTripNote, updateDayNote, updateItemNote } from "@/app/trips/[id]/actions";

import { BlockActions, ItemRowLite } from "@/app/trips/BlockEditControls";
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
    Users2,
    Compass,
    NotebookPen,
    Pencil,
    Check,
    X,
    Loader2,
    ExternalLink,
} from "lucide-react";
import { AddItemUnderDay } from "@/app/trips/AddItemUnderDay";
import { DestinationMeta, TripConfig } from "@/app/trips/TripActionsClient";
import { formatDateRange } from "@/lib/trip-dates";

/* ---------- Map (allow nullable day) ---------- */
type LeafletMapProps = {
    theme?: "light" | "dark";
    day: Day | null;
    placesById: Map<string, Place>;
};

const LeafletMap = dynamic<LeafletMapProps>(
    () => import("@/app/preview/_leaflet/LeafletMap"),
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
}: {
    tripId: string;
    data: PreviewLike;
    startDate?: string;
}) {
    const { resolvedTheme } = useTheme();
    const theme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

    const [activeDayIdx, setActiveDayIdx] = useState(0);

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

    const inputs: TripInputs = data.trip_summary.inputs as TripInputs;

    // Extract Trip Currency
    const tripCurrency = data.trip_summary.currency ?? "USD";

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

    // Helper for Search Links
    const locationName = primaryDestination?.name ?? destinationMeta?.city ?? "Destination";

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
                                Trip Progress
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                    Day {Math.min(activeDayIdx + 1, Math.max(1, totalDays))}
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
                            className="pointer-events-auto inline-flex h-14 items-center justify-center rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 p-1.5 shadow-sm">
                            <TabsTrigger
                                value="overview"
                                className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                            >
                                Overview
                            </TabsTrigger>
                            <TabsTrigger
                                value="days"
                                className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                            >
                                Itinerary
                            </TabsTrigger>
                            <TabsTrigger
                                value="places"
                                className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                            >
                                Places
                            </TabsTrigger>
                            <TabsTrigger
                                value="raw"
                                className="rounded-full px-6 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 transition-all data-[state=active]:bg-slate-900 dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                            >
                                Tours
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
                                {/* Hero Destination Card */}
                                <div
                                    className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-slate-50 dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-950 p-8 shadow-sm">
                                    <div className="mb-8">
                                        <div className="mb-3 flex items-center gap-2">
                                            <div className="h-px w-8 bg-blue-600 dark:bg-blue-500" />
                                            <span
                                                className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                                Destination
                                            </span>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {primaryDestination?.name ??
                                                destinationMeta?.city ??
                                                "Destination"}
                                        </h2>
                                        {primaryDestination &&
                                            primaryDestination.lat != null &&
                                            primaryDestination.lng != null && (
                                                <div
                                                    className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                                    <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                                                    {primaryDestination.lat.toFixed(4)},{" "}
                                                    {primaryDestination.lng.toFixed(4)}
                                                </div>
                                            )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                        <MetricTile
                                            label="Dates"
                                            value={formatDateRange(metricStart, metricEnd)}
                                            icon={CalendarDays}
                                        />
                                        <MetricTile
                                            label="Duration"
                                            value={`${totalDays} Days`}
                                            icon={Clock3}
                                        />
                                        <MetricTile
                                            label="Places"
                                            value={String(data.places.length)}
                                            icon={MapPin}
                                        />
                                        <MetricTile
                                            label="Total Cost"
                                            value={`${tripCurrency} ${totals.estCost}`}
                                            highlight
                                            icon={DollarSign}
                                        />
                                        <MetricTile
                                            label="Activity Time"
                                            value={`${Math.round(totals.durationMin / 60)}h`}
                                            icon={Star}
                                        />
                                        <MetricTile
                                            label="Travel Time"
                                            value={`${Math.round(totals.travelMin / 60)}h`}
                                            icon={MoveRight}
                                        />
                                    </div>
                                </div>

                                {/* About & History Grid */}
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div
                                        className="h-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm transition-shadow hover:shadow-md">
                                        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                            About
                                        </h3>
                                        {destinationMeta?.description ? (
                                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                                {destinationMeta.description}
                                            </p>
                                        ) : (
                                            <p className="text-sm italic text-slate-400 dark:text-slate-500">
                                                No description available.
                                            </p>
                                        )}
                                    </div>
                                    <div
                                        className="h-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm transition-shadow hover:shadow-md">
                                        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                            History
                                        </h3>
                                        {destinationMeta?.history ? (
                                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                                {destinationMeta.history}
                                            </p>
                                        ) : (
                                            <p className="text-sm italic text-slate-400 dark:text-slate-500">
                                                No history details available.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info */}
                            <aside className="space-y-6">
                                {/* Trip General Notes */}
                                <div
                                    className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/10 p-6 shadow-sm">
                                    <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
                                        <NotebookPen className="h-4 w-4 text-amber-600 dark:text-amber-500" /> Trip Notes
                                    </h3>
                                    <InlineNoteEditor
                                        id="trip-notes"
                                        initialValue={inputs?.notes}
                                        label="general trip notes"
                                        variant="card"
                                        onSave={async (val) => {
                                            try {
                                                await updateTripNote(tripId, val);
                                                toast.success("Trip note saved");
                                            } catch {
                                                toast.error("Failed to save note");
                                            }
                                        }}
                                    />
                                </div>

                                <div
                                    className="sticky top-24 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                                    <h3 className="mb-6 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Local Guide
                                    </h3>
                                    <ul className="space-y-4">
                                        <SidebarFact
                                            label="Currency"
                                            value={destinationMeta?.currency_code}
                                            sub={
                                                destinationMeta?.fx_rate &&
                                                destinationMeta.fx_base &&
                                                `1 ${destinationMeta.fx_base} ≈ ${destinationMeta.fx_rate} ${destinationMeta.currency_code}`
                                            }
                                            icon={DollarSign}
                                        />

                                        {/* WEATHER: Links to Google */}
                                        <SidebarFact
                                            label="Weather"
                                            value={destinationMeta?.weather_desc}
                                            sub={
                                                destinationMeta?.weather_temp_c != null
                                                    ? `${destinationMeta.weather_temp_c.toFixed(1)}°C`
                                                    : undefined
                                            }
                                            icon={Cloud}
                                            href={`https://www.google.com/search?q=weather+${encodeURIComponent(locationName)}`}
                                        />

                                        <SidebarFact
                                            label="Plugs"
                                            value={joinArr(destinationMeta?.plugs)}
                                            icon={Plug}
                                        />
                                        <SidebarFact
                                            label="Languages"
                                            value={joinArr(destinationMeta?.languages)}
                                            icon={LanguagesIcon}
                                        />
                                        <SidebarFact
                                            label="Transport"
                                            value={joinArr(destinationMeta?.transport)}
                                            icon={TrainFront}
                                        />

                                        {/* eSIM: Links to Airalo */}
                                        <SidebarFact
                                            label="eSIM"
                                            value={destinationMeta?.esim_provider || "Find eSIM"}
                                            icon={SmartphoneNfc}
                                            href="https://www.airalo.com/"
                                        />
                                    </ul>
                                </div>
                            </aside>
                        </div>
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
                                                    Day {i + 1}
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
                                />
                            </div>
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
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Places</h2>
                                <span
                                    className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
                                    {data.places?.length ?? 0} Locations
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
                                    Coming Soon
                                </div>
                                <h2 className="mb-4 text-3xl font-extrabold text-slate-900 dark:text-white">
                                    Explore with a Local
                                </h2>
                                <p className="mb-10 leading-relaxed text-slate-600 dark:text-slate-400">
                                    We&apos;re vetting the best local guides to bring you exclusive,
                                    verified experiences that plug directly into your itinerary.
                                </p>

                                <div className="grid gap-4 text-left sm:grid-cols-2">
                                    <div
                                        className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                                        <Users2 className="mb-3 h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Verified Guides
                                        </h4>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Locals vetted for quality & safety.
                                        </p>
                                    </div>
                                    <div
                                        className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                                        <Compass className="mb-3 h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Curated Tours
                                        </h4>
                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Unique experiences you can&apos;t find elsewhere.
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
                    placeholder={`Add ${label?.toLowerCase() || "notes"}...`}
                    className="bg-white dark:bg-slate-950 min-h-[100px] text-sm border-slate-200 dark:border-slate-800 dark:text-white"
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isSaving}>
                        <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> :
                            <Check className="h-3.5 w-3.5 mr-1" />}
                        {isSaving ? "Saving..." : "Save"}
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
                Add {label || "notes"}
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

/* ---------- Updated Sidebar Fact ---------- */
function SidebarFact({
    label,
    value,
    sub,
    icon: Icon,
    href,
}: {
    label: string;
    value?: React.ReactNode;
    sub?: React.ReactNode;
    icon: React.ElementType;
    href?: string;
}) {
    if (!value && !sub) return null;

    const Content = (
        <div className={cn("flex items-start gap-3 group", href && "cursor-pointer")}>
            <div
                className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                    href
                        ? "bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:group-hover:bg-blue-600"
                        : "bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                )}
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 py-0.5 flex-1">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">
                        {label}
                    </span>
                    {href && (
                        <ExternalLink
                            className="h-3 w-3 text-blue-400 dark:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                </div>
                {value && (
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 leading-tight">
                        {value}
                    </div>
                )}
                {sub && (
                    <div className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {sub}
                    </div>
                )}
            </div>
        </div>
    );

    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-slate-50/50 dark:hover:bg-slate-800/50 -mx-2 px-2 py-2 rounded-2xl transition-colors"
            >
                {Content}
            </a>
        );
    }

    return Content;
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
                                        value: `${tripCurrency} ${b.est_cost ?? 0}`,
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
    onUpdateNote
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
}) {
    const whenUi = whenBadgeClasses(when);
    const hasMeta = !!place || !!coords;
    const hasStats = stats?.length > 0;

    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:hover:border-slate-700">
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