// app/trips/[id]/TripViewerClient.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {JSX, useMemo, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent} from "@/components/ui/tabs";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Button} from "@/components/ui/button";
import type {PreviewLike, Day, Place} from "./page";

// Reuse the same Leaflet map used in Preview (dynamic to avoid SSR issues)
const LeafletMap = dynamic(() => import("@/app/preview/_leaflet/LeafletMap"), {ssr: false});
import "leaflet/dist/leaflet.css";

// ✅ your edit controls
import {AddItemUnderDay, BlockActions, ItemRowLite} from "@/app/trips/BlockEditControls";
import {cn} from "@/lib/utils";
import {DollarSign, Hourglass, MoveRight} from "lucide-react";

/** ---------- helpers for safe inputs typing ---------- */
type TripInputs = { interests?: string[] } | undefined;

function hasInterests(v: unknown): v is { interests: string[] } {
    if (!v || typeof v !== "object") return false;
    const maybe = v as { interests?: unknown };
    return Array.isArray(maybe.interests) && maybe.interests.every((t): t is string => typeof t === "string");
}

export default function TripViewerClient({
                                             tripId,
                                             data,
                                         }: {
    tripId: string;
    data: PreviewLike;
}) {
    const [activeDayIdx, setActiveDayIdx] = useState(0);

    const placesById = useMemo(() => new Map(data.places.map((p) => [p.id, p])), [data.places]);

    const totalDays = data.days.length;
    const progressPct = totalDays ? Math.min(100, Math.round(((activeDayIdx + 1) / totalDays) * 100)) : 0;

    // Narrow inputs safely (no 'any')
    const inputs: TripInputs = data.trip_summary.inputs as TripInputs;

    const activeDay = data.days[activeDayIdx];

    // ⚠️ Build a list the controls understand (needs id & order_index).
    // If your server didn’t include them, we synthesize safe fallbacks (controls will render disabled).
    const itemsForControls: ItemRowLite[] = (activeDay?.blocks ?? []).map((b, i) => {
        const anyB = b as unknown as { id?: string; order_index?: number };
        return {
            id: anyB.id ?? `no-id-${i}`, // fallback nonce
            trip_id: tripId,
            day_index: i,               // not used by BlockActions but kept tidy
            date: activeDay?.date ?? null,
            order_index: Number.isFinite(anyB.order_index) ? (anyB.order_index as number) : i,
            when: b.when,
            place_id: b.place_id ?? null,
            title: b.title,
            est_cost: b.est_cost ?? null,
            duration_min: b.duration_min ?? null,
            travel_min_from_prev: b.travel_min_from_prev ?? null,
            notes: b.notes ?? null,
            // let BlockActions decide if it's editable based on id format
        };
    });

    const nextOrderIndex = itemsForControls.length;

    return (
        <Card className="overflow-hidden border">
            <CardContent className="space-y-6 py-6">
                {/* Interests (if present on inputs) */}
                {hasInterests(inputs) && inputs.interests.length > 0 && (
                    <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Interests</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {inputs.interests.map((t) => (
                                <Badge key={t} variant="outline" className="capitalize">
                                    {emojiFor(t)} {t}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress */}
                <div className="mt-1">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Trip progress</span>
                        <span>
              Day {activeDayIdx + 1} of {totalDays || "—"}
            </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full border bg-muted/40">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                </div>

                {/* Tabs: Days / Places / Raw */}
                <Tabs defaultValue="days">
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

                        {/* Split grid: Left timeline (editable), Right map */}
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(480px,1fr)_minmax(540px,1fr)]">
                            {/* Timeline (editable) */}
                            <div className="rounded-2xl border bg-card p-2 md:p-3">
                                <EditableDay
                                    dayIdx={activeDayIdx}
                                    day={activeDay}
                                    items={itemsForControls}
                                    nextOrderIndex={nextOrderIndex}
                                    tripId={tripId}
                                    placesById={placesById}
                                />
                            </div>

                            {/* Map */}
                            <aside className="md:sticky md:top-20 h-[calc(100vh-160px)] md:self-start">
                                <div className="overflow-hidden rounded-2xl border">
                                    <LeafletMap day={activeDay} placesById={placesById} />
                                </div>
                            </aside>
                        </div>
                    </TabsContent>

                    <TabsContent value="places" className="mt-0">
                        <div className="rounded-2xl border p-4">
                            <PlacesList places={data.places} />
                        </div>
                    </TabsContent>

                    <TabsContent value="raw" className="mt-0">
                        <div className="h-[420px] w-full overflow-hidden rounded-2xl border">
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
                     }: {
    dayIdx: number;
    day: Day;
    items: ItemRowLite[];
    nextOrderIndex: number;
    tripId: string;
    placesById: Map<string, Place>;
}) {
    const dayCost = useMemo(
        () =>
            Math.max(
                0,
                Math.round(day.blocks.reduce((acc, b) => acc + (Number(b.est_cost) || 0), 0))
            ),
        [day.blocks]
    );

    const hasRealIds = items.every((it) => !String(it.id).startsWith("no-id-"));

    return (
        <div className="space-y-4 p-3 md:p-4">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Day {dayIdx + 1}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold">{formatISODate(day.date)}</span>
                        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
              est. day cost <span className="font-medium text-foreground">${dayCost}</span>
            </span>
                    </div>
                </div>

                {/* Add new item CTA */}
                <div className="sm:self-end">
                    <AddItemUnderDay
                        tripId={tripId}
                        date={day.date ?? null}
                        nextOrderIndex={nextOrderIndex}
                    />
                </div>
            </div>

            {!hasRealIds && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                    Heads up: these items don’t include IDs. Save/load the trip from the database (not preview) to enable editing.
                </div>
            )}

            {/* Timeline */}
            <div className="relative">
                <div className="pointer-events-none absolute left-[14px] top-0 h-full w-px bg-border" />
                <div className="space-y-3">
                    {day.blocks.map((b, i) => {
                        const place = b.place_id ? placesById.get(b.place_id) : null;
                        const forControls = items[i];
                        const whenUi = getWhenUi(b.when);

                        return (
                            <div key={`${day.date}-${i}`} className="relative">
                                <div className="absolute left-2 top-5 h-3 w-3 -translate-x-1/2 rounded-full border bg-background shadow-sm" />
                                <div className="ml-6 rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md">
                                    {/* Title row */}
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
                                        <BlockActions item={forControls} />
                                    </div>

                                    {/* Details */}
                                    <div className="mt-3 space-y-2">
                                        {place ? (
                                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                <PlaceChip place={place} />
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
                                            <div className="text-sm leading-relaxed text-muted-foreground">
                                                {b.notes}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer stats row */}
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
                                        <StatChip variant="cost"    label="Est. cost" value={`$${b.est_cost ?? 0}`} />
                                        <StatChip variant="duration" label="Duration"  value={`${b.duration_min ?? 0}m`} />
                                        <StatChip variant="travel"   label="Travel"    value={`${b.travel_min_from_prev ?? 0}m`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom add button */}
                <div className="mt-4 pl-6">
                    <AddItemUnderDay
                        tripId={tripId}
                        date={day.date ?? null}
                        nextOrderIndex={nextOrderIndex}
                    />
                </div>
            </div>
        </div>
    );
}

type StatVariant = "cost" | "duration" | "travel";

/* ---- stat chip ---- */
function StatChip({
                      variant,
                      label,
                      value,
                  }: {
    variant: StatVariant;
    label: string;
    value: string | number;
}) {
    const styles: Record<StatVariant, {wrap: string; dot: string; icon: JSX.Element}> = {
        cost: {
            wrap: "bg-amber-50 text-amber-900 border border-amber-200",
            dot: "bg-amber-400",
            icon: <DollarSign className="h-3.5 w-3.5" />,
        },
        duration: {
            wrap: "bg-blue-50 text-blue-900 border border-blue-200",
            dot: "bg-blue-400",
            icon: <Hourglass className="h-3.5 w-3.5" />,
        },
        travel: {
            wrap: "bg-violet-50 text-violet-900 border border-violet-200",
            dot: "bg-violet-400",
            icon: <MoveRight className="h-3.5 w-3.5" />,
        },
    };

    const s = styles[variant];

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium",
                s.wrap
            )}
            aria-label={`${label}: ${value}`}
        >
            <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
            {s.icon}
            <span className="opacity-80">{label}:</span>
            <span className="text-foreground/90">{value}</span>
        </div>
    );
}

// /* ---------- tiny local helpers (keep with the component) ---------- */
//
// function StatChip({ label, value }: { label: string; value: string | number }) {
//     return (
//         <div className="rounded-lg border bg-background px-2 py-2">
//             <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
//             <div className="text-sm font-semibold">{value}</div>
//         </div>
//     );
// }

function PlaceChip({ place }: { place: Place }) {
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
            badge:
                "bg-amber-50 text-amber-900 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-200",
            icon: <span className="text-[12px]">🌅</span>,
        };
    }
    if (when === "afternoon") {
        return {
            badge:
                "bg-sky-50 text-sky-900 ring-1 ring-sky-200 dark:bg-sky-900/20 dark:text-sky-200",
            icon: <span className="text-[12px]">🌤️</span>,
        };
    }
    return {
        badge:
            "bg-violet-50 text-violet-900 ring-1 ring-violet-200 dark:bg-violet-900/20 dark:text-violet-200",
        icon: <span className="text-[12px]">🌆</span>,
    };
}

/* ---------- Places list ---------- */

function PlacesList({places}: { places: Place[] }) {
    if (!places?.length) return <div className="text-sm text-muted-foreground">No places included.</div>;
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {places.map((p) => (
                <div key={p.id} className="rounded-xl border bg-card/60 p-3 shadow-sm">
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
        <div className="rounded-md border bg-background p-2">
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