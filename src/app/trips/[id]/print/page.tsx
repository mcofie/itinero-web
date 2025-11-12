// app/trips/[id]/print/page.tsx
import * as React from "react";
import {redirect} from "next/navigation";
import {createClientServerRSC} from "@/lib/supabase/server";
import {extractDestName} from "../page";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

/* ---------------- types (expanded) ---------------- */
type UUID = string;

type TripRow = {
    id: UUID;
    user_id: UUID;
    title: string | null;
    start_date: string | null;
    end_date: string | null;
    est_total_cost: number | null;
    currency: string | null;
    cover_url?: string | null;
    inputs?: unknown;
    destination_id?: UUID | null;
};

type ItemRow = {
    id: UUID;
    trip_id: UUID;
    day_index: number;
    date: string | null;
    order_index: number;
    when: "morning" | "afternoon" | "evening";
    place_id: string | null;
    title: string;
    est_cost: number | null;
    duration_min: number | null;
    travel_min_from_prev: number | null;
    notes: string | null;
};

type PlaceRow = {
    id: string;
    name: string;
    lat?: number | null;
    lng?: number | null;
    category?: string | null;
    tags?: string[] | null;
};

type DayBlock = {
    id?: string;
    order_index?: number;
    when: "morning" | "afternoon" | "evening";
    place_id: string | null;
    title: string;
    est_cost: number;
    duration_min: number;
    travel_min_from_prev: number;
    notes?: string;
};

type Day = {
    date: string;
    blocks: DayBlock[];
};

type ItineroKBYG = {
    currency?: string;
    plugs?: string;
    languages?: string[] | string;
    weather?: unknown;
    getting_around?: string;
    esim?: string;
    primary_city?: string;
};

type DestinationHistoryPayload = {
    about?: string;
    history?: string;
    kbyg?: ItineroKBYG;
};

type DestinationRow = {
    id: UUID;
    name: string | null;
    lat: number | null;
    lng: number | null;
    current_history_id: UUID | null;
};

type DestinationHistoryRow = {
    id: UUID;
    section?: string | null;
    payload?: DestinationHistoryPayload | unknown;
    sources?: string[] | unknown;
    created_at?: string | Date | null;
    backdrop_image_url?: string | null;
    backdrop_image_attribution?: string | null;
};

/* ---------------- helpers ---------------- */

// SSR-safe date formatting (fixed locale + UTC)
const STABLE_DATE_LOCALE = "en-GB";
const STABLE_DATE_TIMEZONE = "UTC";
const STABLE_DTF = new Intl.DateTimeFormat(STABLE_DATE_LOCALE, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: STABLE_DATE_TIMEZONE,
});

function parseYMDtoUTC(ymd?: string | null): Date | null {
    if (!ymd || typeof ymd !== "string") return null;
    const [y, m, d] = ymd.split("-").map((n) => Number(n));
    if (!y || !m || !d) return null;
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

function formatDate(d?: string | null) {
    const dt = parseYMDtoUTC(d ?? undefined);
    return dt ? STABLE_DTF.format(dt) : "—";
}

function formatDateRange(start?: string | null, end?: string | null) {
    if (!start && !end) return "—";
    const s = start ? parseYMDtoUTC(start) : null;
    const e = end ? parseYMDtoUTC(end) : null;
    const fmt = (d: Date) => STABLE_DTF.format(d);
    if (s && e) return `${fmt(s)} → ${fmt(e)}`;
    if (s) return fmt(s);
    if (e) return fmt(e);
    return "—";
}

function groupItemsByDayIndex(items: ItemRow[]): Day[] {
    const map = new Map<number, { date: string | null; items: ItemRow[] }>();
    for (const it of items) {
        if (!map.has(it.day_index)) map.set(it.day_index, {date: it.date, items: []});
        map.get(it.day_index)!.items.push(it);
    }
    return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([_, v]) => ({
            date: v.date ?? "",
            blocks: v.items.map((it) => ({
                id: it.id,
                order_index: it.order_index,
                when: it.when,
                place_id: it.place_id,
                title: it.title,
                est_cost: Number(it.est_cost ?? 0),
                duration_min: Number(it.duration_min ?? 0),
                travel_min_from_prev: Number(it.travel_min_from_prev ?? 0),
                notes: it.notes ?? undefined,
            })),
        }));
}

