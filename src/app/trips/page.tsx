import * as React from "react";
import Link from "next/link";
import {redirect} from "next/navigation";
import {createClientServerRSC} from "@/lib/supabase/server";
import AppShell from "@/components/layout/AppShell";
import {Button} from "@/components/ui/button";
import {
    CalendarDays,
    Plus,
    Plane,
    MapPin,
    Clock,
    Wallet,
    AlertCircle,
    ArrowRight
} from "lucide-react";
import {cn} from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

// Columns returned by the query
type TripRow = {
    id: string;
    user_id: string;
    title: string | null;
    start_date: string | null;
    end_date: string | null;
    est_total_cost: number | null;
    currency: string | null;
    cover_url: string | null;
    created_at: string | null;
};

export default async function TripsPage() {
    const sb = await createClientServerRSC();

    // Auth (server-side)
    const {
        data: {user},
    } = await sb.auth.getUser();
    if (!user) redirect("/login");

    // Fetch trips
    const {data: trips, error} = await sb
        .schema("itinero")
        .from("trips")
        .select(
            "id,user_id,title,start_date,end_date,est_total_cost,currency,cover_url,created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {ascending: false});

    const tripsSafe: TripRow[] = (trips ?? []) as TripRow[];
    const hasTrips = tripsSafe.length > 0;

    if (error) {
        return (
            <AppShell userEmail={user.email ?? null}>
                <div className="min-h-screen bg-gray-50/50 px-4 py-10">
                    <div className="mx-auto max-w-5xl">
                        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                            <div
                                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <AlertCircle className="h-6 w-6"/>
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">Unable to load trips</h3>
                            <p className="text-gray-500">{error.message}</p>
                        </div>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell userEmail={user.email ?? null}>
            <div className="min-h-screen bg-gray-50/50 text-gray-900">
                <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 lg:py-16">

                    {/* Header - Clean & Minimal */}
                    <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Trips
                            </h1>
                            <p className="text-lg text-gray-500">
                                {hasTrips
                                    ? "Your collection of planned adventures."
                                    : "Start planning your next getaway."}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {hasTrips && (
                                <Link
                                    href="/trip-maker"
                                    className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                >
                                    <Plus className="mr-2 h-4 w-4"/>
                                    New Trip
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    {hasTrips ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {tripsSafe.map((t) => (
                                <TripCard key={t.id} trip={t}/>
                            ))}

                            {/* Add Card - Minimalist Outline */}
                            <Link
                                href="/trip-maker"
                                className="group relative flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 text-center transition-all hover:border-blue-500 hover:bg-blue-50/50"
                            >
                                <div
                                    className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
                                    <Plus className="h-7 w-7"/>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Create new trip</span>
                            </Link>
                        </div>
                    ) : (
                        <EmptyState/>
                    )}
                </section>
            </div>
        </AppShell>
    );
}

/** ---------- TripCard Component ---------- */
function TripCard({trip}: { trip: TripRow }) {
    const title = trip.title?.trim() || "Untitled Trip";
    const dateRange = formatDateRange(trip.start_date, trip.end_date);
    const created = trip.created_at ? relativeTimeFromNow(trip.created_at) : "just now";

    // Format Currency
    const amount =
        typeof trip.est_total_cost === "number"
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: trip.currency ?? 'USD',
                maximumFractionDigits: 0
            }).format(trip.est_total_cost)
            : null;

    // Fallback image
    const imageUrl =
        trip.cover_url ??
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80";

    return (
        <Link
            href={`/trips/${trip.id}`}
            className="group flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-md"
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{backgroundImage: `url(${imageUrl})`}}
                />
                {/* Cost Badge */}
                {amount && (
                    <div
                        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-gray-900 shadow-sm backdrop-blur-sm">
                        {amount}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col px-1 pb-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>
                </div>

                <div className="mt-1.5 flex items-center gap-2 text-sm text-gray-500">
                    <CalendarDays className="h-3.5 w-3.5 text-gray-400"/>
                    <span>{dateRange}</span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 text-xs text-gray-400">
           <span className="flex items-center gap-1">
             <Clock className="h-3 w-3"/>
               {created}
           </span>
                    <span
                        className="font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-0.5">
             Open <ArrowRight className="h-3 w-3"/>
           </span>
                </div>
            </div>
        </Link>
    );
}

/** ---------- EmptyState Component ---------- */
function EmptyState() {
    return (
        <div
            className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-24 text-center shadow-sm">
            <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 ring-8 ring-blue-50/50">
                <Plane className="h-10 w-10 text-blue-600"/>
            </div>

            <h2 className="text-xl font-semibold text-gray-900">
                No trips planned yet
            </h2>

            <p className="mt-2 max-w-sm text-gray-500">
                Your travel log is empty. Start building your dream itinerary today—it only takes a few minutes.
            </p>

            <div className="mt-8">
                <Button
                    asChild
                    className="h-11 rounded-full bg-blue-600 px-8 font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
                >
                    <Link href="/trip-maker">
                        Start a New Adventure
                    </Link>
                </Button>
            </div>
        </div>
    );
}

/** ---------- Helpers ---------- */
function formatDateRange(start?: string | null, end?: string | null) {
    if (!start && !end) return "Dates TBD";

    const fmt = (dStr: string) => {
        const d = new Date(dStr);
        return d.toLocaleDateString(undefined, {month: "short", day: "numeric"});
    };

    if (start && end) {
        // Check if same year to simplify if needed, but for now short is fine
        return `${fmt(start)} – ${fmt(end)}`;
    }
    if (start) return `Starts ${fmt(start)}`;
    return `Ends ${fmt(end!)}`;
}

function relativeTimeFromNow(isoOrDate: string | Date): string {
    const now = new Date();
    const then = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
    const diffMs = now.getTime() - then.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));

    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffSec < 30) return "just now";
    if (diffSec < minute) return "moments ago";

    const mins = Math.floor(diffSec / minute);
    if (mins < 60) return `${mins}m ago`;

    const hrs = Math.floor(diffSec / hour);
    if (hrs < 24) return `${hrs}h ago`;

    const days = Math.floor(diffSec / day);
    if (days < 7) return `${days}d ago`;

    return then.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}