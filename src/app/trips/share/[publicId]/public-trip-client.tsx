// app/share/[publicId]/public-trip-client.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    DollarSign,
    ExternalLink,
    Link as LinkIcon,
    MapPin,
    Clock,
    Navigation,
    Utensils,
    Camera,
    Bed,
    Ticket,
} from "lucide-react";

/* ---------------- Types (loose but explicit) ---------------- */

type When = "morning" | "afternoon" | "evening" | string;

type Block = {
    when?: When | null;
    title?: string | null;
    notes?: string | null;
    est_cost?: number | null;
    duration_min?: number | null;
    travel_min_from_prev?: number | null;
    place_id?: string | null;
};

type PublicDay = {
    date?: string | null;
    blocks: Block[];
};

type PlaceLite = {
    id: string;
    name: string;
    category?: string | null;
    lat?: number | null;
    lng?: number | null;
};

type TripSummaryLoose = {
    start_date?: string | null;
    end_date?: string | null;
    destinations?: Array<{ name?: string; country_code?: string }>;
} | null;

/** Minimal props that LeafletMap actually needs */
type LeafletDayProp = { date: string; blocks: Block[] };
type LeafletPlaceProp = {
    id: string;
    name?: string;
    category?: string | null;
    lat?: number | null;
    lng?: number | null;
};

type LeafletMapProps = {
    theme?: "light" | "dark";
    day: LeafletDayProp;
    placesById: Map<string, LeafletPlaceProp>;
};

const LeafletMap = dynamic<LeafletMapProps>(
    () =>
        import("@/app/(main)/preview/_leaflet/LeafletMap").then(
            (m) => m.default as React.ComponentType<LeafletMapProps>
        ),
    { ssr: false }
);

type Props = {
    tripId: string;
    publicId: string;
    currency: string;
    estTotalCost: number | null;
    tripSummary: TripSummaryLoose;
    days: PublicDay[];
    places: PlaceLite[];
};

/* ---------------- Adapters ---------------- */

function toLeafletDay(d?: PublicDay): LeafletDayProp {
    // Guarantee a non-empty string date for LeafletMap
    const safeDate = (d?.date ?? "1970-01-01") || "1970-01-01";
    return {
        date: safeDate,
        blocks: Array.isArray(d?.blocks) ? d!.blocks : [],
    };
}

function toPlacesMap(src: PlaceLite[]): Map<string, LeafletPlaceProp> {
    const map = new Map<string, LeafletPlaceProp>();
    for (const p of Array.isArray(src) ? src : []) {
        if (p && typeof p.id === "string") {
            map.set(p.id, {
                id: p.id,
                name: p.name,
                category: p.category ?? null,
                lat: typeof p.lat === "number" ? p.lat : null,
                lng: typeof p.lng === "number" ? p.lng : null,
            });
        }
    }
    return map;
}

function getCategoryIcon(category?: string | null) {
    const c = (category || "").toLowerCase();
    if (c.includes("food") || c.includes("restaurant") || c.includes("eat")) return Utensils;
    if (c.includes("hotel") || c.includes("stay") || c.includes("lodging")) return Bed;
    if (c.includes("museum") || c.includes("art") || c.includes("culture")) return Ticket;
    if (c.includes("park") || c.includes("nature") || c.includes("view")) return Camera;
    return MapPin;
}