function money(v?: number | null, code?: string | null) {
    if (typeof v !== "number") return "—";
    return `${code ?? "USD"} ${Math.round(v).toLocaleString()}`;
}

function minutes(v?: number | null) {
    if (!v || v <= 0) return "—";
    return `${v} min`;
}

function chip(label: string) {
    return (
        <span
            style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(15,23,42,0.06)",
                border: "1px solid rgba(15,23,42,0.08)",
                fontSize: 12,
            }}
        >
      {label}
    </span>
    );
}

function whenPretty(w: DayBlock["when"]) {
    return w.charAt(0).toUpperCase() + w.slice(1);
}

function whenEmoji(w: DayBlock["when"]) {
    if (w === "morning") return "🌅";
    if (w === "afternoon") return "🌞";
    return "🌙";
}

function whenLabel(w: DayBlock["when"]) {
    return `${whenEmoji(w)} ${whenPretty(w)}`;
}

/** parse a maybe-JSON inputs into an object */
function parseInputs(inputs: unknown): Record<string, unknown> | null {
    if (!inputs) return null;
    if (typeof inputs === "string") {
        try {
            const u = JSON.parse(inputs);
            return typeof u === "object" && u ? (u as Record<string, unknown>) : null;
        } catch {
            return null;
        }
    }
    return typeof inputs === "object" ? (inputs as Record<string, unknown>) : null;
}

/** pull interests: string[] from inputs if present */
function getInterests(inputs: unknown): string[] {
    const obj = parseInputs(inputs);
    const list = (obj?.interests as unknown) as string[] | undefined;
    if (Array.isArray(list)) return list.filter((s) => typeof s === "string" && s.trim()).slice(0, 12);
    return [];
}

/** map an interest to a cute emoji */
function emojiForInterest(raw: string): string {
    const s = raw.toLowerCase();
    if (/(food|cuisine|street)/.test(s)) return "🍽️";
    if (/(nightlife|party|club)/.test(s)) return "🎉";
    if (/(museum|gallery|art)/.test(s)) return "🖼️";
    if (/(history|heritage)/.test(s)) return "🏛️";
    if (/(nature|park|outdoor)/.test(s)) return "🌿";
    if (/(hike|trek|trail|mountain)/.test(s)) return "🥾";
    if (/(beach|coast|island)/.test(s)) return "🏖️";
    if (/(shopping|mall|market)/.test(s)) return "🛍️";
    if (/(adventure|extreme)/.test(s)) return "⚡";
    if (/(photo|photography)/.test(s)) return "📸";
    if (/(coffee|cafe)/.test(s)) return "☕";
    if (/(wine|brew|beer)/.test(s)) return "🍷";
    if (/(family|kids|child)/.test(s)) return "👨‍👩‍👧‍👦";
    if (/(wildlife|safari|animal)/.test(s)) return "🐘";
    if (/(music|concert|live)/.test(s)) return "🎶";
    if (/(architecture|design|building)/.test(s)) return "🏗️";
    if (/(wellness|spa|relax|yoga)/.test(s)) return "🧘";
    if (/(festival|event)/.test(s)) return "🎪";
    if (/(culture|local)/.test(s)) return "🌍";
    return "⭐";
}

