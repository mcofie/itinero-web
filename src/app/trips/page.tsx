// app/trips/page.tsx
import * as React from "react";
import Link from "next/link";
import {redirect} from "next/navigation";
import {createClientServerRSC} from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {CalendarDays, DollarSign, Plane, MapPin, Clock} from "lucide-react";
import {cn} from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

// Columns returned by the query below
type TripRow = {
    id: string;
    user_id: string;
    title: string | null;
    start_date: string | null;
    end_date: string | null;
    est_total_cost: number | null;
    currency: string | null;
    cover_url: string | null; // <<—— include cover_url
    created_at: string | null;
};

export default async function TripsPage() {
    const sb = await createClientServerRSC();

    // Auth (server-side)
    const {
        data: {user},
    } = await sb.auth.getUser();
    if (!user) redirect("/login");

    // Fetch trips (include cover_url)
    const {data: trips, error} = await sb
        .schema("itinero")
        .from("trips")
        .select(
            "id,user_id,title,start_date,end_date,est_total_cost,currency,cover_url,created_at"
        )
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
            <section className="mx-auto w-full max-w-6xl bg-background px-4 py-6 text-foreground md:py-8">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                            Your Trips
                        </div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
                            <Plane className="h-6 w-6"/>
                            Saved itineraries
                        </h1>
                        <div className="mt-1 text-sm text-muted-foreground">
                            {hasTrips
                                ? `${tripsSafe.length} trip${tripsSafe.length === 1 ? "" : "s"}`
                                : "No trips yet"}
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

/** ---------- TripCard Component ---------- */
export function TripCard({
                             trip,
                         }: {
    trip: {
        id: string;
        title?: string | null;
        start_date?: string | null;
        end_date?: string | null;
        est_total_cost?: number | null;
        currency?: string | null;
        created_at?: string | null;
        cover_url?: string | null; // <<—— accept cover_url in props
    };
}) {
    const title = trip.title?.trim() || "Untitled Trip";
    const date = formatDateRange(
        trip.start_date ?? undefined,
        trip.end_date ?? undefined
    );
    const amount =
        typeof trip.est_total_cost === "number"
            ? `${trip.currency ?? "USD"} ${Math.round(trip.est_total_cost)}`
            : null;
    const created = trip.created_at
        ? new Date(trip.created_at).toLocaleDateString()
        : null;

    // Use cover_url if present; otherwise a pleasant fallback
    const imageUrl =
        trip.cover_url ??
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

    const flag = "🌍";
    const cityEmoji = "✈️";

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border border-border/50 bg-card text-card-foreground",
                "transition-all hover:-translate-y-0.5 hover:shadow-md py-0 pb-3"
            )}
        >
            {/* --- Background image band (from cover_url) --- */}
            <div
                className="relative h-24 w-full bg-cover bg-center sm:h-28"
                style={{backgroundImage: `url(${imageUrl})`}}
            >
                {/* Overlay tint for readability */}
                <div className="absolute inset-0 bg-black/40 dark:bg-black/50"/>

                {/* Stamp icons */}
                <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
          <span
              className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg shadow ring-1 ring-white/50">
            {flag}
          </span>
                    <span
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-lg shadow ring-1 ring-white/50">
            {cityEmoji}
          </span>
                </div>

                {/* Destination title */}
                <div className="absolute bottom-2 left-4 z-10 text-white">
                    <div className="text-xs opacity-90">Destination</div>
                    <div className="mt-0.5 line-clamp-1 text-lg font-semibold tracking-tight drop-shadow-sm">
                        {title}
                    </div>
                </div>
            </div>

            {/* --- Trip Info --- */}
            <CardHeader className="space-y-2 pb-2 pt-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1 border border-white/10 bg-white/10 text-foreground"
                    >
                        <CalendarDays className="h-3.5 w-3.5 opacity-70"/>
                        {date}
                    </Badge>
                    {amount && (
                        <Badge className="flex items-center gap-1 border border-white/10 bg-white/10 text-foreground">
                            <DollarSign className="h-3.5 w-3.5 opacity-80"/>
                            {amount}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {/* --- Footer --- */}
            <CardContent className="flex items-center justify-between border-t border-border/40 pt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5"/>
                    {created ? `Saved ${created}` : "Recently added"}
                </div>

                <Button asChild size="sm" className="gap-1">
                    <Link href={`/trips/${trip.id}`}>
                        <MapPin className="mr-1 h-4 w-4"/>
                        Open
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

function EmptyState() {
    return (
        <div className="grid place-items-center rounded-2xl border bg-card py-16 text-center text-card-foreground">
            <div className="mx-auto max-w-sm space-y-3 px-6">
                <div className="text-2xl">No trips yet</div>
                <p className="text-sm text-muted-foreground">
                    Build a preview itinerary and save it to see it here. You can start
                    from the trip maker.
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