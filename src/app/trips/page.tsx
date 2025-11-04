// app/trips/page.tsx (Server Component, schema-accurate)

import * as React from "react";
import Link from "next/link";
import {redirect} from "next/navigation";
import {createClientServer} from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {CalendarDays, DollarSign, Plane, MapPin, Clock} from "lucide-react";
import {cn} from "@/lib/utils";


/** Match ONLY existing columns in itinero.trips */
type TripRow = {
    id: string;
    user_id: string;
    title: string | null;
    start_date: string | null;
    end_date: string | null;
    est_total_cost: number | null;
    currency: string | null;
    created_at: string | null;
};

export default async function TripsPage() {
    const sb = await createClientServer();

    // Auth (server-side)
    const {
        data: {user},
    } = await sb.auth.getUser();
    if (!user) redirect("/login");

    // Fetch trips using only existing columns
    const {data: trips, error} = await sb
        .schema("itinero")
        .from("trips")
        .select("id,user_id,title,start_date,end_date,est_total_cost,currency,created_at")
        .eq("user_id", user.id)
        .order("created_at", {ascending: false});

    if (error) {
        return (
            <AppShell userEmail={user.email ?? null}>
                <section className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
                    <div className="mb-6">
                        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
                            <Plane className="h-6 w-6"/>
                            Saved itineraries
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Couldn’t load your trips: {error.message}
                        </p>
                    </div>
                </section>
            </AppShell>
        );
    }

    const tripsSafe: TripRow[] = (trips ?? []) as TripRow[];
    const hasTrips = tripsSafe.length > 0;

    return (
        <AppShell userEmail={user.email ?? null}>
            <section className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Your Trips</div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
                            <Plane className="h-6 w-6"/>
                            Saved itineraries
                        </h1>
                        <div className="mt-1 text-sm text-muted-foreground">
                            {hasTrips ? `${tripsSafe.length} trip${tripsSafe.length === 1 ? "" : "s"}` : "No trips yet"}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" asChild>
                            <Link href="/trip-maker">New itinerary</Link>
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                {hasTrips ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {tripsSafe.map((t) => (
                            <TripCard key={t.id} trip={t}/>
                        ))}
                    </div>
                ) : (
                    <EmptyState/>
                )}
            </section>
        </AppShell>
    );
}

/** ---------- UI Parts ---------- */


/** Utils: pick colors, emoji, and flag based on destination */
function ccToFlag(cc?: string | null) {
    if (!cc) return "🗺️";
    const code = cc.trim().slice(0, 2).toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) return "🗺️";
    const A = 0x1f1e6;
    return String.fromCodePoint(...[...code].map(c => A + (c.charCodeAt(0) - 65)));
}

function guessEmoji(name: string) {
    const n = name.toLowerCase();
    if (/(beach|island|coast|sea|bay)/.test(n)) return "🏖️";
    if (/(mount|alps|peak|kilimanjaro|volcano)/.test(n)) return "⛰️";
    if (/(safari|park|reserve|wildlife)/.test(n)) return "🦁";
    if (/(desert|sahara)/.test(n)) return "🏜️";
    if (/(lake|river|falls|waterfall)/.test(n)) return "🌊";
    if (/(museum|gallery|heritage|castle|fort)/.test(n)) return "🏛️";
    if (/(nightlife|bar|club)/.test(n)) return "🌃";
    if (/(food|market|street food)/.test(n)) return "🍜";
    return "📍";
}

type Palette = {
    from: string; to: string; ring: string; chip: string; textOn: string; pattern: string;
};

// simple hash → palette picker for fun variety
function pickPalette(seed: string): Palette {
    const palettes: Palette[] = [
        { from: "from-pink-500/90", to: "to-orange-400/90", ring: "ring-pink-200", chip: "bg-pink-100 text-pink-900 border-pink-200", textOn: "text-white",
            pattern: "#f472b6" },
        { from: "from-blue-600/90", to: "to-cyan-400/90", ring: "ring-blue-200", chip: "bg-blue-100 text-blue-900 border-blue-200", textOn: "text-white",
            pattern: "#60a5fa" },
        { from: "from-emerald-600/90", to: "to-lime-400/90", ring: "ring-emerald-200", chip: "bg-emerald-100 text-emerald-900 border-emerald-200", textOn: "text-white",
            pattern: "#34d399" },
        { from: "from-violet-600/90", to: "to-fuchsia-400/90", ring: "ring-violet-200", chip: "bg-violet-100 text-violet-900 border-violet-200", textOn: "text-white",
            pattern: "#a78bfa" },
    ];
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return palettes[h % palettes.length];
}

