"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { PreviewLike, Day, Place } from "./page";

import "leaflet/dist/leaflet.css";

import { BlockActions, ItemRowLite } from "@/app/trips/BlockEditControls";
import { cn } from "@/lib/utils";
import {
    Cloud,
    DollarSign,
    Globe,
    Hourglass,
    MoveRight,
    SmartphoneNfc,
    Thermometer,
    TrainFront,
    Plug,
    Languages as LanguagesIcon,
    MapPin,
    Tag,
    Star,
    Clock3,
    CalendarDays,
    Lock,
    Users2,
    Compass,
    ChevronDown
} from "lucide-react";
import { AddItemUnderDay } from "@/app/trips/AddItemUnderDay";
import { DestinationMeta, TripConfig } from "@/app/trips/TripActionsClient";

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

/** ---------- helpers for safe inputs typing ---------- */
type TripInputs = { interests?: string[] } | undefined;

function hasInterests(v: unknown): v is { interests: string[] } {
    if (!v || typeof v !== "object") return false;
    const maybe = v as { interests?: unknown };
    return Array.isArray(maybe.interests) && maybe.interests.every((t): t is string => typeof t === "string");
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
    const progressPct = totalDays ? Math.min(100, Math.round(((activeDayIdx + 1) / totalDays) * 100)) : 0;

    const inputs: TripInputs = data.trip_summary.inputs as TripInputs;

    const tripConfig: TripConfig | null = useMemo(() => {
        const raw = data.trip_summary.inputs;
        try {
            return (raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : null) as TripConfig | null;
        } catch {
            return null;
        }
    }, [data.trip_summary.inputs]);

    const destinationMeta = React.useMemo(() => {
        const anyCfg = tripConfig as unknown as { destination_meta?: DestinationMeta } | null;
        return anyCfg?.destination_meta ?? null;
    }, [tripConfig]);

    const primaryDestination = tripConfig?.destinations?.[0] ?? null;
    const activeDay: Day | null = data.days[activeDayIdx] ?? null;

    const itemsForControls: ItemRowLite[] = (activeDay?.blocks ?? []).map((b, i) => {
        const anyB = b as unknown as { id?: string; order_index?: number };
        return {
            id: anyB.id ?? `no-id-${i}`,
            trip_id: tripId,
            day_index: i,
            date: activeDay?.date ?? null,
            order_index: Number.isFinite(anyB.order_index) ? (anyB.order_index as number) : i,
            when: b.when,
            place_id: b.place_id ?? null,
            title: b.title,
            est_cost: b.est_cost ?? null,
            duration_min: b.duration_min ?? null,
            travel_min_from_prev: b.travel_min_from_prev ?? null,
            notes: b.notes ?? null,
        };
    });

    const nextOrderIndex = itemsForControls.length;

    const totals = useMemo(() => {
        const allBlocks = data.days.flatMap((d) => d.blocks);
        const cost = allBlocks.reduce((acc, b) => acc + (Number(b.est_cost) || 0), 0);
        const duration = allBlocks.reduce((acc, b) => acc + (Number(b.duration_min) || 0), 0);
        const travel = allBlocks.reduce((acc, b) => acc + (Number(b.travel_min_from_prev) || 0), 0);
        return {
            estCost: Math.max(0, Math.round(cost)),
            durationMin: duration,
            travelMin: travel,
        };
    }, [data.days]);

    return (
        <Card className="overflow-hidden border-none shadow-none bg-transparent pb-10"> {/* Added padding bottom */}
            <CardContent className="p-0 space-y-8">

                {/* Progress & Interests Header */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="space-y-1">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Trip Progress</div>
                            <div className="text-sm font-medium text-slate-900">
                                Day {Math.min(activeDayIdx + 1, Math.max(1, totalDays))} of {totalDays || "—"}
                            </div>
                        </div>

                        {hasInterests(inputs) && inputs.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {inputs.interests.map((t) => (
                                    <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-xs font-medium text-slate-600 capitalize">
                            {emojiFor(t)} {t}
                        </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    {/* Styled Tabs List */}
                    <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                        <TabsList className="inline-flex h-12 items-center justify-start rounded-full bg-slate-100/80 p-1 text-slate-500 w-full md:w-auto">
                            <TabsTrigger value="overview" className="rounded-full px-6 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
                            <TabsTrigger value="days" className="rounded-full px-6 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Itinerary</TabsTrigger>
                            <TabsTrigger value="places" className="rounded-full px-6 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Places</TabsTrigger>
                            <TabsTrigger value="raw" className="rounded-full px-6 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Tours</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ---------- OVERVIEW TAB ---------- */}
                    <TabsContent value="overview" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                            <div className="space-y-6">

                                {/* Destination Card */}
                                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                                    <div className="mb-6">
                                        <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Destination</div>
                                        <h2 className="text-3xl font-extrabold text-slate-900">
                                            {primaryDestination?.name ?? destinationMeta?.city ?? "Destination"}
                                        </h2>
                                        {primaryDestination && (primaryDestination.lat ?? null) != null && (primaryDestination.lng ?? null) != null && (
                                            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-400">
                                                <MapPin className="h-3 w-3" />
                                                {primaryDestination.lat.toFixed(4)}, {primaryDestination.lng.toFixed(4)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <MetricTile label="Dates" value={`${formatISODate(startDate)} → ${formatISODate(data.days.at(-1)?.date)}`} />
                                        <MetricTile label="Duration" value={`${totalDays} Days`} />
                                        <MetricTile label="Places" value={data.places.length} />
                                        <MetricTile label="Total Cost" value={`$${totals.estCost}`} highlight />
                                        <MetricTile label="Activity Time" value={`${Math.round(totals.durationMin / 60)}h`} />
                                        <MetricTile label="Travel Time" value={`${Math.round(totals.travelMin / 60)}h`} />
                                    </div>
                                </div>

                                {/* About & History */}
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-full">
                                        <h3 className="text-base font-bold text-slate-900 mb-3">About</h3>
                                        {destinationMeta?.description ? (
                                            <p className="text-sm leading-relaxed text-slate-600">{destinationMeta.description}</p>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No description available.</p>
                                        )}
                                    </div>
                                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm h-full">
                                        <h3 className="text-base font-bold text-slate-900 mb-3">History</h3>
                                        {destinationMeta?.history ? (
                                            <p className="text-sm leading-relaxed text-slate-600">{destinationMeta.history}</p>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No history details available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Info */}
                            <aside className="space-y-6">
                                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
                                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-blue-600" /> Local Guide
                                    </h3>
                                    <ul className="space-y-4">
                                        <SidebarFact label="Currency" value={destinationMeta?.currency_code} sub={destinationMeta?.fx_rate && `1 ${destinationMeta.fx_base} ≈ ${destinationMeta.fx_rate} ${destinationMeta.currency_code}`} icon={DollarSign} />
                                        <SidebarFact label="Weather" value={destinationMeta?.weather_desc} sub={destinationMeta?.weather_temp_c && `${destinationMeta.weather_temp_c.toFixed(1)}°C`} icon={Cloud} />
                                        <SidebarFact label="Plugs" value={joinArr(destinationMeta?.plugs)} icon={Plug} />
                                        <SidebarFact label="Languages" value={joinArr(destinationMeta?.languages)} icon={LanguagesIcon} />
                                        <SidebarFact label="Transport" value={joinArr(destinationMeta?.transport)} icon={TrainFront} />
                                        <SidebarFact label="eSIM" value={destinationMeta?.esim_provider} icon={SmartphoneNfc} />
                                    </ul>
                                </div>
                            </aside>
                        </div>
                    </TabsContent>

                    {/* ---------- ITINERARY TAB ---------- */}
                    <TabsContent value="days" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* 50/50 Split Grid with equal height constraint */}
                        <div className="grid gap-6 lg:grid-cols-2 h-[calc(100vh-240px)]">

                            {/* Left: Timeline */}
                            <div className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full">
                                {/* Day Tabs */}
                                <div className="border-b border-slate-100 bg-slate-50/50 p-4 shrink-0">
                                    <ScrollArea className="w-full whitespace-nowrap">
                                        <div className="flex w-max gap-2 pb-2">
                                            {data.days.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActiveDayIdx(i)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full text-xs font-bold transition-all border",
                                                        activeDayIdx === i
                                                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                    )}
                                                >
                                                    Day {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                </div>

                                {/* Scrollable Content */}
                                <ScrollArea className="flex-1 bg-slate-50/30 overflow-y-auto">
                                    <div className="p-4 md:p-6 pb-20">
                                        <EditableDay
                                            dayIdx={activeDayIdx}
                                            day={activeDay}
                                            items={itemsForControls}
                                            nextOrderIndex={nextOrderIndex}
                                            tripId={tripId}
                                            startDate={startDate}
                                            tripConfig={tripConfig}
                                            placesById={placesById}
                                        />
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Right: Map (Sticky) */}
                            <div className="hidden lg:block rounded-3xl border border-slate-200 bg-slate-100 overflow-hidden shadow-sm h-full sticky top-24">
                                <LeafletMap day={activeDay} placesById={placesById} theme={theme} />
                            </div>
                        </div>
                    </TabsContent>

                    {/* ---------- PLACES TAB ---------- */}
                    <TabsContent value="places" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-slate-900">All Places</h2>
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                      {data.places?.length ?? 0} Locations
                   </span>
                            </div>
                            <PlacesList places={data.places} />
                        </div>
                    </TabsContent>

                    {/* ---------- TOURS TAB ---------- */}
                    <TabsContent value="raw" className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-12 text-center overflow-hidden shadow-sm">
                            <div className="relative z-10 max-w-lg mx-auto">
                                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 mb-6">
                                    Coming Soon
                                </div>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Explore with a Local</h2>
                                <p className="text-slate-600 mb-10 leading-relaxed">
                                    We're vetting the best local guides to bring you exclusive, verified experiences that plug directly into your itinerary.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4 text-left">
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <Users2 className="h-6 w-6 text-blue-600 mb-3" />
                                        <h4 className="font-bold text-slate-900 text-sm">Verified Guides</h4>
                                        <p className="text-xs text-slate-500 mt-1">Locals vetted for quality & safety.</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <Compass className="h-6 w-6 text-purple-600 mb-3" />
                                        <h4 className="font-bold text-slate-900 text-sm">Curated Tours</h4>
                                        <p className="text-xs text-slate-500 mt-1">Unique experiences you can't find elsewhere.</p>
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

function MetricTile({ label, value, highlight }: { label: string, value: React.ReactNode, highlight?: boolean }) {
    return (
        <div className={cn(
            "flex flex-col gap-1 rounded-2xl border p-4 transition-all",
            highlight
                ? "bg-blue-50 border-blue-100 text-blue-900"
                : "bg-slate-50 border-slate-100 text-slate-700"
        )}>
            <span className={cn("text-[10px] font-bold uppercase tracking-wider", highlight ? "text-blue-400" : "text-slate-400")}>{label}</span>
            <span className={cn("text-lg font-bold truncate", highlight ? "text-blue-700" : "text-slate-900")}>{value}</span>
        </div>
    )
}

function SidebarFact({ label, value, sub, icon: Icon }: { label: string, value?: any, sub?: any, icon: any }) {
    if (!value && !sub) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900">{label}</div>
                {value && <div className="text-xs text-slate-600 font-medium mt-0.5">{value}</div>}
                {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
            </div>
        </div>
    )
}

/* ---------- Editable day renderer ---------- */

type StatKind = "cost" | "duration" | "travel";

function EditableDay({
                         dayIdx,
                         day,
                         items,
                         nextOrderIndex,
                         tripId,
                         placesById,
                         startDate,
                         tripConfig,
                     }: {
    dayIdx: number;
    day: Day | null;
    items: ItemRowLite[];
    nextOrderIndex: number;
    tripId: string;
    placesById: Map<string, Place>;
    startDate?: string;
    tripConfig: TripConfig | null;
}) {
    const blocks = React.useMemo(() => day?.blocks ?? [], [day?.blocks]);

    const dayCost = useMemo(
        () => Math.max(0, Math.round(blocks.reduce((acc, b) => acc + (Number(b.est_cost) || 0), 0))),
        [blocks]
    );

    const hasRealIds = items.every((it) => !String(it.id).startsWith("no-id-"));

    if (!day) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <CalendarDays className="h-6 w-6 text-slate-300" />
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-slate-900">Empty Day</p>
                    <p className="text-xs text-slate-500">Add your first activity to get started.</p>
                </div>
                <AddItemUnderDay
                    tripId={tripId}
                    dayIndex={dayIdx}
                    date={null}
                    tripStartDate={startDate}
                    destinationLat={tripConfig?.destinations?.[0]?.lat}
                    destinationLng={tripConfig?.destinations?.[0]?.lng}
                    preferenceTags={tripConfig?.interests}
                    nextOrderIndex={nextOrderIndex}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Day Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-extrabold text-slate-900">{formatISODate(day.date).split(',')[0]}</h3>
                    <p className="text-sm font-medium text-slate-500">{formatISODate(day.date).split(',')[1]}</p>
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1">
                    Est. ${dayCost}
                </Badge>
            </div>

            {!hasRealIds && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                    ⚠️ Preview mode: items cannot be edited until you save this trip.
                </div>
            )}

            {/* Timeline */}
            <div className="relative pl-8 border-l-2 border-slate-200 space-y-8">
                {blocks.map((b, i) => {
                    const place = b.place_id ? placesById.get(b.place_id) : null;
                    const forControls = items[i];

                    // Convert block alternatives to expected format if needed
                    // but for now we'll skip displaying alternatives in this simplified view if not needed
                    // or adapt BlockCard to accept them.

                    return (
                        <li key={`${day.date}-${i}`} className="relative list-none">
                            <div className={cn(
                                "absolute -left-[39px] top-5 h-5 w-5 rounded-full border-4 border-white shadow-sm z-10",
                                whenBadgeClasses(b.when).dot
                            )} />
                            <BlockCard
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
                                    { kind: "cost", label: "Est.", value: `$${b.est_cost ?? 0}` },
                                    { kind: "duration", label: "Duration", value: `${b.duration_min ?? 0}m` },
                                    { kind: "travel", label: "Travel", value: `${b.travel_min_from_prev ?? 0}m` },
                                ]}
                                actions={<BlockActions item={forControls} />}
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

/* ---------- Block Card Component (Restored & Styled) ---------- */

function BlockCard({
                       title,
                       when,
                       place,
                       notes,
                       coords,
                       stats,
                       actions,
                   }: {
    title: string;
    when: "morning" | "afternoon" | "evening";
    place: Place | null;
    notes?: string;
    coords?: string | null;
    stats: Array<{ kind: StatKind; label: string; value: string | number }>;
    actions?: React.ReactNode;
}) {
    const whenUi = whenBadgeClasses(when);
    const hasMeta = !!place || !!coords;
    const hasNotes = !!notes?.trim();
    const hasStats = stats?.length > 0;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200 group-hover:-translate-y-0.5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3 relative z-10">
                <div className="space-y-1">
             <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1", whenUi.badge)}>
                {when}
             </span>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>
                </div>
                {actions && <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">{actions}</div>}
            </div>

            {/* Notes */}
            {hasNotes && (
                <p className="relative z-10 text-sm text-slate-600 leading-relaxed mb-4 pl-3 border-l-2 border-slate-100">
                    {notes}
                </p>
            )}

            {/* Meta (Place) */}
            {(hasMeta || hasStats) && (
                <div className="relative z-10 space-y-3 pt-2 border-t border-slate-50">
                    {place ? (
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                            <span>{place.name}</span>
                            {place.category && <span className="text-slate-400 font-normal">• {place.category}</span>}
                        </div>
                    ) : coords ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{coords}</span>
                        </div>
                    ) : null}

                    {/* Stats Chips */}
                    {hasStats && (
                        <div className="flex flex-wrap gap-2">
                            {stats.map((s, idx) => (
                                <StatChip key={idx} variant={s.kind} label={s.label} value={s.value} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function StatChip({ variant, label, value }: { variant: StatKind, label: string, value: string | number }) {
    const styles: Record<StatKind, { bg: string, text: string, border: string, icon: any }> = {
        cost: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: DollarSign },
        duration: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: Clock3 },
        travel: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", icon: MoveRight },
    };
    const s = styles[variant];
    const Icon = s.icon;

    return (
        <div className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium border", s.bg, s.text, s.border)}>
            <Icon className="h-3 w-3 opacity-70" />
            <span className="opacity-70">{label}:</span>
            <span>{value}</span>
        </div>
    )
}

/* ---------- Places List ---------- */
function PlacesList({ places }: { places: Place[] }) {
    if (!places?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                    <MapPin className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">No places added yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {places.map((p) => (
                <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all hover:border-blue-200">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm mb-1">{p.name}</h3>
                            <div className="flex flex-wrap gap-2">
                                {p.category && <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">{p.category}</span>}
                                {p.popularity && <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 flex items-center gap-1"><Star className="h-3 w-3" /> {p.popularity}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ---------- Utils ---------- */
function formatISODate(x?: string) {
    if (!x) return "—";
    try {
        const d = new Date(x);
        return d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
    } catch { return x; }
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
    if (w === "morning") return { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-400 border-amber-100" };
    if (w === "afternoon") return { badge: "bg-orange-50 text-orange-700", dot: "bg-orange-400 border-orange-100" };
    return { badge: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-400 border-indigo-100" };
}