// app/trips/[id]/TripViewerClient.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {JSX, useMemo, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Button} from "@/components/ui/button";
import type {PreviewLike, Day, Place} from "./page";

const LeafletMap = dynamic(() => import("@/app/preview/_leaflet/LeafletMap"), {ssr: false});
import "leaflet/dist/leaflet.css";

import {BlockActions, ItemRowLite} from "@/app/trips/BlockEditControls";
import {cn} from "@/lib/utils";
import {
    Cloud,
    DollarSign,
    Globe,
    Hourglass,
    MoveRight,
    SmartphoneNfc,
    Thermometer,
    TrainFront,
    Clock,
    Plug,
    Languages,
} from "lucide-react";
import {AddItemUnderDay} from "@/app/trips/AddItemUnderDay";
import {DestinationMeta, TripConfig} from "@/app/trips/TripActionsClient";

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
    const [activeDayIdx, setActiveDayIdx] = useState(0);

    const placesById = useMemo(() => new Map(data.places.map((p) => [p.id, p])), [data.places]);

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

    // After tripConfig useMemo
    const destinationMeta = React.useMemo(() => {
        const anyCfg = tripConfig as unknown as { destination_meta?: DestinationMeta } | null;
        return anyCfg?.destination_meta ?? null;
    }, [tripConfig]);

    if (tripConfig && !tripConfig.destination_meta) {
        tripConfig.destination_meta = {
            currency_code: "THB",
            fx_base: "USD",
            fx_rate: 35.24,
            money_tools: ["Wise"],
            city: "Bangkok",
            timezone: "UTC+07:00",
            plugs: ["plug-A", "plug-B", "plug-C", "plug-F"],
            languages: ["Thai", "English"],
            weather_desc: "☁️ Cloudy",
            weather_temp_c: 29.39,
            transport: ["Taxi", "Tuk-Tuk", "Songthaew"],
            esim_provider: "Airalo",
            description: "Ghana, located along the Gulf of Guinea in West Africa, is known for its warm hospitality, political stability, and rich cultural heritage. The country gained independence from British colonial rule on 6th March 1957, becoming the first sub-Saharan African nation to do so. Its capital, Accra, serves as a vibrant hub of commerce, art, and modern African identity.",
            history: "Ghana’s history is one of resilience and pride. Once home to powerful kingdoms like the Ashanti Empire and the ancient Kingdom of Ghana (which inspired the country’s modern name), it became a centre of trade and culture long before European contact. During the colonial era, it was known as the Gold Coast for its rich mineral wealth.\n" +
                "\n" +
                "In 1957, under the leadership of Dr. Kwame Nkrumah, Ghana became the first sub-Saharan African nation to gain independence—sparking a wave of freedom movements across the continent. Today, Ghana stands as a symbol of African unity, democracy, and progress, blending its proud past with a dynamic and forward-looking spirit.",
        };
    }

    const primaryDestination = tripConfig?.destinations?.[0] ?? null;

    const activeDay = data.days[activeDayIdx];

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
        <Card className="overflow-hidden border border-gray-200 shadow-2xs">
            <CardContent className="space-y-6 py-6">
                {hasInterests(inputs) && inputs.interests.length > 0 && (
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Interests</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {inputs.interests.map((t) => (
                                <Badge key={t} variant="outline" className="capitalize border-gray-200">
                                    {emojiFor(t)} {t}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-1">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Trip progress</span>
                        <span>
              Day {activeDayIdx + 1} of {totalDays || "—"}
            </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border-gray-200 border bg-muted/40">
                        <div className="h-full rounded-full bg-primary transition-all"
                             style={{width: `${progressPct}%`}}/>
                    </div>
                </div>

                <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="days">Days</TabsTrigger>
                        <TabsTrigger value="places">Places</TabsTrigger>
                        <TabsTrigger value="raw">Raw</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4">
                        <div className="grid gap-4 md:grid-cols-[minmax(520px,1fr)_380px]">
                            <div className="space-y-4">
                                <div className="space-y-4 rounded-2xl border border-gray-200 bg-card p-4">
                                    <div className="space-y-1">
                                        <div
                                            className="text-[11px] uppercase tracking-wider text-muted-foreground">Destination
                                        </div>
                                        <div className="text-xl font-semibold">
                                            {primaryDestination?.name ?? destinationMeta?.city ?? "Destination"}{" "}
                                            {/*{primaryDestination?.country_code ? (*/}
                                            {/*    <span className="text-muted-foreground">· {primaryDestination.country_code}</span>*/}
                                            {/*) : null}*/}
                                        </div>
                                        {primaryDestination && (primaryDestination.lat ?? null) != null && (primaryDestination.lng ?? null) != null ? (
                                            <div className="text-xs text-muted-foreground">
                                                {primaryDestination.lat.toFixed(4)}, {primaryDestination.lng.toFixed(4)}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                        <Metric label="Dates"
                                                value={`${formatISODate(startDate)} → ${formatISODate(data.days.at(-1)?.date)}`}/>
                                        <Metric label="Trip length"
                                                value={`${totalDays} day${totalDays === 1 ? "" : "s"}`}/>
                                        <Metric label="Places" value={data.places.length}/>
                                        <Metric label="Est. total cost" value={`$${totals.estCost}`}/>
                                        <Metric label="Planned duration" value={`${totals.durationMin}m`}/>
                                        <Metric label="Est. travel time" value={`${totals.travelMin}m`}/>
                                    </div>

                                    {hasInterests(inputs) && inputs.interests.length > 0 && (
                                        <div>
                                            <div
                                                className="text-[11px] uppercase tracking-wider text-muted-foreground">Focus
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {inputs.interests.map((t) => (
                                                    <Badge key={`ov-${t}`} variant="secondary"
                                                           className="capitalize border-gray-200">
                                                        {emojiFor(t)} {t}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-2xl border bg-card border-gray-200 p-4">
                                    <div className="mb-2 text-sm font-semibold">About this destination</div>
                                    {destinationMeta?.description ? (
                                        <p className="text-sm leading-relaxed text-muted-foreground">{destinationMeta.description}</p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No description yet. Add a short overview of the destination—vibe,
                                            highlights, seasons, and must-knows.
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-gray-200 bg-card p-4">
                                    <div className="mb-2 text-sm font-semibold">History</div>
                                    {destinationMeta?.history ? (
                                        <p className="text-sm leading-relaxed text-muted-foreground">{destinationMeta.history}</p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No history added yet. Summarize key historical periods, influences, and
                                            notable events.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <aside className="md:sticky md:top-20 md:self-start">
                                <div className="space-y-3 rounded-2xl border border-gray-200 bg-card p-4">
                                    <div className="text-sm font-semibold">Know before you go</div>
                                    <ul className="mt-2 space-y-2 text-sm">
                                        {(destinationMeta?.currency_code || destinationMeta?.fx_rate) && (
                                            <li className="flex items-start gap-2">
                                                <DollarSign className="mt-0.5 h-4 w-4"/>
                                                <div>
                                                    <div className="font-medium">Currency</div>
                                                    <div className="text-muted-foreground">
                                                        {destinationMeta?.currency_code ?? "—"}
                                                        {destinationMeta?.fx_rate && destinationMeta?.fx_base
                                                            ? ` · 1 ${destinationMeta.fx_base} ≈ ${destinationMeta.fx_rate} ${destinationMeta.currency_code}`
                                                            : null}
                                                    </div>
                                                    {destinationMeta?.money_tools?.length ? (
                                                        <div
                                                            className="text-muted-foreground">Helpful: {destinationMeta.money_tools.join(", ")}</div>
                                                    ) : null}
                                                </div>
                                            </li>
                                        )}

                                        {/*{(destinationMeta?.timezone || primaryDestination?.timezone) && (*/}
                                        {/*    <li className="flex items-start gap-2">*/}
                                        {/*        <Clock className="mt-0.5 h-4 w-4" />*/}
                                        {/*        <div>*/}
                                        {/*            <div className="font-medium">Time zone</div>*/}
                                        {/*            <div className="text-muted-foreground">*/}
                                        {/*                {destinationMeta?.timezone ?? primaryDestination?.timezone ?? "—"}*/}
                                        {/*            </div>*/}
                                        {/*        </div>*/}
                                        {/*    </li>*/}
                                        {/*)}*/}

                                        {destinationMeta?.plugs?.length ? (
                                            <li className="flex items-start gap-2">
                                                <Plug className="mt-0.5 h-4 w-4"/>
                                                <div>
                                                    <div className="font-medium">Plugs</div>
                                                    <div
                                                        className="text-muted-foreground">{destinationMeta.plugs.join(", ")}</div>
                                                </div>
                                            </li>
                                        ) : null}

                                        {destinationMeta?.languages?.length ? (
                                            <li className="flex items-start gap-2">
                                                <Languages className="mt-0.5 h-4 w-4"/>
                                                <div>
                                                    <div className="font-medium">Languages</div>
                                                    <div
                                                        className="text-muted-foreground">{destinationMeta.languages.join(", ")}</div>
                                                </div>
                                            </li>
                                        ) : null}

                                        {destinationMeta?.weather_temp_c != null || destinationMeta?.weather_desc ? (
                                            <li className="flex items-start gap-2">
                                                <Thermometer className="mt-0.5 h-4 w-4"/>
                                                <div>
                                                    <div className="font-medium">Weather</div>
                                                    <div className="text-muted-foreground flex items-center gap-2">
                                                        {destinationMeta?.weather_desc ? (
                                                            <>
                                                                <Cloud className="h-4 w-4"/>
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
                                                <TrainFront className="mt-0.5 h-4 w-4"/>
                                                <div>
                                                    <div className="font-medium">Getting around</div>
                                                    <div
                                                        className="text-muted-foreground">{destinationMeta.transport.join(", ")}</div>
                                                </div>
                                            </li>
                                        ) : null}

                                        {destinationMeta?.esim_provider ? (
                                            <li className="flex items-start gap-2">
                                                <SmartphoneNfc className="mt-0.5 h-4 w-4"/>
                                                <div>
                                                    <div className="font-medium">eSIM</div>
                                                    <div
                                                        className="text-muted-foreground">{destinationMeta.esim_provider}</div>
                                                </div>
                                            </li>
                                        ) : null}

                                        {(destinationMeta?.city || primaryDestination?.name) && (
                                            <li className="flex items-start gap-2">
                                                <Globe className="mt-0.5 h-4 w-4"/>
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
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(480px,1fr)_minmax(540px,1fr)]">
                            {/* LEFT: Days pane — same height as map, scrolls internally */}
                            <div
                                className="rounded-2xl border border-gray-200 bg-card md:h-[calc(100vh-160px)] overflow-hidden">
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

                            {/* RIGHT: Map pane — same height */}
                            <aside className="md:sticky md:top-20 md:self-start">
                                <div
                                    className="overflow-hidden rounded-2xl border border-gray-200 md:h-[calc(100vh-160px)]">
                                    <LeafletMap day={activeDay} placesById={placesById}/>
                                </div>
                            </aside>
                        </div>
                    </TabsContent>

                    <TabsContent value="places" className="mt-0">
                        <div className="rounded-2xl border border-gray-200 p-4">
                            <PlacesList places={data.places}/>
                        </div>
                    </TabsContent>

                    <TabsContent value="raw" className="mt-0">
                        <div className="h-[420px] w-full overflow-hidden rounded-2xl border-gray-200 border">
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
                         day,
                         items,
                         nextOrderIndex,
                         tripId,
                         placesById,
                         startDate,
                         tripConfig,
                     }: {
    dayIdx: number;
    day: Day;
    items: ItemRowLite[];
    nextOrderIndex: number;
    tripId: string;
    placesById: Map<string, Place>;
    startDate?: string;
    tripConfig: TripConfig | null;
}) {
    const dayCost = useMemo(
        () => Math.max(0, Math.round(day.blocks.reduce((acc, b) => acc + (Number(b.est_cost) || 0), 0))),
        [day.blocks]
    );

    const hasRealIds = items.every((it) => !String(it.id).startsWith("no-id-"));

    return (
        <div className="space-y-4 p-3 md:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Day {dayIdx + 1}</div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold">{formatISODate(day.date)}</span>
                        <span
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-0.5 text-xs text-muted-foreground">
              est. day cost <span className="font-medium text-foreground">${dayCost}</span>
            </span>
                    </div>
                </div>

                <div className="sm:self-end">
                    <AddItemUnderDay
                        tripId={tripId}
                        dayIndex={dayIdx}
                        date={day.date ?? null}
                        tripStartDate={startDate}
                        destinationLat={tripConfig?.destinations?.[0]?.lat}
                        destinationLng={tripConfig?.destinations?.[0]?.lng}
                        preferenceTags={tripConfig?.interests}
                        nextOrderIndex={nextOrderIndex}
                    />
                </div>
            </div>

            {!hasRealIds && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                    Heads up: these items don’t include IDs. Save/load the trip from the database (not preview) to
                    enable editing.
                </div>
            )}

            {/* ---- Timeline (prettier stepwise) ---- */}
            <div className="relative">
                {/* Vertical rail */}
                <div
                    className="pointer-events-none absolute border border-gray-200 left-4 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/70 to-transparent"/>

                <ol role="list" className="space-y-3">
                    {day.blocks.map((b, i) => {
                        const place = b.place_id ? placesById.get(b.place_id) : null;
                        const forControls = items[i];
                        const whenUi = getWhenUi(b.when);
                        const isLast = i === day.blocks.length - 1;

                        return (
                            <li key={`${day.date}-${i}`} className="relative pl-10">
                                {/* Node + connector */}
                                <div className="absolute left-4 top-6 -translate-x-1/2">
                                    <div className="relative grid place-items-center">
                                        {/* Connector tail (hidden on last) */}
                                        {!isLast && (
                                            <span
                                                className="absolute left-1/2 top-6 h-[calc(100%+12px)] w-px -translate-x-1/2 bg-border"/>
                                        )}

                                        {/* Numbered node */}
                                        <span
                                            className={cn(
                                                "grid h-6 w-6 place-items-center rounded-full border bg-background",
                                                "text-[11px] font-semibold tabular-nums shadow-sm ring-1 ring-transparent transition",
                                                "group-hover:ring-primary/20"
                                            )}
                                            aria-label={`Step ${i + 1}`}
                                        >
                {i + 1}
              </span>
                                    </div>
                                </div>

                                {/* Card */}
                                <div
                                    className="group rounded-2xl border border-gray-200 p-4  transition hover:shadow-md focus-within:shadow-md">
                                    {/* Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                <span
                    className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        whenUi.badge
                    )}
                >
                  {whenUi.icon}
                    {b.when}
                </span>
                                            <div className="text-base font-semibold leading-tight">{b.title}</div>
                                        </div>
                                        <BlockActions item={forControls}/>
                                    </div>

                                    {/* Meta */}
                                    <div className="mt-3 space-y-2">
                                        {place ? (
                                            <div
                                                className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                <PlaceChip place={place}/>
                                                {place.lat != null && place.lng != null && (
                                                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs">
                      {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-muted-foreground">No place selected</div>
                                        )}

                                        {b.notes && (
                                            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">{b.notes}</p>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div
                                        className="mt-4 grid grid-cols-3 items-center gap-2 border-t border-gray-200 pt-3 text-xs sm:flex sm:flex-wrap sm:justify-between">
                                        <StatChip variant="cost" label="Est. cost" value={`$${b.est_cost ?? 0}`}/>
                                        <StatChip variant="duration" label="Duration"
                                                  value={`${b.duration_min ?? 0}m`}/>
                                        <StatChip variant="travel" label="Travel"
                                                  value={`${b.travel_min_from_prev ?? 0}m`}/>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>

                {/* Bottom add */}
                <div className="mt-4 pl-10">
                    <AddItemUnderDay
                        tripId={tripId}
                        dayIndex={dayIdx}
                        date={day.date ?? null}
                        tripStartDate={startDate}
                        destinationLat={tripConfig?.destinations?.[0]?.lat}
                        destinationLng={tripConfig?.destinations?.[0]?.lng}
                        preferenceTags={tripConfig?.interests}
                        nextOrderIndex={nextOrderIndex}
                    />
                </div>
            </div>
        </div>
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
    const styles: Record<StatVariant, { wrap: string; dot: string; icon: JSX.Element }> = {
        cost: {
            wrap: "bg-amber-50 text-amber-900 border border-amber-200",
            dot: "bg-amber-400",
            icon: <DollarSign className="h-3.5 w-3.5"/>,
        },
        duration: {
            wrap: "bg-blue-50 text-blue-900 border border-blue-200",
            dot: "bg-blue-400",
            icon: <Hourglass className="h-3.5 w-3.5"/>,
        },
        travel: {
            wrap: "bg-violet-50 text-violet-900 border border-violet-200",
            dot: "bg-violet-400",
            icon: <MoveRight className="h-3.5 w-3.5"/>,
        },
    };

    const s = styles[variant];

    return (
        <div
            className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium", s.wrap)}
            aria-label={`${label}: ${value}`}
        >
            <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)}/>
            {s.icon}
            <span className="opacity-80">{label}:</span>
            <span className="text-foreground/90">{value}</span>
        </div>
    );
}

function PlaceChip({place}: { place: Place }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs">
      <span className="font-medium text-foreground">{place.name}</span>
            {place.category ? <span className="text-muted-foreground">• {place.category}</span> : null}
    </span>
    );
}

function getWhenUi(
    when: "morning" | "afternoon" | "evening"
): { badge: string; icon: React.ReactNode } {
    if (when === "morning") {
        return {
            badge: "bg-amber-50 text-amber-900 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-200",
            icon: <span className="text-[12px]">🌅</span>,
        };
    }
    if (when === "afternoon") {
        return {
            badge: "bg-sky-50 text-sky-900 ring-1 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-200",
            icon: <span className="text-[12px]">🌤️</span>,
        };
    }
    return {
        badge: "bg-violet-50 text-violet-900 ring-1 ring-violet-200 dark:bg-violet-900/20 dark:text-violet-200",
        icon: <span className="text-[12px]">🌆</span>,
    };
}

/* ---------- Places list ---------- */

function PlacesList({places}: { places: Place[] }) {
    if (!places?.length) return <div className="text-sm text-muted-foreground">No places included.</div>;
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {places.map((p) => (
                <div key={p.id} className="rounded-xl border border-gray-200 bg-card/60 p-3">
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

function Metric({label, value}: { label: string; value: string | number }) {
    return (
        <div className="rounded-md border border-gray-200 bg-background p-2">
            <div className="text-[11px] text-muted-foreground">{label}</div>
            <div className="font-medium">{value}</div>
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

function formatISODate(x?: string) {
    if (!x) return "—";
    try {
        return new Date(x + "T00:00:00").toLocaleDateString(undefined, {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return x;
    }
}