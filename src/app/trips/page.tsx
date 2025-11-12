// app/trips/page.tsx
import * as React from "react";
import Link from "next/link";
import {redirect} from "next/navigation";
import {createClientServerRSC} from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    CalendarDays,
    DollarSign,
    Plane,
    MapPin,
    Clock,
} from "lucide-react";
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
                        <Button asChild>
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
    const date = formatDateRange(trip.start_date ?? undefined, trip.end_date ?? undefined);
    const amount =
        typeof trip.est_total_cost === "number"
            ? `${trip.currency ?? "USD"} ${Math.round(trip.est_total_cost)}`
            : null;

    const created = trip.created_at ? relativeTimeFromNow(trip.created_at) : "just now";

    // Use cover_url if present; otherwise a pleasant fallback
    const imageUrl =
        trip.cover_url ??
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border bg-card text-card-foreground",
                "border-border/60 ring-1 ring-border/40",
                "transition-all hover:-translate-y-0.5 hover:shadow-lg py-0 pb-4"
            )}
        >
            {/* --- Media / Hero band --- */}
            <Link href={`/trips/${trip.id}`}>
                <div
                    className={cn(
                        "relative w-full",
                        // pleasant wide ratio that adapts well in grid
                        "aspect-[16/9]",
                        "bg-cover bg-center"
                    )}
                    style={{backgroundImage: `url(${imageUrl})`}}
                >
                    {/* Theme-aware overlay for readability */}
                    <div
                        className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/40 dark:from-black/45 dark:via-black/40 dark:to-black/50"/>

                    {/* Destination title */}
                    <div className="absolute inset-x-3 bottom-2 sm:bottom-3">
                        <div
                            className="line-clamp-1 text-base font-semibold tracking-tight text-white drop-shadow sm:text-lg">
                            {title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-white/85 drop-shadow">
                            {date}
                        </div>
                    </div>

                    {/* Subtle floating chips (top-right) */}
                    <div className="absolute right-2 top-2 flex gap-1">
                        {amount && (
                            <div
                                className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/95 backdrop-blur-sm">
                                {amount}
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            {/* --- Meta & actions --- */}
            <CardHeader className="space-y-2 pb-2 pt-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <Badge
                        variant="outline"
                        className="flex items-center gap-1 rounded-full border-border/60 bg-background/70 px-2 py-1 text-foreground"
                    >
                        <CalendarDays className="h-3.5 w-3.5 opacity-70"/>
                        <span className="font-medium">Dates</span>
                        <span className="text-muted-foreground">· {date}</span>
                    </Badge>

                    {amount && (
                        <Badge
                            variant="secondary"
                            className="flex items-center gap-1 rounded-full border-border/60 bg-muted px-2 py-1 text-foreground"
                        >
                            <DollarSign className="h-3.5 w-3.5 opacity-80"/>
                            <span className="font-medium">{amount}</span>
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex items-center justify-between border-t border-border/50 pt-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5"/>
                    {/* human-friendly relative time */}
                    <span>Saved {created}</span>
                </div>

                <Button variant={'outline'} asChild size="sm" className="gap-1 border-border">
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

/**
 * Returns human-friendly relative time like:
 * "just now", "1 min ago", "2 hours ago", "a day ago", "2 weeks ago", "3 months ago", "a year ago"
 */
function relativeTimeFromNow(isoOrDate: string | Date): string {
    const now = new Date();
    const then = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;

    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));

    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day; // rough
    const year = 365 * day; // rough

    if (diffSec < 30) return "just now";
    if (diffSec < minute) return `${diffSec} sec${diffSec === 1 ? "" : "s"} ago`;

    const mins = Math.floor(diffSec / minute);
    if (mins < 60) return mins === 1 ? "1 min ago" : `${mins} mins ago`;

    const hrs = Math.floor(diffSec / hour);
    if (hrs < 24) return hrs === 1 ? "1 hour ago" : `${hrs} hours ago`;

    const days = Math.floor(diffSec / day);
    if (days < 7) return days === 1 ? "a day ago" : `${days} days ago`;

    const weeks = Math.floor(diffSec / week);
    if (weeks < 5) return weeks === 1 ? "a week ago" : `${weeks} weeks ago`;

    const months = Math.floor(diffSec / month);
    if (months < 12) return months === 1 ? "a month ago" : `${months} months ago`;

    const years = Math.floor(diffSec / year);
    return years === 1 ? "a year ago" : `${years} years ago`;
}