// tiny SVG dots pattern (data URI) tinted by palette.pattern
function dotsPattern(fillHex: string) {
    const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 32 32'>
      <g fill='${fillHex}' fill-opacity='0.12'>
        <circle cx='2' cy='2' r='2'/>
        <circle cx='18' cy='10' r='1.5'/>
        <circle cx='6' cy='22' r='1.5'/>
        <circle cx='28' cy='26' r='1.2'/>
      </g>
    </svg>`;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function getDestinationBits(trip: TripRow) {
    // Try to read from saved inputs if present
    const inputs = (trip as any)?.inputs as {
        destinations?: { id?: string | null; name?: string; country?: string | null }[];
    } | undefined;

    const primary = inputs?.destinations?.[0];
    const name = primary?.name || trip.title || "Trip";
    const countryCode = primary?.country ?? null;
    return { name, countryCode };
}

/** ---------- UI ---------- */
export function TripCard({ trip }: { trip: TripRow }) {
    const { name, countryCode } = getDestinationBits(trip);
    const title = (trip.title?.trim() || name || "Untitled Trip").trim();
    const date = formatDateRange(trip.start_date ?? undefined, trip.end_date ?? undefined);
    const amount =
        typeof trip.est_total_cost === "number"
            ? `${trip.currency ?? "USD"} ${Math.round(trip.est_total_cost)}`
            : null;
    const created = trip.created_at ? new Date(trip.created_at).toLocaleDateString() : null;

    const seed = `${name}-${countryCode ?? ""}`;
    const palette = pickPalette(seed);
    const flag = ccToFlag(countryCode || "");
    const cityEmoji = guessEmoji(name);

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border border-border/50 bg-card/70 shadow-sm",
                "hover:shadow-md transition-all hover:translate-y-[-2px]"
            )}
        >
            {/* Colorful hero band */}
            <div
                className={cn(
                    "relative h-20 sm:h-24 w-full bg-gradient-to-br",
                    palette.from,
                    palette.to
                )}
                style={{
                    backgroundImage:
                        `linear-gradient(to bottom right, var(--tw-gradient-stops)), ${dotsPattern(palette.pattern)}`,
                    backgroundSize: `auto, 64px 64px`,
                }}
            >
                {/* Stamp: flag + city emoji */}
                <div className="absolute right-3 top-3 flex items-center gap-1">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg shadow ring-1 ring-white/50">
            {flag}
          </span>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg shadow ring-1 ring-white/50">
            {cityEmoji}
          </span>
                </div>

                {/* Title on band for contrast */}
                <div className="absolute left-4 bottom-2">
                    <div className={cn("text-sm opacity-90", palette.textOn)}>Destination</div>
                    <div className={cn("mt-0.5 line-clamp-1 text-lg font-semibold tracking-tight drop-shadow-sm", palette.textOn)}>
                        {title}
                    </div>
                </div>
            </div>

            <CardHeader className="space-y-2 pb-2 pt-3">
                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                        variant="outline"
                        className={cn("flex items-center gap-1 border", palette.chip.split(" ").slice(-1)[0])}
                    >
                        <CalendarDays className="h-3.5 w-3.5 opacity-70" />
                        {date}
                    </Badge>

                    {amount && (
                        <Badge
                            variant="secondary"
                            className={cn("flex items-center gap-1 border", palette.chip)}
                        >
                            <DollarSign className="h-3.5 w-3.5 opacity-80" />
                            {amount}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex items-center justify-between border-t border-border/40 pt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {created ? `Saved ${created}` : "Recently added"}
                </div>

                <Button
                    asChild
                    size="sm"
                    className="gap-1 ring-1 ring-transparent transition group-hover:ring-primary/30"
                >
                    <Link href={`/trips/${trip.id}`}>
                        <MapPin className="mr-1 h-4 w-4" />
                        Open
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

function EmptyState() {
    return (
        <div className="grid place-items-center rounded-2xl border py-16 text-center">
            <div className="mx-auto max-w-sm space-y-3 px-6">
                <div className="text-2xl">No trips yet</div>
                <p className="text-sm text-muted-foreground">
                    Build a preview itinerary and save it to see it here. You can start from the trip maker.
                </p>
                <div className="pt-2">
                    <Button asChild>
                        <Link href="/trip-maker">Create a trip</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

/** ---------- helpers ---------- */
function formatDateRange(start?: string, end?: string) {
    if (!start && !end) return "—";
    const s = start ? new Date(start + "T00:00:00") : null;
    const e = end ? new Date(end + "T00:00:00") : null;
    const fmt = (d: Date) =>
        d.toLocaleDateString(undefined, {day: "2-digit", month: "short", year: "numeric"});
    if (s && e) return `${fmt(s)} → ${fmt(e)}`;
    if (s) return fmt(s);
    if (e) return fmt(e);
    return "—";
}