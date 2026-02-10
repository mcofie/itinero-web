import * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClientServerRSC } from "@/lib/supabase/server";
import PublicItineraryClient from "./public-itinerary-client";
import {
    Compass,
    Wallet,
    DollarSign,
    MapPin,
    CloudSun,
    Globe,
    Plug,
    Phone,
    CalendarDays,
    Plane
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParallaxHero } from "@/components/trips/ParallaxHero";
import SharedPlacesList from "./SharedPlacesList";
import { SharedTripIntelligence } from "./SharedTripIntelligence";
import { ExchangeRateCard } from "@/components/trips/ExchangeRateCard";
import { WeatherWidget } from "@/components/trips/WeatherWidget";
import MapSection from "./MapSection";

/* ---------------- Types (Preserved) ---------------- */

type TripSummary = Record<string, unknown> | null;

type DayBlock = {
    when?: string | null;
    title?: string | null;
    notes?: string | null;
    est_cost?: number | null;
    duration_min?: number | null;
    travel_min_from_prev?: number | null;
    place_id?: string | null;
};

export type Day = {
    date?: string | null;
    blocks: DayBlock[];
};

export type PlaceLite = {
    id: string;
    name: string;
    category?: string | null;
};

type TripRowLoose =
    | {
        id: string;
        public_id?: string | null;
        user_id?: string | null;
        title?: string | null;
        start_date?: string | null;
        end_date?: string | null;
        est_total_cost?: number | null;
        currency?: string | null;
        created_at?: string | null;
        inputs?: unknown;
        trip_summary?: unknown;
        days?: unknown; // legacy
        places?: unknown;
        cover_url?: string | null;
        destination_id?: string | null;
    }
    | null;

type DestinationRow =
    | {
        id: string;
        name: string | null;
        current_history_id: string | null;
    }
    | null;

type DestinationHistoryRow =
    | {
        id?: string;
        section?: string | null;
        payload?: unknown;
        sources?: unknown;
        created_at?: string | Date | null;
        backdrop_image_url?: string | null;
        backdrop_image_attribution?: string | null;
    }
    | null;

type ItineroKBYG = {
    currency?: string;
    plugs?: string;
    languages?: string[] | string;
    weather?: Record<string, unknown> | unknown;
    getting_around?: string;
    esim?: string;
    primary_city?: string;
};

type PlaceDetail = {
    id: string;
    name: string;
    category?: string | null;
    lat?: number | null;
    lng?: number | null;
    address?: string | null;
};

type DestinationHistoryPayload = {
    about?: string;
    history?: string;
    kbyg?: ItineroKBYG;
};

type DestinationMetaLike = {
    description?: string;
    history?: string;
    currency_code?: string;
    plugs?: string[];
    languages?: string[];
    weather_desc?: string;
    transport?: string[];
    esim_provider?: string;
    city?: string;
};

type ProfileRow =
    | {
        id: string;
        full_name?: string | null;
        avatar_url?: string | null;
        username?: string | null;
    }
    | null;

type ItineraryItemRow =
    | {
        id: string;
        trip_id: string;
        place_id?: string | null;
        title?: string | null;
        notes?: string | null;
        est_cost?: number | null;
        duration_min?: number | null;
        travel_min_from_prev?: number | null;
        date?: string | null;
        when?: string | null;
    }
    | null;

/* ---------------- Helpers ---------------- */

function asPlaceArray(u: unknown): PlaceLite[] {
    if (!Array.isArray(u)) return [];
    return u
        .map((p) => {
            const obj = (p ?? {}) as Record<string, unknown>;
            const id = typeof obj.id === "string" ? obj.id : null;
            const name = typeof obj.name === "string" ? obj.name : null;
            if (!id || !name) return null;
            return {
                id,
                name,
                category: typeof obj.category === "string" ? obj.category : null,
            };
        })
        .filter(Boolean) as PlaceLite[];
}

function isObject(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null;
}

