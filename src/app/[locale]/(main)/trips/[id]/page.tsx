import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClientServerRSC } from "@/lib/supabase/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    CalendarDays,
    Plus,
    Plane,
    Clock,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    DollarSign,
    MapPin,
} from "lucide-react";

import TripViewerClient from "./TripViewerClient";
import TripActionsClient, { TripConfig } from "@/app/[locale]/(main)/trips/TripActionsClient";
import Image from "next/image";
import { ParallaxHero } from "@/components/trips/ParallaxHero";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// --- NEW IMPORTS ---
import {
    ShareCard,
    ExportCard,
    DangerZoneCard,
    CollaboratorsCard
} from "./TripManagement";


export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { id } = await params;
    const sb = await createClientServerRSC();

    // Fetch just the title for metadata
    const { data: trip } = await sb
        .schema("itinero")
        .from("trips")
        .select("title")
        .eq("id", id)
        .single();

    return {
        title: trip?.title || "Trip Details",
    };
}

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
    country_code: string | null;
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
        trip_title?: string;
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
    tipping?: string;
    payment?: string;
    photography?: string;
    gestures?: string;
    dress_code?: string;
    cost_coffee?: string;
    cost_meal?: string;
    cost_beer?: string;
    etiquette_dos?: string;
    etiquette_donts?: string;
    packing_tips?: string;
    emergency_police?: string;
    emergency_medical?: string;
    hidden_gem_title?: string;
    hidden_gem_desc?: string;
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
    country_code?: string;
    timezone?: string;
    plugs?: string[];
    languages?: string[];
    weather_desc?: string;
    weather_temp_c?: number;
    transport?: string[];
    esim_provider?: string;
    description?: string;
    history?: string;
    tipping?: string;
    payment?: string;
    photography?: string;
    gestures?: string;
    dress_code?: string;
    cost_coffee?: string;
    cost_meal?: string;
    cost_beer?: string;
    etiquette_dos?: string;
    etiquette_donts?: string;
    packing_tips?: string;
    emergency_police?: string;
    emergency_medical?: string;
    hidden_gem_title?: string;
    hidden_gem_desc?: string;
    image?: string;
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
        if (isUnknownRecord(weatherRaw) || Array.isArray(weatherRaw) || isString(weatherRaw))
            kb.weather = weatherRaw as JSONValue;

        const gettingAround = kbygRaw["getting_around"];
        if (isString(gettingAround)) kb.getting_around = gettingAround;

        const esim = kbygRaw["esim"];
        if (isString(esim)) kb.esim = esim;

        const primaryCity = kbygRaw["primary_city"];
        if (isString(primaryCity)) kb.primary_city = primaryCity;

        const tipping = kbygRaw["tipping"];
        if (isString(tipping)) kb.tipping = tipping;

        const payment = kbygRaw["payment"];
        if (isString(payment)) kb.payment = payment;

        const photography = kbygRaw["photography"];
        if (isString(photography)) kb.photography = photography;

        const gestures = kbygRaw["gestures"];
        if (isString(gestures)) kb.gestures = gestures;

        const dressCode = kbygRaw["dress_code"];
        if (isString(dressCode)) kb.dress_code = dressCode;

        const costCoffee = kbygRaw["cost_coffee"];
        if (isString(costCoffee)) kb.cost_coffee = costCoffee;

        const costMeal = kbygRaw["cost_meal"];
        if (isString(costMeal)) kb.cost_meal = costMeal;

        const costBeer = kbygRaw["cost_beer"];
        if (isString(costBeer)) kb.cost_beer = costBeer;

        const etiquetteDos = kbygRaw["etiquette_dos"];
        if (isString(etiquetteDos)) kb.etiquette_dos = etiquetteDos;

        const etiquetteDonts = kbygRaw["etiquette_donts"];
        if (isString(etiquetteDonts)) kb.etiquette_donts = etiquetteDonts;

        const packingTips = kbygRaw["packing_tips"];
        if (isString(packingTips)) kb.packing_tips = packingTips;

        const emergencyPolice = kbygRaw["emergency_police"];
        if (isString(emergencyPolice)) kb.emergency_police = emergencyPolice;

        const emergencyMedical = kbygRaw["emergency_medical"];
        if (isString(emergencyMedical)) kb.emergency_medical = emergencyMedical;

        const hiddenGemTitle = kbygRaw["hidden_gem_title"];
        if (isString(hiddenGemTitle)) kb.hidden_gem_title = hiddenGemTitle;

        const hiddenGemDesc = kbygRaw["hidden_gem_desc"];
        if (isString(hiddenGemDesc)) kb.hidden_gem_desc = hiddenGemDesc;

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
    hist: DestinationHistoryRow | null | undefined,
    countryCode?: string | null
): {
    meta?: DestinationMetaLike;
    heroUrl?: string;
} {
    if (!hist) return countryCode ? { meta: { country_code: countryCode } } : {};
    const payload = coercePayload(hist.payload);
    const k = payload.kbyg ?? {};

    const weatherRaw = k.weather;

    const meta: DestinationMetaLike = {
        description: payload.about ?? undefined,
        history: payload.history ?? undefined,
        currency_code: isString(k.currency) ? k.currency : undefined,
        country_code: countryCode || undefined,
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
            isString(weatherRaw)
                ? weatherRaw
                : isUnknownRecord(weatherRaw) && isString(weatherRaw["summary"])
                    ? (weatherRaw["summary"] as string)
                    : undefined,
        weather_temp_c:
            isUnknownRecord(weatherRaw) && typeof weatherRaw["temperature"] === "number"
                ? (weatherRaw["temperature"] as number)
                : undefined,
        transport: isString(k.getting_around)
            ? k
                .getting_around!.split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
        esim_provider: isString(k.esim) ? k.esim : undefined,
        city: isString(k.primary_city) ? k.primary_city : undefined,
        tipping: k.tipping,
        payment: k.payment,
        photography: k.photography,
        gestures: k.gestures,
        dress_code: k.dress_code,
        cost_coffee: k.cost_coffee,
        cost_meal: k.cost_meal,
        cost_beer: k.cost_beer,
        etiquette_dos: k.etiquette_dos,
        etiquette_donts: k.etiquette_donts,
        packing_tips: k.packing_tips,
        emergency_police: k.emergency_police,
        emergency_medical: k.emergency_medical,
        hidden_gem_title: k.hidden_gem_title,
        hidden_gem_desc: k.hidden_gem_desc,
        image: hist.backdrop_image_url ?? undefined,
    };

    return { meta, heroUrl: hist.backdrop_image_url };
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
        return { name: l.name, lat: l.lat, lng: l.lng };
    }
    return null;
}

