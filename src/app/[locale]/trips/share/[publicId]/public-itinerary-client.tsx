"use client";

import * as React from "react";
import {
    DollarSign,
    Clock,
    CarFront,
    MapPin,
    X,
    ArrowUpRight,
    CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Types ---------- */

type DayBlock = {
    when?: string | null;
    title?: string | null;
    notes?: string | null;
    est_cost?: number | null;
    duration_min?: number | null;
    travel_min_from_prev?: number | null;
    place_id?: string | null;
};

type Day = {
    date?: string | null; // YYYY-MM-DD or null
    blocks: DayBlock[];
};

type PlaceLite = {
    id: string;
    name: string;
    category?: string | null;
};

type PlaceDetail = {
    id: string;
    name: string;
    category?: string | null;
    description?: string | null;
    lat?: number | null;
    lng?: number | null;
    address?: string | null;
    photo_url?: string | null;
    google_place_id?: string | null;
};

export default function PublicItineraryClient({
    currency,
    estTotalCost,
    days,
    places,
    placeDetails = [],
}: {
    currency: string;
    estTotalCost: number | null;
    tripSummary: Record<string, unknown> | null;
    days: Day[];
    places: PlaceLite[];
    placeDetails?: PlaceDetail[];
}) {
    // Index for quick lookup
    const nameIndex = React.useMemo(() => {
        const idx = new Map<string, PlaceLite>();
        for (const p of places) idx.set(p.id, p);
        return idx;
    }, [places]);

    const detailIndex = React.useMemo(() => {
        const idx = new Map<string, PlaceDetail>();
        for (const p of placeDetails) idx.set(p.id, p);
        return idx;
    }, [placeDetails]);

    // Tabs: choose first day that has items, else 0
    const initialTab = React.useMemo(() => {
        const withItems = days.findIndex((d) => d.blocks.length > 0);
        return withItems >= 0 ? withItems : 0;
    }, [days]);
    const [active, setActive] = React.useState(initialTab);

    // Keep active index in range if days change
    React.useEffect(() => {
        if (active > days.length - 1) setActive(days.length - 1);
    }, [days.length, active]);

    // ---- Trip stats (days + cost) ----
    const totalDays = React.useMemo(() => computeTripDays(days), [days]);
    const displayCost =
        typeof estTotalCost === "number" && Number.isFinite(estTotalCost)
            ? estTotalCost
            : computeEstimatedCostFallback(days);

    return (
        <section className="space-y-8">
            {/* Trip stats - Clean White Card */}
            <div
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Days */}
                    <div
                        className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm dark:bg-slate-800/50 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:border-slate-700">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <div
                                className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-0.5 dark:text-slate-400">
                                Trip Length
                            </div>
                            <div className="text-xl font-bold text-slate-900 leading-none dark:text-white">
                                {totalDays} {totalDays === 1 ? "day" : "days"}
                            </div>
                        </div>
                    </div>

                    {/* Cost */}
                    <div
                        className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm dark:bg-slate-800/50 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:border-slate-700">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <div
                                className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-0.5 dark:text-slate-400">
                                Estimated Cost
                            </div>
                            <div className="text-xl font-bold text-slate-900 leading-none dark:text-white">
                                {displayCost !== null ? formatMoney(displayCost, currency) : "—"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs header - Pill Style */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                <div
                    role="tablist"
                    aria-label="Itinerary days"
                    className="flex w-max gap-2 rounded-full bg-slate-100/80 p-1 dark:bg-slate-800"
                >
                    {days.map((day, i) => {
                        const selected = i === active;
                        return (
                            <button
                                key={day.date ?? `unscheduled-${i}`}
                                role="tab"
                                aria-selected={selected}
                                aria-controls={`day-panel-${i}`}
                                id={`day-tab-${i}`}
                                onClick={() => setActive(i)}
                                className={cn(
                                    "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200",
                                    selected
                                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-blue-400 dark:ring-slate-700"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50"
                                )}
                            >
                                {dayLabel(i, day)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active day panel */}
            {days[active] ? (
                <div
                    role="tabpanel"
                    id={`day-panel-${active}`}
                    aria-labelledby={`day-tab-${active}`}
                    className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                    <DayCard
                        day={days[active]}
                        nameIndex={nameIndex}
                        detailIndex={detailIndex}
                        currency={currency}
                    />
                </div>
            ) : (
                <div
                    className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
                    <div
                        className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                    <p className="text-slate-900 font-semibold dark:text-white">
                        No items planned
                    </p>
                    <p className="text-slate-500 text-sm dark:text-slate-400">
                        This day is currently empty.
                    </p>
                </div>
            )}
        </section>
    );
}

/* ---------- Day + Item ---------- */

function DayCard({
    day,
    nameIndex,
    detailIndex,
    currency,
}: {
    day: Day;
    nameIndex: Map<string, PlaceLite>;
    detailIndex: Map<string, PlaceDetail>;
    currency: string;
}) {
    const label = day.date ? friendlyDate(day.date) : "Unscheduled";

    return (
        <article className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            {/* Header */}
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        {label}
                    </h3>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800">
                    {day.blocks.length} Items
                </span>
            </header>

            {/* Timeline Body */}
            <div className="p-6 md:p-8">
                {day.blocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 dark:bg-slate-800">
                            <Clock className="w-6 h-6 opacity-50" />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            No activities scheduled for this day.
                        </p>
                    </div>
                ) : (
                    <div className="relative space-y-8 pl-4 sm:pl-0">
                        {/* Timeline Line (Desktop) */}
                        <div className="absolute left-[95px] top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                        {day.blocks.map((block, idx) => (
                            <ItineraryItemRow
                                key={`${block.title}-${idx}`}
                                block={block}
                                place={block.place_id ? nameIndex.get(block.place_id) ?? null : null}
                                placeDetail={block.place_id ? detailIndex.get(block.place_id) ?? null : null}
                                currency={currency}
                            />
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

function ItineraryItemRow({
    block,
    place,
    placeDetail,
    currency,
}: {
    block: DayBlock;
    place: PlaceLite | null;
    placeDetail: PlaceDetail | null;
    currency: string;
}) {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement | null>(null);

    // Close logic omitted for brevity, assumed shared ref hook or similar if needed...
    React.useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        const onClick = (e: MouseEvent) => {
            const t = e.target as Node;
            if (!anchorRef.current) return;
            const panel = document.getElementById(popId(anchorRef.current));
            if (!panel) return;
            if (!anchorRef.current.contains(t) && !panel.contains(t as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("click", onClick);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("click", onClick);
        };
    }, [open]);

    const chips: Array<{ icon: React.ReactNode; label: string; color: string }> = [];

    if (isFiniteNum(block.est_cost) && block.est_cost! > 0)
        chips.push({
            icon: <DollarSign className="h-3 w-3" />,
            label: formatMoney(block.est_cost!, currency),
            color: "text-emerald-700 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900/50",
        });

    if (isFiniteNum(block.duration_min) && block.duration_min! > 0)
        chips.push({
            icon: <Clock className="h-3 w-3" />,
            label: formatMinutes(block.duration_min!),
            color: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
        });

    if (isFiniteNum(block.travel_min_from_prev) && block.travel_min_from_prev! > 0)
        chips.push({
            icon: <CarFront className="h-3 w-3" />,
            label: `${block.travel_min_from_prev}m travel`,
            color: "text-slate-500 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400",
        });

    const whenUi = getWhenUi(block.when as "morning" | "afternoon" | "evening");

    return (
        <div className="relative grid sm:grid-cols-[100px_1fr] gap-6 group">
            {/* Left: Time visual */}
            <div className="hidden sm:flex flex-col items-end pt-1 relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                    {block.when}
                </span>
                <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm shadow-sm ring-4 ring-white dark:ring-slate-900 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700",
                    whenUi.text
                )}>
                    {whenUi.emoji}
                </div>
            </div>

            {/* Right: Card */}
            <div className="flex-1 min-w-0">
                <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2 flex-1 min-w-0">
                            {/* Mobile Time Header */}
                            <div className="flex sm:hidden items-center gap-2 mb-2">
                                <span className="text-lg">{whenUi.emoji}</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    {block.when}
                                </span>
                            </div>

                            <h4 className="text-lg font-bold text-slate-900 leading-tight dark:text-white">
                                {block.title || "Untitled Activity"}
                            </h4>

                            {block.notes && (
                                <p className="text-sm text-slate-600 leading-relaxed max-w-xl dark:text-slate-400">
                                    {block.notes}
                                </p>
                            )}

                            {place && (
                                <div className="pt-1">
                                    <button
                                        ref={anchorRef}
                                        id={buttonId(place.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpen((v) => !v);
                                        }}
                                        aria-expanded={open}
                                        aria-controls={open ? popId(anchorRef.current!) : undefined}
                                    >
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{place.name}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Chips */}
                        {chips.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end md:gap-1.5 mt-2 md:mt-0">
                                {chips.map((c, i) => (
                                    <span
                                        key={i}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold tabular-nums",
                                            c.color
                                        )}
                                    >
                                        {c.icon}
                                        <span>{c.label}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Popover */}
                {place && open && (
                    <Popover
                        anchorId={buttonId(place.id)}
                        onClose={() => setOpen(false)}
                        place={place}
                        detail={placeDetail}
                    />
                )}
            </div>
        </div>
    );
}

/* ---------- Popover ---------- */

function Popover({
    anchorId,
    onClose,
    place,
    detail,
}: {
    anchorId: string;
    onClose: () => void;
    place: PlaceLite;
    detail: PlaceDetail | null;
}) {
    // Position below the anchor
    const [style, setStyle] = React.useState<React.CSSProperties>({});
    React.useLayoutEffect(() => {
        const anchor = document.getElementById(anchorId);
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        setStyle({
            position: "fixed",
            top: rect.bottom + 8,
            left: Math.min(rect.left, window.innerWidth - 340),
            width: Math.min(320, window.innerWidth - 32), // Adjusted width constraint
            zIndex: 50,
        });
    }, [anchorId]);

    const gmapsHref = buildGoogleMapsLink(detail ?? undefined, place);

    return (
        <div
            id={popIdByAnchor(anchorId)}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 dark:bg-slate-900 dark:border-slate-700 dark:ring-white/10"
            style={style}
            role="dialog"
            aria-label={`${place.name} details`}
        >
            {/* Header */}
            <div
                className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-800">
                <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {place.name}
                    </div>
                    {detail?.category && (
                        <div className="truncate text-xs font-medium text-slate-500 mt-0.5 dark:text-slate-400">
                            {detail.category}
                        </div>
                    )}
                </div>
                <button
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
                {detail?.photo_url && (
                    <div
                        className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={detail.photo_url}
                            alt={place.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}
                {detail?.description && (
                    <div className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
                        {detail.description}
                    </div>
                )}
                {detail?.address && (
                    <div
                        className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                        <MapPin className="h-3 w-3 shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                        <span>{detail.address}</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/30 p-3 dark:border-slate-800 dark:bg-slate-950/30">
                <a
                    href={gmapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-sm active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                    View on Google Maps
                    <ArrowUpRight className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}

/* ---------- Utils ---------- */

function dayLabel(index: number, day: Day) {
    const left = `Day ${index + 1}`;
    if (!day.date) return `${left}`;
    const d = new Date(`${day.date}T00:00:00`);
    const right = d.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
    });
    return `${left} • ${right}`;
}

function popId(btn: HTMLElement) {
    return `${btn.id}-popover`;
}

function popIdByAnchor(anchorId: string) {
    return `${anchorId}-popover`;
}

function buttonId(placeId: string) {
    return `place-btn-${placeId}`;
}

function isFiniteNum(n: unknown): n is number {
    return typeof n === "number" && Number.isFinite(n);
}

function formatMoney(n: number, currency: string) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(n);
    } catch {
        return `${currency} ${Math.round(n).toLocaleString()}`;
    }
}

function formatMinutes(min: number) {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
}

function friendlyDate(ymd: string) {
    const d = new Date(`${ymd}T00:00:00`);
    return d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

function buildGoogleMapsLink(
    detail: PlaceDetail | undefined,
    fallback: PlaceLite
) {
    const q =
        detail?.lat && detail?.lng
            ? `${detail.lat},${detail.lng}`
            : encodeURIComponent(fallback.name);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/* ---- Trip stats helpers ---- */

function toDate(d?: string | null) {
    return d ? new Date(`${d}T00:00:00`) : null;
}

function daysInclusive(a: Date, b: Date) {
    const ms = Math.abs(b.getTime() - a.getTime());
    return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

function computeTripDays(days: Day[]) {
    const dated = days.map((d) => d.date).filter(Boolean) as string[];
    if (dated.length === 0) return Math.max(0, days.length);
    const sorted = dated.sort();
    const start = toDate(sorted[0])!;
    const end = toDate(sorted[sorted.length - 1])!;
    return daysInclusive(start, end);
}

function computeEstimatedCostFallback(days: Day[]) {
    let total = 0;
    for (const d of days) {
        for (const b of d.blocks) {
            if (typeof b.est_cost === "number" && Number.isFinite(b.est_cost)) {
                total += b.est_cost;
            }
        }
    }
    return total || null;
}

function getWhenUi(
    when: "morning" | "afternoon" | "evening"
): { emoji: string; text: string } {
    if (when === "morning") {
        return { emoji: "🌅", text: "text-amber-600 dark:text-amber-400" };
    }
    if (when === "afternoon") {
        return { emoji: "☀️", text: "text-orange-600 dark:text-orange-400" };
    }
    return { emoji: "🌙", text: "text-indigo-600 dark:text-indigo-400" };
}