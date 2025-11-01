// app/trips/page.tsx (Server Component, schema-accurate)

import * as React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClientServer } from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, Plane, MapPin } from "lucide-react";

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
        data: { user },
    } = await sb.auth.getUser();
    if (!user) redirect("/login");

    // Fetch trips using only existing columns
    const { data: trips, error } = await sb
        .schema("itinero")
        .from("trips")
        .select("id,user_id,title,start_date,end_date,est_total_cost,currency,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return (
            <AppShell userEmail={user.email ?? null}>
                <section className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
                    <div className="mb-6">
                        <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
                            <Plane className="h-6 w-6" />
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
                            <Plane className="h-6 w-6" />
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
                            <TripCard key={t.id} trip={t} />
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </section>
        </AppShell>
    );
}

/** ---------- UI Parts ---------- */
function TripCard({ trip }: { trip: TripRow }) {
    const title = trip.title?.trim() || "Untitled Trip";
    const date = formatDateRange(trip.start_date ?? undefined, trip.end_date ?? undefined);
    const amount =
        typeof trip.est_total_cost === "number" ? `${trip.currency ?? "USD"} ${Math.round(trip.est_total_cost)}` : null;

    return (
        <Card className="overflow-hidden border bg-card/60 shadow-sm transition hover:shadow">
            <CardHeader className="space-y-1">
                <CardTitle className="line-clamp-1 flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" />
                    {title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {date}
                    </Badge>
                    {amount ? (
                        <Badge variant="secondary" className="gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {amount}
                        </Badge>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                    {trip.created_at ? `Saved ${new Date(trip.created_at).toLocaleDateString()}` : ""}
                </div>
                <Button asChild size="sm">
                    <Link href={`/trips/${trip.id}`}>Open</Link>
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
        d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
    if (s && e) return `${fmt(s)} → ${fmt(e)}`;
    if (s) return fmt(s);
    if (e) return fmt(e);
    return "—";
}