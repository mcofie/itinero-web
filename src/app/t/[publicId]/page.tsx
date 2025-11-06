// app/t/[publicId]/page.tsx
import * as React from "react";
import type { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClientServer } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import PublicTripClient from "./public-trip-client";

// --- Types kept flexible (schema-safe) ---
type Json = Record<string, any> | null;

type TripRowLoose = {
    id: string;
    public_id?: string | null;
    title?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    est_total_cost?: number | null;
    currency?: string | null;
    created_at?: string | null;
    // Optional JSON blobs (if your schema has them)
    inputs?: Json;
    trip_summary?: Json;
    days?: any[] | null;
    places?: any[] | null;
    cover_url?: string | null;
} | null;

export async function generateMetadata(
    { params }: { params: { publicId: string } },
    _parent: ResolvingMetadata
): Promise<Metadata> {
    const sb = await createClientServer();

    // Fetch only what we need for SEO. If it fails, it's fine—fallback metadata below.
    const { data } = await sb
        .schema("itinero")
        .from("trips")
        .select("title, cover_url, start_date, end_date")
        .eq("public_id", params.publicId)
        .maybeSingle();

    const title = data?.title ? `${data.title} • Itinero` : "Shared Trip • Itinero";
    const description = data?.start_date || data?.end_date
        ? `Travel dates: ${formatDateRange(data?.start_date ?? undefined, data?.end_date ?? undefined)}`
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

export default async function PublicTripPage({
                                                 params,
                                             }: {
    params: { publicId: string };
}) {
    const sb = await createClientServer();

    // Try to fetch the trip via public_id (read-only)
    const { data, error } = await sb
        .schema("itinero")
        .from("trips")
        .select("*")
        .eq("public_id", params.publicId)
        .maybeSingle<TripRowLoose>();

    if (error || !data) {
        notFound();
    }

    // Build a minimal “preview-like” shape without relying on strict columns.
    const title = (data.title ?? "Shared Trip").trim();
    const dateRange = formatDateRange(
        data.start_date ?? undefined,
        data.end_date ?? undefined
    );
    const cover =
        data.cover_url ||
        // nice generic travel shot fallback
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1600&auto=format&fit=crop";

    // Trip content (tolerant of missing fields)
    const tripSummary = (data.trip_summary ?? null) as Json;
    const days = Array.isArray(data.days) ? data.days : [];
    const places = Array.isArray(data.places) ? data.places : [];

    return (
        <div className="min-h-dvh bg-background text-foreground">
            {/* HERO — full-bleed cover with tint, distinct from internal page */}
            <section className="relative h-[44svh] w-full overflow-hidden">
                {/* bg image */}
                <Image
                    src={cover}
                    alt={title}
                    priority
                    fill
                    className="object-cover"
                    sizes="100vw"
                />
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
                {/* Share + quick stats */}
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

            {/* Lightweight footer (distinct) */}
            <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
                Shared via Itinero — plan smarter, wander farther.
            </footer>
        </div>
    );
}

/* ---------- helpers (server) ---------- */

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