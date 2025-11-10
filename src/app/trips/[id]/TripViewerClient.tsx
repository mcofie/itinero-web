// app/trips/[id]/TripViewerClient.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
        <Card className="overflow-hidden border-border border shadow-sm">
            <CardContent className="space-y-6 py-6">
                {hasInterests(inputs) && inputs.interests.length > 0 && (
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Interests</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {inputs.interests.map((t) => (
                                <Badge key={t} variant="outline" className="capitalize border border-border">
                                    {emojiFor(t)} {t}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-1">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Trip progress</span>
                        <span>Day {Math.min(activeDayIdx + 1, Math.max(1, totalDays))} of {totalDays || "—"}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border-border border bg-muted/40">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                </div>

                <Tabs defaultValue="overview">
                    {/* Scrollable tab list on mobile */}
                    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                        <TabsList className="grid min-w-[520px] grid-cols-4 sm:min-w-0 sm:w-full">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="days">Days</TabsTrigger>
                            <TabsTrigger value="places">Places</TabsTrigger>
                            <TabsTrigger value="raw">Raw</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ---------- OVERVIEW ---------- */}
                    <TabsContent value="overview" className="mt-4">
                        <div className="grid gap-4 lg:grid-cols-[minmax(520px,1fr)_380px]">
                            <div className="space-y-4">
                                <div className="space-y-4 rounded-2xl border-border border bg-card p-4">
                                    <div className="space-y-1">
                                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Destination</div>
                                        <div className="text-xl font-semibold">
                                            {primaryDestination?.name ?? destinationMeta?.city ?? "Destination"}{" "}
                                        </div>
                                        {primaryDestination && (primaryDestination.lat ?? null) != null && (primaryDestination.lng ?? null) != null ? (
                                            <div className="text-xs text-muted-foreground">
                                                {primaryDestination.lat.toFixed(4)}, {primaryDestination.lng.toFixed(4)}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                        <Metric label="Dates" value={`${formatISODate(startDate)} → ${formatISODate(data.days.at(-1)?.date)}`} />
                                        <Metric label="Trip length" value={`${totalDays} day${totalDays === 1 ? "" : "s"}`} />
                                        <Metric label="Places" value={data.places.length} />
                                        <Metric label="Est. total cost" value={`$${totals.estCost}`} />
                                        <Metric label="Planned duration" value={`${totals.durationMin}m`} />
                                        <Metric label="Est. travel time" value={`${totals.travelMin}m`} />
                                    </div>

                                    {hasInterests(inputs) && inputs.interests.length > 0 && (
                                        <div>
                                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Focus</div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {inputs.interests.map((t) => (
                                                    <Badge key={`ov-${t}`} variant="secondary" className="capitalize">
                                                        {emojiFor(t)} {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-2xl border-border border bg-card p-4">
                                    <div className="mb-2 text-sm font-semibold">About this destination</div>
                                    {destinationMeta?.description ? (
                                        <p className="text-sm leading-relaxed text-muted-foreground">{destinationMeta.description}</p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No description yet. Add a short overview of the destination—vibe, highlights, seasons, and must-knows.
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-2xl border-border border bg-card p-4">
                                    <div className="mb-2 text-sm font-semibold">History</div>
                                    {destinationMeta?.history ? (
                                        <p className="text-sm leading-relaxed text-muted-foreground">{destinationMeta.history}</p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No history added yet. Summarize key historical periods, influences, and notable events.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <aside className="lg:sticky lg:top-20 lg:self-start">
                                <div className="space-y-3 rounded-2xl border-border border bg-card p-4">
                                    <div className="text-sm font-semibold">Know before you go</div>
                                    <ul className="mt-2 space-y-2 text-sm">
                                        {(destinationMeta?.currency_code || destinationMeta?.fx_rate) && (
                                            <li className="flex items-start gap-2">
                                                <DollarSign className="mt-0.5 h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">Currency</div>
                                                    <div className="text-muted-foreground">
                                                        {destinationMeta?.currency_code ?? "—"}
                                                        {destinationMeta?.fx_rate && destinationMeta?.fx_base
                                                            ? ` · 1 ${destinationMeta.fx_base} ≈ ${destinationMeta.fx_rate} ${destinationMeta.currency_code}`
                                                            : null}
                                                    </div>
                                                    {destinationMeta?.money_tools?.length ? (
                                                        <div className="text-muted-foreground">Helpful: {destinationMeta.money_tools.join(", ")}</div>
                                                    ) : null}
                                                </div>
                                            </li>
                                        )}

                                        {destinationMeta?.plugs?.length ? (
                                            <li className="flex items-start gap-2">
                                                <Plug className="mt-0.5 h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">Plugs</div>
                                                    <div className="text-muted-foreground">{destinationMeta.plugs.join(", ")}</div>
                                                </div>
                                            </li>
                                        ) : null}

                                        {destinationMeta?.languages?.length ? (
                                            <li className="flex items-start gap-2">
                                                <LanguagesIcon className="mt-0.5 h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">Languages</div>
                                                    <div className="text-muted-foreground">{destinationMeta.languages.join(", ")}</div>
                                                </div>
                                            </li>
                                        ) : null}

                                        {destinationMeta?.weather_temp_c != null || destinationMeta?.weather_desc ? (
                                            <li className="flex items-start gap-2">
                                                <Thermometer className="mt-0.5 h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">Weather</div>
                                                    <div className="text-muted-foreground flex items-center gap-2">
                                                        {destinationMeta?.weather_desc ? (
                                                            <>
                                                                <Cloud className="h-4 w-4" />
                                                                <span>{destinationMeta.weather_desc}</span>
                                                            </>
                                                        ) : null}
                                                        {destinationMeta?.weather_temp_c != null ? (
                                                            <span>· {destinationMeta.weather_temp_c.toFixed(1)}°C</span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </li>
                                        ) : null}

                                        {destinationMeta?.transport?.length ? (
                                            <li className="flex items-start gap-2">
                                                <TrainFront className="mt-0.5 h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">Getting around</div>
                                                    <div className="text-muted-foreground">{destinationMeta.transport.join(", ")}</div>
                                                </div>
                                            </li>
                                        ) : null}

                                        {destinationMeta?.esim_provider ? (
                                            <li className="flex items-start gap-2">
                                                <SmartphoneNfc className="mt-0.5 h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">eSIM</div>
                                                    <div className="text-muted-foreground">{destinationMeta.esim_provider}</div>
                                                </div>
                                            </li>
                                        ) : null}

                                        {(destinationMeta?.city || primaryDestination?.name) && (
                                            <li className="flex items-start gap-2">
                                                <Globe className="mt-0.5 h-4 w-4" />
                                                <div>
                                                    <div className="font-medium">Primary city</div>
                                                    <div className="text-muted-foreground">
                                                        {destinationMeta?.city ?? primaryDestination?.name ?? "—"}
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </aside>
                        </div>
                    </TabsContent>

                    {/* ---------- DAYS ---------- */}
                    <TabsContent value="days" className="mt-0">
                        {/* Day picker */}
                        <div className="relative">
                            <ScrollArea className="w-full">
                                <div className="flex w-max gap-2">
                                    {data.days.map((_, i) => (
                                        <Button
                                            key={i}
                                            size="sm"
                                            variant={activeDayIdx === i ? "default" : "secondary"}
                                            onClick={() => setActiveDayIdx(i)}
                                            className="rounded-full"
                                        >
                                            Day {i + 1}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Two-pane layout with matched heights */}
                        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(480px,1fr)_minmax(540px,1fr)]">
                            {/* LEFT: Days pane — scrolls internally; full-height only on lg+ */}
                            <div className="rounded-2xl border-border border bg-card overflow-hidden h-auto lg:h-[calc(100vh-160px)]">
                                <ScrollArea className="h-full">
                                    <div className="p-2 md:p-3">
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

                            {/* RIGHT: Map — mobile gets sane height; sticky only on lg+ */}
                            <aside className="lg:sticky lg:top-20 lg:self-start">
                                <div className="overflow-hidden rounded-2xl border-border border h-64 sm:h-80 lg:h-[calc(100vh-160px)]">
                                    <LeafletMap day={activeDay} placesById={placesById} theme={theme} />
                                </div>
                            </aside>
                        </div>
                    </TabsContent>

                    <TabsContent value="places" className="mt-0">
                        <div className="rounded-2xl border-border border p-4">
                            <PlacesList places={data.places} />
                        </div>
                    </TabsContent>

                    <TabsContent value="raw" className="mt-0">
                        <div className="h-[420px] w-full overflow-hidden rounded-2xl border-border border">
                            <pre className="p-4 text-xs">{JSON.stringify(data, null, 2)}</pre>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

/* ---------- Editable day renderer ---------- */

function EditableDay({
                         dayIdx,
                         day, // nullable
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

    // Empty state when no day exists
    if (!day) {
        return (
            <div className="space-y-4 p-3 md:p-4">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">No day selected</div>
                <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                    This itinerary has no days yet. Add your first item to create one.
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
        <div className="space-y-4 p-3 md:p-4">
            {/* Header */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Day {dayIdx + 1}</div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold">{formatISODate(day?.date)}</span>
                        <DayCostPill amount={dayCost} />
                    </div>
                </div>

                <div className="justify-self-start md:justify-self-end">
                    <AddItemUnderDay
                        tripId={tripId}
                        dayIndex={dayIdx}
                        date={day?.date ?? null}
                        tripStartDate={startDate}
                        destinationLat={tripConfig?.destinations?.[0]?.lat}
                        destinationLng={tripConfig?.destinations?.[0]?.lng}
                        preferenceTags={tripConfig?.interests}
                        nextOrderIndex={nextOrderIndex}
                    />
                </div>
            </div>

            {!hasRealIds && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-200">
                    Heads up: these items don’t include IDs. Save/load the trip from the database (not preview) to enable editing.
                </div>
            )}

            {/* ---- Clean list (no rails/connectors) ---- */}
            <ol role="list" className="space-y-4 md:space-y-5">
                {blocks.map((b, i) => {
                    const place = b.place_id ? placesById.get(b.place_id) : null;
                    const forControls = items[i];
                    return (
                        <li key={`${day?.date ?? "no-date"}-${i}`} className="relative pl-9 sm:pl-10">
                            <StepNode index={i + 1} variant={b.when} />
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
                                    { kind: "cost", label: "Est. cost", value: `$${b.est_cost ?? 0}` },
                                    { kind: "duration", label: "Duration", value: `${b.duration_min ?? 0}m` },
                                    { kind: "travel", label: "Travel", value: `${b.travel_min_from_prev ?? 0}m` },
                                ]}
                                actions={<BlockActions item={forControls} />}
                            />
                        </li>
                    );
                })}
            </ol>

            <div className="mt-4">
                <AddItemUnderDay
                    tripId={tripId}
                    dayIndex={dayIdx}
                    date={day?.date ?? null}
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

/* ---------- Block card ---------- */

type StatKind = "cost" | "duration" | "travel";

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
    const whenUi = getWhenUi(when);

    const hasMeta = !!place || !!coords;
    const hasNotes = !!notes?.trim();
    const hasStats = stats?.length > 0;

    // helper to truncate notes safely
    const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-4 md:p-5 transition",
                "hover:bg-card hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
                "ring-1 ring-transparent hover:ring-primary/10"
            )}
        >
            {/* Soft gradient sheen on hover */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: "radial-gradient(1200px 200px at 0% 0%, rgba(99,102,241,0.08), transparent 60%)",
                }}
            />

            {/* --- Header: badge + title + actions --- */}
            <div className="relative z-10 flex items-center gap-2 md:gap-3">
        <span
            className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
                whenUi.badge
            )}
            aria-label={`Time of day: ${when}`}
        >
          {whenUi.icon}
            {when}
        </span>
                <h3 className="min-w-0 truncate text-base font-semibold leading-tight">{title}</h3>
                {actions ? <div className="ml-auto shrink-0 opacity-90 transition-opacity group-hover:opacity-100">{actions}</div> : null}
            </div>

            {/* --- Notes (truncated), optional divider above if also showing meta/stats --- */}
            {hasNotes && (
                <>
                    {(hasMeta || hasStats) && <div className="relative z-10 mt-2 border-t border-border/70" />}
                    <p
                        className="relative z-10 mt-2 text-sm leading-relaxed text-muted-foreground"
                        title={notes}
                    >
                        {truncate(notes ?? "", 160)}
                    </p>
                </>
            )}

            {/* Divider only if there will be body content */}
            {(hasMeta || hasStats) && <div className="relative z-10 mt-3 border-t border-border/70" />}

            {/* --- Body: Meta (left) • Stats (right) --- */}
            {(hasMeta || hasStats) && (
                <div className="relative z-10 mt-3 grid gap-3 md:mt-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                    {/* Meta (place + coords) */}
                    <div className="min-w-0">
                        {place ? (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <PlaceChip place={place} />
                                {coords ? (
                                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px]">{coords}</span>
                                ) : null}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">No place selected</div>
                        )}
                    </div>

                    {/* Stats (always inline, scroll if overflow) */}
                    {hasStats ? (
                        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 md:justify-end">
                            {stats.map((s, idx) => (
                                <div key={idx} className="flex-shrink-0">
                                    <StatChip variant={s.kind} label={s.label} value={s.value} />
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

/* ---------- Visual helpers ---------- */

function StepNode({ index, variant }: { index: number; variant: "morning" | "afternoon" | "evening" }) {
    const whenUi = getWhenUi(variant);
    return (
        <span
            className={cn(
                "absolute left-2 sm:left-3 top-3 grid h-7 w-7 place-items-center rounded-full text-[11px] font-semibold tabular-nums",
                "border border-border shadow-sm ring-2",
                whenUi.nodeRing,
                "bg-background text-foreground"
            )}
            aria-label={`Step ${index}`}
        >
      {index}
    </span>
    );
}

function getWhenUi(
    when: "morning" | "afternoon" | "evening"
): { badge: string; icon: React.ReactNode; nodeRing: string } {
    if (when === "morning") {
        return {
            badge: "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-100 dark:ring-amber-900/40",
            icon: <span className="text-[12px]">🌅</span>,
            nodeRing: "ring-amber-200/70 dark:ring-amber-300/30",
        };
    }
    if (when === "afternoon") {
        return {
            badge: "bg-sky-50 text-sky-900 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-100 dark:ring-sky-900/40",
            icon: <span className="text-[12px]">🌤️</span>,
            nodeRing: "ring-sky-200/70 dark:ring-sky-300/30",
        };
    }
    return {
        badge: "bg-violet-50 text-violet-900 ring-violet-200 dark:bg-violet-900/20 dark:text-violet-100 dark:ring-violet-900/40",
        icon: <span className="text-[12px]">🌆</span>,
        nodeRing: "ring-violet-200/70 dark:ring-violet-300/30",
    };
}

function PlaceChip({ place }: { place: Place }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs">
      <span className="font-medium text-foreground">{place.name}</span>
            {place.category ? <span className="text-muted-foreground">• {place.category}</span> : null}
    </span>
    );
}

function DayCostPill({ amount }: { amount: number }) {
    const safe = Number.isFinite(amount) ? amount : 0;
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground whitespace-nowrap">
      est. day cost <span className="font-medium text-foreground">${safe}</span>
    </span>
    );
}

type StatVariant = "cost" | "duration" | "travel";

function StatChip({
                      variant,
                      label,
                      value,
                  }: {
    variant: StatVariant;
    label: string;
    value: string | number;
}) {
    const styles: Record<StatVariant, { wrap: string; dot: string; icon: React.ReactElement }> = {
        cost: {
            wrap: "bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-900/30",
            dot: "bg-amber-400 dark:bg-amber-300",
            icon: <DollarSign className="h-3.5 w-3.5" />,
        },
        duration: {
            wrap: "bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-900/30",
            dot: "bg-blue-400 dark:bg-blue-300",
            icon: <Hourglass className="h-3.5 w-3.5" />,
        },
        travel: {
            wrap: "bg-violet-50 text-violet-900 border border-violet-200 dark:bg-violet-900/20 dark:text-violet-200 dark:border-violet-900/30",
            dot: "bg-violet-400 dark:bg-violet-300",
            icon: <MoveRight className="h-3.5 w-3.5" />,
        },
    };

    const s = styles[variant];

    return (
        <div className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium", s.wrap)} aria-label={`${label}: ${value}`}>
            <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
            {s.icon}
            <span className="opacity-80">{label}:</span>
            <span className="text-foreground/90">{value}</span>
        </div>
    );
}

/* ---------- Overview metric ---------- */
function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-md border border-border bg-background p-2">
            <div className="text-[11px] text-muted-foreground">{label}</div>
            <div className="font-medium">{value}</div>
        </div>
    );
}

/* ---------- Places list ---------- */
function PlacesList({ places }: { places: Place[] }) {
    if (!places?.length) {
        return <div className="text-sm text-muted-foreground">No places included.</div>;
    }
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {places.map((p) => (
                <div key={p.id} className="rounded-xl border border-border bg-card/60 p-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{p.category ?? "—"}</div>
                    {typeof p.popularity === "number" && (
                        <div className="mt-2 text-xs text-muted-foreground">popularity: {p.popularity}</div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ---------- shared small helpers ---------- */

function emojiFor(tag: string) {
    const t = tag.toLowerCase();
    if (t.includes("beach")) return "🌴";
    if (t.includes("food") || t.includes("dining")) return "🍽";
    if (t.includes("culture") || t.includes("museum")) return "🏛";
    if (t.includes("music")) return "🎶";
    if (t.includes("night")) return "🌙";
    if (t.includes("shop")) return "🛍";
    if (t.includes("hiking") || t.includes("trail")) return "🥾";
    if (t.includes("wildlife") || t.includes("safari")) return "🦁";
    if (t.includes("art")) return "🎨";
    if (t.includes("sports")) return "🏅";
    if (t.includes("wellness") || t.includes("spa")) return "💆";
    if (t.includes("architecture")) return "🏗";
    if (t.includes("festival") || t.includes("event")) return "🎉";
    if (t.includes("nature") || t.includes("park")) return "🌿";
    return "✨";
}

// 🔒 Stable, SSR-safe date formatting (fixed locale + UTC)
const STABLE_DATE_LOCALE = "en-GB"; // change to "en-US" if you prefer
const STABLE_DATE_TIMEZONE = "UTC";

const STABLE_DTF = new Intl.DateTimeFormat(STABLE_DATE_LOCALE, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: STABLE_DATE_TIMEZONE,
});

function parseYMDtoUTC(ymd: string): Date | null {
    if (!ymd || typeof ymd !== "string") return null;
    const [y, m, d] = ymd.split("-").map((n) => Number(n));
    if (!y || !m || !d) return null;
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

function formatISODate(x?: string) {
    if (!x) return "—";
    const d = parseYMDtoUTC(x);
    return d ? STABLE_DTF.format(d) : x;
}