/** 🔑 Next.js 15: params is a Promise and must be awaited */
export default async function TripIdPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const tripId = id;
    const t = await getTranslations("TripDetails");

    const sb = await createClientServerRSC();

    // Auth (SSR)
    const {
        data: { user },
    } = await sb.auth.getUser();
    if (!user) redirect("/login");

    // 1) Initial Data Fetch (Parallel)
    const [profileRes, tripRes, itemsRes, routesRes] = await Promise.all([
        sb.schema("itinero").from("profiles").select("preferred_currency, passport_country").eq("id", user.id).single(),
        sb.schema("itinero").from("trips").select("*").eq("id", id).maybeSingle<TripRow>(), // Kept * for now to avoid breaking complex types, but could be narrowed
        sb.schema("itinero").from("itinerary_items").select("*").eq("trip_id", id).order("date", { ascending: true, nullsFirst: true }).order("order_index", { ascending: true }),
        sb.schema("itinero").from("trip_day_routes").select("date,polyline6,polyline").eq("trip_id", id)
    ]);

    const { data: profile } = profileRes;
    const { data: trip, error: tripErr } = tripRes;
    const { data: items, error: itemsErr } = itemsRes;
    const { data: routes } = routesRes;

    const userPreferredCurrency = profile?.preferred_currency ?? "USD";
    const userPassportCountry = profile?.passport_country;

    if (tripErr || !trip) {
        return (
            <div className="mx-auto mt-10 max-w-2xl px-4">
                <Button asChild variant="ghost" className="mb-3 rounded-full">
                    <Link href="/trips">
                        <ArrowLeft className="mr-2 h-4 w-4" /> {t("Header.backToTrips")}
                    </Link>
                </Button>
                <Card className="rounded-3xl border-none shadow-md">
                    <CardHeader>
                        <CardTitle>
                            {tripErr ? t("Header.loadErrorTitle") : t("Header.notFoundTitle")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        {tripErr?.message ??
                            t("Header.notFoundDesc")}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Determine Currency
    const tripCurrency = trip.currency ?? "USD";

    if (itemsErr) {
        return (
            <div className="mx-auto mt-10 max-w-2xl px-4">
                <Button asChild variant="ghost" className="mb-3 rounded-full">
                    <Link href="/trips">
                        <ArrowLeft className="mr-2 h-4 w-4" /> {t("Header.backToTrips")}
                    </Link>
                </Button>
                <Card className="rounded-3xl border-none shadow-md">
                    <CardHeader>
                        <CardTitle>{t("Header.itemsErrorTitle")}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        {itemsErr.message ?? t("Header.itemsErrorDesc")}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const safeItems: ItemRow[] = Array.isArray(items) ? (items as ItemRow[]) : [];

    // 2) Dependency-based fetches (Places & Routes were already fetched if no dependency)
    // Places depend on item results
    const placeIds = Array.from(
        new Set(safeItems.map((r) => r.place_id).filter(Boolean))
    ) as string[];

    // Destination fetch depends on trip
    const destId = trip.destination_id;

    const [placesRes, destRes] = await Promise.all([
        placeIds.length
            ? sb.schema("itinero").from("places").select("id,name,lat,lng,category,popularity,cost_typical,cost_currency,tags").in("id", placeIds)
            : Promise.resolve({ data: [] }),
        destId
            ? sb.schema("itinero").from("destinations").select("id,name,lat,lng,current_history_id,country_code").eq("id", destId).maybeSingle<DestinationRow>()
            : Promise.resolve({ data: null })
    ]);

    let places = (placesRes.data ?? []) as PlaceRow[];
    let destination = (destRes.data ?? null) as DestinationRow | null;

    // 3) Final round of dependencies (History depends on destination)
    const historyId = destination?.current_history_id;
    const targetCity = destination?.name || (trip.inputs as any)?.destinations?.[0]?.name;

    const [historyRes, guidesRes] = await Promise.all([
        historyId
            ? sb.schema("itinero").from("destination_history").select("id,section,payload,sources,created_at,backdrop_image_url,backdrop_image_attribution").eq("id", historyId).maybeSingle<DestinationHistoryRow>()
            : Promise.resolve({ data: null }),
        targetCity
            ? sb.schema("itinero").from("tour_guide_requests").select("*").eq("status", "approved").ilike("city", `%${targetCity}%`)
            : Promise.resolve({ data: [] })
    ]);

    let history = (historyRes.data ?? null) as DestinationHistoryRow | null;
    let tourGuidesRaw = guidesRes.data ?? [];

    // 4) Enrich guides with profiles if found
    let tourGuides: any[] = [];
    if (tourGuidesRaw.length > 0) {
        const userIds = tourGuidesRaw.map((g: any) => g.user_id);
        const { data: guideProfiles } = await sb
            .schema("itinero")
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", userIds);

        tourGuides = tourGuidesRaw.map((g: any) => ({
            ...g,
            profiles: guideProfiles?.find((p) => p.id === g.user_id) || null,
        }));
    }

    // ---- Optional per-day polylines processing ----
    const polyByDate = new Map<string, string>();
    (routes ?? []).forEach((r: DayRouteRow) => {
        const key = r.date ?? "";
        const poly = r.polyline6 ?? r.polyline ?? undefined;
        if (key && poly) polyByDate.set(key, poly);
    });

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


    const { meta: destMeta, heroUrl } =
        buildDestinationMetaFromHistoryRow(history, destination?.country_code);

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

    const enrichedInputs: any = {
        ...(parsedInputs ?? {}),
        ...(enrichedDestList ? { destinations: enrichedDestList } : {}),
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
            currency: tripCurrency,
            inputs: enrichedInputs as TripRow["inputs"],
            start_date: trip.start_date ?? undefined,
            end_date: trip.end_date ?? undefined,
            trip_title: trip.title ?? undefined,
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

    // Guides already fetched in Step 3


    return (
        <div
            className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">

            {/* Hero Header */}
            <ParallaxHero
                title={trip.title ?? t("Header.titleFallback")}
                heroUrl={heroBackground}
                startDate={trip.start_date ?? undefined}
                estCost={typeof trip.est_total_cost === "number" ? Math.round(trip.est_total_cost) : undefined}
                currency={tripCurrency}
                interests={enrichedInputs?.interests as string[] | undefined}
            >
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
            </ParallaxHero>

            {/* Main Content */}
            <div className="relative z-10 -mt-20 mx-auto w-full max-w-6xl px-4 pb-20">

                {/* Viewer */}
                <div
                    className="mb-12 overflow-hidden  dark:border-slate-800  transition-all">
                    <TripViewerClient
                        tripId={trip.id}
                        data={previewLike}
                        startDate={previewLike.trip_summary.start_date}
                        userPreferredCurrency={userPreferredCurrency}
                        userPassportCountry={userPassportCountry}
                        tourGuides={tourGuides}
                    />
                </div>

                {/* Trip Settings & Management Grid */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t("Header.tripSettings")}</h3>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* 1. Share */}
                        <ShareCard
                            tripId={trip.id}
                            publicId={trip.public_id}
                            isPublic={!!trip.public_id}
                        />

                        {/* 2. Export */}
                        <ExportCard
                            tripId={trip.id}
                            title={trip.title ?? "Trip"}
                            days={days}
                        />

                        {/* 3. Collaborators */}
                        <CollaboratorsCard />

                        {/* 4. Danger Zone (Full width on large screens) */}
                        <div className="md:col-span-2 lg:col-span-3">
                            <DangerZoneCard tripId={trip.id} title={trip.title ?? "Trip"} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

/* ---------------- helpers ---------------- */

function groupItemsByDayIndex(items: ItemRow[]) {
    const map = new Map<number, { date: string | null; items: ItemRow[] }>();
    for (const it of items) {
        const key = it.day_index;
        if (!map.has(key)) map.set(key, { date: it.date, items: [] });
        map.get(key)!.items.push(it);
    }
    return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([dayIndex, v]) => ({ dayIndex, date: v.date, items: v.items }));
}