function hasKey<T extends string>(
    obj: Record<string, unknown>,
    key: T
): obj is Record<T, unknown> & typeof obj {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function coercePayload(u: unknown): DestinationHistoryPayload {
    const out: DestinationHistoryPayload = {};
    if (!isObject(u)) return out;

    if (typeof u.about === "string") out.about = u.about;
    if (typeof u.history === "string") out.history = u.history;

    if (hasKey(u, "kbyg") && isObject(u.kbyg)) {
        const k = u.kbyg as Record<string, unknown>;
        const kbyg: ItineroKBYG = {};

        if (typeof k.currency === "string") kbyg.currency = k.currency;
        if (typeof k.plugs === "string") kbyg.plugs = k.plugs;
        if (Array.isArray(k.languages)) kbyg.languages = k.languages as string[];
        else if (typeof k.languages === "string") kbyg.languages = k.languages;
        if (isObject(k.weather)) kbyg.weather = k.weather;
        if (typeof k.getting_around === "string")
            kbyg.getting_around = k.getting_around;
        if (typeof k.esim === "string") kbyg.esim = k.esim;
        if (typeof k.primary_city === "string") kbyg.primary_city = k.primary_city;

        out.kbyg = kbyg;
    }
    return out;
}

function buildMetaFromHistory(h: DestinationHistoryRow | null | undefined) {
    if (!h || !isObject(h))
        return {
            meta: undefined as DestinationMetaLike | undefined,
            heroUrl: undefined as string | undefined,
            attribution: undefined as string | undefined,
        };

    const payload = coercePayload(h.payload);
    const k = payload.kbyg ?? {};
    const weather =
        k.weather && isObject(k.weather)
            ? (k.weather as Record<string, unknown>)
            : undefined;

    const meta: DestinationMetaLike = {
        description: payload.about ?? undefined,
        history: payload.history ?? undefined,
        currency_code: typeof k.currency === "string" ? k.currency : undefined,
        plugs:
            typeof k.plugs === "string"
                ? k.plugs
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : undefined,
        languages: Array.isArray(k.languages)
            ? (k.languages as string[])
            : typeof k.languages === "string"
                ? k.languages
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : undefined,
        weather_desc:
            typeof weather?.summary === "string"
                ? (weather.summary as string)
                : undefined,
        transport:
            typeof k.getting_around === "string"
                ? k.getting_around
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : undefined,
        esim_provider: typeof k.esim === "string" ? k.esim : undefined,
        city: typeof k.primary_city === "string" ? k.primary_city : undefined,
    };

    return {
        meta,
        heroUrl:
            typeof h.backdrop_image_url === "string"
                ? h.backdrop_image_url
                : undefined,
        attribution:
            typeof h.backdrop_image_attribution === "string"
                ? h.backdrop_image_attribution
                : undefined,
    };
}

function formatDateRange(start?: string, end?: string) {
    if (!start && !end) return "—";
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
    return "—";
}

function coerceNumber(n: unknown): number | null {
    const v = Number(n);
    return Number.isFinite(v) ? v : null;
}

function joinArr(arr?: string[]) {
    if (!arr || arr.length === 0) return undefined;
    return arr.join(", ");
}

/* ===== Interests extraction + emoji mapping ===== */

function extractInterests(
    inputsRaw: unknown,
    tripSummary: TripSummary
): string[] {
    const fromInputs = parseInterestsFrom(inputsRaw);
    if (fromInputs.length > 0) return fromInputs;

    const inner = isObject(tripSummary)
        ? (tripSummary.inputs as unknown)
        : null;
    return parseInterestsFrom(inner);
}

function parseInterestsFrom(maybe: unknown): string[] {
    let obj: unknown = maybe;
    if (typeof maybe === "string") {
        try {
            obj = JSON.parse(maybe);
        } catch {
            return [];
        }
    }
    if (!isObject(obj)) return [];

    const interestsRaw =
        (hasKey(obj, "interests") ? (obj.interests as unknown) : undefined) ??
        undefined;

    if (Array.isArray(interestsRaw)) {
        return interestsRaw
            .map((v) => (typeof v === "string" ? v : String(v)))
            .map(normalizeInterest)
            .filter(Boolean);
    }

    if (typeof interestsRaw === "string") {
        return interestsRaw
            .split(/[,\n]/g)
            .map((s) => s.trim())
            .filter(Boolean)
            .map(normalizeInterest);
    }

    return [];
}

function normalizeInterest(s: string): string {
    return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function titleCase(s: string): string {
    return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

function interestEmoji(s: string): string {
    const k = normalizeInterest(s);
    const map: Array<[RegExp, string]> = [
        [/food|cuisine|restaurant|street food|eat|dining/, "🍽️"],
        [/coffee|café|cafe|tea/, "☕"],
        [/wine|beer|bar|nightlife|cocktail/, "🍷"],
        [/museum|art|gallery|exhibit|culture/, "🖼️"],
        [/history|heritage|ruins|castle/, "🏛️"],
        [/beach|island|coast|sun/, "🏝️"],
        [/hike|hiking|trail|mountain|outdoors|nature|park/, "🥾"],
        [/wildlife|safari|zoo|animals/, "🦁"],
        [/shopping|market|bazaar|souvenir|mall/, "🛍️"],
        [/music|concert|live|festival/, "🎶"],
        [/theatre|theater|show|opera|ballet/, "🎭"],
        [/spa|wellness|relax|yoga/, "💆"],
        [/photography|photo|instagram|viewpoint|scenic/, "📸"],
        [/architecture|design|buildings|landmark/, "🏗️"],
        [/sports?|football|soccer|basketball|tennis|golf/, "🏅"],
        [/cycling|bike|bicycle/, "🚴"],
        [/ski|snow|winter|snowboard/, "🎿"],
        [/boats?|sailing|cruise|kayak|canoe/, "⛵"],
        [/family|kids|children/, "👨‍👩‍👧‍👦"],
        [/technology|innovation|science/, "🧪"],
        [/markets?|farmers|farmer|fresh/, "🧺"],
        [/street art|murals?/, "🎨"],
    ];
    for (const [re, emoji] of map) if (re.test(k)) return emoji;
    return "✨";
}

function buildDaysFromItems(items: NonNullable<ItineraryItemRow>[]): Day[] {
    const byDate = new Map<string, DayBlock[]>();

    for (const it of items) {
        const start = it.date ? new Date(it.date) : null;
        const dateKey = start ? toYMD(start) : "unscheduled";
        const list = byDate.get(dateKey) ?? [];
        list.push({
            when:
                it.when ??
                (start ? toTimeRangeLabel(start, it.duration_min ?? null) : null),
            title: it.title ?? null,
            notes: it.notes ?? null,
            est_cost: safeNum(it.est_cost),
            duration_min: safeNum(it.duration_min),
            travel_min_from_prev: safeNum(it.travel_min_from_prev),
            place_id: it.place_id ?? null,
        });
        byDate.set(dateKey, list);
    }

    const out: Day[] = Array.from(byDate.entries())
        .sort(([a], [b]) =>
            a === "unscheduled"
                ? 1
                : b === "unscheduled"
                    ? -1
                    : a.localeCompare(b)
        )
        .map(([date, blocks]) => ({
            date: date === "unscheduled" ? null : date,
            blocks,
        }));

    return out;
}

function fallbackDaysFromTrip(daysRaw: unknown): Day[] {
    return asDayArray(daysRaw);
}

function asDayArray(u: unknown): Day[] {
    if (!Array.isArray(u)) return [];
    return u.map((d) => {
        const obj = (d ?? {}) as Record<string, unknown>;
        return {
            date: typeof obj.date === "string" ? obj.date : null,
            blocks: asBlockArray((obj as { blocks?: unknown }).blocks),
        };
    });
}

function asBlockArray(u: unknown): DayBlock[] {
    if (!Array.isArray(u)) return [];
    return u.map((b) => {
        const obj = (b ?? {}) as Record<string, unknown>;
        const num = (x: unknown): number | null => {
            const v = Number(x);
            return Number.isFinite(v) ? v : null;
        };
        return {
            when: typeof obj.when === "string" ? obj.when : null,
            title: typeof obj.title === "string" ? obj.title : null,
            notes: typeof obj.notes === "string" ? obj.notes : null,
            est_cost: num(obj.est_cost),
            duration_min: num(obj.duration_min),
            travel_min_from_prev: num(obj.travel_min_from_prev),
            place_id: typeof obj.place_id === "string" ? obj.place_id : null,
        };
    });
}

function toYMD(d: Date): string {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${dd}`;
}

function toTimeRangeLabel(start: Date, durationMin: number | null): string {
    const startStr = start.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });
    if (!durationMin || durationMin <= 0) return startStr;
    const end = new Date(start.getTime() + durationMin * 60 * 1000);
    const endStr = end.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
    });
    return `${startStr} – ${endStr}`;
}

function safeNum(n: unknown): number | null {
    const v = Number(n);
    return Number.isFinite(v) ? v : null;
}

/* ---------------- Metadata ---------------- */

export async function generateMetadata({
    params,
}: {
    params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
    const { publicId } = await params;
    const sb = await createClientServerRSC();

    const { data: trip } = await sb
        .schema("itinero")
        .from("trips")
        .select("title, cover_url, start_date, end_date, destination_id")
        .eq("public_id", publicId)
        .maybeSingle();

    let ogImage =
        trip?.cover_url ||
        "https://images.unsplash.com/photo-1526772662000-3b5ec3a7fe05ff?q=80&w=1600&auto=format&fit=crop";

    if (trip?.destination_id) {
        const { data: dest } = await sb
            .schema("itinero")
            .from("destinations")
            .select("id,current_history_id")
            .eq("id", trip.destination_id)
            .maybeSingle<DestinationRow>();

        if (dest?.current_history_id) {
            const { data: hist } = await sb
                .schema("itinero")
                .from("destination_history")
                .select("id,backdrop_image_url")
                .eq("id", dest.current_history_id)
                .maybeSingle<DestinationHistoryRow>();
            if (hist?.backdrop_image_url) ogImage = hist.backdrop_image_url;
        }
    }

    const title = trip?.title
        ? `${trip.title} • Itinero`
        : "Shared Trip • Itinero";
    const description =
        trip?.start_date || trip?.end_date
            ? `Travel dates: ${formatDateRange(
                trip?.start_date ?? undefined,
                trip?.end_date ?? undefined
            )}`
            : "View this shared itinerary on Itinero.";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: ogImage, width: 1600, height: 840 }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage],
        },
    };
}

/* ---------------- Main Page Component ---------------- */

export default async function PublicTripPage({
    params,
}: {
    params: Promise<{ publicId: string }>;
}) {
    const { publicId } = await params;
    const sb = await createClientServerRSC();

    const { data, error } = await sb
        .schema("itinero")
        .from("trips")
        .select("*")
        .eq("public_id", publicId)
        .maybeSingle<TripRowLoose>();

    if (error || !data) notFound();

    // Determine Trip Currency
    const tripCurrency = data.currency ?? "USD";

    let owner: ProfileRow = null;
    if (data.user_id) {
        const { data: o } = await sb
            .schema("itinero")
            .from("profiles")
            .select("id,full_name,avatar_url,username")
            .eq("id", data.user_id)
            .maybeSingle<ProfileRow>();
        owner = o ?? null;
    }

    let dest: DestinationRow = null;
    let hist: DestinationHistoryRow = null;

    if (data.destination_id) {
        const { data: dRow } = await sb
            .schema("itinero")
            .from("destinations")
            .select("id,name,current_history_id")
            .eq("id", data.destination_id)
            .maybeSingle<DestinationRow>();
        dest = dRow ?? null;

        if (dest?.current_history_id) {
            const { data: hRow } = await sb
                .schema("itinero")
                .from("destination_history")
                .select(
                    "id,section,payload,sources,created_at,backdrop_image_url,backdrop_image_attribution"
                )
                .eq("id", dest.current_history_id)
                .maybeSingle<DestinationHistoryRow>();
            hist = hRow ?? null;
        }
    }

    const { meta: destMeta, heroUrl } = buildMetaFromHistory(hist);

    const title = (data.title ?? "Shared Trip").trim();
    const dateRange = formatDateRange(
        data.start_date ?? undefined,
        data.end_date ?? undefined
    );

    const cover =
        data.cover_url ||
        heroUrl ||
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop";

    const tripSummary: TripSummary = (data.trip_summary as TripSummary) ?? null;
    const tripInputs = data.inputs as any;

    const { data: itemsRows } = await sb
        .schema("itinero")
        .from("itinerary_items")
        .select(
            "id,trip_id,place_id,title,notes,est_cost,duration_min,travel_min_from_prev,when, date"
        )
        .eq("trip_id", data.id)
        .order("date", { ascending: true, nullsFirst: true })
        .returns<ItineraryItemRow[]>();

    const items = Array.isArray(itemsRows)
        ? (itemsRows.filter(Boolean) as NonNullable<ItineraryItemRow>[])
        : [];

    const placeIds = Array.from(
        new Set(items.map((it) => it.place_id).filter(Boolean))
    ) as string[];

    let placeDetails: PlaceDetail[] = [];
    if (placeIds.length > 0) {
        const { data: placeRows } = await sb
            .schema("itinero")
            .from("places")
            .select("id,name,category,lat,lng,description")
            .in("id", placeIds)
            .returns<PlaceDetail[]>();
        placeDetails = placeRows ?? [];
    }

    const days: Day[] =
        items.length > 0
            ? buildDaysFromItems(items)
            : fallbackDaysFromTrip(data.days);

    const places: PlaceLite[] =
        (placeDetails?.length
            ? placeDetails.map(({ id, name, category }) => ({
                id,
                name,
                category: category ?? null,
            }))
            : asPlaceArray(data.places)) ?? [];

    const ownerName =
        (owner?.full_name && owner.full_name.trim()) ||
        (owner?.username && `@${owner.username}`) ||
        null;
    const ownerAvatar = owner?.avatar_url || null;

    const interests = extractInterests(data.inputs, tripSummary);

    return (
        <div
            className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
            {/* 1. HERO SECTION (Immersive) */}
            {/* 1. HERO HEADER */}
            <ParallaxHero
                title={title}
                heroUrl={cover}
                startDate={data.start_date || undefined}
                estCost={data.est_total_cost || undefined}
                currency={tripCurrency}
                interests={interests}
            >
                <Link href="/trip-maker" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/20">
                    Create Your Own
                </Link>
            </ParallaxHero>

            {/* 2. MAIN CONTENT WRAPPER */}
            <div className="relative z-10 -mt-20 mx-auto max-w-6xl px-4 sm:px-6 pb-20 space-y-12">
                {/* A. INTRO & STATS GRID (Bento Style) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Overview / Description */}
                    <div className="lg:col-span-2 space-y-6">
                        {(destMeta?.description || interests.length > 0) && (
                            <div
                                className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                                {destMeta?.description && (
                                    <div className="prose prose-slate dark:prose-invert max-w-none">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                            About this trip
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                                            {destMeta.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Travel Toolkit & Intelligence */}
                        <SharedTripIntelligence meta={destMeta ?? undefined} />
                    </div>

                    {/* Right: Know Before You Go (Stats) */}
                    <div className="lg:col-span-1 flex flex-col gap-4 lg:sticky lg:top-24 self-start">
                        {/* Exchange Rate Card */}
                        <ExchangeRateCard
                            meta={destMeta ?? null}
                            baseCurrency={tripCurrency} // Using trip currency as base for public view or maybe needs user context but static for now
                            className="shrink-0"
                        />

                        {/* Weather Widget */}
                        <WeatherWidget
                            meta={destMeta ?? null}
                            lat={tripInputs?.destinations?.[0]?.lat}
                            lng={tripInputs?.destinations?.[0]?.lng}
                            startDate={data.start_date || undefined}
                            endDate={data.end_date || undefined}
                            className="shrink-0"
                        />

                        {/* Budget Card - Premium Gradient */}
                        {data.est_total_cost && (
                            <div
                                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-lg text-white">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <Wallet className="w-24 h-24 rotate-[-15deg] translate-x-4 translate-y-[-10px]" />
                                </div>

                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div
                                            className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">
                                            Est. Budget
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-4xl font-black tracking-tight text-white mb-1">
                                            {formatMoneyGeneric(data.est_total_cost, tripCurrency)}
                                        </p>
                                        <p className="text-xs font-medium text-emerald-100/80">
                                            Estimated total based on itinerary activities
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Facts Grid */}
                        <div
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-4 flex items-center gap-2">
                                <Compass className="w-4 h-4 text-blue-500" />
                                Trip Details
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <InfoCard icon={MapPin} label="City" value={destMeta?.city} delay={1} />
                                <InfoCard icon={DollarSign} label="Currency" value={destMeta?.currency_code} delay={2} />
                                <InfoCard icon={CloudSun} label="Weather" value={destMeta?.weather_desc} delay={3} />
                                <InfoCard icon={Globe} label="Language" value={joinArr(destMeta?.languages)} delay={4} />
                                <InfoCard icon={Plug} label="Plugs" value={joinArr(destMeta?.plugs)} delay={5} />
                                <InfoCard icon={Phone} label="eSIM" value={destMeta?.esim_provider} delay={6} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* B. ITINERARY TIMELINE */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <div
                                className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <CalendarDays className="w-5 h-5" />
                            </div>
                            Itinerary
                        </h2>
                    </div>

                    <div
                        className="overflow-hidden">
                        <PublicItineraryClient
                            currency={tripCurrency}
                            estTotalCost={coerceNumber(data.est_total_cost)}
                            tripSummary={tripSummary}
                            days={days}
                            places={places}
                            placeDetails={placeDetails}
                        />
                    </div>
                </div>

                {/* C. PLACES & MAP */}
                {placeDetails.length > 0 && (
                    <div className="space-y-8 pt-8">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Curated Places
                                </h2>
                            </div>
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {placeDetails.length} Locations
                            </span>
                        </div>

                        {/* Places Grid */}
                        <SharedPlacesList places={placeDetails} />

                        {/* Map View */}
                        <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm h-[400px] bg-slate-100 dark:bg-slate-800 relative mt-8">
                            <MapSection places={placeDetails} />
                            <div className="absolute bottom-6 left-6 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold shadow-md border border-slate-100 dark:border-slate-800 pointer-events-none z-[1000] text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                Interactive Map
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer
                className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 text-center transition-colors duration-300">
                <div className="mx-auto max-w-md px-6 space-y-4">
                    <div
                        className="flex items-center justify-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
                        <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                            <Plane className="h-4 w-4" />
                        </span>
                        Itinero
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Plan your next adventure in minutes.
                    </p>
                    <Button
                        asChild
                        className="rounded-full bg-slate-900 text-white hover:bg-slate-800 px-6 mt-4 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                        <Link href="/trip-maker">Start Planning Free</Link>
                    </Button>
                    <p className="text-xs text-slate-400 dark:text-slate-500 pt-8">
                        © {new Date().getFullYear()} Itinero Inc.
                    </p>
                </div>
            </footer>
        </div>
    );
}

/* ---------------- UI Components ---------------- */

function InfoCard({
    icon: Icon,
    label,
    value,
    delay = 0,
}: {
    icon: React.ElementType;
    label: string;
    value?: string | null;
    delay?: number;
}) {
    if (!value) return null;
    return (
        <div
            className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
            style={{ animationDelay: `${delay * 100}ms` }}
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-blue-500 dark:text-blue-400">
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {label}
                </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                {value}
            </p>
        </div>
    );
}

function formatMoneyGeneric(n: number, currency: string) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(n);
    } catch {
        return `${currency} ${Math.round(n).toLocaleString()}`;
    }
}

function InterestChips({
    interests,
    pillTone = "light",
}: {
    interests: string[];
    pillTone?: "light" | "default";
}) {
    const isLight = pillTone === "light";
    const containerClass = isLight
        ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
        : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700";

    return (
        <ul className="flex flex-wrap gap-2">
            {interests.map((raw) => {
                const label = titleCase(raw);
                const emoji = interestEmoji(raw);
                return (
                    <li
                        key={raw}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors cursor-default ${containerClass}`}
                    >
                        <span>{emoji}</span>
                        <span>{label}</span>
                    </li>
                );
            })}
        </ul>
    );
}