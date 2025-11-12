// app/trips/[id]/page.tsx
import * as React from "react";
import Link from "next/link";
import {redirect} from "next/navigation";
import {createClientServerRSC} from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {CalendarDays, DollarSign, MapPin, ArrowLeft} from "lucide-react";

import TripViewerClient from "./TripViewerClient";

import TripActionsClient, {TripConfig} from "@/app/trips/TripActionsClient";
import PublicToggle from "@/app/trips/PublicToggle";
// app/trips/[id]/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store'; // Next 14+ only

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
    cover_url?: string | null; // ✅ add this
    destination_id?: UUID | null; // 👈 used to fetch destination + history
    inputs?:
        | {
        destinations?: { name: string; lat?: number; lng?: number }[];
        start_date?: string;
        end_date?: string;
        interests?: string[];
        pace?: "chill" | "balanced" | "packed";
        mode?: "walk" | "bike" | "car" | "transit";
        lodging?: { name: string; lat?: number; lng?: number } | null;
        destination_meta?: DestinationMetaLike;
    }
        | unknown;
    created_at?: string | null;
};

type DestinationRow = {
    id: UUID;
    name: string | null;
    lat: number | null;
    lng: number | null;
    current_history_id: UUID | null;
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

type DayRouteRow = {
    date: string | null; // yyyy-mm-dd
    polyline6?: string | null;
    polyline?: string | null;
};

export type Day = {
    date: string;
    blocks: Array<{
        id?: string;
        order_index?: number;
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

/* ---------- meta & history helpers ---------- */
type JSONValue = string | number | boolean | null | JSONValue[] | { [k: string]: JSONValue };

type ItineroKBYG = {
    currency?: string;
    plugs?: string;
    languages?: string[] | JSONValue;
    weather?: JSONValue;
    getting_around?: string;
    esim?: string;
    primary_city?: string;
};

type DestinationHistoryPayload = {
    about?: string;
    history?: string;
    kbyg?: ItineroKBYG;
};

type DestinationHistoryRow = {
    id?: string;
    section?: "about" | "history" | "kbyg" | "image" | "mixed" | string;
    payload?: DestinationHistoryPayload | JSONValue;
    sources?: string[] | JSONValue;
    created_at?: string | Date;
    backdrop_image_url?: string;
    backdrop_image_attribution?: string;
};

type DestinationMetaLike = {
    currency_code?: string;
    fx_base?: string;
    fx_rate?: number;
    money_tools?: string[];
    city?: string;
    timezone?: string;
    plugs?: string[];
    languages?: string[];
    weather_desc?: string;
    weather_temp_c?: number;
    transport?: string[];
    esim_provider?: string;
    description?: string;
    history?: string;
};

function isObject(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null;
}

function toDate(x: unknown): Date | null {
    if (x instanceof Date && !isNaN(x.getTime())) return x;
    if (typeof x === "string") {
        const d = new Date(x);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
}

function asHistoryRow(x: unknown): DestinationHistoryRow | null {
    if (!isObject(x)) return null;
    const row: DestinationHistoryRow = {
        id: typeof x.id === "string" ? x.id : undefined,
        section: typeof x.section === "string" ? x.section : undefined,
        payload: isObject(x.payload) || Array.isArray(x.payload) ? (x.payload as JSONValue) : undefined,
        sources: Array.isArray(x.sources) || isObject(x.sources) ? (x.sources as JSONValue) : undefined,
        created_at: typeof x.created_at === "string" || x.created_at instanceof Date ? (x.created_at as any) : undefined,
        backdrop_image_url: typeof x.backdrop_image_url === "string" ? x.backdrop_image_url : undefined,
        backdrop_image_attribution:
            typeof x.backdrop_image_attribution === "string" ? x.backdrop_image_attribution : undefined,
    };
    return row;
}

function coercePayload(p: unknown): DestinationHistoryPayload {
    if (!isObject(p)) return {};
    const out: DestinationHistoryPayload = {};
    if (typeof (p as any).about === "string") out.about = (p as any).about;
    if (typeof (p as any).history === "string") out.history = (p as any).history;

    const kbyg = (p as any).kbyg;
    if (isObject(kbyg)) {
        const kb: ItineroKBYG = {};
        if (typeof (kbyg as any).currency === "string") kb.currency = (kbyg as any).currency;
        if (typeof (kbyg as any).plugs === "string") kb.plugs = (kbyg as any).plugs;
        if (Array.isArray((kbyg as any).languages)) kb.languages = (kbyg as any).languages as string[];
        else if (typeof (kbyg as any).languages === "string") kb.languages = [(kbyg as any).languages];
        if (isObject((kbyg as any).weather) || Array.isArray((kbyg as any).weather)) kb.weather = (kbyg as any).weather as JSONValue;
        if (typeof (kbyg as any).getting_around === "string") kb.getting_around = (kbyg as any).getting_around;
        if (typeof (kbyg as any).esim === "string") kb.esim = (kbyg as any).esim;
        if (typeof (kbyg as any).primary_city === "string") kb.primary_city = (kbyg as any).primary_city;
        out.kbyg = kb;
    }
    return out;
}

export function extractDestName(inputs: unknown): string {
    try {
        const obj = inputs as { destinations?: Array<{ name?: string }> };
        return obj?.destinations?.[0]?.name ?? "Destination";
    } catch {
        return "Destination";
    }
}

/** Build a client-friendly meta object from a destination_history payload */
function buildDestinationMetaFromHistoryRow(hist: DestinationHistoryRow | null | undefined): {
    meta?: DestinationMetaLike;
    heroUrl?: string;
} {
    if (!hist) return {};
    const payload = coercePayload(hist.payload);
    const k = payload.kbyg ?? {};
    const weather = (k.weather && isObject(k.weather)) ? (k.weather as Record<string, any>) : undefined;

    const meta: DestinationMetaLike = {
        description: payload.about ?? undefined,
        history: payload.history ?? undefined,
        currency_code: typeof k.currency === "string" ? k.currency : undefined,
        plugs: typeof k.plugs === "string" ? k.plugs.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        languages: Array.isArray(k.languages) ? (k.languages as string[]) : undefined,
        weather_desc: typeof weather?.summary === "string" ? weather.summary : undefined,
        transport: typeof k.getting_around === "string" ? k.getting_around.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        esim_provider: typeof k.esim === "string" ? k.esim : undefined,
        city: typeof k.primary_city === "string" ? k.primary_city : undefined,
    };

    return {meta, heroUrl: hist.backdrop_image_url};
}

/* ---------- lodging helper ---------- */
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
    const sb = await createClientServerRSC();

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

    // ---- Optional per-day polylines ----
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
        // ignore
    }

    // ---- Build preview-like structure ----
    const grouped = groupItemsByDayIndex(safeItems);
    const days: Day[] = grouped.map((g) => ({
        date: g.date ?? trip.start_date ?? "",
        blocks: g.items.map((it) => ({
            id: it.id,
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

    // ---------- NEW: fetch destination + its history using trips.destination_id ----------
    let destination: DestinationRow | null = null;
    let history: DestinationHistoryRow | null = null;

    if (trip.destination_id) {
        const {data: dRow} = await sb
            .schema("itinero")
            .from("destinations")
            .select("id,name,lat,lng,current_history_id")
            .eq("id", trip.destination_id)
            .maybeSingle<DestinationRow>();
        destination = dRow ?? null;

        if (destination?.current_history_id) {
            const {data: hRow} = await sb
                .schema("itinero")
                .from("destination_history")
                .select("id,section,payload,sources,created_at,backdrop_image_url,backdrop_image_attribution")
                .eq("id", destination.current_history_id)
                .maybeSingle<DestinationHistoryRow>();
            history = hRow ?? null;
        }
    }

    // ---- Inputs enrichment (keep existing inputs but inject destination + meta from history) ----
    const rawInputs = (trip.inputs ?? null) as TripRow["inputs"] | null;
    const parsedInputs: Record<string, any> | null = ((): Record<string, any> | null => {
        if (!rawInputs) return null;
        if (typeof rawInputs === "string") {
            try {
                return JSON.parse(rawInputs as any);
            } catch {
                return null;
            }
        }
        return (rawInputs as any) ?? null;
    })();

    // Ensure we have a destinations[0] entry for the UI (name/coords)
    const enrichedDestList =
        destination
            ? [{
                name: destination.name ?? "Destination",
                lat: typeof destination.lat === "number" ? destination.lat : undefined,
                lng: typeof destination.lng === "number" ? destination.lng : undefined,
            }]
            : (parsedInputs?.destinations ?? undefined);

    const {meta: histMeta, heroUrl} = buildDestinationMetaFromHistoryRow(history);

    const enrichedInputs = {
        ...(parsedInputs ?? {}),
        ...(enrichedDestList ? {destinations: enrichedDestList} : {}),
        ...(histMeta ? {destination_meta: {...(parsedInputs?.destination_meta ?? {}), ...histMeta}} : {}),
    };

    const previewLike: PreviewLike = {
        trip_summary: {
            total_days: days.length,
            est_total_cost: Number(trip.est_total_cost ?? 0),
            currency: trip.currency ?? undefined,
            inputs: enrichedInputs as TripRow["inputs"],
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

    // For action bar props
    const clientPlaces = places.map((p) => ({
        id: p.id,
        name: p.name,
        lat: p.lat ?? undefined,
        lng: p.lng ?? undefined,
    }));

    const heroBackground =
        trip.cover_url // ✅ prefer the trip’s cover image
        || heroUrl     // then the destination_history backdrop
        || "https://images.unsplash.com/photo-1589556045897-c444ffa0a6ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2874";

    return (
        <AppShell userEmail={user.email ?? null}>
            <div className="mx-auto w-full max-w-6xl px-4 py-6">
                {/* Back */}
                <div className="mb-4 flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm" className="rounded-full">
                        <Link href="/trips">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back
                        </Link>
                    </Button>
                </div>

                {/* Hero Header */}
                <Card className="mb-6 overflow-hidden border-0 shadow-sm relative">
                    {/* Full background image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-slate-900"
                        style={{
                            backgroundImage: `url('${heroBackground}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center"
                        }}
                    />
                    {/* Tint overlay */}
                    <div className="absolute inset-0 bg-black/40 backdrop-brightness-75"/>
                    {/* Content */}
                    <div className="relative z-10">
                        <CardHeader className="pb-2 text-white">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="mb-1 text-[11px] uppercase tracking-wider opacity-90">Saved
                                        Itinerary
                                    </div>
                                    <CardTitle className="text-2xl leading-tight">
                                        {trip.title ?? "Untitled Trip"}
                                    </CardTitle>
                                </div>
                                {/* Quick stats */}
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-xs">
                                        <div className="opacity-80">Days</div>
                                        <div className="text-sm font-semibold">{days.length}</div>
                                    </div>
                                    <div className="rounded-xl border border-white/30 bg-white/10 px-3 py-2 text-xs">
                                        <div className="opacity-80">Est. Cost</div>
                                        <div className="text-sm font-semibold">
                                            {typeof trip.est_total_cost === "number"
                                                ? `${trip.currency ?? "USD"} ${Math.round(trip.est_total_cost)}`
                                                : "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0 text-white">
                            {/* Meta chips */}
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant="outline" className="gap-1 rounded-full border-white/40 text-white">
                                    <CalendarDays className="h-3.5 w-3.5"/>
                                    {dateRange}
                                </Badge>

                                {typeof trip.est_total_cost === "number" && (
                                    <Badge variant="secondary" className="gap-1 rounded-full bg-white/20 text-white">
                                        <DollarSign className="h-3.5 w-3.5"/>
                                        est. {trip.currency ?? "USD"} {Math.round(trip.est_total_cost)}
                                    </Badge>
                                )}

                                <Badge variant="outline" className="gap-1 rounded-full border-white/40 text-white">
                                    <MapPin className="h-3.5 w-3.5"/>
                                    {extractDestName(enrichedInputs)}
                                </Badge>
                            </div>

                            {/* Action row */}
                            <div className="flex flex-wrap justify-between items-end gap-2">
                                <TripActionsClient
                                    tripId={trip.id}
                                    tripTitle={trip.title ?? "Trip"}
                                    startDate={trip.start_date ?? undefined}
                                    endDate={trip.end_date ?? undefined}
                                    days={days}
                                    useInputs={
                                        (previewLike.trip_summary.inputs
                                            ? typeof previewLike.trip_summary.inputs === "string"
                                                ? JSON.parse(previewLike.trip_summary.inputs as any)
                                                : previewLike.trip_summary.inputs
                                            : null) as TripConfig | null
                                    }
                                    places={clientPlaces}
                                />

                                <div className="">
                                    <PublicToggle tripId={trip.id} publicId={tripId}/>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card>

                {/* Viewer */}
                <TripViewerClient tripId={trip.id} data={previewLike} startDate={previewLike.trip_summary.start_date}/>
            </div>
        </AppShell>
    );
}

/* ---------------- helpers ---------------- */

// 🔒 Stable, SSR-safe date formatting (fixed locale + UTC)
const STABLE_DATE_LOCALE = "en-GB";      // change to "en-US" if you prefer
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

function formatDateRange(start?: string, end?: string) {
    if (!start && !end) return "—";
    const s = start ? parseYMDtoUTC(start) : null;
    const e = end ? parseYMDtoUTC(end) : null;
    const fmt = (d: Date) => STABLE_DTF.format(d);
    if (s && e) return `${fmt(s)} → ${fmt(e)}`;
    if (s) return fmt(s);
    if (e) return fmt(e);
    return "—";
}

// (no other changes below)

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