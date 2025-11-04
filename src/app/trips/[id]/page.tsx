// app/trips/[id]/page.tsx
import * as React from "react";
import Link from "next/link";
import {redirect} from "next/navigation";
import {createClientServer} from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {CalendarDays, DollarSign, MapPin, ArrowLeft} from "lucide-react";

import TripViewerClient from "./TripViewerClient";

import TripActionsClient from "@/app/trips/TripActionsClient";
import TripEditorClient from "@/app/trips/TripEditorClient";

type UUID = string;

/** ---------- DB-aligned types ---------- */
type TripRow = {
    id: UUID;
    user_id: UUID;
    title: string | null;
    start_date: string | null;
    end_date: string | null;
    est_total_cost: number | null;
    currency: string | null;
    inputs?:
        | {
        destinations?: { name: string; lat?: number; lng?: number }[];
        start_date?: string;
        end_date?: string;
        interests?: string[];
        pace?: "chill" | "balanced" | "packed";
        mode?: "walk" | "bike" | "car" | "transit";
        lodging?: { name: string; lat?: number; lng?: number } | null;
    }
        | unknown;
    created_at?: string | null;
};

type ItemRow = {
    id: UUID;
    trip_id: UUID;
    day_index: number;
    date: string | null; // yyyy-mm-dd
    order_index: number;
    when: "morning" | "afternoon" | "evening";
    place_id: string | null;
    title: string;
    est_cost: number | null;
    duration_min: number | null;
    travel_min_from_prev: number | null;
    notes: string | null;
};

type PlaceRow = {
    id: string;
    name: string;
    lat?: number | null;
    lng?: number | null;
    category?: string | null;
    tags?: string[] | null;
    popularity?: number | null;
    cost_typical?: number | null;
    cost_currency?: string | null;
};

/** Optional helper table for polylines (if created) */
type DayRouteRow = {
    date: string | null; // yyyy-mm-dd
    polyline6?: string | null;
    polyline?: string | null;
};

export type Day = {
    date: string;
    blocks: Array<{
        id?: string;            // add
        order_index?: number;   // add
        when: "morning" | "afternoon" | "evening";
        place_id: string | null;
        title: string;
        est_cost: number;
        duration_min: number;
        travel_min_from_prev: number;
        notes?: string;
    }>;
    map_polyline?: string;
    lodging?: { name: string; lat: number; lng: number } | null;
    return_to_lodging_min?: number | null;
    est_day_cost?: number;
    budget_daily?: number;
};

export type Place = {
    id: string;
    name: string;
    lat?: number;
    lng?: number;
    category?: string | null;
    tags?: string[] | null;
    popularity?: number | null;
    cost_typical?: number | null;
    cost_currency?: string | null;
};

export type PreviewLike = {
    trip_summary: {
        total_days: number;
        est_total_cost: number;
        currency?: string;
        inputs?: TripRow["inputs"];
        start_date?: string;
        end_date?: string;
    };
    days: Day[];
    places: Place[];
};

/* ---------- type-safe helpers to avoid `any` ---------- */
type InputsWithLodging = {
    lodging?: { name: string; lat?: number; lng?: number } | null;
};

function getValidLodging(inputs: TripRow["inputs"]): { name: string; lat: number; lng: number } | null {
    if (!inputs || typeof inputs !== "object") return null;
    const maybe = inputs as InputsWithLodging;
    const l = maybe.lodging;
    if (l && typeof l === "object" && typeof l.name === "string" && typeof l.lat === "number" && typeof l.lng === "number") {
        return {name: l.name, lat: l.lat, lng: l.lng};
    }
    return null;
}

