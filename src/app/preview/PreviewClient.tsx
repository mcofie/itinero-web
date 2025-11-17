"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {useTheme} from "next-themes";
import {createClientBrowser} from "@/lib/supabase/browser";

import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    Loader2,
    CalendarDays,
    MapPin,
    DollarSign,
    Footprints,
    Car,
    Bike,
    Train,
    Clock3,
    Check,
    Sparkles,
    Map as MapIcon,
    Download,
    Share2,
    PencilLine,
    ChevronDown,
    Globe,
    Plug,
    Phone,
    CloudSun, ChevronLeft, ChevronRight,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

/* =========================
   Types
========================= */
export type PreviewResponse = {
    trip_summary: {
        total_days: number;
        est_total_cost: number;
        currency?: string;
        inputs?: {
            destinations?: {
                id: string;
                name: string;
                lat?: number;
                lng?: number;
                cover_url?: string;
            }[];
            start_date?: string;
            end_date?: string;
            interests?: string[];
            pace?: "chill" | "balanced" | "packed";
            mode?: "walk" | "bike" | "car" | "transit";
            lodging?: { name: string; lat?: number; lng?: number } | null;
        };
        start_date?: string;
        end_date?: string;
    };
    days: Day[];
    places: Place[];
    destination_meta?: DestinationMetaLike;
};

