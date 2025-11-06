// app/t/[publicId]/public-trip-client.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    CalendarDays,
    DollarSign,
    ExternalLink,
    Link as LinkIcon,
    MapPin,
} from "lucide-react";

const LeafletMap = dynamic(
    () => import("@/app/preview/_leaflet/LeafletMap"),
    { ssr: false }
);

type Props = {
    tripId: string;
    publicId: string;
    currency: string;
    estTotalCost: number | null;
    tripSummary: Record<string, any> | null;
    days: any[];
    places: any[];
};

export default function PublicTripClient({
                                             publicId,
                                             currency,
                                             estTotalCost,
                                             tripSummary,
                                             days,
                                             places,
                                         }: Props) {
    const { resolvedTheme } = useTheme();
    const [activeDay, setActiveDay] = React.useState(0);

    // compute a very light preview center
    const placesById = React.useMemo(() => {
        const map = new Map<string, any>();
        for (const p of Array.isArray(places) ? places : []) {
            if (p?.id) map.set(p.id, p);
        }
        return map;
    }, [places]);

    const summary = tripSummary ?? {};
    const dest = (summary?.destinations?.[0] ?? null) as
        | { name?: string; country_code?: string }
        | null;

    const dateRange = formatDateRange(summary?.start_date, summary?.end_date);

    return (
        <div className="space-y-6">
            {/* SHARE BAR */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="secondary" className="gap-1 rounded-full">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {dateRange ?? "Flexible dates"}
                    </Badge>
                    {typeof estTotalCost === "number" && (
                        <Badge variant="outline" className="gap-1 rounded-full">
                            <DollarSign className="h-3.5 w-3.5" />
                            est. {currency} {Math.round(estTotalCost)}
                        </Badge>
                    )}
                    {dest?.name && (
                        <Badge variant="outline" className="gap-1 rounded-full">
                            <MapPin className="h-3.5 w-3.5" />
                            {dest.name}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openSelf()}>
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Open in new tab
                    </Button>
                    <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => copyShareUrl(publicId)}
                        title="Copy share link"
                    >
                        <LinkIcon className="h-4 w-4" />
                        Copy link
                    </Button>
                </div>
            </div>

            {/* DISTINCT LAYOUT: left timeline (scrolls internally), right map */}
            <div className="grid gap-4 md:grid-cols-[minmax(520px,1fr)_minmax(520px,1fr)]">
                {/* LEFT: days/timeline */}
                <Card className="overflow-hidden border">
                    <div className="border-b p-3">
                        <div className="flex w-full gap-2 overflow-x-auto">
                            {days.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveDay(i)}
                                    className={cn(
                                        "rounded-full px-3 py-1 text-sm transition",
                                        i === activeDay
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-foreground hover:bg-muted/80"
                                    )}
                                >
                                    Day {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ScrollArea className="h-[calc(70svh-44px)]">
                        <ol className="space-y-3 p-3">
                            {(days?.[activeDay]?.blocks ?? []).map((b: any, idx: number) => {
                                const place = b?.place_id ? placesById.get(b.place_id) : null;
                                return (
                                    <li key={idx} className="relative">
                                        <div className="flex items-start gap-3 rounded-xl border p-4">
                                            <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-1 ring-primary/20">
                                                {idx + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="truncate text-base font-semibold">
                                                        {b?.title ?? "Untitled"}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {b?.when ?? "—"}
                                                    </div>
                                                </div>
                                                {place ? (
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        <span className="font-medium">{place.name}</span>
                                                        {place.category ? (
                                                            <span className="opacity-80"> • {place.category}</span>
                                                        ) : null}
                                                    </div>
                                                ) : null}
                                                {b?.notes ? (
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        {b.notes}
                                                    </p>
                                                ) : null}
                                                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                                                    <Chip label="Est. cost" value={fmtMoney(b?.est_cost)} />
                                                    <Chip label="Duration" value={fmtMin(b?.duration_min)} />
                                                    <Chip label="Travel" value={fmtMin(b?.travel_min_from_prev)} />
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                            {!days?.[activeDay]?.blocks?.length && (
                                <div className="p-4 text-sm text-muted-foreground">
                                    No activities for this day.
                                </div>
                            )}
                        </ol>
                    </ScrollArea>
                </Card>

                {/* RIGHT: map */}
                <Card className="overflow-hidden border md:h-[70svh]">
                    <LeafletMap
                        key={resolvedTheme} // force remount on theme change
                        theme={(resolvedTheme as "light" | "dark") ?? "light"}
                        // The public LeafletMap in your project expects: day + placesById.
                        day={days?.[activeDay] ?? { blocks: [] }}
                        placesById={placesById}
                    />
                </Card>
            </div>
        </div>
    );
}

/* ---------- tiny bits ---------- */

function openSelf() {
    if (typeof window === "undefined") return;
    window.open(window.location.href, "_blank", "noopener");
}

async function copyShareUrl(publicId: string) {
    const url =
        typeof window !== "undefined"
            ? window.location.origin + "/t/" + publicId
            : `/t/${publicId}`;
    try {
        if (navigator.share) {
            await navigator.share({ url, title: "Shared Trip • Itinero" });
            return;
        }
    } catch {
        // fall through to clipboard
    }
    try {
        await navigator.clipboard.writeText(url);
    } catch {
        // noop
    }
}

function Chip({ label, value }: { label: string; value: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
      <span className="opacity-70">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
    );
}

function fmtMin(n: any) {
    const v = Number(n);
    return Number.isFinite(v) ? `${v}m` : "—";
}

function fmtMoney(n: any) {
    const v = Number(n);
    return Number.isFinite(v) ? `$${v}` : "—";
}

function formatDateRange(start?: string, end?: string) {
    if (!start && !end) return null;
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
    return null;
}