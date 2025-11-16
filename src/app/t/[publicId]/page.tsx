// app/t/[publicId]/page.tsx
import * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClientServerRSC } from "@/lib/supabase/server";
import PublicItineraryClient from "./public-itinerary-client";
import {
    MapPin,
    DollarSign,
    Plug,
    Globe,
    Phone,
    CloudSun,
    ChevronDown,
    User2,
} from "lucide-react";
import MapSection from "@/app/t/[publicId]/MapSection";

/* ---------------- Types ---------------- */

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

/** New: raw row from itinero.itinerary_items */
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
    date?: string | null; // ISO timestamp
    when?: string | null; // optional friendly label if you store one
}
    | null;

/* ---------------- Coercion helpers ---------------- */

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
    key: T,
): obj is Record<T, unknown> & typeof obj {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function coercePayload(u: unknown): DestinationHistoryPayload {
    const out: DestinationHistoryPayload = {};
    if (!isObject(u)) return out;

    if (typeof u.about === "string") out.about = u.about;
    if (typeof u.history === "string") out.history = u.history;

    // Safely read u.kbyg without `any`
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

/* ---------------- Metadata (SEO) ---------------- */

export async function generateMetadata({
                                           params,
                                       }: {
    params: { publicId: string };
}): Promise<Metadata> {
    const sb = await createClientServerRSC();

    const { data: trip } = await sb
        .schema("itinero")
        .from("trips")
        .select("title, cover_url, start_date, end_date, destination_id")
        .eq("public_id", params.publicId)
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

    const title = trip?.title ? `${trip.title} • Itinero` : "Shared Trip • Itinero";
    const description =
        trip?.start_date || trip?.end_date
            ? `Travel dates: ${formatDateRange(
                trip?.start_date ?? undefined,
                trip?.end_date ?? undefined,
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
        twitter: { card: "summary_large_image", title, description, images: [ogImage] },
    };
}

/* ---------------- Page ---------------- */

export default async function PublicTripPage({
                                                 params,
                                             }: {
    params: { publicId: string };
}) {
    const sb = await createClientServerRSC();

    // Load trip (include user_id for owner)
    const { data, error } = await sb
        .schema("itinero")
        .from("trips")
        .select("*")
        .eq("public_id", params.publicId)
        .maybeSingle<TripRowLoose>();

    if (error || !data) notFound();

    // Fetch owner profile (optional, fail-soft)
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

    // Destination history
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
                    "id,section,payload,sources,created_at,backdrop_image_url,backdrop_image_attribution",
                )
                .eq("id", dest.current_history_id)
                .maybeSingle<DestinationHistoryRow>();
            hist = hRow ?? null;
        }
    }

    const { meta: destMeta, heroUrl, attribution } = buildMetaFromHistory(hist);

    const title = (data.title ?? "Shared Trip").trim();
    const dateRange = formatDateRange(
        data.start_date ?? undefined,
        data.end_date ?? undefined,
    );

    // Prefer destination_history backdrop over trip.cover_url
    const cover =
        data.cover_url ||
        heroUrl ||
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop";

    // Tolerant parsing for trip content
    const tripSummary: TripSummary = (data.trip_summary as TripSummary) ?? null;

    // ===== NEW: Pull itinerary from itinero.itinerary_items =====
    const { data: itemsRows } = await sb
        .schema("itinero")
        .from("itinerary_items")
        .select(
            "id,trip_id,place_id,title,notes,est_cost,duration_min,travel_min_from_prev,when, date",
        )
        .eq("trip_id", data.id)
        .order("date", { ascending: true, nullsFirst: true })
        .returns<ItineraryItemRow[]>();

    const items = Array.isArray(itemsRows)
        ? (itemsRows.filter(Boolean) as NonNullable<ItineraryItemRow>[])
        : [];

    // Collect place ids used by itinerary items
    const placeIds = Array.from(
        new Set(items.map((it) => it.place_id).filter(Boolean)),
    ) as string[];

    // Fetch details for places referenced in itinerary
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

    // Build Day[] structure for the client component (group by date)
    const days: Day[] =
        items.length > 0
            ? buildDaysFromItems(items)
            : fallbackDaysFromTrip(data.days);

    // Build PlaceLite[] from fetched placeDetails (fallback to legacy if any)
    const places: PlaceLite[] =
        (placeDetails?.length
            ? placeDetails.map(({ id, name, category }) => ({
                id,
                name,
                category: category ?? null,
            }))
            : asPlaceArray(data.places)) ?? [];

    // Owner pill content
    const ownerName =
        (owner?.full_name && owner.full_name.trim()) ||
        (owner?.username && `@${owner.username}`) ||
        null;
    const ownerAvatar = owner?.avatar_url || null;

    // Interests (top, non-collapsible)
    const interests = extractInterests(data.inputs, tripSummary);

    return (
        <div className="min-h-dvh bg-background text-foreground">
            {/* HERO */}
            <section className="relative h-[40svh] w-full overflow-hidden sm:h-[44svh]">
                <Image
                    src={cover}
                    alt={title}
                    priority
                    fill
                    className="object-cover"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60" />
                <div className="absolute inset-x-0 bottom-0">
                    <div className="mx-auto w-full max-w-5xl px-4 pb-5 md:max-w-6xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/20 backdrop-blur">
                            View-only share
                        </div>

                        <h1 className="mt-2 text-pretty text-2xl font-bold tracking-tight text-white drop-shadow sm:text-3xl md:text-4xl">
                            {title}
                        </h1>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-white/90">
                            <p className="text-sm sm:text-base">{dateRange}</p>

                            {/* Owner pill */}
                            {ownerName && (
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs ring-1 ring-white/20 backdrop-blur">
                  <span className="relative inline-block h-5 w-5 overflow-hidden rounded-full bg-white/20">
                    {ownerAvatar ? (
                        <Image
                            src={ownerAvatar}
                            alt={ownerName}
                            fill
                            sizes="24px"
                            className="object-cover"
                        />
                    ) : (
                        <User2 className="absolute inset-0 m-auto h-4 w-4 text-white/80" />
                    )}
                  </span>
                  <span className="font-medium">{ownerName}</span>
                </span>
                            )}
                        </div>

                        {/* Interests (top, not collapsible) */}
                        {interests.length > 0 && (
                            <div className="mt-3">
                                <InterestChips interests={interests} pillTone="light" />
                            </div>
                        )}

                        {attribution && (
                            <p className="mt-1 text-[11px] text-white/75">{attribution}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ===== MAIN PRIORITY: Itinerary first (built from itinerary_items) ===== */}
            <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8 md:max-w-6xl">
                <PublicItineraryClient
                    currency={data.currency ?? "USD"}
                    estTotalCost={coerceNumber(data.est_total_cost)}
                    tripSummary={tripSummary}
                    days={days}
                    places={places}
                    placeDetails={placeDetails}
                />
            </main>

            {/* Destination knowledge (collapsible) — AFTER itinerary */}
            {(destMeta?.description ||
                destMeta?.history ||
                destMeta?.currency_code ||
                destMeta?.plugs ||
                destMeta?.languages ||
                destMeta?.transport ||
                destMeta?.esim_provider ||
                destMeta?.city ||
                destMeta?.weather_desc) && (
                <section className="mx-auto w-full max-w-5xl px-4 pt-2 pb-8 sm:pt-3 md:max-w-6xl">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* About / History */}
                        <div className="space-y-3 sm:col-span-2">
                            {destMeta?.description && (
                                <CollapsibleCard title="About">
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {destMeta.description}
                                    </p>
                                </CollapsibleCard>
                            )}
                            {destMeta?.history && (
                                <CollapsibleCard title="History">
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {destMeta.history}
                                    </p>
                                </CollapsibleCard>
                            )}
                        </div>

                        {/* Know before you go (icons) */}
                        <div className="sm:col-span-1">
                            <CollapsibleCard title="Destination at a glance">
                                <IconFacts
                                    facts={[
                                        { label: "City", value: destMeta?.city, Icon: MapPin },
                                        {
                                            label: "Currency",
                                            value: destMeta?.currency_code,
                                            Icon: DollarSign,
                                        },
                                        {
                                            label: "Plugs",
                                            value: joinArr(destMeta?.plugs),
                                            Icon: Plug,
                                        },
                                        {
                                            label: "Languages",
                                            value: joinArr(destMeta?.languages),
                                            Icon: Globe,
                                        },
                                        {
                                            label: "Getting around",
                                            value: joinArr(destMeta?.transport),
                                            Icon: MapPin,
                                        },
                                        {
                                            label: "eSIM",
                                            value: destMeta?.esim_provider,
                                            Icon: Phone,
                                        },
                                        {
                                            label: "Weather",
                                            value: destMeta?.weather_desc,
                                            Icon: CloudSun,
                                        },
                                    ]}
                                />
                            </CollapsibleCard>
                        </div>
                    </div>
                </section>
            )}

            {/* Map (collapsible) — plots all places with coordinates via Leaflet */}
            {placeDetails.length > 0 && (
                <section className="mx-auto w-full max-w-5xl px-4 pt-2 pb-8 sm:pt-3 md:max-w-6xl">
                    <CollapsibleCard title="Map of places" initialOpen={false}>
                        {/* additional wrapper to enforce bounds inside details */}
                        <div className="relative isolate overflow-hidden rounded-xl border border-border/60">
                            <MapSection places={placeDetails} />
                        </div>
                    </CollapsibleCard>
                </section>
            )}

            {/* Footer */}
            <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
                Shared via Itinero — plan smarter, wander farther.
            </footer>
        </div>
    );
}

/* ---------------- Presentational bits ---------------- */

function CollapsibleCard({
                             title,
                             children,
                             /** renamed from defaultOpen */
                             initialOpen = false,
                         }: {
    title: string;
    children: React.ReactNode;
    initialOpen?: boolean;
}) {
    return (
        <details
            className="group rounded-2xl border border-border/40 bg-card/70"
            open={initialOpen || undefined}
        >
            <summary
                className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 sm:px-5"
                style={{ listStyle: "none" }}
            >
                <span className="text-sm font-semibold tracking-wide">{title}</span>
                <ChevronDown
                    className="h-4 w-4 transition-transform duration-200 ease-out group-open:rotate-180"
                    aria-hidden
                />
            </summary>
            <div className="border-t border-border/40 px-4 py-4 sm:px-5">
                {children}
            </div>
        </details>
    );
}

function IconFacts({
                       facts,
                   }: {
    facts: Array<{
        label: string;
        value?: string | null;
        Icon: React.ComponentType<{ className?: string }>;
    }>;
}) {
    const rows = facts.filter(
        (f) => f.value && String(f.value).trim().length > 0,
    );
    if (rows.length === 0) return null;

    return (
        <dl className="grid grid-cols-1 gap-2">
            {rows.map(({ label, value, Icon }) => (
                <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/40 px-3 py-2"
                >
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background/80">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </span>
                    <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="text-sm font-medium">{value}</dd>
                    </div>
                </div>
            ))}
        </dl>
    );
}

/* ===== Interests UI (top, non-collapsible) ===== */

function InterestChips({
                           interests,
                           pillTone = "light",
                       }: {
    interests: string[];
    /** "light" = for dark hero, "default" = for normal sections */
    pillTone?: "light" | "default";
}) {
    const base =
        pillTone === "light"
            ? "border-white/30 bg-white/10 text-white"
            : "border-border/60 bg-background/50 text-foreground";
    return (
        <ul className="flex flex-wrap gap-2">
            {interests.map((raw) => {
                const label = titleCase(raw);
                const emoji = interestEmoji(raw);
                return (
                    <li
                        key={raw}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm backdrop-blur ${base}`}
                        title={label}
                    >
            <span aria-hidden className="text-base leading-none">
              {emoji}
            </span>
                        <span className="leading-none">{label}</span>
                    </li>
                );
            })}
        </ul>
    );
}