/** safe coerce destination_history payload */
function coerceHistoryPayload(p: unknown): DestinationHistoryPayload {
    const out: DestinationHistoryPayload = {};
    if (!p || typeof p !== "object") return out;
    const obj = p as Record<string, unknown>;
    if (typeof obj.about === "string") out.about = obj.about as string;
    if (typeof obj.history === "string") out.history = obj.history as string;
    const k = obj.kbyg as unknown;
    if (k && typeof k === "object") {
        const kb = k as Record<string, unknown>;
        out.kbyg = {
            currency: typeof kb.currency === "string" ? (kb.currency as string) : undefined,
            plugs: typeof kb.plugs === "string" ? (kb.plugs as string) : undefined,
            languages: Array.isArray(kb.languages)
                ? (kb.languages as string[])
                : typeof kb.languages === "string"
                    ? (kb.languages as string)
                    : undefined,
            weather: kb.weather,
            getting_around: typeof kb.getting_around === "string" ? (kb.getting_around as string) : undefined,
            esim: typeof kb.esim === "string" ? (kb.esim as string) : undefined,
            primary_city: typeof kb.primary_city === "string" ? (kb.primary_city as string) : undefined,
        };
    }
    return out;
}

/** pick lodging (if present) */
type InputsWithLodging = { lodging?: { name: string; lat?: number; lng?: number } | null };

function getLodging(inputs: unknown) {
    const obj = parseInputs(inputs) as InputsWithLodging | null;
    const l = obj?.lodging;
    return l && typeof l.name === "string" ? l : null;
}

/** tiny sums & time formatters */
function sum<T>(arr: T[], pick: (t: T) => number | null | undefined) {
    return arr.reduce((s, x) => s + (Number(pick(x) ?? 0) || 0), 0);
}

function fmtHoursMin(mins: number) {
    if (!mins) return "—";
    const h = Math.floor(mins / 60),
        m = mins % 60;
    return h ? `${h}h${m ? " " + m + "m" : ""}` : `${m}m`;
}

/** emojis for KBYG labels */
function kbygEmoji(key: keyof ItineroKBYG): string {
    switch (key) {
        case "currency":
            return "💱";
        case "plugs":
            return "🔌";
        case "languages":
            return "🗣️";
        case "getting_around":
            return "🚌";
        case "esim":
            return "📶";
        case "primary_city":
            return "🏙️";
        default:
            return "ℹ️";
    }
}

/* ---------------- page ---------------- */