export type Day = {
    date: string;
    blocks: Array<{
        when: "morning" | "afternoon" | "evening";
        place_id: string | null;
        title: string;
        est_cost: number;
        duration_min: number;
        travel_min_from_prev: number;
        notes?: string;
        alternatives?: Array<{
            id: string | null;
            name: string;
            est_cost: number;
        }>;
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

/* For destination_history row normalisation */
type DestinationHistoryRow = {
    destination_id?: string;
    description?: string | null;
    history?: string | null;
    city?: string | null;
    currency_code?: string | null;
    plugs?: string[] | string | null;
    languages?: string[] | string | null;
    transport?: string[] | string | null;
    esim_provider?: string | null;
    weather_desc?: string | null;
};

/* =========================
   Constants / utils
========================= */
const HERO_FALLBACK =
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop";

function modeToIcon(mode?: string) {
    if (!mode) return null;
    const cl = "mr-1 h-3.5 w-3.5";
    if (mode === "walk") return <Footprints className={cl}/>;
    if (mode === "bike") return <Bike className={cl}/>;
    if (mode === "car") return <Car className={cl}/>;
    if (mode === "transit") return <Train className={cl}/>;
    return null;
}

function emojiFor(tag: string) {
    const t = tag.toLowerCase();
    if (t.includes("beach")) return "🏝️";
    if (t.includes("food") || t.includes("dining")) return "🍽️";
    if (t.includes("culture") || t.includes("museum")) return "🖼️";
    if (t.includes("music")) return "🎶";
    if (t.includes("night")) return "🌙";
    if (t.includes("shop")) return "🛍️";
    if (t.includes("hiking") || t.includes("trail") || t.includes("nature") || t.includes("park"))
        return "🥾";
    if (t.includes("wildlife") || t.includes("safari")) return "🦁";
    if (t.includes("art")) return "🎨";
    if (t.includes("sports")) return "🏅";
    return "✨";
}

function formatDateRange(summary: PreviewResponse["trip_summary"]) {
    const start = summary.inputs?.start_date ?? summary.start_date;
    const end = summary.inputs?.end_date ?? summary.end_date;
    const fmt = (x?: string) =>
        x
            ? new Date(x + "T00:00:00").toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            : "—";
    if (start && end) return `${fmt(start)} → ${fmt(end)}`;
    return fmt(start || end);
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

function joinArr(arr?: string[]) {
    if (!arr || arr.length === 0) return undefined;
    return arr.join(", ");
}

function hasDestMeta(meta?: DestinationMetaLike) {
    if (!meta) return false;
    return Boolean(
        meta.description ||
        meta.history ||
        meta.currency_code ||
        (meta.plugs && meta.plugs.length) ||
        (meta.languages && meta.languages.length) ||
        (meta.transport && meta.transport.length) ||
        meta.esim_provider ||
        meta.city ||
        meta.weather_desc
    );
}

/* When badge helpers */
function whenEmoji(w: "morning" | "afternoon" | "evening") {
    if (w === "morning") return "🌅";
    if (w === "afternoon") return "🌞";
    return "🌙";
}

function whenLabel(w: "morning" | "afternoon" | "evening") {
    return `${whenEmoji(w)} ${w.charAt(0).toUpperCase() + w.slice(1)}`;
}

function whenBadgeClasses(w: "morning" | "afternoon" | "evening") {
    if (w === "morning") {
        return "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-300/70 dark:bg-amber-900/30 dark:text-amber-100";
    }
    if (w === "afternoon") {
        return "border border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-300/70 dark:bg-orange-900/30 dark:text-orange-100";
    }
    return "border border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-300/70 dark:bg-indigo-900/30 dark:text-indigo-100";
}

/* =========================
   Client-only dynamic
========================= */
const MapSection = dynamic(() => import("../t/[publicId]/MapSection"), {ssr: false});

/* =========================
   Main client component
========================= */
export default function PreviewClient({
                                          requiredPoints,
                                          initialPoints,
                                      }: {
    requiredPoints: number;
    initialPoints: number | null;
}) {
    const sb = createClientBrowser();
    const router = useRouter();
    const {resolvedTheme} = useTheme();
    const isDark = (resolvedTheme ?? "dark") === "dark";

    // Client state
    const [preview, setPreview] = React.useState<PreviewResponse | null>(null);
    const [loading, setLoading] = React.useState(true);

    const [points, setPoints] = React.useState<number | null>(initialPoints ?? null);
    const [pointsBusy, setPointsBusy] = React.useState(false);

    const [activeDayIdx, setActiveDayIdx] = React.useState(0);
    const [insufficientOpen, setInsufficientOpen] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    const [paywallLeft, setPaywallLeft] = React.useState<number>(10);
    const [showPaywall, setShowPaywall] = React.useState<boolean>(false);

    // Destination meta override from DB
    const [destMetaFromDb, setDestMetaFromDb] = React.useState<DestinationMetaLike | null>(null);

    // Load preview from localStorage (client-only)
    React.useEffect(() => {
        const raw =
            typeof window !== "undefined" ? localStorage.getItem("itinero:latest_preview") : null;
        if (raw) {
            try {
                setPreview(JSON.parse(raw) as PreviewResponse);
            } catch {
                setPreview(null);
            }
        }
        setLoading(false);
    }, []);

    // Refresh points (client) if unknown from server
    React.useEffect(() => {
        if (points !== null) return;
        (async () => {
            setPointsBusy(true);
            try {
                const {data: rpcBalance} = await sb.rpc("get_points_balance");
                if (typeof rpcBalance === "number") setPoints(rpcBalance);
            } finally {
                setPointsBusy(false);
            }
        })();
    }, [points, sb]);

    // Countdown to paywall (10s)
    React.useEffect(() => {
        if (showPaywall) return;
        let left = 10;
        setPaywallLeft(left);

        const timer = window.setInterval(() => {
            left -= 1;
            setPaywallLeft(left);
            if (left <= 0) {
                window.clearInterval(timer);
                setShowPaywall(true);
            }
        }, 2000);

        return () => {
            window.clearInterval(timer);
        };
    }, [showPaywall]);

    const inputs = React.useMemo(() => preview?.trip_summary?.inputs, [preview]);
    const tripTitle = React.useMemo(() => {
        const dest = inputs?.destinations?.[0]?.name;
        return dest ? `${dest} — Your Trip Plan` : "Your Trip Plan";
    }, [inputs]);

    const modeIcon = modeToIcon(inputs?.mode);
    const estTotal = preview?.trip_summary.est_total_cost ?? 0;

    const coverUrl = inputs?.destinations?.[0]?.cover_url || HERO_FALLBACK;

    // Clamp day on data change
    React.useEffect(() => {
        const len = preview?.days?.length ?? 0;
        if (!len) return;
        if (activeDayIdx > len - 1) setActiveDayIdx(len - 1);
    }, [preview?.days?.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // Fetch destination_history meta and normalise; override preview.destination_meta when present
    React.useEffect(() => {
        (async () => {
            const destId = inputs?.destinations?.[0]?.id;
            if (!destId) {
                setDestMetaFromDb(null);
                return;
            }

            const {data, error} = await sb
                .schema("itinero")
                .from("destination_history")
                .select(
                    "description, history, city, currency_code, plugs, languages, transport, esim_provider, weather_desc"
                )
                .eq("destination_id", destId)
                .limit(1)
                .maybeSingle<DestinationHistoryRow>();

            if (error || !data) {
                setDestMetaFromDb(null);
                return;
            }

            const toArr = (v: string[] | string | null | undefined): string[] | undefined =>
                Array.isArray(v)
                    ? v
                    : typeof v === "string"
                        ? v
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        : undefined;

            const normalized: DestinationMetaLike = {
                description: data.description ?? undefined,
                history: data.history ?? undefined,
                city: data.city ?? undefined,
                currency_code: data.currency_code ?? undefined,
                plugs: toArr(data.plugs),
                languages: toArr(data.languages),
                transport: toArr(data.transport),
                esim_provider: data.esim_provider ?? undefined,
                weather_desc: data.weather_desc ?? undefined,
            };

            const hasAny =
                normalized.description ||
                normalized.history ||
                normalized.city ||
                normalized.currency_code ||
                (normalized.plugs && normalized.plugs.length) ||
                (normalized.languages && normalized.languages.length) ||
                (normalized.transport && normalized.transport.length) ||
                normalized.esim_provider ||
                normalized.weather_desc;

            setDestMetaFromDb(hasAny ? normalized : null);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sb, inputs?.destinations?.[0]?.id]);

    // Actions
    const handleBuy = () => {
        if (!preview) return;
        void saveDraftAsTrip(
            sb,
            preview,
            requiredPoints,
            points,
            setPoints,
            setInsufficientOpen,
            setSaving,
            router
        );
    };
    const handleSave = () => {
        router.push("/trips");
    };

    if (loading) {
        return (
            <div className="mx-auto grid min-h-[40vh] max-w-4xl place-items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin"/> Loading preview…
                </div>
            </div>
        );
    }

    if (!preview) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
                <div
                    className="relative w-full overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/90 via-background/80 to-background shadow-sm">
                    {/* soft glow */}
                    <div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_80%_at_0%_0%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(80%_80%_at_100%_100%,rgba(129,140,248,0.18),transparent_55%)] opacity-70"/>

                    <div className="relative z-10 px-6 py-7 sm:px-8 sm:py-9">
                        <div
                            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                            <Sparkles className="h-3.5 w-3.5 text-primary"/>
                            Preview your next adventure
                        </div>

                        <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                            No trip preview yet
                        </h2>

                        <p className="mt-2 text-sm text-muted-foreground">
                            Use the trip maker to tell us where you’re going, for how long, and what you enjoy.
                            We’ll build a smart day-by-day plan and show it here.
                        </p>

                        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto"
                                onClick={() => router.push("/trip-maker")}
                            >
                                <CalendarDays className="mr-2 h-4 w-4"/>
                                Start a new trip
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-border/70 text-xs text-muted-foreground sm:w-auto"
                                onClick={() => router.push("/trips")}
                            >
                                View saved trips
                            </Button>
                        </div>

                        <p className="mt-3 text-[11px] text-muted-foreground">
                            Your latest generated plan will automatically appear here as a preview.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Prefer DB meta, fallback to preview meta
    const destinationMeta: DestinationMetaLike | undefined =
        destMetaFromDb ?? preview.destination_meta ?? undefined;

    const placesWithCoords =
        preview.places?.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)) ?? [];

    const lastActivity =
        preview.days && preview.days.length
            ? formatISODate(preview.days[preview.days.length - 1]?.date)
            : "—";

    return (
        <>
            {/* HERO with rounded card */}
            <section className="pt-4">
                <div className="mx-auto w-full max-w-5xl px-4 md:max-w-6xl">
                    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-black/70 shadow-lg">
                        <div className="relative h-[40svh] w-full sm:h-[44svh]">
                            <Image
                                src={coverUrl}
                                alt={tripTitle}
                                priority
                                fill
                                className="object-cover"
                                sizes="100vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/75"/>

                            <div className="absolute inset-x-0 bottom-0">
                                <div className="px-4 pb-5 sm:px-6 md:px-8">
                                    <div
                                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/25 backdrop-blur">
                                        <Sparkles className="h-3.5 w-3.5"/>
                                        Preview itinerary
                                    </div>

                                    <h1 className="mt-2 text-pretty text-2xl font-bold tracking-tight text-white drop-shadow sm:text-3xl md:text-4xl">
                                        {tripTitle}
                                    </h1>

                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-white/90">
                                        <p className="text-sm sm:text-base">
                                            {formatDateRange(preview.trip_summary)}
                                        </p>

                                        {inputs?.destinations?.[0]?.name && (
                                            <span
                                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs ring-1 ring-white/20">
                        <MapPin className="h-4 w-4 text-white/80"/>
                        <span className="font-medium">
                          {inputs.destinations[0].name}
                        </span>
                      </span>
                                        )}
                                        {modeIcon && (
                                            <span
                                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs ring-1 ring-white/20">
                        {modeIcon}
                                                <span className="font-medium">{inputs?.mode}</span>
                      </span>
                                        )}
                                        {inputs?.pace && (
                                            <span
                                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs ring-1 ring-white/20">
                        <Clock3 className="h-4 w-4 text-white/80"/>
                        <span className="font-medium">pace: {inputs.pace}</span>
                      </span>
                                        )}
                                        {typeof estTotal === "number" && (
                                            <span
                                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs ring-1 ring-white/20">
                        <DollarSign className="h-4 w-4 text-white/80"/>
                        <span className="font-medium">
                          est. {preview.trip_summary.currency ?? "$"}
                            {estTotal}
                        </span>
                      </span>
                                        )}
                                    </div>

                                    {!!inputs?.interests?.length && (
                                        <div className="mt-3">
                                            <InterestChips interests={inputs!.interests!} pillTone="light"/>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main content: itinerary only (map moved to bottom) */}
            <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8 md:max-w-6xl">
                <section className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-sm">
                    {/* Day picker header */}
                    <div
                        className="border-b border-border/60 bg-gradient-to-r from-background via-card to-background px-3 py-3 md:px-5 md:py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                    Itinerary
                                </div>
                                <div className="mt-0.5 text-sm text-muted-foreground">
                                    Day-by-day plan generated from your preferences.
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div
                                    className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1 text-[11px] text-muted-foreground">
                                    <CalendarDays className="h-3.5 w-3.5"/>
                                    <span>{preview.trip_summary.total_days} days</span>
                                </div>
                                <div
                                    className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1 text-[11px] text-muted-foreground">
                                    <Clock3 className="h-3.5 w-3.5"/>
                                    <span>Last updated: {lastActivity}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                Jump to day
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {(preview.days || []).map((_, i) => (
                                    <Button
                                        key={i}
                                        size="sm"
                                        variant={activeDayIdx === i ? "default" : "secondary"}
                                        onClick={() => setActiveDayIdx(i)}
                                        className="rounded-full px-3 text-xs"
                                    >
                                        Day {i + 1}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Day content */}
                    <div className="p-2 md:p-3">
                        <ItineraryDay
                            dayIdx={activeDayIdx}
                            day={
                                preview.days?.[activeDayIdx] ?? {
                                    date:
                                        preview.trip_summary.inputs?.start_date ??
                                        preview.trip_summary.start_date ??
                                        "",
                                    blocks: [],
                                }
                            }
                            placesById={new Map(preview.places.map((p) => [p.id, p]))}
                        />
                    </div>
                </section>
            </main>

            {/* Destination knowledge */}
            {hasDestMeta(destinationMeta) && (
                <section className="mx-auto w-full max-w-5xl px-4 pt-2 pb-6 sm:pt-3 md:max-w-6xl">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-3 sm:col-span-2">
                            {destinationMeta?.description && (
                                <CollapsibleCard title="About" initialOpen={false}>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {destinationMeta.description}
                                    </p>
                                </CollapsibleCard>
                            )}
                            {destinationMeta?.history && (
                                <CollapsibleCard title="History" initialOpen={false}>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {destinationMeta.history}
                                    </p>
                                </CollapsibleCard>
                            )}
                        </div>

                        <div className="sm:col-span-1">
                            <CollapsibleCard title="Destination at a glance" initialOpen={false}>
                                <IconFacts
                                    facts={[
                                        {label: "City", value: destinationMeta?.city, Icon: MapPin},
                                        {
                                            label: "Currency",
                                            value: destinationMeta?.currency_code,
                                            Icon: DollarSign,
                                        },
                                        {
                                            label: "Plugs",
                                            value: joinArr(destinationMeta?.plugs),
                                            Icon: Plug,
                                        },
                                        {
                                            label: "Languages",
                                            value: joinArr(destinationMeta?.languages),
                                            Icon: Globe,
                                        },
                                        {
                                            label: "Getting around",
                                            value: joinArr(destinationMeta?.transport),
                                            Icon: MapPin,
                                        },
                                        {
                                            label: "eSIM",
                                            value: destinationMeta?.esim_provider,
                                            Icon: Phone,
                                        },
                                        {
                                            label: "Weather",
                                            value: destinationMeta?.weather_desc,
                                            Icon: CloudSun,
                                        },
                                    ]}
                                />
                            </CollapsibleCard>
                        </div>
                    </div>
                </section>
            )}

            {/* Map moved to bottom */}
            {placesWithCoords.length > 0 && (
                <section className="mx-auto w-full max-w-5xl px-4 pb-10 md:max-w-6xl">
                    <div className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-5">
                            <div className="flex items-center gap-2 text-sm font-medium">
                <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapIcon className="h-4 w-4"/>
                </span>
                                <span>Map overview</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                Showing {placesWithCoords.length} place
                                {placesWithCoords.length === 1 ? "" : "s"}
              </span>
                        </div>
                        <div className="h-[320px] sm:h-[380px]">
                            <MapSection
                                places={placesWithCoords.map((p) => ({
                                    id: p.id,
                                    name: p.name,
                                    lat: p.lat!,
                                    lng: p.lng!,
                                }))}
                            />
                        </div>
                    </div>
                </section>
            )}

            <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
                Previewed on Itinero — plan smarter, wander farther.
            </footer>

            {/* Countdown chip */}
            {!showPaywall && paywallLeft > 0 && <PaywallCountdownBadge seconds={paywallLeft}/>}

            {/* Theme-aware paywall */}
            {showPaywall && (
                <FullScreenPaywallOverlay
                    onBuy={handleBuy}
                    onSave={handleSave}
                    points={pointsBusy ? null : points}
                    required={requiredPoints}
                    forceTheme={isDark ? "dark" : "light"}
                    saving={saving}
                />
            )}

            {/* Not enough points dialog */}
            <Dialog open={insufficientOpen} onOpenChange={setInsufficientOpen}>
                <DialogContent
                    className={[
                        "relative overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-xl ring-1 ring-border",
                        "sm:max-w-sm",
                    ].join(" ")}
                >
                    {/* subtle theme-adaptive top gradient */}
                    <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.06),transparent)] dark:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent)]"/>

                    <DialogHeader className="space-y-1">
                        <div
                            className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground">
                            Balance
                        </div>
                        <DialogTitle className="text-base font-semibold">Not enough points</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2 text-sm">
                        <p>
                            You need <strong>{requiredPoints}</strong> points to save a trip. You currently have{" "}
                            <strong>{pointsBusy ? "…" : points ?? "—"}</strong>.
                        </p>
                        <p className="text-muted-foreground">Top up your points and try again.</p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            className="border-border bg-background/60 text-foreground hover:bg-background"
                            onClick={() => setInsufficientOpen(false)}
                        >
                            Close
                        </Button>
                        <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => {
                                setInsufficientOpen(false);
                                router.push("/rewards");
                            }}
                        >
                            Top up
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

/* =========================
   Helpers / UI bits
========================= */
function ItineraryDay({
                          dayIdx,
                          day,
                          placesById,
                      }: {
    dayIdx: number;
    day: Day;
    placesById: Map<string, Place>;
}) {
    const dayCost = React.useMemo(
        () => Math.max(0, Math.round(day.blocks.reduce((acc, b) => acc + (b.est_cost || 0), 0))),
        [day.blocks]
    );

    return (
        <div className="space-y-5 p-3 md:p-4">
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Day {dayIdx + 1}
                    </div>
                    <div className="text-lg font-semibold">{formatISODate(day.date)}</div>
                </div>
                <div
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                    est. day cost:
                    <span className="font-semibold text-foreground">${dayCost}</span>
                </div>
            </div>

            <div className="relative">
                <div className="pointer-events-none absolute left-[18px] top-0 h-full w-[2px] rounded bg-border/70"/>
                <div className="space-y-3">
                    {day.blocks.map((b, i) => {
                        const place = b.place_id ? placesById.get(b.place_id) : null;
                        return (
                            <div key={`${day.date}-${i}`} className="relative pl-7">
                                <div
                                    className="absolute left-[18px] top-5 h-3 w-3 -translate-x-1/2 rounded-full border border-primary/40 bg-primary/90 shadow-sm"/>
                                <div
                                    className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span
                        className={[
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                            whenBadgeClasses(b.when),
                        ].join(" ")}
                    >
                      {whenLabel(b.when)}
                    </span>

                                        <div
                                            className="flex flex-wrap gap-2 text-[11px] text-muted-foreground sm:w-auto">
                                            <Metric label="Est." value={`$${b.est_cost ?? 0}`}/>
                                            <Metric label="Duration" value={`${b.duration_min}m`}/>
                                            <Metric label="Travel" value={`${b.travel_min_from_prev}m`}/>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                                        <div className="md:col-span-2">
                                            <div className="text-base font-semibold">{b.title}</div>
                                            {!!b.notes && (
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    {b.notes.length > 240 ? `${b.notes.slice(0, 240)}…` : b.notes}
                                                </div>
                                            )}
                                            {place && (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    <span className="font-medium text-foreground">{place.name}</span>
                                                    {place.category && <span> • {place.category}</span>}
                                                    {place.lat != null && place.lng != null && (
                                                        <span className="ml-1">
                              • {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
                            </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {b.alternatives?.length ? (
                                        <div className="mt-3">
                                            <div className="text-xs text-muted-foreground">Alternatives</div>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {b.alternatives.slice(0, 3).map((a) => (
                                                    <span
                                                        key={a.id ?? a.name}
                                                        className="rounded-full border border-border/60 bg-background/70 px-2 py-1 text-xs"
                                                    >
                            {a.name} {a.est_cost ? `· ~$${a.est_cost}` : ""}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}

                    {!day.blocks.length && (
                        <div
                            className="grid h-40 place-items-center rounded-2xl border bg-card/40 text-sm text-muted-foreground">
                            No activities for this day yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Metric({label, value}: { label: string; value: string | number }) {
    return (
        <div
            className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 px-2 py-0.5">
            <span className="text-[11px] text-muted-foreground">{label}:</span>
            <span className="text-[11px] font-semibold text-foreground">{value}</span>
        </div>
    );
}

function CollapsibleCard({
                             title,
                             children,
                             initialOpen = false,
                         }: {
    title: string;
    children: React.ReactNode;
    initialOpen?: boolean;
}) {
    return (
        <details
            className="group rounded-2xl border border-border/60 bg-card/50 shadow-sm open:shadow-md"
            open={initialOpen || undefined}
        >
            <summary
                className="flex cursor-pointer items-center justify-between gap-2 px-4 py-3 sm:px-5"
                style={{listStyle: "none"}}
            >
                <span className="text-sm font-semibold tracking-wide">{title}</span>
                <ChevronDown
                    className="h-4 w-4 transition-transform duration-200 ease-out group-open:rotate-180"
                    aria-hidden
                />
            </summary>
            <div className="border-t border-border/60 px-4 py-4 sm:px-5">{children}</div>
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
    const rows = facts.filter((f) => f.value && String(f.value).trim().length > 0);
    if (rows.length === 0) return null;

    return (
        <dl className="grid grid-cols-1 gap-2">
            {rows.map(({label, value, Icon}) => (
                <div
                    key={label}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2"
                >
          <span
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60">
            <Icon className="h-4 w-4 text-muted-foreground"/>
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

function InterestChips({
                           interests,
                           pillTone = "light",
                       }: {
    interests: string[];
    pillTone?: "light" | "default";
}) {
    const base =
        pillTone === "light"
            ? "border-white/30 bg-white/10 text-white"
            : "border-border/60 bg-background/50 text-foreground";
    return (
        <ul className="flex flex-wrap gap-2">
            {interests.map((raw) => {
                const label = raw.replace(/\b\w/g, (m) => m.toUpperCase());
                const emoji = emojiFor(raw);
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

function PaywallCountdownBadge({seconds}: { seconds: number }) {
    return (
        <div className="fixed bottom-4 right-4 z-[55]">
            <div
                className="rounded-full border border-border/60 bg-background/90 px-3 py-1 text-sm text-foreground shadow-sm">
                Paywall in <span className="font-semibold">{seconds}s</span>
            </div>
        </div>
    );
}

type ThemeMode = "light" | "dark";

function formatPoints(n: number) {
    return new Intl.NumberFormat().format(n);
}


function FullScreenPaywallOverlay({
                                      onBuy,
                                      onSave,
                                      points,
                                      required,
                                      forceTheme,
                                      saving,
                                  }: {
    onBuy: () => void;
    onSave: () => void;
    points: number | null;
    required: number;
    forceTheme?: ThemeMode;
    saving?: boolean;
}) {
    const insuff = typeof points === "number" && points < required;

    const perks = [
        {
            label: "Full day-by-day schedule",
            description: "See every stop laid out in a clean, time-based view.",
            icon: <Sparkles className="h-4 w-4 text-primary"/>,
        },
        {
            label: "Local insights & transport mapping",
            description: "Smarter routing between sights with realistic travel times.",
            icon: <MapIcon className="h-4 w-4 text-primary"/>,
        },
        {
            label: "Printable PDF",
            description: "Export a beautiful PDF for offline use or sharing.",
            icon: <Download className="h-4 w-4 text-primary"/>,
        },
        {
            label: "Shareable trip link",
            description: "Send a live itinerary link to friends and co-travellers.",
            icon: <Share2 className="h-4 w-4 text-primary"/>,
        },
        {
            label: "Calendar export",
            description: "Drop everything into your calendar in one click.",
            icon: <CalendarDays className="h-4 w-4 text-primary"/>,
        },
        {
            label: "7-day free edits",
            description: "Regenerate, reorder and tweak your trip for a full week.",
            icon: <PencilLine className="h-4 w-4 text-primary"/>,
        },
    ] as const;

    const [activeIndex, setActiveIndex] = React.useState(0);
    const scrollRef = React.useRef<HTMLDivElement | null>(null);

    const scrollToIndex = (index: number) => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const card = container.querySelector<HTMLElement>("[data-perk-card]");
        const cardWidth = card ? card.offsetWidth + 16 : container.clientWidth * 0.85;

        container.scrollTo({
            left: cardWidth * index,
            behavior: "smooth",
        });
        setActiveIndex(index);
    };

    const handleArrow = (direction: "prev" | "next") => {
        if (direction === "prev") {
            scrollToIndex(Math.max(0, activeIndex - 1));
        } else {
            scrollToIndex(Math.min(perks.length - 1, activeIndex + 1));
        }
    };

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const card = container.querySelector<HTMLElement>("[data-perk-card]");
        const cardWidth = card ? card.offsetWidth + 16 : container.clientWidth * 0.85;
        const idx = Math.round(container.scrollLeft / Math.max(1, cardWidth));
        setActiveIndex(Math.min(perks.length - 1, Math.max(0, idx)));
    };

    return (
        <div
            data-theme={forceTheme}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm dark:bg-black/75"
            role="dialog"
            aria-modal="true"
        >
            {/* Ambient glow */}
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,rgba(59,130,246,0.22),transparent_55%),radial-gradient(80%_60%_at_0%_100%,rgba(236,72,153,0.18),transparent_55%)] opacity-50"/>

            {/* Panel */}
            <div className="relative w-full max-w-3xl px-4">
                <div
                    className="overflow-hidden rounded-3xl border border-border/80 bg-card/95 text-foreground shadow-2xl ring-1 ring-border/80">
                    {/* Thin top accent */}
                    <div className="h-[3px] w-full bg-gradient-to-r from-primary via-amber-400 to-emerald-400"/>

                    <div className="px-5 py-6 sm:px-7 md:px-8 md:py-8">
                        <div className="flex flex-col items-center gap-6">
                            {/* Header */}
                            <div className="w-full max-w-xl text-center">
                                <Badge
                                    variant="secondary"
                                    className="mb-2 inline-flex items-center gap-1.5 border border-border bg-muted/80 text-[11px] font-medium uppercase tracking-wide text-foreground/80"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-primary"/>
                                    Preview limited
                                </Badge>

                                <h2 className="text-balance text-2xl font-bold tracking-tight md:text-3xl">
                                    Unlock the full itinerary
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground md:text-base">
                                    Get the complete plan, smarter routing, export tools, and shareable links — all in
                                    one tap.
                                </p>

                                <div
                                    className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <div
                                        className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 shadow-sm">
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
                      Required
                    </span>
                                        <span className="text-xs font-semibold tabular-nums">
                      {formatPoints(required)} pts
                    </span>
                                    </div>

                                    {typeof points === "number" && (
                                        <div className="text-[11px]">
                                            Balance:{" "}
                                            <span
                                                className={
                                                    insuff
                                                        ? "font-semibold text-red-500"
                                                        : "font-semibold text-foreground"
                                                }
                                            >
                        {formatPoints(points)} pts
                      </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Perks band */}
                            <div
                                className="w-full max-w-xl rounded-2xl border border-border/70 bg-gradient-to-br from-background/90 via-muted/70 to-background/90 px-3 py-4 sm:px-4">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        What you&apos;ll unlock
                                    </p>
                                    <p className="hidden text-[11px] text-muted-foreground sm:inline">
                                        Swipe or use arrows
                                    </p>
                                </div>

                                <div className="relative">
                                    {/* Arrows (desktop only) */}
                                    <button
                                        type="button"
                                        onClick={() => handleArrow("prev")}
                                        className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border/80 bg-background/90 p-1.5 shadow-sm hover:bg-background sm:inline-flex"
                                        aria-label="Previous perk"
                                    >
                                        <ChevronLeft className="h-4 w-4 text-muted-foreground"/>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleArrow("next")}
                                        className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border/80 bg-background/90 p-1.5 shadow-sm hover:bg-background sm:inline-flex"
                                        aria-label="Next perk"
                                    >
                                        <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                                    </button>

                                    {/* Scroll container */}
                                    <div
                                        ref={scrollRef}
                                        onScroll={handleScroll}
                                        className="mt-1 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-2 [-ms-overflow-style:none] [scrollbar-width:none]"
                                        style={{scrollBehavior: "smooth"}}
                                    >
                                        <style jsx>{`
                                            div::-webkit-scrollbar {
                                                display: none;
                                            }
                                        `}</style>

                                        {perks.map((perk, idx) => (
                                            <div
                                                key={perk.label}
                                                data-perk-card
                                                className="flex min-w-[82%] max-w-[82%] snap-center sm:min-w-[260px] sm:max-w-[260px]"
                                            >
                                                <Perk
                                                    title={perk.label}
                                                    description={perk.description}
                                                    icon={perk.icon}
                                                    active={idx === activeIndex}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Dots */}
                                    <div className="mt-3 flex justify-center gap-1.5">
                                        {perks.map((perk, idx) => (
                                            <button
                                                key={perk.label}
                                                type="button"
                                                onClick={() => scrollToIndex(idx)}
                                                className={[
                                                    "h-1.5 rounded-full transition-all duration-200",
                                                    idx === activeIndex
                                                        ? "w-5 bg-primary"
                                                        : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70",
                                                ].join(" ")}
                                                aria-label={`Go to perk ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="mt-1 w-full max-w-xl space-y-2.5">
                                <Button
                                    className="w-full py-5 text-base md:py-6"
                                    onClick={onBuy}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                            Saving your trip…
                                        </>
                                    ) : (
                                        "Buy / Top up"
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full border-border py-5 text-base md:py-6"
                                    onClick={onSave}
                                    disabled={saving}
                                >
                                    Skip to Trip
                                </Button>

                                {/* Footer hint */}
                                {typeof points === "number" && (
                                    <p className="mt-2 text-center text-[11px] text-muted-foreground md:text-xs">
                                        {insuff ? (
                                            <>
                                                You need{" "}
                                                <span className="font-semibold">
                          {formatPoints(required)} pts
                        </span>{" "}
                                                to save this trip. Current balance:{" "}
                                                <span className="font-semibold text-red-500">
                          {formatPoints(points)} pts
                        </span>
                                                .
                                            </>
                                        ) : (
                                            <>
                                                You have{" "}
                                                <span className="font-semibold">
                          {formatPoints(points)} pts
                        </span>{" "}
                                                — this trip is fully unlockable.
                                            </>
                                        )}
                                    </p>
                                )}

                                <p className="mt-1 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                                    Powered by Itinero Points
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Vertical, layered perk card */
function Perk({
                  icon,
                  title,
                  description,
                  active,
              }: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    active?: boolean;
}) {
    return (
        <div
            className={[
                "relative flex w-full flex-col items-center gap-3 text-center",
                "rounded-3xl border p-4 sm:p-5 transition-all duration-300",
                "bg-card/80 backdrop-blur-sm border-border/80",
                active
                    ? "shadow-xl ring-1 ring-primary/50 bg-background/95 -translate-y-0.5"
                    : "shadow-sm hover:shadow-md hover:bg-card/95",
            ].join(" ")}
        >
            {/* Floating glow behind icon */}
            <div className="relative -mt-7 mb-1">
                {active && (
                    <div
                        className="pointer-events-none absolute inset-0 -z-10 h-16 w-16 rounded-3xl bg-primary/30 blur-xl opacity-70"/>
                )}
                <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-md backdrop-blur">
                    {icon ?? <Sparkles className="h-6 w-6 text-primary"/>}
                </div>
            </div>

            <div className="text-sm font-semibold tracking-tight">{title}</div>
            <p className="text-xs leading-relaxed text-muted-foreground">
                {description}
            </p>
        </div>
    );
}


/* =========================
   Save flow
========================= */
async function saveDraftAsTrip(
    sbClient: ReturnType<typeof createClientBrowser>,
    currentPreview: PreviewResponse,
    requiredPoints: number,
    points: number | null,
    setPoints: (v: number | null) => void,
    setInsufficientOpen: (v: boolean) => void,
    setSavingState: (v: boolean) => void,
    router: ReturnType<typeof useRouter>
) {
    setSavingState(true);
    const COST = requiredPoints ?? 100;

    if ((points ?? 0) < COST) {
        setInsufficientOpen(true);
        setSavingState(false);
        return;
    }

    let currentUserId: string | undefined;
    let pointsSpent = false;

    try {
        const {data: auth} = await sbClient.auth.getUser();
        currentUserId = auth?.user?.id ?? undefined;
        if (!currentUserId) throw new Error("Not authenticated");

        // 1) Spend points via RPC, fallback to manual ledger insert
        try {
            const {data: ok, error: rpcErr} = await sbClient.rpc("spend_points", {p_cost: COST});
            if (rpcErr) throw rpcErr;
            if (ok !== true) {
                setInsufficientOpen(true);
                return;
            }
            pointsSpent = true;
        } catch {
            const {error: debitErr} = await sbClient
                .schema("itinero")
                .from("points_ledger")
                .insert({
                    user_id: currentUserId,
                    delta: -COST,
                    reason: "save_trip",
                    meta: {source: "web", at: new Date().toISOString()},
                });
            if (debitErr) {
                setInsufficientOpen(true);
                return;
            }
            pointsSpent = true;
        }

        // 2) Insert trip
        const ins = currentPreview.trip_summary?.inputs;
        const title = ins?.destinations?.[0]?.name
            ? `${ins.destinations[0].name} Trip`
            : "Trip";

        const tripRow = {
            user_id: currentUserId,
            title,
            start_date: ins?.start_date ?? currentPreview.trip_summary.start_date ?? null,
            end_date: ins?.end_date ?? currentPreview.trip_summary.end_date ?? null,
            est_total_cost:
                typeof currentPreview.trip_summary.est_total_cost === "number"
                    ? currentPreview.trip_summary.est_total_cost
                    : null,
            currency: currentPreview.trip_summary.currency ?? null,
            destination_id: ins?.destinations?.[0]?.id ?? null,
            inputs: ins,
        };

        const {data: tripInsert, error: tripErr} = await sbClient
            .schema("itinero")
            .from("trips")
            .insert(tripRow)
            .select("id")
            .single<{ id: string }>();

        if (tripErr) throw tripErr;
        const tripId = tripInsert.id;

        // 3) Insert itinerary items
        type ItemInsert = {
            trip_id: string;
            day_index: number;
            date: string | null;
            order_index: number;
            when: "morning" | "afternoon" | "evening";
            place_id: string | null;
            title: string;
            est_cost: number | null;
            duration_min: number | null;
            travel_min_from_prev: number | null;
            notes: string | null;
        };

        const items: ItemInsert[] = [];
        currentPreview.days.forEach((d, dIdx) => {
            d.blocks.forEach((b, iIdx) => {
                items.push({
                    trip_id: tripId,
                    day_index: dIdx,
                    date: d.date ?? null,
                    order_index: iIdx,
                    when: b.when,
                    place_id: b.place_id ?? null,
                    title: b.title,
                    est_cost: Number.isFinite(b.est_cost) ? b.est_cost : null,
                    duration_min: Number.isFinite(b.duration_min) ? b.duration_min : null,
                    travel_min_from_prev: Number.isFinite(b.travel_min_from_prev)
                        ? b.travel_min_from_prev
                        : null,
                    notes: b.notes ?? null,
                });
            });
        });

        if (items.length) {
            const {error: itemsErr} = await sbClient
                .schema("itinero")
                .from("itinerary_items")
                .insert(items);
            if (itemsErr) throw itemsErr;
        }

        // 4) Refresh points balance
        try {
            const {data: newBal} = await sbClient.rpc("get_points_balance");
            if (typeof newBal === "number") setPoints(newBal);
        } catch {
            /* ignore */
        }

        // 5) Clear preview from localStorage after successful save
        try {
            if (typeof window !== "undefined") {
                localStorage.removeItem("itinero:latest_preview");
            }
        } catch {
            // non-fatal
        }

        // 6) Redirect to trip
        router.push(`/trips/${tripId}`);
    } catch (err) {
        // Refund points if we successfully spent them but failed later
        if (pointsSpent) {
            try {
                const {data: auth2} = await sbClient.auth.getUser();
                const uid = auth2?.user?.id ?? null;
                await sbClient.schema("itinero").from("points_ledger").insert({
                    user_id: uid,
                    delta: COST,
                    reason: "refund_save_trip_failed",
                    meta: {source: "web", at: new Date().toISOString()},
                });
            } catch {
                // swallow
            }
        }
        // eslint-disable-next-line no-console
        console.error("Save trip failed:", err);
    } finally {
        setSavingState(false);
    }
}