export default function PublicTripClient({
    publicId,
    currency,
    estTotalCost,
    tripSummary,
    days,
    places,
}: Props) {
    const { resolvedTheme } = useTheme();
    const theme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

    const [activeDay, setActiveDay] = React.useState(0);

    // Map place.id -> place (typed for LeafletMap)
    const placesById = React.useMemo<Map<string, LeafletPlaceProp>>(
        () => toPlacesMap(places),
        [places]
    );

    const summary = tripSummary ?? {};
    const dest = (summary?.destinations?.[0] ?? null) as
        | { name?: string; country_code?: string }
        | null;

    const dateRange = formatDateRange(
        summary?.start_date ?? undefined,
        summary?.end_date ?? undefined
    );

    return (
        <div className="space-y-6">
            {/* SHARE BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1.5 font-medium">
                        <CalendarDays className="h-4 w-4 text-slate-500" />
                        {dateRange ?? "Flexible dates"}
                    </Badge>
                    {typeof estTotalCost === "number" && (
                        <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1.5 font-medium border-slate-200 dark:border-slate-700">
                            <DollarSign className="h-4 w-4 text-slate-500" />
                            est. {currency} {Math.round(estTotalCost).toLocaleString()}
                        </Badge>
                    )}
                    {dest?.name && (
                        <Badge variant="outline" className="gap-1.5 rounded-full px-3 py-1.5 font-medium border-slate-200 dark:border-slate-700">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            {dest.name}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openSelf()} className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in new tab
                    </Button>
                    <Button
                        size="sm"
                        className="gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-600/20"
                        onClick={() => copyShareUrl(publicId)}
                        title="Copy share link"
                    >
                        <LinkIcon className="h-4 w-4" />
                        Copy link
                    </Button>
                </div>
            </div>

            {/* DISTINCT LAYOUT: left timeline (scrolls internally), right map */}
            <div className="grid gap-6 lg:grid-cols-[minmax(400px,1fr)_minmax(500px,1.2fr)] h-[calc(100vh-200px)] min-h-[600px]">
                {/* LEFT: days/timeline */}
                <Card className="flex flex-col overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 rounded-3xl">
                    {/* Day Selector Strip */}
                    <div className="border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                        <div className="flex w-full gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {days.map((d, i) => {
                                const dateObj = d.date ? new Date(d.date) : null;
                                const dayName = dateObj ? dateObj.toLocaleDateString('en-US', { weekday: 'short' }) : `Day`;
                                const dayNum = dateObj ? dateObj.getDate() : i + 1;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setActiveDay(i)}
                                        className={cn(
                                            "flex min-w-[70px] flex-col items-center justify-center rounded-2xl py-2 px-3 transition-all duration-200",
                                            i === activeDay
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105"
                                                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                        )}
                                    >
                                        <span className={cn("text-xs font-medium uppercase tracking-wider opacity-80", i === activeDay ? "text-blue-100" : "")}>
                                            {dayName}
                                        </span>
                                        <span className="text-lg font-bold leading-none mt-1">
                                            {dayNum}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <ScrollArea className="flex-1 bg-white dark:bg-slate-950">
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeDay}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-8 ml-2"
                                >
                                    {(days?.[activeDay]?.blocks ?? []).map((b: Block, idx: number) => {
                                        const place = b?.place_id ? placesById.get(b.place_id) : null;
                                        const CatIcon = getCategoryIcon(place?.category);

                                        return (
                                            <div key={idx} className="relative">
                                                {/* Timeline Dot */}
                                                <div className="absolute -left-[25px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 border-2 border-white ring-1 ring-blue-100 dark:bg-blue-900/30 dark:border-slate-900 dark:ring-blue-800">
                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{idx + 1}</span>
                                                </div>

                                                <div className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-white hover:shadow-md hover:border-blue-100 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:hover:border-slate-700">
                                                    <div className="flex flex-col gap-3">
                                                        {/* Header: Time & Title */}
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
                                                                    {b?.title ?? "Untitled Activity"}
                                                                </h3>
                                                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    {b?.when ?? "Flexible time"}
                                                                </div>
                                                            </div>
                                                            {place && (
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                                                                    <CatIcon className="h-5 w-5" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Place Details */}
                                                        {place && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700 w-fit">
                                                                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                                <span className="font-medium">{place.name}</span>
                                                                {place.category && (
                                                                    <span className="text-slate-400 text-xs border-l border-slate-200 pl-2 ml-2 dark:border-slate-600">
                                                                        {place.category}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Notes */}
                                                        {b?.notes && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-yellow-50/50 dark:bg-yellow-900/10 p-3 rounded-xl border border-yellow-100/50 dark:border-yellow-900/20">
                                                                {b.notes}
                                                            </p>
                                                        )}

                                                        {/* Footer Stats */}
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {b?.est_cost ? (
                                                                <Chip icon={DollarSign} label="Cost" value={fmtMoney(b.est_cost)} />
                                                            ) : null}
                                                            {b?.duration_min ? (
                                                                <Chip icon={Clock} label="Duration" value={fmtMin(b.duration_min)} />
                                                            ) : null}
                                                            {b?.travel_min_from_prev ? (
                                                                <Chip icon={Navigation} label="Travel" value={fmtMin(b.travel_min_from_prev)} />
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {!days?.[activeDay]?.blocks?.length && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 dark:bg-slate-800">
                                                <CalendarDays className="h-6 w-6 opacity-50" />
                                            </div>
                                            <p>No activities planned for this day.</p>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </Card>

                {/* RIGHT: map */}
                <Card className="overflow-hidden border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-900 rounded-3xl h-full min-h-[500px]">
                    <LeafletMap
                        key={theme} // force remount on theme change
                        theme={theme}
                        day={toLeafletDay(days?.[activeDay])}
                        placesById={placesById}
                    />
                </Card>
            </div>
        </div>
    );
}

/* ---------------- tiny bits ---------------- */

function openSelf() {
    if (typeof window === "undefined") return;
    window.open(window.location.href, "_blank", "noopener");
}

async function copyShareUrl(publicId: string) {
    const url =
        typeof window !== "undefined"
            ? window.location.origin + "/share/" + publicId
            : `/t/${publicId}`;
    try {
        if (navigator.share) {
            await navigator.share({ url, title: "Shared Trip • Itinero" });
            return;
        }
    } catch {
        // fall through to clipboard
    }
    try {
        await navigator.clipboard.writeText(url);
    } catch {
        // noop
    }
}

function Chip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Icon className="h-3 w-3 text-slate-400" />
            <span className="opacity-70">{label}:</span>
            <span className="text-slate-900 dark:text-white">{value}</span>
        </span>
    );
}

function fmtMin(n: unknown): string {
    const v = typeof n === "number" ? n : Number(n);
    return Number.isFinite(v) ? `${v}m` : "—";
}

function fmtMoney(n: unknown): string {
    const v = typeof n === "number" ? n : Number(n);
    return Number.isFinite(v) ? `$${v}` : "—";
}

function formatDateRange(start?: string, end?: string) {
    if (!start && !end) return null;
    const s = start ? new Date(start + "T00:00:00") : null;
    const e = end ? new Date(end + "T00:00:00") : null;
    const fmt = (d: Date) =>
        d.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    if (s && e) return `${fmt(s)} → ${fmt(e)}`;
    if (s) return fmt(s);
    if (e) return fmt(e);
    return null;
}