export default async function TripIdPage({params}: { params: { id: string } }) {
    const sb = await createClientServer();

    // Auth (SSR)
    const {
        data: {user},
    } = await sb.auth.getUser();
    if (!user) redirect("/login");

    const tripId = params.id;

    // ---- Trip ----
    const {data: trip, error: tripErr} = await sb
        .schema("itinero")
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .maybeSingle<TripRow>();

    if (tripErr || !trip) {
        return (
            <AppShell userEmail={user.email ?? null}>
                <div className="mx-auto mt-10 max-w-2xl px-4">
                    <Button asChild variant="ghost" className="mb-3">
                        <Link href="/trips">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to trips
                        </Link>
                    </Button>
                    <Card>
                        <CardHeader>
                            <CardTitle>{tripErr ? "Couldn’t load trip" : "Trip not found"}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {tripErr?.message ?? "The requested trip doesn’t exist or you don’t have access to it."}
                        </CardContent>
                    </Card>
                </div>
            </AppShell>
        );
    }

    // ---- Items (ordered) ----
    const {data: items, error: itemsErr} = await sb
        .schema("itinero")
        .from("itinerary_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("date", {ascending: true, nullsFirst: true})
        .order("order_index", {ascending: true});

    if (itemsErr) {
        return (
            <AppShell userEmail={user.email ?? null}>
                <div className="mx-auto mt-10 max-w-2xl px-4">
                    <Button asChild variant="ghost" className="mb-3">
                        <Link href="/trips">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to trips
                        </Link>
                    </Button>
                    <Card>
                        <CardHeader>
                            <CardTitle>Couldn’t load itinerary items</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {itemsErr.message ?? "Failed to load itinerary items"}
                        </CardContent>
                    </Card>
                </div>
            </AppShell>
        );
    }

    const safeItems: ItemRow[] = Array.isArray(items) ? (items as ItemRow[]) : [];

    // ---- Places (for map markers) ----
    const placeIds = Array.from(new Set(safeItems.map((r) => r.place_id).filter(Boolean))) as string[];
    let places: PlaceRow[] = [];
    if (placeIds.length) {
        const {data: pRows} = await sb
            .schema("itinero")
            .from("places")
            .select("id,name,lat,lng,category,popularity,cost_typical,cost_currency,tags")
            .in("id", placeIds);
        places = (pRows ?? []) as PlaceRow[];
    }

    // ---- Optional per-day polylines (if you created itinero.trip_day_routes) ----
    const polyByDate = new Map<string, string>();
    try {
        const {data: routes} = await sb
            .schema("itinero")
            .from("trip_day_routes")
            .select("date,polyline6,polyline")
            .eq("trip_id", tripId);
        (routes ?? []).forEach((r: DayRouteRow) => {
            const key = r.date ?? "";
            const poly = r.polyline6 ?? r.polyline ?? undefined;
            if (key && poly) polyByDate.set(key, poly);
        });
    } catch {
        // If table doesn't exist or RLS denies it, continue silently.
    }

    // ---- Build preview-like structure for TripViewerClient ----
    const grouped = groupItemsByDayIndex(safeItems);
    const days: Day[] = grouped.map((g) => ({
        date: g.date ?? trip.start_date ?? "",
        blocks: g.items.map((it) => ({
            id: it.id,                    // 👈 add
            order_index: it.order_index,
            when: it.when,
            place_id: it.place_id,
            title: it.title,
            est_cost: Number(it.est_cost ?? 0),
            duration_min: Number(it.duration_min ?? 0),
            travel_min_from_prev: Number(it.travel_min_from_prev ?? 0),
            notes: it.notes ?? undefined,
        })),
        map_polyline: g.date ? polyByDate.get(g.date) : undefined,
        lodging: getValidLodging(trip.inputs),
    }));

    const previewLike: PreviewLike = {
        trip_summary: {
            total_days: days.length,
            est_total_cost: Number(trip.est_total_cost ?? 0),
            currency: trip.currency ?? undefined,
            inputs: trip.inputs as TripRow["inputs"],
            start_date: trip.start_date ?? undefined,
            end_date: trip.end_date ?? undefined,
        },
        days,
        places: places.map((p) => ({
            id: p.id,
            name: p.name,
            lat: p.lat ?? undefined,
            lng: p.lng ?? undefined,
            category: p.category ?? null,
            tags: p.tags ?? null,
            popularity: p.popularity ?? null,
            cost_typical: p.cost_typical ?? null,
            cost_currency: p.cost_currency ?? null,
        })),
    };

    const dateRange = formatDateRange(trip.start_date ?? undefined, trip.end_date ?? undefined);

    // Editor needs items grouped by date (with ids)
    const itemsByDate: Record<string, ItemRow[]> = safeItems.reduce((acc, it) => {
        const key = it.date ?? trip.start_date ?? "unscheduled";
        (acc[key] ||= []).push(it);
        return acc;
    }, {} as Record<string, ItemRow[]>);

    // For action bar props
    const clientPlaces = places.map((p) => ({
        id: p.id,
        name: p.name,
        lat: p.lat ?? undefined,
        lng: p.lng ?? undefined,
    }));

    return (
        <AppShell userEmail={user.email ?? null}>
            <div className="mx-auto w-full max-w-6xl px-4 py-6">
                {/* Back */}
                <div className="mb-4 flex items-center justify-between">
                    <Button asChild variant="ghost">
                        <Link href="/trips">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back
                        </Link>
                    </Button>
                </div>

                {/* Header */}
                <Card className="mb-4 overflow-hidden">
                    <CardHeader>
                        <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Saved Itinerary
                        </div>
                        <CardTitle className="text-2xl">{trip.title ?? "Untitled Trip"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="gap-1">
                                <CalendarDays className="h-3.5 w-3.5"/>
                                {dateRange}
                            </Badge>
                            {typeof trip.est_total_cost === "number" && (
                                <Badge variant="secondary" className="gap-1">
                                    <DollarSign className="h-3.5 w-3.5"/>
                                    est. {trip.currency ?? "USD"} {Math.round(trip.est_total_cost)}
                                </Badge>
                            )}
                            <Badge variant="outline" className="gap-1">
                                <MapPin className="h-3.5 w-3.5"/>
                                {extractDestName(trip.inputs)}
                            </Badge>
                        </div>

                        {/* Actions */}
                        <div className="mt-4">
                            <TripActionsClient
                                tripId={trip.id}
                                tripTitle={trip.title ?? "Trip"}
                                startDate={trip.start_date ?? undefined}
                                endDate={trip.end_date ?? undefined}
                                days={days}
                                places={clientPlaces}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Viewer */}
                <TripViewerClient
                    tripId={trip.id}                         // ✅ pass id (strings are fine)
                    data={previewLike}
                />

                {/* Inline editor */}
                {/*<div className="mt-6">*/}
                {/*    <TripEditorClient*/}
                {/*        itemsByDate={itemsByDate}*/}
                {/*    />*/}
                {/*</div>*/}
            </div>
        </AppShell>
    );
}

/* ---------------- helpers ---------------- */

function formatDateRange(start?: string, end?: string) {
    if (!start && !end) return "—";
    const s = start ? new Date(start + "T00:00:00") : null;
    const e = end ? new Date(end + "T00:00:00") : null;
    const fmt = (d: Date) => d.toLocaleDateString(undefined, {day: "2-digit", month: "short", year: "numeric"});
    if (s && e) return `${fmt(s)} → ${fmt(e)}`;
    if (s) return fmt(s);
    if (e) return fmt(e);
    return "—";
}

function extractDestName(inputs: unknown): string {
    try {
        const obj = inputs as { destinations?: Array<{ name?: string }> };
        return obj?.destinations?.[0]?.name ?? "Destination";
    } catch {
        return "Destination";
    }
}

function groupItemsByDayIndex(items: ItemRow[]) {
    const map = new Map<number, { date: string | null; items: ItemRow[] }>();
    for (const it of items) {
        const key = it.day_index;
        if (!map.has(key)) map.set(key, {date: it.date, items: []});
        map.get(key)!.items.push(it);
    }
    return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([dayIndex, v]) => ({dayIndex, date: v.date, items: v.items}));
}