/* ---------------- Server helpers ---------------- */

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
    tripSummary: TripSummary,
): string[] {
    const fromInputs = parseInterestsFrom(inputsRaw);
    if (fromInputs.length > 0) return fromInputs;

    const inner = isObject(tripSummary)
        ? (tripSummary.inputs as unknown)
        : null;
    return parseInterestsFrom(inner);
}

function parseInterestsFrom(maybe: unknown): string[] {
    // Accept JSON string or object; avoid `any`
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

/** Basic, friendly emoji map with fuzzy keys */
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

/* ===== NEW: Build days from itinerary_items (with graceful fallback) ===== */

function buildDaysFromItems(
    items: NonNullable<ItineraryItemRow>[],
): Day[] {
    // Group by YYYY-MM-DD (use local time to be consistent with UI expectations)
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

    // Order dates ascending; within a date they are already ordered by date from the query
    const out: Day[] = Array.from(byDate.entries())
        .sort(([a], [b]) =>
            a === "unscheduled"
                ? 1
                : b === "unscheduled"
                    ? -1
                    : a.localeCompare(b),
        )
        .map(([date, blocks]) => ({
            date: date === "unscheduled" ? null : date,
            blocks,
        }));

    return out;
}

function fallbackDaysFromTrip(daysRaw: unknown): Day[] {
    // Keep existing behaviour if there are no itinerary_items yet
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