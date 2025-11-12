// app/preview/PreviewClient.tsx
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
    CloudSun,
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
            destinations?: { id: string; name: string; lat?: number; lng?: number; cover_url?: string }[];
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
    if (t.includes("hiking") || t.includes("trail") || t.includes("nature") || t.includes("park")) return "🥾";
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

    const [paywallLeft, setPaywallLeft] = React.useState<number>(10);
    const [showPaywall, setShowPaywall] = React.useState<boolean>(false);

    // Destination meta override from DB
    const [destMetaFromDb, setDestMetaFromDb] = React.useState<DestinationMetaLike | null>(null);

    // Load preview from localStorage (client-only)
    React.useEffect(() => {
        const raw = localStorage.getItem("itinero:latest_preview");
        if (raw) {
            try {
                setPreview(JSON.parse(raw));
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
        }, 1000);

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

            const toArr = (v: string[] | string | null | undefined) =>
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
    const handleBuy = () => router.push("/rewards");
    const handleSave = () => {
        if (!preview) return;
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
            <div className="mx-auto mt-10 max-w-lg text-center">
                <div
                    className="rounded-2xl border-none bg-gradient-to-br from-card to-card/60 p-6 shadow-md ring-1 ring-border/60">
                    <h2 className="text-lg font-semibold">No preview found</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Generate a preview from the wizard first. Then return here.
                    </p>
                </div>
            </div>
        );
    }

    // Prefer DB meta, fallback to preview meta
    const destinationMeta: DestinationMetaLike | undefined =
        destMetaFromDb ?? preview.destination_meta ?? undefined;

    return (
        <>
            {/* HERO */}
            <section className="relative h-[40svh] w-full overflow-hidden sm:h-[44svh]">
                <Image src={coverUrl} alt={tripTitle} priority fill className="object-cover" sizes="100vw"/>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60"/>
                <div className="absolute inset-x-0 bottom-0">
                    <div className="mx-auto w-full max-w-5xl px-4 pb-5 md:max-w-6xl">
                        <div
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/20">
                            Preview
                        </div>

                        <h1 className="mt-2 text-pretty text-2xl font-bold tracking-tight text-white drop-shadow sm:text-3xl md:text-4xl">
                            {tripTitle}
                        </h1>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-white/90">
                            <p className="text-sm sm:text-base">{formatDateRange(preview.trip_summary)}</p>

                            {inputs?.destinations?.[0]?.name && (
                                <span
                                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs ring-1 ring-white/20">
                  <MapPin className="h-4 w-4 text-white/80"/>
                  <span className="font-medium">{inputs.destinations[0].name}</span>
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
                  <span className="font-medium">est. ${estTotal}</span>
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
            </section>

            {/* Main content */}
            <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8 md:max-w-6xl">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(520px,1.15fr)_minmax(460px,1fr)]">
                    {/* LEFT: map + interests */}
                    <aside className="md:sticky md:top-24 h-[calc(100vh-160px)] md:self-start">
                        <div
                            className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-lg">
                            <div
                                className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]"/>
                            <div
                                className="pointer-events-none absolute left-0 top-0 z-10 w-full bg-gradient-to-b from-black/50 to-transparent py-2 text-center text-xs text-white/80">
                                Map overview
                            </div>

                            <MapSection
                                places={(preview.places || [])
                                    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng))
                                    .map((p) => ({id: p.id, name: p.name, lat: p.lat!, lng: p.lng!}))}
                            />
                        </div>

                        {Array.isArray(inputs?.interests) && inputs!.interests.length > 0 && (
                            <div className="mt-4 rounded-3xl border border-white/10 bg-black/40 p-4 shadow-sm">
                                <div className="text-[11px] uppercase tracking-wider text-white/70">Interests</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {inputs!.interests.map((t) => (
                                        <Badge
                                            key={t}
                                            variant="outline"
                                            className="rounded-full border-white/30 bg-white/5 px-2.5 py-1 capitalize text-white"
                                        >
                                            {emojiFor(t)} {t}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* RIGHT: itinerary */}
                    <section className="rounded-3xl border border-border/60 bg-card/60 shadow-sm">
                        {/* Day picker */}
                        <div className="flex flex-col gap-3 border-b border-border/60 p-3 md:p-4">
                            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Days</div>
                            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 md:grid-cols-10">
                                {(preview.days || []).map((_, i) => (
                                    <Button
                                        key={i}
                                        size="sm"
                                        variant={activeDayIdx === i ? "default" : "secondary"}
                                        onClick={() => setActiveDayIdx(i)}
                                        className="rounded-full px-3"
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
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
                </div>
            </main>

            {/* Destination knowledge */}
            {hasDestMeta(destinationMeta) && (
                <section className="mx-auto w-full max-w-5xl px-4 pt-2 pb-8 sm:pt-3 md:max-w-6xl">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2 space-y-3">
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
                                        {label: "Currency", value: destinationMeta?.currency_code, Icon: DollarSign},
                                        {label: "Plugs", value: joinArr(destinationMeta?.plugs), Icon: Plug},
                                        {label: "Languages", value: joinArr(destinationMeta?.languages), Icon: Globe},
                                        {
                                            label: "Getting around",
                                            value: joinArr(destinationMeta?.transport),
                                            Icon: MapPin,
                                        },
                                        {label: "eSIM", value: destinationMeta?.esim_provider, Icon: Phone},
                                        {label: "Weather", value: destinationMeta?.weather_desc, Icon: CloudSun},
                                    ]}
                                />
                            </CollapsibleCard>
                        </div>
                    </div>
                </section>
            )}

            <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
                Previewed on Itinero — plan smarter, wander farther.
            </footer>

            {/* Countdown chip */}
            {!showPaywall && paywallLeft > 0 && <PaywallCountdownBadge seconds={paywallLeft}/>}

            {/* Theme-aware paywall (no blur) */}
            {showPaywall && (
                <FullScreenPaywallOverlay
                    onBuy={handleBuy}
                    onSave={handleSave}
                    points={pointsBusy ? null : points}
                    required={requiredPoints}
                    forceTheme={isDark ? "dark" : "light"}
                />
            )}

            {/* Not enough points dialog */}
            <Dialog open={insufficientOpen} onOpenChange={setInsufficientOpen}>
                <DialogContent
                    className={[
                        "sm:max-w-sm rounded-2xl border shadow-xl ring-1",
                        "bg-card text-foreground border-border ring-border",
                        "relative overflow-hidden",
                    ].join(" ")}
                >
                    {/* subtle theme-adaptive top gradient */}
                    <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.06),transparent)] dark:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent)]"/>

                    <DialogHeader className="space-y-1">
                        <div
                            className="inline-flex items-center gap-2 self-start rounded-full border px-2.5 py-1 text-xs border-border bg-muted/50 text-muted-foreground">
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
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Day {dayIdx + 1}</div>
                    <div className="text-lg font-semibold">{formatISODate(day.date)}</div>
                </div>
                <div className="rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                    est. day cost: <span className="font-medium text-foreground">${dayCost}</span>
                </div>
            </div>

            <div className="relative">
                <div className="pointer-events-none absolute left-[18px] top-0 h-full w-[2px] rounded bg-border"/>
                <div className="space-y-3">
                    {day.blocks.map((b, i) => {
                        const place = b.place_id ? placesById.get(b.place_id) : null;
                        return (
                            <div key={`${day.date}-${i}`} className="relative pl-7">
                                <div
                                    className="absolute left-[10px] top-5 h-3 w-3 -translate-x-1/2 rounded-full border border-border/70 bg-background shadow-sm"/>
                                <div
                                    className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm transition hover:shadow-md">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div
                                            className="text-[11px] uppercase tracking-wider text-muted-foreground">{b.when}</div>
                                        <div
                                            className="grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground sm:w-auto">
                                            <Metric label="Est." value={`$${b.est_cost ?? 0}`}/>
                                            <Metric label="Duration" value={`${b.duration_min}m`}/>
                                            <Metric label="Travel" value={`${b.travel_min_from_prev}m`}/>
                                        </div>
                                    </div>

                                    <div className="mt-2 grid gap-3 md:grid-cols-3">
                                        <div className="md:col-span-2">
                                            <div className="text-base font-medium">{b.title}</div>
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
        <div className="rounded-full border bg-background/70 px-2 py-0.5">
            <span className="text-[11px]">{label}: </span>
            <span className="font-medium">{value}</span>
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
                <ChevronDown className="h-4 w-4 transition-transform duration-200 ease-out group-open:rotate-180"
                             aria-hidden/>
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
                className="rounded-full border px-3 py-1 text-sm shadow-sm bg-background/90 text-foreground border-border/60">
                Paywall in <span className="font-semibold">{seconds}s</span>
            </div>
        </div>
    );
}

type ThemeMode = "light" | "dark";

function FullScreenPaywallOverlay({
                                      onBuy,
                                      onSave,
                                      points,
                                      required,
                                      forceTheme, // optional
                                  }: {
    onBuy: () => void;
    onSave: () => void;
    points: number | null;
    required: number;
    forceTheme?: ThemeMode;
}) {
    const insuff = typeof points === "number" && points < required;

    return (
        <div
            data-theme={forceTheme}
            className="fixed inset-0 z-[60] bg-black/50 dark:bg-black/55"
            role="dialog"
            aria-modal="true"
        >
            {/* Subtle non-blur accents that adapt in dark mode */}
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(0,0,0,0.04),transparent_60%)] dark:bg-[radial-gradient(80%_50%_at_50%_0%,rgba(255,255,255,0.04),transparent_60%)]"/>
            <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.18),transparent_30%,transparent_70%,rgba(0,0,0,0.16))] dark:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08),transparent_30%,transparent_70%,rgba(255,255,255,0.06))]"/>

            {/* Panel */}
            <div className="absolute inset-x-0 bottom-6 mx-auto w-full max-w-4xl px-4 sm:bottom-8 md:bottom-10">
                <div className="rounded-3xl border border-border bg-card text-foreground shadow-2xl ring-1 ring-border">
                    <div className="px-5 py-6 sm:px-7 md:px-8 md:py-8">
                        <div className="text-center">
                            <Badge variant="secondary"
                                   className="mb-2 border border-border bg-muted text-foreground/80">
                                Preview limited
                            </Badge>

                            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Unlock the full itinerary</h2>

                            <p className="mt-1 text-sm text-muted-foreground md:text-base">
                                See every activity, get the printable PDF, shareable link, and calendar sync.
                            </p>
                        </div>

                        {/* Perks */}
                        <ul className="mx-auto mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            <Perk icon={<Sparkles className="h-4 w-4 text-primary"/>}>Full day-by-day schedule</Perk>
                            <Perk icon={<MapIcon className="h-4 w-4 text-primary"/>}>Local insights & transport
                                mapping</Perk>
                            <Perk icon={<Download className="h-4 w-4 text-primary"/>}>Printable PDF</Perk>
                            <Perk icon={<Share2 className="h-4 w-4 text-primary"/>}>Shareable trip link</Perk>
                            <Perk icon={<CalendarDays className="h-4 w-4 text-primary"/>}>Calendar export</Perk>
                            <Perk icon={<PencilLine className="h-4 w-4 text-primary"/>}>7-day free edits</Perk>
                        </ul>

                        {/* CTAs */}
                        <div className="mt-6 flex flex-col items-stretch gap-2">
                            <Button className="w-full py-5 text-base md:py-6" onClick={onBuy}>
                                Buy / Top up
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full py-5 text-base md:py-6 border-border"
                                onClick={onSave}
                            >
                                Skip to Trip
                            </Button>
                        </div>

                        {typeof points === "number" && (
                            <p className="mt-2 text-center text-xs text-muted-foreground md:text-sm">
                                {insuff
                                    ? `You need ${required} points to save. Current balance: ${points}.`
                                    : `You have ${points} points — you’re good to go!`}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Perk pill respects theme tokens */
function Perk({children, icon}: { children: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <li className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2">
            {icon ?? <Check className="h-4 w-4 text-primary"/>}
            <span className="text-sm md:text-base text-foreground">{children}</span>
        </li>
    );
}