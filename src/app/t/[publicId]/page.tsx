// app/t/[publicId]/page.tsx
import * as React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClientServer } from "@/lib/supabase/server";
import PublicTripClient from "./public-trip-client";

/* ---------------- Types (loose but explicit) ---------------- */

type TripSummary = Record<string, unknown> | null;

type DayBlock = {
    when?: string | null;
    title?: string | null;
    notes?: string | null;
    est_cost?: number | null;
    duration_min?: number | null;
    travel_min_from_prev?: number | null;
    place_id?: string | null;
};

export type Day = {
    date?: string | null;
    blocks: DayBlock[];
};

export type PlaceLite = {
    id: string;
    name: string;
    category?: string | null;
};

/** Shape of the DB row we read (keep fields optional & nullable) */
type TripRowLoose = {
    id: string;
    public_id?: string | null;
    title?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    est_total_cost?: number | null;
    currency?: string | null;
    created_at?: string | null;
    inputs?: unknown;
    trip_summary?: unknown;
    days?: unknown;
    places?: unknown;
    cover_url?: string | null;
} | null;

/* ---------------- Runtime coercion helpers ---------------- */

function asBlockArray(u: unknown): DayBlock[] {
    if (!Array.isArray(u)) return [];
    return u.map((b) => {
        const obj = (b ?? {}) as Record<string, unknown>;
        const num = (x: unknown): number | null => {
            const v = Number(x);
            return Number.isFinite(v) ? v : null;
        };
        return {
            when: typeof obj.when === "string" ? obj.when : null,
            title: typeof obj.title === "string" ? obj.title : null,
            notes: typeof obj.notes === "string" ? obj.notes : null,
            est_cost: num(obj.est_cost),
            duration_min: num(obj.duration_min),
            travel_min_from_prev: num(obj.travel_min_from_prev),
            place_id: typeof obj.place_id === "string" ? obj.place_id : null,
        };
    });
}

function asDayArray(u: unknown): Day[] {
    if (!Array.isArray(u)) return [];
    return u.map((d) => {
        const obj = (d ?? {}) as Record<string, unknown>;
        return {
            date: typeof obj.date === "string" ? obj.date : null,
            blocks: asBlockArray((obj as { blocks?: unknown }).blocks),
        };
    });
}

function asPlaceArray(u: unknown): PlaceLite[] {
    if (!Array.isArray(u)) return [];
    return u
        .map((p) => {
            const obj = (p ?? {}) as Record<string, unknown>;
            const id = typeof obj.id === "string" ? obj.id : null;
            const name = typeof obj.name === "string" ? obj.name : null;
            if (!id || !name) return null;
            return {
                id,
                name,
                category: typeof obj.category === "string" ? obj.category : null,
            };
        })
        .filter(Boolean) as PlaceLite[];
}

/* ---------------- Metadata (SEO) ---------------- */

export async function generateMetadata(
    { params }: { params: { publicId: string } }
): Promise<Metadata> {
    const sb = await createClientServer();

    // Fetch only minimal fields needed for SEO. It’s okay if this fails.
    const { data } = await sb
        .schema("itinero")
        .from("trips")
        .select("title, cover_url, start_date, end_date")
        .eq("public_id", params.publicId)
        .maybeSingle();

    const title = data?.title ? `${data.title} • Itinero` : "Shared Trip • Itinero";
    const description =
        data?.start_date || data?.end_date
            ? `Travel dates: ${formatDateRange(
                data?.start_date ?? undefined,
                data?.end_date ?? undefined
            )}`
            : "View this shared itinerary on Itinero.";

    const ogImage =
        data?.cover_url ||
        "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1600&auto=format&fit=crop";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: ogImage, width: 1600, height: 840 }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage],
        },
    };
}

/* ---------------- Page ---------------- */

export default async function PublicTripPage({
                                                 params,
                                             }: {
    params: { publicId: string };
}) {
    const sb = await createClientServer();

    // Read the shared trip by public_id (RLS should allow a public view)
    const { data, error } = await sb
        .schema("itinero")
        .from("trips")
        .select("*")
        .eq("public_id", params.publicId)
        .maybeSingle<TripRowLoose>();

    if (error || !data) {
        notFound();
    }

    const title = (data.title ?? "Shared Trip").trim();
    const dateRange = formatDateRange(
        data.start_date ?? undefined,
        data.end_date ?? undefined
    );
    const cover =
        data.cover_url ||
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop";

    // Tolerant parsing for trip content
    const tripSummary: TripSummary = (data.trip_summary as TripSummary) ?? null;
    const days = asDayArray(data.days);
    const places = asPlaceArray(data.places);

    return (
        <div className="min-h-dvh bg-background text-foreground">
            {/* HERO — full-bleed cover with tint, distinct from internal page */}
            <section className="relative h-[44svh] w-full overflow-hidden">
                {/* background image */}
                <Image src={cover} alt={title} priority fill className="object-cover" sizes="100vw" />
                {/* tint */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
                {/* title block */}
                <div className="absolute inset-x-0 bottom-0">
                    <div className="mx-auto w-full max-w-6xl px-4 pb-5">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20 backdrop-blur">
                            View-only share
                        </div>
                        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-white drop-shadow md:text-4xl">
                            {title}
                        </h1>
                        <p className="mt-1 text-white/85">{dateRange}</p>
                    </div>
                </div>
            </section>

            {/* BODY */}
            <main className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
                <PublicTripClient
                    tripId={data.id}
                    publicId={params.publicId}
                    currency={data.currency ?? "USD"}
                    estTotalCost={coerceNumber(data.est_total_cost)}
                    tripSummary={tripSummary}
                    days={days}
                    places={places}
                />
            </main>

            {/* Lightweight footer */}
            <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
                Shared via Itinero — plan smarter, wander farther.
            </footer>
        </div>
    );
}

/* ---------------- Server helpers ---------------- */

function formatDateRange(start?: string, end?: string) {
    if (!start && !end) return "—";
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
    return "—";
}

function coerceNumber(n: unknown): number | null {
    const v = Number(n);
    return Number.isFinite(v) ? v : null;
}