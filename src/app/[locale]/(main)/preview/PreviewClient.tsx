"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
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
    Sparkles,
    Map as MapIcon,
    Download,
    PencilLine,
    Globe,
    Plug,
    CloudSun,
    Wallet,
    X,
    ExternalLink, SmartphoneNfc,
    ArrowRight,
    Info,
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { notifyTripCreatedAction } from "@/app/actions/trips";

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
   Constants / Utils
========================= */
const HERO_FALLBACK =
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop";

function modeToIcon(mode?: string) {
    if (!mode) return null;
    const cl = "mr-1 h-3.5 w-3.5";
    if (mode === "walk") return <Footprints className={cl} />;
    if (mode === "bike") return <Bike className={cl} />;
    if (mode === "car") return <Car className={cl} />;
    if (mode === "transit") return <Train className={cl} />;
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

function whenBadgeClasses(w: "morning" | "afternoon" | "evening") {
    if (w === "morning") {
        return {
            dot: "bg-amber-400",
            badge: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900",
        };
    }
    if (w === "afternoon") {
        return {
            dot: "bg-orange-400",
            badge: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900",
        };
    }
    return {
        dot: "bg-indigo-400",
        badge: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900",
    };
}

/* =========================
   Client-only dynamic
========================= */
const MapSection = dynamic(() => import("@/app/[locale]/trips/share/[publicId]/MapSection"), {
    ssr: false,
});

/* =========================
   Main Component
========================= */
export default function PreviewClient({
    requiredPoints,
    initialPoints,
}: {
    requiredPoints: number;
    initialPoints: number | null;
}) {
    const sb = getSupabaseBrowser();
    const router = useRouter();
    const { resolvedTheme } = useTheme();
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
    const [destMetaFromDb, setDestMetaFromDb] =
        React.useState<DestinationMetaLike | null>(null);

    // Scroll for parallax
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 300], [0, 100]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    // Load preview from localStorage
    React.useEffect(() => {
        if (typeof window === "undefined") return;

        setLoading(true);
        try {
            const raw = window.localStorage.getItem("itinero:latest_preview");
            if (!raw) {
                setPreview(null);
                return;
            }

            try {
                const parsed = JSON.parse(raw) as PreviewResponse;
                setPreview(parsed);
            } catch (e) {
                console.error("[PreviewClient] Failed to parse itinero:latest_preview:", e);
                window.localStorage.removeItem("itinero:latest_preview");
                setPreview(null);
            }
        } catch (e) {
            console.error("[PreviewClient] localStorage access error:", e);
            setPreview(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Refresh points
    React.useEffect(() => {
        if (points !== null) return;
        (async () => {
            setPointsBusy(true);
            try {
                const { data: rpcBalance, error } = await sb.rpc("get_points_balance");
                if (error) console.error("[PreviewClient] get_points_balance error:", error);
                if (typeof rpcBalance === "number") setPoints(rpcBalance);
            } catch (e) {
                console.error("[PreviewClient] get_points_balance threw:", e);
            } finally {
                setPointsBusy(false);
            }
        })();
    }, [points, sb]);

    // Countdown to paywall
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
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [showPaywall]);

    const inputs = React.useMemo(() => preview?.trip_summary?.inputs, [preview]);
    const tripTitle = React.useMemo(() => {
        const dest = inputs?.destinations?.[0]?.name;
        return dest ? `${dest} Itinerary` : "Your Trip Plan";
    }, [inputs]);

    const modeIcon = modeToIcon(inputs?.mode);
    const estTotal = preview?.trip_summary.est_total_cost ?? 0;
    const currency = preview?.trip_summary.currency ?? "USD";
    const coverUrl = inputs?.destinations?.[0]?.cover_url || HERO_FALLBACK;

    const locationName = inputs?.destinations?.[0]?.name ?? "Destination";

    // Clamp day on data change
    React.useEffect(() => {
        const len = preview?.days?.length ?? 0;
        if (!len) return;
        if (activeDayIdx > len - 1) setActiveDayIdx(len - 1);
    }, [preview?.days?.length, activeDayIdx]);

    // Fetch destination_history meta
    const destId = inputs?.destinations?.[0]?.id;
    React.useEffect(() => {
        (async () => {
            if (!destId) {
                setDestMetaFromDb(null);
                return;
            }

            try {
                const { data, error } = await sb
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
                            ? v.split(",").map((s) => s.trim()).filter(Boolean)
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

                setDestMetaFromDb(normalized);
            } catch (e) {
                console.error("[PreviewClient] destination_history query threw:", e);
                setDestMetaFromDb(null);
            }
        })();
    }, [sb, destId]);

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
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> Loading preview…
                </div>
            </div>
        );
    }

    if (!preview) {
        return (
            <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
                <div
                    className="relative w-full overflow-hidden rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center dark:bg-slate-900 dark:border-slate-800">
                    <div
                        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-8 ring-white/50 dark:bg-slate-800 dark:ring-slate-800/50">
                        <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        No preview available
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Start a new trip plan to see your itinerary preview here.
                    </p>

                    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Button
                            size="lg"
                            className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
                            onClick={() => router.push("/trip-maker")}
                        >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Start Planning
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 sm:w-auto dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                            onClick={() => router.push("/trips")}
                        >
                            View Saved Trips
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const destinationMeta: DestinationMetaLike | undefined =
        destMetaFromDb ?? preview.destination_meta ?? undefined;

    const placesWithCoords =
        preview.places?.filter(
            (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)
        ) ?? [];

    return (
        <>
            {/* HERO */}
            <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
                <motion.div
                    style={{ y: y1 }}
                    className="absolute inset-0 h-[120%] w-full"
                >
                    <Image
                        src={coverUrl}
                        alt={tripTitle}
                        priority
                        fill
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                </motion.div>

                <div className="absolute inset-0 flex items-end pb-12 md:pb-16">
                    <div className="mx-auto w-full max-w-5xl px-4 md:max-w-6xl">
                        <motion.div
                            style={{ opacity }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="max-w-3xl space-y-4"
                        >
                            <div
                                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white backdrop-blur-md ring-1 ring-white/20">
                                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                                Preview Mode
                            </div>

                            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl drop-shadow-lg">
                                {tripTitle}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-200">
                                <span
                                    className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/10">
                                    <CalendarDays className="h-4 w-4 text-slate-300" />
                                    {formatDateRange(preview.trip_summary)}
                                </span>

                                {typeof estTotal === "number" && (
                                    <span
                                        className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/10">
                                        <DollarSign className="h-4 w-4 text-emerald-400" />
                                        Est. {currency} {estTotal}
                                    </span>
                                )}

                                {modeIcon && (
                                    <span
                                        className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/10 capitalize">
                                        {modeIcon}
                                        {inputs?.mode}
                                    </span>
                                )}
                            </div>

                            {!!inputs?.interests?.length && (
                                <div className="pt-2">
                                    <InterestChips interests={inputs!.interests!} dark />
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <main className="mx-auto w-full max-w-5xl px-4 pb-20 md:max-w-6xl">
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    {/* LEFT: Itinerary */}
                    <div className="space-y-8">
                        {/* Currency Explanation */}
                        <div
                            className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:bg-blue-900/20 dark:border-blue-800">
                            <div className="flex gap-3">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Costs are shown in the destination&apos;s currency (<strong>{currency}</strong>).
                                    When you save this trip, we&apos;ll automatically convert these estimates to your
                                    preferred currency.
                                </p>
                            </div>
                        </div>

                        <section
                            className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                            {/* Day Picker Header */}
                            <div
                                className="bg-slate-50 border-b border-slate-100 px-6 py-4 dark:bg-slate-950/50 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-bold text-slate-900 text-lg dark:text-white">
                                        Day by Day
                                    </h2>
                                    <div
                                        className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                                        {preview.trip_summary.total_days} Days Total
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(preview.days || []).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveDayIdx(i)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                                                activeDayIdx === i
                                                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                                                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            Day {i + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Day Content */}
                            <div className="p-6">
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
                                    currency={currency}
                                />
                            </div>
                        </section>
                    </div>

                    {/* RIGHT: Sidebar */}
                    <div className="space-y-6 lg:sticky lg:top-8 h-fit">
                        {placesWithCoords.length > 0 && (
                            <div
                                className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                                <div
                                    className="p-4 border-b border-slate-100 flex items-center justify-between dark:border-slate-800">
                                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 dark:text-white">
                                        <MapIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" /> Map View
                                    </h3>
                                </div>
                                <div className="h-64 w-full bg-slate-100 dark:bg-slate-800 relative group">
                                    <MapSection
                                        places={placesWithCoords.map((p) => ({
                                            id: p.id,
                                            name: p.name,
                                            lat: p.lat!,
                                            lng: p.lng!,
                                        }))}
                                    />
                                    {/* Overlay to indicate interactivity */}
                                    <div
                                        className="absolute inset-0 bg-slate-900/0 pointer-events-none group-hover:bg-slate-900/5 transition-colors" />
                                </div>
                            </div>
                        )}

                        {hasDestMeta(destinationMeta) && (
                            <div
                                className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-6 dark:bg-slate-900 dark:border-slate-800">
                                <div
                                    className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <h3 className="font-bold text-slate-900 text-sm dark:text-white">Local Guide</h3>
                                </div>

                                {destinationMeta?.description && (
                                    <div className="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
                                        {destinationMeta.description.slice(0, 200)}...
                                    </div>
                                )}
                                <div className="space-y-3">
                                    <IconFact label="City" value={destinationMeta?.city} icon={MapPin} />
                                    <IconFact label="Currency" value={destinationMeta?.currency_code}
                                        icon={DollarSign} />

                                    {/* Interactive Weather */}
                                    <IconFact
                                        label="Weather"
                                        value={destinationMeta?.weather_desc}
                                        icon={CloudSun}
                                        href={`https://www.google.com/search?q=weather+${encodeURIComponent(locationName)}`}
                                    />

                                    <IconFact label="Plugs" value={joinArr(destinationMeta?.plugs)} icon={Plug} />
                                    <IconFact label="Transport" value={joinArr(destinationMeta?.transport)}
                                        icon={Train} />

                                    {/* Interactive eSIM */}
                                    <IconFact
                                        label="eSIM"
                                        value={destinationMeta?.esim_provider || "Find eSIM"}
                                        icon={SmartphoneNfc}
                                        href="https://www.airalo.com/"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Floating Paywall Countdown */}
            {!showPaywall && paywallLeft > 0 && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div
                        className="flex items-center gap-3 rounded-full bg-slate-900 text-white px-5 py-2.5 shadow-xl dark:bg-white dark:text-slate-900">
                        <div className="relative h-4 w-4">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-slate-700 dark:text-slate-200"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="text-blue-500 transition-all duration-1000 ease-linear"
                                    strokeDasharray={`${(paywallLeft / 10) * 100}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                            </svg>
                        </div>
                        <span className="text-xs font-bold">Free Preview: {paywallLeft}s</span>
                    </div>
                </div>
            )}

            {/* Full Screen Paywall */}
            {showPaywall && (
                <FullScreenPaywallOverlay
                    onBuy={handleBuy}
                    onSave={handleSave}
                    onClose={() => setShowPaywall(false)}
                    points={pointsBusy ? null : points}
                    required={requiredPoints}
                    saving={saving}
                    forceTheme={isDark ? "dark" : "light"}
                />
            )}

            {/* Not enough points dialog */}
            <Dialog open={insufficientOpen} onOpenChange={setInsufficientOpen}>
                <DialogContent
                    className="sm:max-w-sm rounded-3xl border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800">
                    <DialogHeader>
                        <div
                            className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
                            <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                            Not enough points
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 text-center text-sm text-slate-600 dark:text-slate-400">
                        <p>
                            You need <strong
                                className="text-slate-900 dark:text-white">{requiredPoints} points</strong> to save this
                            full itinerary.
                        </p>
                        <div
                            className="rounded-xl bg-slate-50 p-3 font-medium border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                            Current Balance: {points ?? "..."} points
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setInsufficientOpen(false)}
                            className="rounded-xl border-slate-200 dark:border-slate-700 dark:bg-transparent dark:text-slate-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold dark:bg-blue-600 dark:hover:bg-blue-500"
                            onClick={() => router.push("/rewards")}
                        >
                            Get Points
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
    currency,
}: {
    dayIdx: number;
    day: Day;
    placesById: Map<string, Place>;
    currency: string;
}) {
    const formatted = formatISODate(day.date);
    const [weekday, rest] = formatted.split(",");

    return (
        <motion.div
            key={dayIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{weekday}</div>
                <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                <div className="text-slate-500 font-medium dark:text-slate-400">{rest}</div>
            </div>

            <div className="relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
                {day.blocks.map((b, i) => {
                    const place = b.place_id ? placesById.get(b.place_id) : null;
                    const badgeClasses = whenBadgeClasses(b.when);

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative group"
                        >
                            {/* Timeline Dot */}
                            <div
                                className={cn(
                                    "absolute -left-[39px] top-0 h-5 w-5 rounded-full border-4 border-white shadow-sm z-10 dark:border-slate-900 transition-transform group-hover:scale-110",
                                    badgeClasses.dot
                                )}
                            />

                            <div
                                className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-blue-800">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <span
                                            className={cn(
                                                "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2",
                                                badgeClasses.badge
                                            )}
                                        >
                                            {b.when}
                                        </span>
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {b.title}
                                        </h4>
                                    </div>
                                    <div className="text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Clock3 className="h-3 w-3" />
                                            {b.duration_min} min
                                        </div>
                                        {b.est_cost > 0 && (
                                            <div className="text-emerald-600 font-bold mt-1 dark:text-emerald-400">
                                                {currency} {b.est_cost}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {b.notes && (
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4 dark:text-slate-400">
                                        {b.notes}
                                    </p>
                                )}

                                {place && (
                                    <div
                                        className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 group/place hover:bg-blue-50 hover:border-blue-100 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-blue-900/20 dark:hover:border-blue-800">
                                        <div
                                            className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm dark:bg-slate-900 dark:border-slate-700">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                        </div>
                                        <div className="flex-1">
                                            <div
                                                className="font-bold text-slate-900 dark:text-white group-hover/place:text-blue-700 dark:group-hover/place:text-blue-400">
                                                {place.name}
                                            </div>
                                            {place.category && (
                                                <div
                                                    className="text-[10px] uppercase tracking-wider font-medium text-slate-400 mt-0.5">
                                                    {place.category}
                                                </div>
                                            )}
                                        </div>
                                        <ArrowRight
                                            className="h-4 w-4 text-slate-300 group-hover/place:text-blue-400 transition-colors" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

function IconFact({
    label,
    value,
    icon: Icon,
    href,
}: {
    label: string;
    value?: string | null;
    icon: React.ElementType;
    href?: string;
}) {
    if (!value) return null;

    const Content = (
        <div className={cn("flex items-start gap-3 group", href && "cursor-pointer")}>
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border transition-colors shrink-0",
                href ? "bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                    : "bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
            )}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                        {label}
                    </div>
                    {href && <ExternalLink
                        className="h-3 w-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">{value}</div>
            </div>
        </div>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer"
                className="block hover:bg-slate-50/50 dark:hover:bg-slate-800/30 -mx-2 px-2 py-1 rounded-xl transition-colors">
                {Content}
            </a>
        )
    }
    return Content;
}

function InterestChips({ interests, dark }: { interests: string[]; dark?: boolean }) {
    return (
        <div className="flex flex-wrap gap-2">
            {interests.map((raw) => (
                <span
                    key={raw}
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm capitalize backdrop-blur-md transition-colors",
                        dark
                            ? "bg-white/10 border border-white/20 text-white"
                            : "bg-white border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                    )}
                >
                    <span>{emojiFor(raw)}</span>
                    {raw}
                </span>
            ))}
        </div>
    );
}

/* Full Screen Paywall Component */
function FullScreenPaywallOverlay({
    onBuy,
    onSave,
    onClose,
    points,
    required,
    saving,
    forceTheme,
}: {
    onBuy: () => void;
    onSave: () => void;
    onClose: () => void;
    points: number | null;
    required: number;
    saving: boolean;
    forceTheme: "dark" | "light";
}) {
    const hasEnough = points !== null && points >= required;
    const router = useRouter();

    const handlePrimaryAction = () => {
        if (hasEnough) {
            onBuy();
        } else {
            router.push(`/checkout?points=${Math.max(10, required)}`);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                data-theme={forceTheme}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl ring-1 ring-white/10 dark:bg-slate-950 dark:ring-slate-800"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-5 top-5 z-20 rounded-full bg-black/10 p-2 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/20 hover:text-white dark:bg-white/10 dark:hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Premium Header */}
                    <div
                        className="relative flex h-64 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-violet-600 via-blue-600 to-indigo-600 text-center text-white">
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 mix-blend-overlay" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative z-10 flex flex-col items-center gap-4 p-6"
                        >
                            <div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md ring-1 ring-white/30">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                                    Unlock Your Full Trip
                                </h2>
                                <p className="text-blue-100 font-medium text-lg">
                                    Get the complete itinerary, maps, and offline access.
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-10">
                        {/* Perks Grid */}
                        <div className="mb-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                            <PerkItem
                                icon={MapIcon}
                                title="Interactive Maps"
                                desc="Navigate easily with pinned locations."
                            />
                            <PerkItem
                                icon={Download}
                                title="PDF Export"
                                desc="Save offline for when signal drops."
                            />
                            <PerkItem
                                icon={CalendarDays}
                                title="Calendar Sync"
                                desc="Add to Google/Apple Calendar."
                            />
                            <PerkItem
                                icon={PencilLine}
                                title="Full Customization"
                                desc="Edit every detail of your plan."
                            />
                        </div>

                        {/* Cost & Actions */}
                        <div className="flex flex-col items-center gap-6">
                            {/* Points Status */}
                            <div
                                className="flex items-center gap-3 rounded-full bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800">
                                <span className="flex items-center gap-1.5">
                                    <span className="text-slate-400">Cost:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{required} pts</span>
                                </span>
                                <span className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                                <span className="flex items-center gap-1.5">
                                    <span className="text-slate-400">Balance:</span>
                                    <span
                                        className={cn(
                                            "font-bold",
                                            hasEnough
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-rose-500 dark:text-rose-400"
                                        )}
                                    >
                                        {points ?? "..."} pts
                                    </span>
                                </span>
                            </div>

                            {/* Buttons */}
                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button
                                    size="lg"
                                    onClick={handlePrimaryAction}
                                    disabled={saving}
                                    className={cn(
                                        "relative h-14 flex-1 rounded-2xl text-base font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                                        hasEnough
                                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25"
                                            : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                                    )}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : hasEnough ? (
                                        <span className="flex items-center gap-2">
                                            Unlock Itinerary <Sparkles className="h-4 w-4" />
                                        </span>
                                    ) : (
                                        "Top Up Points"
                                    )}
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={onSave}
                                    disabled={saving}
                                    className="h-14 flex-1 rounded-2xl border-2 border-slate-200 bg-transparent text-base font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                >
                                    Save Draft
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function PerkItem({
    icon: Icon,
    title,
    desc,
}: {
    icon: React.ElementType;
    title: string;
    desc: string;
}) {
    return (
        <div className="flex gap-4">
            <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{title}</h4>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {desc}
                </p>
            </div>
        </div>
    );
}

// ... (Keep your saveDraftAsTrip logic at the bottom) ...


/* =========================
   Save flow
========================= */
async function saveDraftAsTrip(
    sbClient: ReturnType<typeof getSupabaseBrowser>,
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
        const { data: auth, error: userErr } = await sbClient.auth.getUser();
        if (userErr) {
            console.error("[saveDraftAsTrip] auth.getUser error:", userErr);
        }
        currentUserId = auth?.user?.id ?? undefined;
        if (!currentUserId) throw new Error("Not authenticated");

        // 1) Spend points via RPC, fallback to manual ledger insert
        try {
            const { data: ok, error: rpcErr } = await sbClient
                .schema('itinero')
                .rpc("spend_points", {
                    p_cost: COST,
                });
            if (rpcErr) throw rpcErr;
            if (ok !== true) {
                setInsufficientOpen(true);
                setSavingState(false);
                return;
            }
            pointsSpent = true;
        } catch (e) {
            console.error("[saveDraftAsTrip] spend_points RPC failed, fallback:", e);
            const { error: debitErr } = await sbClient
                .schema("itinero")
                .from("points_ledger")
                .insert({
                    user_id: currentUserId,
                    delta: -COST,
                    reason: "save_trip",
                    meta: { source: "web", at: new Date().toISOString() },
                });
            if (debitErr) {
                console.error("[saveDraftAsTrip] manual debit failed:", debitErr);
                setInsufficientOpen(true);
                setSavingState(false);
                return;
            }
            pointsSpent = true;
        }

        // 2) Prepare trip insert
        const ins = currentPreview.trip_summary?.inputs;
        const title = ins?.destinations?.[0]?.name
            ? `${ins.destinations[0].name} Trip`
            : "Trip";

        const destinationId = ins?.destinations?.[0]?.id ?? null;

        // NEW: get cover_url from destinations table as source of truth
        let coverUrlFromDest: string | null = null;
        if (destinationId) {
            try {
                const { data: destRow, error: destErr } = await sbClient
                    .schema("itinero")
                    .from("destinations")
                    .select("cover_url")
                    .eq("id", destinationId)
                    .maybeSingle<{ cover_url: string | null }>();

                if (destErr) {
                    console.error(
                        "[saveDraftAsTrip] destinations cover_url lookup error:",
                        destErr
                    );
                } else if (destRow) {
                    coverUrlFromDest = destRow.cover_url ?? null;
                }
            } catch (e) {
                console.error(
                    "[saveDraftAsTrip] destinations cover_url lookup threw:",
                    e
                );
            }
        }

        const tripRow = {
            user_id: currentUserId,
            title,
            start_date:
                ins?.start_date ?? currentPreview.trip_summary.start_date ?? null,
            end_date: ins?.end_date ?? currentPreview.trip_summary.end_date ?? null,
            est_total_cost:
                typeof currentPreview.trip_summary.est_total_cost === "number"
                    ? currentPreview.trip_summary.est_total_cost
                    : null,
            currency: currentPreview.trip_summary.currency ?? null,
            destination_id: destinationId,
            inputs: ins,
            // Prefer DB value, fall back to preview input, then null
            cover_url: coverUrlFromDest ?? ins?.destinations?.[0]?.cover_url ?? null,
        };

        const { data: tripInsert, error: tripErr } = await sbClient
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
                    duration_min: Number.isFinite(b.duration_min)
                        ? b.duration_min
                        : null,
                    travel_min_from_prev: Number.isFinite(b.travel_min_from_prev)
                        ? b.travel_min_from_prev
                        : null,
                    notes: b.notes ?? null,
                });
            });
        });

        if (items.length) {
            const { error: itemsErr } = await sbClient
                .schema("itinero")
                .from("itinerary_items")
                .insert(items);
            if (itemsErr) throw itemsErr;
        }

        // 4) Refresh points balance
        try {
            const { data: newBal } = await sbClient.rpc("get_points_balance");
            if (typeof newBal === "number") setPoints(newBal);
        } catch (e) {
            console.error("[saveDraftAsTrip] refresh balance failed:", e);
        }

        // 5) Clear preview from localStorage after successful save
        try {
            if (typeof window !== "undefined") {
                window.localStorage.removeItem("itinero:latest_preview");
            }
        } catch {
            // non-fatal
        }

        // 6) Notify Discord (Optional/Background)
        void notifyTripCreatedAction(tripId);

        // 7) Redirect to trip
        router.push(`/trips/${tripId}`);
    } catch (err) {
        // Refund points if we successfully spent them but failed later
        if (pointsSpent) {
            try {
                const { data: auth2 } = await sbClient.auth.getUser();
                const uid = auth2?.user?.id ?? null;
                await sbClient.schema("itinero").from("points_ledger").insert({
                    user_id: uid,
                    delta: COST,
                    reason: "refund_save_trip_failed",
                    meta: { source: "web", at: new Date().toISOString() },
                });
            } catch {
                // swallow
            }
        }
        console.error("Save trip failed:", err);
    } finally {
        setSavingState(false);
    }
}