export default async function TripPrintPage({params}: { params: { id: string } }) {
    const sb = await createClientServerRSC();
    const {
        data: {user},
    } = await sb.auth.getUser();
    if (!user) redirect("/login");

    const tripId = params.id;

    // Trip
    const {data: trip} = await sb
        .schema("itinero")
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .maybeSingle<TripRow>();
    if (!trip) redirect("/trips");

    // Items
    const {data: items} = await sb
        .schema("itinero")
        .from("itinerary_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("date", {ascending: true, nullsFirst: true})
        .order("order_index", {ascending: true});

    const safeItems: ItemRow[] = Array.isArray(items) ? (items as ItemRow[]) : [];
    const days = groupItemsByDayIndex(safeItems);

    // Places (name lookup)
    const placeIds = Array.from(new Set(safeItems.map((r) => r.place_id).filter(Boolean))) as string[];
    let places: PlaceRow[] = [];
    if (placeIds.length) {
        const {data: pRows} = await sb
            .schema("itinero")
            .from("places")
            .select("id,name,lat,lng,category,tags")
            .in("id", placeIds);
        places = (pRows ?? []) as PlaceRow[];
    }
    const placeName = (id?: string | null) => (id && places.find((p) => p.id === id)?.name) || "—";

    const dateRange = formatDateRange(trip.start_date, trip.end_date);
    const destinationName = extractDestName(trip.inputs);

    // Destination history (about/history + KBYG + sources)
    let aboutText: string | undefined;
    let historyText: string | undefined;
    let kbyg: ItineroKBYG | undefined;
    let sources: string[] | undefined;

    if (trip.destination_id) {
        const {data: dest} = await sb
            .schema("itinero")
            .from("destinations")
            .select("id,name,lat,lng,current_history_id")
            .eq("id", trip.destination_id)
            .maybeSingle<DestinationRow>();

        if (dest?.current_history_id) {
            const {data: histRow} = await sb
                .schema("itinero")
                .from("destination_history")
                .select(
                    "id,section,payload,sources,created_at,backdrop_image_url,backdrop_image_attribution"
                )
                .eq("id", dest.current_history_id)
                .maybeSingle<DestinationHistoryRow>();

            const payload = coerceHistoryPayload(histRow?.payload);
            aboutText = payload.about;
            historyText = payload.history;
            kbyg = payload.kbyg;

            // sources may be string[] or JSON in column
            const s = histRow?.sources as unknown;
            sources = Array.isArray(s) ? (s.filter((x) => typeof x === "string") as string[]) : undefined;
        }
    }

    // Interests from inputs
    const interests = getInterests(trip.inputs);

    // Lodging
    const lodging = getLodging(trip.inputs);

    // Use absolute URL for hero (important for headless fetch)
    const hero =
        trip.cover_url && trip.cover_url.startsWith("http")
            ? trip.cover_url
            : "https://images.unsplash.com/photo-1589556045897-c444ffa0a6ff?auto=format&fit=crop&q=80&w=2000";

    // Optional: public/share URL QR (set NEXT_PUBLIC_SITE_URL)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const shareUrl = siteUrl ? `${siteUrl}/trips/${trip.id}` : "";
    const qr = shareUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shareUrl)}`
        : "";

    // Simple totals
    const totalBlocks = safeItems.length;
    const totalCost = trip.est_total_cost ?? safeItems.reduce((s, it) => s + (it.est_cost ?? 0), 0);

    return (
        <html lang="en">
        <head>
            <title>{trip.title ?? "Trip"} – Printable</title>

            {/* Speed up image fetching */}
            <link rel="preconnect" href="https://images.unsplash.com" crossOrigin=""/>
            <link rel="dns-prefetch" href="//images.unsplash.com"/>

            {/* Preload hero so Chromium starts fetching immediately */}
            <link rel="preload" as="image" href={hero}/>

            {/* Print CSS */}
            <style>{`
          /* Page setup */
          @page { size: A4; margin: 16mm; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { height: 100%; }
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
            color: var(--ink, #0f172a);
            background: white;
            counter-reset: page;
          }

          /* Variables for nice grayscale too */
          :root {
            --ink: #0f172a;
            --muted: #475569;
            --line: rgba(15,23,42,0.12);
          }

          img { max-width: 100%; height: auto; }

          /* Layout primitives */
          .container { max-width: 730px; margin: 0 auto; }
          .page { page-break-after: always; }
          .page:last-child { page-break-after: auto; }

          .cover {
            position: relative;
            min-height: calc(100vh - 32mm);
            border-radius: 20px;
            overflow: hidden;
          }
          .cover-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
          .cover-tint { position: absolute; inset: 0; background: rgba(0,0,0,0.28); }
          .cover-inner {
            position: relative; z-index: 1;
            display: flex; flex-direction: column;
            justify-content: flex-end;
            height: 100%;
            padding: 28mm 0 0 0;
          }
          .glass {
            background: rgba(255,255,255,0.16);
            border: 1px solid rgba(255,255,255,0.35);
            backdrop-filter: blur(6px);
          }

          h1 { font-size: 40px; line-height: 1.1; margin: 0; color: white; }
          h2 { font-size: 22px; margin: 0 0 8px; }
          h3 { font-size: 16px; margin: 16px 0 6px; }
          p, li, td, th, small { font-size: 12.5px; line-height: 1.6; }
          p, li { orphans: 3; widows: 3; hyphens: auto; }

          .muted { color: var(--muted); }
          .tiny { font-size: 11px; }
          .chips { display: flex; gap: 8px; flex-wrap: wrap; }

          .card {
            border: 1px solid var(--line);
            border-radius: 14px;
            padding: 16px;
            background: white;
          }

          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .stat {
            border: 1px dashed rgba(15,23,42,0.18);
            border-radius: 12px; padding: 10px 12px; background: rgba(15,23,42,0.02);
          }
          .stat .k { font-weight: 600; font-size: 12px; color: #334155; }
          .stat .v { font-weight: 700; font-size: 14px; }

          .toc { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
          .toc-item { border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; }

          .kbyg-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 10px; }
          .kbyg-item { border: 1px solid var(--line); border-radius: 12px; padding: 12px; }
          .kbyg-k { font-size: 11.5px; color: #334155; display: inline-flex; align-items: center; gap: 6px; }
          .kbyg-v { font-weight: 600; }

          .section-title { display:flex; align-items:center; gap:8px; margin-top:18px; }
          .rule { height:1px; background: var(--line); border:0; margin:6px 0 0; }

          .badge {
            display: inline-block; padding: 4px 8px; border-radius: 999px;
            background: rgba(15,23,42,0.06); border: 1px solid rgba(15,23,42,0.08);
            font-size: 11.5px;
          }

          /* Day table tweaks for alignment */
          .day-table {
            width: 100%; border-collapse: collapse; overflow: hidden;
            border-radius: 12px; border: 1px solid var(--line); table-layout: fixed;
          }
          .day-table thead th {
            background: rgba(15,23,42,0.04);
            font-weight: 600; color: #334155;
            border-bottom: 1px solid rgba(15,23,42,0.1);
          }
          .day-table th, .day-table td {
            padding: 10px 12px; text-align: left; vertical-align: middle; font-size: 12.5px;
          }
          .day-table tbody tr:nth-child(odd) td { background: rgba(15,23,42,0.02); }
          .day-table tbody tr td { border-bottom: 1px solid var(--line); }
          .day-table tbody tr:last-child td { border-bottom: none; }

          .place-cell-title { font-weight: 600; }
          .place-cell-sub { color: #64748b; font-size: 11px; margin-top: 2px; word-break: break-word; }

          /* Colorful WHEN badges with emojis */
          .when-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-weight: 700; font-size: 11.5px; border: 1px solid transparent; }
          .when-badge.morning { background: #fff7cc; border-color: #fde68a; color: #92400e; }   /* warm yellow */
          .when-badge.afternoon { background: #ffe8d6; border-color: #fed7aa; color: #9a3412; } /* soft orange */
          .when-badge.evening { background: #eae8ff; border-color: #c7d2fe; color: #3730a3; }   /* calm indigo */

          /* Page footer numbering */
          .footer { position: fixed; bottom: 6mm; left: 0; right: 0; color: var(--muted); font-size: 11px; }
          .footer .inner { max-width: 730px; margin: 0 auto; display: flex; justify-content: space-between; gap: 10px; align-items: center; }
          .pageno:after { counter-increment: page; content: counter(page); }

          /* Avoid awkward splits */
          .avoid-break-inside { break-inside: avoid; page-break-inside: avoid; }
          .avoid-break-after { break-after: avoid; page-break-after: avoid; }
          .section { margin: 14px 0 0; }
        `}</style>

            {/* Mark hero-ready when the probe loads */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              (function(){
                function markReady(){ document.documentElement.setAttribute('data-hero-ready','1'); }
                var img = document.getElementById('hero-probe');
                if (!img) { markReady(); return; }
                if (img.complete && img.naturalWidth > 0) { markReady(); return; }
                img.addEventListener('load', markReady, { once: true });
                img.addEventListener('error', markReady, { once: true });
              })();
            `,
                }}
            />
        </head>
        <body>
        {/* Hidden probe ensures the background image actually gets fetched */}
        <img id="hero-probe" src={hero} alt="" style={{display: "none"}}/>

        {/* -------- Cover Page -------- */}
        <div className="page">
            <div className="container">
                <div className="cover">
                    <div className="cover-bg" style={{backgroundImage: `url('${hero}')`}}/>
                    <div className="cover-tint"/>
                    <div className="cover-inner">
                        <div style={{padding: "18mm", color: "white"}}>
                            <div className="chips" style={{marginBottom: 10}}>
                    <span
                        className="badge"
                        style={{
                            background: "rgba(255,255,255,0.18)",
                            color: "white",
                            borderColor: "rgba(255,255,255,0.35)",
                        }}
                    >
                      Saved Itinerary
                    </span>
                                <span
                                    className="badge"
                                    style={{
                                        background: "rgba(255,255,255,0.18)",
                                        color: "white",
                                        borderColor: "rgba(255,255,255,0.35)",
                                    }}
                                >
                      {destinationName}
                    </span>
                            </div>
                            <h1>{trip.title ?? "Untitled Trip"}</h1>
                            <p className="tiny" style={{color: "rgba(255,255,255,0.9)", marginTop: 10}}>
                                {dateRange}
                            </p>

                            <div style={{height: 22}}/>

                            <div
                                className="glass"
                                style={{
                                    borderRadius: 14,
                                    padding: 14,
                                    display: "inline-flex",
                                    gap: 10,
                                    alignItems: "center",
                                }}
                            >
                    <span
                        className="badge"
                        style={{
                            background: "rgba(255,255,255,0.22)",
                            color: "white",
                            borderColor: "rgba(255,255,255,0.45)",
                        }}
                    >
                      {days.length} day{days.length === 1 ? "" : "s"}
                    </span>
                                <span
                                    className="badge"
                                    style={{
                                        background: "rgba(255,255,255,0.22)",
                                        color: "white",
                                        borderColor: "rgba(255,255,255,0.45)",
                                    }}
                                >
                      Est. {money(trip.est_total_cost, trip.currency)}
                    </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer (shows on every page) */}
                <div className="footer">
                    <div className="inner">
                        <span>{trip.title ?? "Trip"}</span>
                        <span className="pageno"/>
                        <span className="tiny">Printed {new Date().toISOString().slice(0, 10)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* -------- Summary Page -------- */}
        <div className="page">
            <div className="container">
                <h2>Trip Summary</h2>
                <p className="muted" style={{marginTop: 2}}>
                    A quick overview of your itinerary details and the day-by-day plan.
                </p>

                {/* Top Stats */}
                <div
                    className="section card avoid-break-inside"
                    style={{
                        display: "grid",
                        gridTemplateColumns: qr ? "1fr auto" : "1fr",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div>
                        <div className="stats">
                            <div className="stat">
                                <div className="k">Duration</div>
                                <div className="v">
                                    {days.length} day{days.length === 1 ? "" : "s"}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="k">Destination</div>
                                <div className="v">{destinationName}</div>
                            </div>
                            <div className="stat">
                                <div className="k">Est. Total Cost</div>
                                <div className="v">{money(totalCost, trip.currency)}</div>
                            </div>
                        </div>

                        <div style={{height: 10}}/>
                        <div className="chips">
                            {chip(dateRange)}
                            {chip(`${totalBlocks} planned activit${totalBlocks === 1 ? "y" : "ies"}`)}
                        </div>
                    </div>

                    {qr && (
                        <img
                            src={qr}
                            alt="Trip QR"
                            width={60}
                            height={60}
                            style={{borderRadius: 8, border: "1px solid var(--line)"}}
                        />
                    )}
                </div>

                {/* Lodging */}
                {lodging && (
                    <div className="section card avoid-break-inside">
                        <div className="section-title">
                            <h3 style={{margin: 0}}>Where You’re Staying</h3>
                        </div>
                        <hr className="rule"/>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12,
                            }}
                        >
                            <div>
                                <div style={{fontWeight: 700}}>{lodging.name}</div>
                                <div className="tiny muted">
                                    Check your app for directions &amp; check-in info
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Interests */}
                {interests.length > 0 && (
                    <div className="section card avoid-break-inside">
                        <div className="section-title">
                            <h3 style={{margin: 0}}>Your Interests</h3>
                        </div>
                        <hr className="rule"/>
                        <div className="chips" style={{marginTop: 8}}>
                            {interests.map((i) => (
                                <span
                                    key={i}
                                    className="badge"
                                    style={{display: "inline-flex", gap: 6, alignItems: "center"}}
                                >
                      <span aria-hidden="true">{emojiForInterest(i)}</span>
                      <span>{i}</span>
                    </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Destination: About / History */}
                {(aboutText || historyText) && (
                    <div className="section card avoid-break-inside">
                        <div className="section-title">
                            <h3 style={{margin: 0}}>About the Destination</h3>
                        </div>
                        <hr className="rule"/>
                        {aboutText && <p style={{marginTop: 8}}>{aboutText}</p>}
                        {historyText && (
                            <>
                                <h3 style={{marginTop: 14}}>A Brief History</h3>
                                <p>{historyText}</p>
                            </>
                        )}
                    </div>
                )}

                {/* KBYG highlights (with emojis) */}
                {kbyg && (
                    <div className="section card avoid-break-inside">
                        <div className="section-title">
                            <h3 style={{margin: 0}}>Know Before You Go</h3>
                        </div>
                        <hr className="rule"/>
                        <div className="kbyg-grid" style={{marginTop: 8}}>
                            {kbyg.currency && (
                                <div className="kbyg-item">
                                    <div className="kbyg-k">
                                        <span aria-hidden="true">{kbygEmoji("currency")}</span>
                                        <span>Currency</span>
                                    </div>
                                    <div className="kbyg-v">{kbyg.currency}</div>
                                </div>
                            )}
                            {kbyg.plugs && (
                                <div className="kbyg-item">
                                    <div className="kbyg-k">
                                        <span aria-hidden="true">{kbygEmoji("plugs")}</span>
                                        <span>Power Plugs</span>
                                    </div>
                                    <div className="kbyg-v">{kbyg.plugs}</div>
                                </div>
                            )}
                            {kbyg.languages && (
                                <div className="kbyg-item">
                                    <div className="kbyg-k">
                                        <span aria-hidden="true">{kbygEmoji("languages")}</span>
                                        <span>Languages</span>
                                    </div>
                                    <div className="kbyg-v">
                                        {Array.isArray(kbyg.languages) ? kbyg.languages.join(", ") : kbyg.languages}
                                    </div>
                                </div>
                            )}
                            {kbyg.getting_around && (
                                <div className="kbyg-item">
                                    <div className="kbyg-k">
                                        <span aria-hidden="true">{kbygEmoji("getting_around")}</span>
                                        <span>Getting Around</span>
                                    </div>
                                    <div className="kbyg-v">{kbyg.getting_around}</div>
                                </div>
                            )}
                            {kbyg.esim && (
                                <div className="kbyg-item">
                                    <div className="kbyg-k">
                                        <span aria-hidden="true">{kbygEmoji("esim")}</span>
                                        <span>eSIM</span>
                                    </div>
                                    <div className="kbyg-v">{kbyg.esim}</div>
                                </div>
                            )}
                            {kbyg.primary_city && (
                                <div className="kbyg-item">
                                    <div className="kbyg-k">
                                        <span aria-hidden="true">{kbygEmoji("primary_city")}</span>
                                        <span>Primary City</span>
                                    </div>
                                    <div className="kbyg-v">{kbyg.primary_city}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Sources */}
                {sources && sources.length > 0 && (
                    <div className="section card avoid-break-inside">
                        <div className="section-title">
                            <h3 style={{margin: 0}}>Sources</h3>
                        </div>
                        <hr className="rule"/>
                        <ul style={{paddingLeft: 18, marginTop: 8}}>
                            {sources.slice(0, 8).map((s, i) => (
                                <li key={i} className="tiny" style={{wordBreak: "break-word"}}>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* TOC */}
                <div className="section avoid-break-inside">
                    <h3>Table of Contents</h3>
                    <div className="toc">
                        {days.map((d, i) => (
                            <div className="toc-item" key={i}>
                                <div style={{fontWeight: 600}}>Day {i + 1}</div>
                                <div className="muted tiny">{formatDate(d.date)}</div>
                                <div className="tiny" style={{marginTop: 6}}>
                                    {d.blocks.length} activit{d.blocks.length === 1 ? "y" : "ies"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="footer">
                    <div className="inner">
                        <span>Summary</span>
                        <span className="pageno"/>
                        <span className="tiny">Printed {new Date().toISOString().slice(0, 10)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* -------- Day-by-Day Pages -------- */}
        {days.map((d, idx) => {
            const dayDuration = sum(d.blocks, (b) => b.duration_min);
            const dayTravel = sum(d.blocks, (b) => b.travel_min_from_prev);
            const dayCost = sum(d.blocks, (b) => b.est_cost);

            return (
                <div className="page" key={idx}>
                    <div className="container">
                        <div
                            className="day-head"
                            style={{
                                display: "flex",
                                alignItems: "baseline",
                                justifyContent: "space-between",
                                marginBottom: 8,
                            }}
                        >
                            <h2 style={{margin: 0}}>Day {idx + 1}</h2>
                            <div className="tiny muted" style={{display: "flex", gap: 12}}>
                                <span>{formatDate(d.date)}</span>
                                <span>•</span>
                                <span>Activities: {d.blocks.length}</span>
                                <span>•</span>
                                <span>Duration: {fmtHoursMin(dayDuration)}</span>
                                <span>•</span>
                                <span>Travel: {fmtHoursMin(dayTravel)}</span>
                                <span>•</span>
                                <span>Est: {money(dayCost, trip.currency)}</span>
                            </div>
                        </div>

                        {/* Lock column widths to keep alignment identical across pages */}
                        <table className="day-table avoid-break-inside">
                            <colgroup>
                                <col style={{width: "20%"}}/>
                                {/* When */}
                                <col style={{width: "34%"}}/>
                                {/* Place */}
                                <col style={{width: "16%"}}/>
                                {/* Duration */}
                                <col style={{width: "16%"}}/>
                                {/* Travel */}
                                <col style={{width: "14%"}}/>
                                {/* Notes */}
                            </colgroup>
                            <thead>
                            <tr>
                                <th>🕒 When</th>
                                <th>📍 Place</th>
                                <th>⏱️ Duration</th>
                                <th>🚗 Travel</th>
                                <th>📝 Notes</th>
                            </tr>
                            </thead>
                            <tbody>
                            {d.blocks.map((b) => (
                                <tr key={b.id ?? `${b.order_index}-${b.title}`}>
                                    <td>
                                        <span className={`when-badge ${b.when}`}>{whenLabel(b.when)}</span>
                                    </td>
                                    <td>
                                        <div className="place-cell-title">{placeName(b.place_id)}</div>
                                        <div className="place-cell-sub">{b.title}</div>
                                    </td>
                                    <td>{minutes(b.duration_min)}</td>
                                    <td>{minutes(b.travel_min_from_prev)}</td>
                                    <td className="tiny">
                                        {b.notes ? b.notes : <span className="muted">—</span>}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="section card avoid-break-inside">
                            <div className="tiny muted">
                                Tip: keep some buffer between activities to account for local conditions and
                                traffic.
                            </div>
                        </div>

                        <div className="footer">
                            <div className="inner">
                                <span>{trip.title ?? "Trip"} • Day {idx + 1}</span>
                                <span className="pageno"/>
                                <span className="tiny">Printed {new Date().toISOString().slice(0, 10)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
        </body>
        </html>
    );
}