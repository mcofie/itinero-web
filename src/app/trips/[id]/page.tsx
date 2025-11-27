import * as React from "react";
import Link from "next/link";
import {redirect} from "next/navigation";
import {createClientServerRSC} from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
    CalendarDays,
    DollarSign,
    ArrowLeft,
} from "lucide-react";

import TripViewerClient from "./TripViewerClient";
import TripActionsClient, {TripConfig} from "@/app/trips/TripActionsClient";
import PublicToggle from "@/app/trips/PublicToggle";
import DeleteTripClient from "@/app/trips/[id]/DeleteTripClient";
import Image from "next/image";
import {formatDateRange} from "@/lib/trip-dates";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

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
    cover_url?: string | null;
    destination_id?: UUID | null;
    public_id: string | null;
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
type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [k: string]: JSONValue };

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

/* ---------- strict guards & accessors (no `any`) ---------- */
type UnknownRecord = Record<string, unknown>;

function isUnknownRecord(v: unknown): v is UnknownRecord {
    return typeof v === "object" && v !== null;
}

function isString(v: unknown): v is string {
    return typeof v === "string";
}

function isStringArray(v: unknown): v is string[] {
    return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function coercePayload(p: unknown): DestinationHistoryPayload {
    if (!isUnknownRecord(p)) return {};
    const out: DestinationHistoryPayload = {};

    const about = p["about"];
    if (isString(about)) out.about = about;

    const history = p["history"];
    if (isString(history)) out.history = history;

    const kbygRaw = p["kbyg"];
    if (isUnknownRecord(kbygRaw)) {
        const kb: ItineroKBYG = {};

        const currency = kbygRaw["currency"];
        if (isString(currency)) kb.currency = currency;

        const plugs = kbygRaw["plugs"];
        if (isString(plugs)) kb.plugs = plugs;

        const languagesRaw = kbygRaw["languages"];
        if (isStringArray(languagesRaw)) kb.languages = languagesRaw;
        else if (isString(languagesRaw)) kb.languages = languagesRaw;

        const weatherRaw = kbygRaw["weather"];
        if (isUnknownRecord(weatherRaw) || Array.isArray(weatherRaw))
            kb.weather = weatherRaw as JSONValue;

        const gettingAround = kbygRaw["getting_around"];
        if (isString(gettingAround)) kb.getting_around = gettingAround;

        const esim = kbygRaw["esim"];
        if (isString(esim)) kb.esim = esim;

        const primaryCity = kbygRaw["primary_city"];
        if (isString(primaryCity)) kb.primary_city = primaryCity;

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
function buildDestinationMetaFromHistoryRow(
    hist: DestinationHistoryRow | null | undefined
): {
    meta?: DestinationMetaLike;
    heroUrl?: string;
} {
    if (!hist) return {};
    const payload = coercePayload(hist.payload);
    const k = payload.kbyg ?? {};

    const weatherObj =
        k.weather && isUnknownRecord(k.weather)
            ? (k.weather as UnknownRecord)
            : undefined;

    const meta: DestinationMetaLike = {
        description: payload.about ?? undefined,
        history: payload.history ?? undefined,
        currency_code: isString(k.currency) ? k.currency : undefined,
        plugs: isString(k.plugs)
            ? k
                .plugs!.split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
        languages:
            Array.isArray(k.languages) && isStringArray(k.languages)
                ? k.languages
                : undefined,
        weather_desc:
            weatherObj && isString(weatherObj["summary"])
                ? (weatherObj["summary"] as string)
                : undefined,
        transport: isString(k.getting_around)
            ? k
                .getting_around!.split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
        esim_provider: isString(k.esim) ? k.esim : undefined,
        city: isString(k.primary_city) ? k.primary_city : undefined,
    };

    return {meta, heroUrl: hist.backdrop_image_url};
}

/* ---------- lodging helper ---------- */
type InputsWithLodging = {
    lodging?: { name: string; lat?: number; lng?: number } | null;
};

function getValidLodging(
    inputs: TripRow["inputs"]
): { name: string; lat: number; lng: number } | null {
    if (!inputs || typeof inputs !== "object") return null;
    const maybe = inputs as InputsWithLodging;
    const l = maybe.lodging;
    if (
        l &&
        typeof l === "object" &&
        typeof l.name === "string" &&
        typeof l.lat === "number" &&
        typeof l.lng === "number"
    ) {
        return {name: l.name, lat: l.lat, lng: l.lng};
    }
    return null;
}

/** 🔑 Next.js 15: params is a Promise and must be awaited */
export default async function TripIdPage({
                                             params,
                                         }: {
    params: Promise<{ id: string }>;
}) {
    const {id} = await params; // 👈 await params first
    const tripId = id;

    const sb = await createClientServerRSC();

    // Auth (SSR)
    const {
        data: {user},
    } = await sb.auth.getUser();
    if (!user) redirect("/login");

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
                    <Button asChild variant="ghost" className="mb-3 rounded-full">
                        <Link href="/trips">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to trips
                        </Link>
                    </Button>
                    <Card className="rounded-3xl border-none shadow-md">
                        <CardHeader>
                            <CardTitle>
                                {tripErr ? "Couldn’t load trip" : "Trip not found"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {tripErr?.message ??
                                "The requested trip doesn’t exist or you don’t have access to it."}
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
                    <Button asChild variant="ghost" className="mb-3 rounded-full">
                        <Link href="/trips">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to trips
                        </Link>
                    </Button>
                    <Card className="rounded-3xl border-none shadow-md">
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
    const placeIds = Array.from(
        new Set(safeItems.map((r) => r.place_id).filter(Boolean))
    ) as string[];
    let places: PlaceRow[] = [];
    if (placeIds.length) {
        const {data: pRows} = await sb
            .schema("itinero")
            .from("places")
            .select(
                "id,name,lat,lng,category,popularity,cost_typical,cost_currency,tags"
            )
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

    // ---------- Destination + history ----------
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
                .select(
                    "id,section,payload,sources,created_at,backdrop_image_url,backdrop_image_attribution"
                )
                .eq("id", destination.current_history_id)
                .maybeSingle<DestinationHistoryRow>();
            history = hRow ?? null;
        }
    }

    const {meta: destMeta, heroUrl} =
        buildDestinationMetaFromHistoryRow(history);

    // ---- Inputs enrichment ----
    const rawInputs = (trip.inputs ?? null) as TripRow["inputs"] | null;

    const parsedInputs: Record<string, unknown> | null = (() => {
        if (!rawInputs) return null;
        if (typeof rawInputs === "string") {
            try {
                const u: unknown = JSON.parse(rawInputs);
                return isUnknownRecord(u) ? u : null;
            } catch {
                return null;
            }
        }
        return isUnknownRecord(rawInputs)
            ? (rawInputs as Record<string, unknown>)
            : null;
    })();

    // Ensure we have a destinations[0] entry for the UI (name/coords)
    const enrichedDestList =
        destination
            ? [
                {
                    name: destination.name ?? "Destination",
                    lat:
                        typeof destination.lat === "number" ? destination.lat : undefined,
                    lng:
                        typeof destination.lng === "number" ? destination.lng : undefined,
                },
            ]
            : (parsedInputs?.destinations as
                | { name: string; lat?: number; lng?: number }[]
                | undefined);

    const enrichedInputs = {
        ...(parsedInputs ?? {}),
        ...(enrichedDestList ? {destinations: enrichedDestList} : {}),
        ...(destMeta
            ? {
                destination_meta: {
                    ...((parsedInputs?.destination_meta as
                        | DestinationMetaLike
                        | undefined) ?? {}),
                    ...destMeta,
                },
            }
            : {}),
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

    const dateRange = formatDateRange(
        trip.start_date ?? undefined,
        trip.end_date ?? undefined
    );

    // For action bar props
    const clientPlaces = places.map((p) => ({
        id: p.id,
        name: p.name,
        lat: p.lat ?? undefined,
        lng: p.lng ?? undefined,
    }));

    const heroBackground =
        trip.cover_url ||
        heroUrl ||
        "https://images.unsplash.com/photo-1589556045897-c444ffa0a6ff?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2874";

    // Safely coerce useInputs for TripActionsClient without `any`
    const inputsForClient: TripConfig | null = (() => {
        const val = previewLike.trip_summary.inputs;
        if (!val) return null;
        if (typeof val === "string") {
            try {
                const u: unknown = JSON.parse(val);
                return u as TripConfig;
            } catch {
                return null;
            }
        }
        return val as TripConfig;
    })();

    return (
        <AppShell userEmail={user.email ?? null}>
            <div
                className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
                {/* Hero Header */}
                <section className="relative h-[50vh] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900">
                        <Image
                            src={heroBackground}
                            alt={trip.title ?? "Trip Cover"}
                            fill
                            className="object-cover opacity-80"
                            priority
                        />
                        <div
                            className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"/>
                    </div>

                    <div
                        className="absolute inset-0 mx-auto flex max-w-6xl w-full flex-col justify-between p-6 md:p-10">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="self-start rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                        >
                            <Link href="/trips">
                                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Trips
                            </Link>
                        </Button>

                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge
                                    className="rounded-full border-white/30 bg-white/10 px-3 py-1 text-white backdrop-blur-md">
                                    <CalendarDays className="mr-2 h-3.5 w-3.5"/> {dateRange}
                                </Badge>
                                {typeof trip.est_total_cost === "number" && (
                                    <Badge
                                        className="rounded-full border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-emerald-100 backdrop-blur-md">
                                        <DollarSign className="mr-1 h-3.5 w-3.5"/>
                                        Est. {trip.currency ?? "USD"}{" "}
                                        {Math.round(trip.est_total_cost)}
                                    </Badge>
                                )}
                                <div className="hidden sm:flex">
                                    <PublicToggle tripId={trip.id} publicId={trip.public_id}/>
                                </div>
                            </div>

                            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white drop-shadow-lg leading-[1.1] md:text-6xl">
                                {trip.title ?? "Untitled Trip"}
                            </h1>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <TripActionsClient
                                    tripId={trip.id}
                                    tripTitle={trip.title ?? "Trip"}
                                    startDate={trip.start_date ?? undefined}
                                    endDate={trip.end_date ?? undefined}
                                    days={days}
                                    useInputs={inputsForClient}
                                    places={clientPlaces}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <div className="relative z-10 -mt-8 mx-auto w-full max-w-6xl px-4 pb-20">
                    {/* Viewer */}
                    <div className="rounded-3xl overflow-hidden">
                        <TripViewerClient
                            tripId={trip.id}
                            data={previewLike}
                            startDate={previewLike.trip_summary.start_date}
                        />
                    </div>

                    {/* Danger Zone */}
                    <div className="mt-12 border-t border-slate-200 pt-8 text-center">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                            Manage Trip
                        </h3>
                        <div className="flex justify-center">
                            <DeleteTripClient
                                tripId={trip.id}
                                title={trip.title ?? "Trip"}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

/* ---------------- helpers ---------------- */

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