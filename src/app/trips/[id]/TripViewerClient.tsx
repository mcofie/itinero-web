// app/trips/[id]/TripViewerClient.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {useMemo, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Tabs, TabsContent} from "@/components/ui/tabs";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";

import {Loader2} from "lucide-react";
import type {PreviewLike, Day, Place} from "./page";

// Reuse the same Leaflet map used in Preview (dynamic to avoid SSR issues)
const LeafletMap = dynamic(() => import("@/app/preview/_leaflet/LeafletMap"), {ssr: false});
import "leaflet/dist/leaflet.css";

export default function TripViewerClient({data}: { data: PreviewLike }) {
    const [activeDayIdx, setActiveDayIdx] = useState(0);
    const [edit] = useState(false); // read-only, but you can toggle if you want editing here

    const placesById = useMemo(() => new Map(data.places.map((p) => [p.id, p])), [data.places]);

    const totalDays = data.days.length;
    const progressPct = totalDays ? Math.min(100, Math.round(((activeDayIdx + 1) / totalDays) * 100)) : 0;

    return (
        <Card className="overflow-hidden border">
            <CardContent className="space-y-6 py-6">
                {/* Interests (if present on inputs) */}
                {Array.isArray((data.trip_summary.inputs as any)?.interests) &&
                    (data.trip_summary.inputs as any).interests.length > 0 && (
                        <div>
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">Interests</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(data.trip_summary.inputs as any).interests.map((t: string) => (
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
                        <div className="h-full rounded-full bg-primary transition-all"
                             style={{width: `${progressPct}%`}}/>
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

                        {/* Split grid: Left timeline, Right map (like Preview) */}
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(480px,1fr)_minmax(540px,1fr)]">
                            {/* Timeline (read-only) */}
                            <div className="rounded-2xl border bg-card p-2 md:p-3">
                                <ReadOnlyDay dayIdx={activeDayIdx} day={data.days[activeDayIdx]}
                                             placesById={placesById}/>
                            </div>

                            {/* Map */}
                            <aside className="md:sticky md:top-20 h-[calc(100vh-160px)] md:self-start">
                                <div className="overflow-hidden rounded-2xl border">
                                    <LeafletMap day={data.days[activeDayIdx]} placesById={placesById}/>
                                </div>
                            </aside>
                        </div>
                    </TabsContent>

                    <TabsContent value="places" className="mt-0">
                        <div className="rounded-2xl border p-4">
                            <PlacesList places={data.places}/>
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

/* ---------- Local read-only renderers (like Preview) ---------- */

function ReadOnlyDay({
                         dayIdx,
                         day,
                         placesById,
                     }: {
    dayIdx: number;
    day: Day;
    placesById: Map<string, Place>;
}) {
    const dayCost = useMemo(
        () => Math.max(0, Math.round(day.blocks.reduce((acc, b) => acc + (Number(b.est_cost) || 0), 0))),
        [day.blocks]
    );

    return (
        <div className="space-y-4 p-3 md:p-4">
            {/* header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Day {dayIdx + 1}</div>
                    <div className="text-lg font-semibold">{formatISODate(day.date)}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                    est. day cost: <span className="font-medium text-foreground">${dayCost}</span>
                </div>
            </div>

            {/* timeline */}
            <div className="relative">
                <div className="pointer-events-none absolute left-[14px] top-0 h-full w-px bg-border"/>
                <div className="space-y-3">
                    {day.blocks.map((b, i) => {
                        const place = b.place_id ? placesById.get(b.place_id) : null;
                        return (
                            <div key={`${day.date}-${i}`} className="relative">
                                <div
                                    className="absolute left-2 top-4 h-3 w-3 -translate-x-1/2 rounded-full border bg-background shadow-sm"/>
                                <div
                                    className="ml-6 rounded-xl border bg-card/60 p-4 shadow-sm transition hover:shadow">
                                    <div className="flex items-center justify-between">
                                        <div
                                            className="text-[11px] uppercase tracking-wider text-muted-foreground">{b.when}</div>
                                    </div>
                                    <div className="mt-2 grid gap-3 md:grid-cols-3">
                                        <div className="md:col-span-2">
                                            <div className="text-base font-medium">{b.title}</div>
                                            {b.notes &&
                                                <div className="mt-1 text-sm text-muted-foreground">{b.notes}</div>}
                                            {place && (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    <span className="font-medium text-foreground">{place.name}</span>
                                                    {place.category && <span> • {place.category}</span>}
                                                    {place.lat != null && place.lng != null && (
                                                        <span
                                                            className="ml-1"> • {place.lat.toFixed(3)}, {place.lng.toFixed(3)}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <Metric label="Est. cost" value={`$${b.est_cost ?? 0}`}/>
                                            <Metric label="Duration" value={`${b.duration_min ?? 0}m`}/>
                                            <Metric label="Travel" value={`${b.travel_min_from_prev ?? 0}m`}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

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