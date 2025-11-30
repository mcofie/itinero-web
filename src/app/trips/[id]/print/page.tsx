import * as React from "react";
import { redirect } from "next/navigation";
import { createClientServerRSC } from "@/lib/supabase/server";

/* Force SSR, no cache */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

/* ---------------- types ---------------- */
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
    public_id?: string | null;
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
const STABLE_DATE_LOCALE = "en-GB";
const STABLE_DATE_TIMEZONE = "UTC";
const STABLE_DTF = new Intl.DateTimeFormat(STABLE_DATE_LOCALE, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: STABLE_DATE_TIMEZONE,
});

function extractDestName(inputs: unknown): string {
    try {
        const obj = inputs as { destinations?: Array<{ name?: string }> };
        return obj?.destinations?.[0]?.name ?? "Destination";
    } catch {
        return "Destination";
    }
}

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
        if (!map.has(it.day_index)) map.set(it.day_index, { date: it.date, items: [] });
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

function whenLabel(w: DayBlock["when"]) {
    const map = { morning: "🌅 Morning", afternoon: "🌞 Afternoon", evening: "🌙 Evening" };
    return map[w] || w;
}

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

function getInterests(inputs: unknown): string[] {
    const obj = parseInputs(inputs);
    const list = (obj?.interests as unknown) as string[] | undefined;
    if (Array.isArray(list)) return list.filter((s) => typeof s === "string" && s.trim()).slice(0, 12);
    return [];
}

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
    return "⭐";
}

type InputsWithLodging = { lodging?: { name: string; lat?: number; lng?: number } | null };

function getLodging(inputs: unknown) {
    const obj = parseInputs(inputs) as InputsWithLodging | null;
    const l = obj?.lodging;
    return l && typeof l.name === "string" ? l : null;
}

/* -- NEW: Note Extractors -- */
function getTripNote(inputs: unknown): string | null {
    const obj = parseInputs(inputs);
    return typeof obj?.notes === "string" ? obj.notes : null;
}

function getDayNotes(inputs: unknown): Record<string, string> {
    const obj = parseInputs(inputs);
    return (obj?.day_notes as Record<string, string>) || {};
}

function sum<T>(arr: T[], pick: (t: T) => number | null | undefined) {
    return arr.reduce((s, x) => s + (Number(pick(x) ?? 0) || 0), 0);
}

function coerceHistoryPayload(p: unknown): DestinationHistoryPayload {
    const out: DestinationHistoryPayload = {};
    if (!p || typeof p !== "object") return out;
    const obj = p as Record<string, unknown>;
    if (typeof obj.about === "string") out.about = obj.about;
    if (typeof obj.history === "string") out.history = obj.history;

    const k = obj.kbyg as unknown;
    if (k && typeof k === "object") {
        const kb = k as Record<string, unknown>;
        out.kbyg = {
            currency: typeof kb.currency === "string" ? kb.currency : undefined,
            plugs: typeof kb.plugs === "string" ? kb.plugs : undefined,
            languages: Array.isArray(kb.languages)
                ? (kb.languages as string[])
                : typeof kb.languages === "string"
                    ? kb.languages
                    : undefined,
            weather: kb.weather,
            getting_around: typeof kb.getting_around === "string" ? kb.getting_around : undefined,
            esim: typeof kb.esim === "string" ? kb.esim : undefined,
            primary_city: typeof kb.primary_city === "string" ? kb.primary_city : undefined,
        };
    }
    return out;
}

/* ---------------- page ---------------- */

export default async function TripPrintPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { id } = await params;
    const sp = await searchParams;

    const sb = await createClientServerRSC();
    const isHeadless = sp.print === "1";

    const {
        data: { user },
    } = await sb.auth.getUser();

    if (!user && !isHeadless) {
        redirect("/login");
    }

    const tripId = id;

    // 1. Fetch Trip
    const { data: trip } = await sb
        .schema("itinero")
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .maybeSingle<TripRow>();

    if (!trip) redirect("/trips");

    // 2. Fetch Items
    const { data: items } = await sb
        .schema("itinero")
        .from("itinerary_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("date", { ascending: true, nullsFirst: true })
        .order("order_index", { ascending: true });

    const safeItems: ItemRow[] = Array.isArray(items) ? (items as ItemRow[]) : [];
    const days = groupItemsByDayIndex(safeItems);

    // 3. Fetch Places
    const placeIds = Array.from(new Set(safeItems.map((r) => r.place_id).filter(Boolean))) as string[];
    let places: PlaceRow[] = [];
    if (placeIds.length) {
        const { data: pRows } = await sb
            .schema("itinero")
            .from("places")
            .select("id,name,lat,lng,category,tags")
            .in("id", placeIds);
        places = (pRows ?? []) as PlaceRow[];
    }
    const placeName = (id?: string | null) => (id && places.find((p) => p.id === id)?.name) || "—";

    const dateRange = formatDateRange(trip.start_date, trip.end_date);
    const destinationName = extractDestName(trip.inputs);

    // 4. Destination history
    let aboutText: string | undefined;
    let historyText: string | undefined;
    let kbyg: ItineroKBYG | undefined;

    if (trip.destination_id) {
        const { data: dest } = await sb
            .schema("itinero")
            .from("destinations")
            .select("id,name,lat,lng,current_history_id")
            .eq("id", trip.destination_id)
            .maybeSingle<DestinationRow>();

        if (dest?.current_history_id) {
            const { data: histRow } = await sb
                .schema("itinero")
                .from("destination_history")
                .select("id,section,payload,sources,created_at,backdrop_image_url,backdrop_image_attribution")
                .eq("id", dest.current_history_id)
                .maybeSingle<DestinationHistoryRow>();

            const payload = coerceHistoryPayload(histRow?.payload);
            aboutText = payload.about;
            historyText = payload.history;
            kbyg = payload.kbyg;
        }
    }

    const interests = getInterests(trip.inputs);
    const lodging = getLodging(trip.inputs);

    // 5. Extract Notes
    const tripGeneralNote = getTripNote(trip.inputs);
    const dayNotesMap = getDayNotes(trip.inputs);

    const hero =
        trip.cover_url && trip.cover_url.startsWith("http")
            ? trip.cover_url
            : "https://images.unsplash.com/photo-1589556045897-c444ffa0a6ff?auto=format&fit=crop&q=80&w=2000";

    // Generate QR for Mobile Access
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://itinero.app";
    const shareUrl = trip.public_id ? `${siteUrl}/trips/share/${trip.public_id}` : "";
    const qrUrl = shareUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`
        : "";

    const totalBlocks = safeItems.length;
    const totalCost = trip.est_total_cost ?? safeItems.reduce((s, it) => s + (it.est_cost ?? 0), 0);

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <title>{trip.title ?? "Trip"} – Printable</title>
                <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />

                <style>{`
          @page { size: A4; margin: 15mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { margin: 0; padding: 0; height: 100%; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            background: white;
            font-size: 12px;
            line-height: 1.5;
          }

          h1, h2, h3, h4 { margin: 0; font-weight: 700; color: #0f172a; }
          h1 { font-size: 36px; letter-spacing: -0.03em; line-height: 1.1; }
          h2 { font-size: 20px; margin-bottom: 12px; letter-spacing: -0.01em; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
          h3 { font-size: 14px; margin-bottom: 6px; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; }
          p { margin: 0 0 10px 0; color: #475569; }

          .container { max-width: 190mm; margin: 0 auto; }
          
          /* Specific page breaks */
          .page-break { page-break-after: always; }

          /* Cover Page */
          .cover-hero {
            position: relative;
            height: 120mm;
            border-radius: 16px;
            overflow: hidden;
            margin-bottom: 10mm;
            background-color: #f1f5f9;
          }
          .cover-img { width: 100%; height: 100%; object-fit: cover; }
          .cover-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 12mm;
            color: white;
          }
          .cover-hero h1 { color: white; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
          .cover-meta { display: flex; gap: 8px; margin-bottom: 8px; }
          .cover-badge { 
            background: rgba(255,255,255,0.2); 
            backdrop-filter: blur(4px); 
            border: 1px solid rgba(255,255,255,0.3); 
            color: white; 
            padding: 4px 10px; 
            border-radius: 99px; 
            font-size: 10px; 
            font-weight: 600; 
            text-transform: uppercase; 
            letter-spacing: 0.05em;
          }

          /* Stats Grid */
          .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 10mm; }
          .stat-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; background: #f8fafc; }
          .stat-label { font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 2px; }
          .stat-val { font-size: 14px; font-weight: 700; color: #0f172a; }

          /* Info Grid */
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12mm; }
          
          /* KBYG Grid */
          .kbyg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .kbyg-card { display: flex; gap: 8px; align-items: flex-start; padding: 10px; border-radius: 8px; border: 1px solid #f1f5f9; }
          .kbyg-icon { font-size: 16px; }
          
          /* Timeline */
          .day-block { 
             margin-bottom: 12mm; 
             break-inside: avoid; 
             border: 1px solid #e2e8f0;
             border-radius: 12px;
             overflow: hidden;
          }
          .day-header { 
            background: #f8fafc;
            padding: 10px 14px;
            border-bottom: 1px solid #e2e8f0;
            display: flex; 
            justify-content: space-between; 
            align-items: baseline; 
          }
          .day-title { font-size: 16px; font-weight: 700; color: #0f172a; }
          .day-meta { font-size: 11px; color: #64748b; font-weight: 500; }

          .day-note {
            padding: 8px 14px;
            background: #fffbeb;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
            color: #475569;
            font-style: italic;
          }

          .timeline-table { width: 100%; border-collapse: collapse; }
          .timeline-table th { background: white; border-bottom: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 10px; text-transform: uppercase; color: #94a3b8; }
          .timeline-table td { padding: 10px 12px; vertical-align: top; border-bottom: 1px solid #f1f5f9; }
          .timeline-table tr:last-child td { border-bottom: none; }

          .event-time { font-family: monospace; font-size: 11px; color: #64748b; font-weight: 600; }
          .event-title { font-weight: 600; color: #0f172a; font-size: 13px; }
          .event-details { font-size: 11px; color: #64748b; margin-top: 2px; }
          .event-notes { margin-top: 4px; font-size: 11px; font-style: italic; color: #475569; background: #fffbeb; padding: 4px 8px; border-radius: 4px; display: inline-block; }

          /* Footer */
          .global-footer { 
            position: fixed; 
            bottom: 0; 
            left: 0; 
            right: 0; 
            height: 10mm;
            border-top: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 9px;
            color: #94a3b8;
            background: white;
            padding-top: 2mm;
          }
          .page-number:after { content: "Page " counter(page); }

          /* QR Code */
          .qr-section {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            margin-top: 8mm;
          }
          .qr-text { font-size: 11px; color: #64748b; line-height: 1.4; }
          .qr-title { font-weight: 700; color: #0f172a; font-size: 12px; margin-bottom: 2px; }

          /* Notes Area */
          .notes-area {
            margin-top: 20mm;
            border-top: 2px dashed #e2e8f0;
            padding-top: 10mm;
          }
          .notes-content {
            white-space: pre-wrap; 
            margin-bottom: 10mm; 
            font-size: 12px; 
            font-family: monospace;
            background: #f8fafc;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            color: #334155;
          }
          .notes-lines {
            height: 30mm;
            background-image: linear-gradient(#e2e8f0 1px, transparent 1px);
            background-size: 100% 10mm;
          }
        `}</style>

                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              if (new URLSearchParams(window.location.search).get("print") === "1") {
                window.addEventListener("load", () => setTimeout(window.print, 500));
              }
            `,
                    }}
                />
            </head>
            <body>
                <div className="global-footer">
                    <span>{trip.title}</span>
                    <span className="page-number"></span>
                </div>

                {/* --- Page 1: Cover & Context --- */}
                <div className="container page-break">
                    <div className="cover-hero">
                        <img src={hero} className="cover-img" alt="Cover" />
                        <div className="cover-overlay">
                            <div className="cover-meta">
                                <span className="cover-badge">Itinerary</span>
                                <span className="cover-badge">{destinationName}</span>
                            </div>
                            <h1>{trip.title || "Untitled Trip"}</h1>
                            <p style={{ color: "rgba(255,255,255,0.9)", marginTop: "4px", fontSize: "14px" }}>
                                {dateRange}
                            </p>
                        </div>
                    </div>

                    {/* Key Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Duration</div>
                            <div className="stat-val">{days.length} days</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Est. Cost</div>
                            <div className="stat-val">{money(totalCost, trip.currency)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Activities</div>
                            <div className="stat-val">{totalBlocks}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">City</div>
                            <div className="stat-val" style={{ fontSize: 12, lineHeight: 1.2 }}>{destinationName}</div>
                        </div>
                    </div>

                    {/* Context Grid: About & KBYG */}
                    <div className="info-grid">
                        {/* Left Column: Narrative */}
                        <div>
                            {(aboutText || historyText) && (
                                <div style={{ marginBottom: "8mm" }}>
                                    <h3>About {destinationName}</h3>
                                    {aboutText && <p style={{ marginBottom: "8px" }}>{aboutText}</p>}
                                    {historyText && (
                                        <>
                                            <h3>History</h3>
                                            <p>{historyText}</p>
                                        </>
                                    )}
                                </div>
                            )}

                            {lodging && (
                                <div>
                                    <h3>🏨 Accommodation</h3>
                                    <div style={{
                                        background: "#f8fafc",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border: "1px solid #e2e8f0"
                                    }}>
                                        <div style={{ fontWeight: 600 }}>{lodging.name}</div>
                                        <div className="tiny muted">Check app for details</div>
                                    </div>
                                </div>
                            )}

                            {/* QR Code Section */}
                            {qrUrl && (
                                <div className="qr-section">
                                    <img src={qrUrl} alt="QR" style={{ width: '60px', height: '60px', borderRadius: '4px' }} />
                                    <div>
                                        <div className="qr-title">Live Map & Details</div>
                                        <div className="qr-text">Scan to view interactive map and updates.</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: KBYG & Sources */}
                        <div>
                            {kbyg && (
                                <div style={{ marginBottom: "8mm" }}>
                                    <h3>Know Before You Go</h3>
                                    <div className="kbyg-grid">
                                        {kbyg.currency && (
                                            <div className="kbyg-card">
                                                <span className="kbyg-icon">💱</span>
                                                <div>
                                                    <div className="tiny muted">Currency</div>
                                                    <div style={{ fontWeight: 600 }}>{kbyg.currency}</div>
                                                </div>
                                            </div>
                                        )}
                                        {!!kbyg.weather && (
                                            <div className="kbyg-card">
                                                <span className="kbyg-icon">🌤️</span>
                                                <div>
                                                    <div className="tiny muted">Weather</div>
                                                    <div
                                                        style={{ fontWeight: 600 }}>{typeof kbyg.weather === 'object' && (kbyg.weather as { summary?: string }).summary ? (kbyg.weather as { summary?: string }).summary : '—'}</div>
                                                </div>
                                            </div>
                                        )}
                                        {kbyg.plugs && (
                                            <div className="kbyg-card">
                                                <span className="kbyg-icon">🔌</span>
                                                <div>
                                                    <div className="tiny muted">Plugs</div>
                                                    <div style={{ fontWeight: 600 }}>{kbyg.plugs}</div>
                                                </div>
                                            </div>
                                        )}
                                        {kbyg.getting_around && (
                                            <div className="kbyg-card">
                                                <span className="kbyg-icon">🚌</span>
                                                <div>
                                                    <div className="tiny muted">Transport</div>
                                                    <div style={{
                                                        fontWeight: 600,
                                                        fontSize: 10
                                                    }}>{kbyg.getting_around.split(',')[0]}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Interests Chips */}
                            {interests.length > 0 && (
                                <div>
                                    <h3>Interests</h3>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {interests.map((i) => (
                                            <span key={i} style={{
                                                fontSize: "11px",
                                                background: "#f1f5f9",
                                                padding: "4px 8px",
                                                borderRadius: "6px",
                                                border: "1px solid #e2e8f0"
                                            }}>
                                                {emojiForInterest(i)} {i}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Itinerary Section --- */}
                <div className="container" style={{ marginTop: "0" }}>
                    <h2 style={{ marginBottom: '16px', borderBottom: 'none' }}>Detailed Itinerary</h2>

                    {days.map((day, idx) => {
                        const dayCost = sum(day.blocks, (b) => b.est_cost);
                        const specificDayNote = dayNotesMap[day.date]; // Check for day note

                        return (
                            <div key={idx} className="day-block">
                                <div className="day-header">
                                    <span className="day-title">Day {idx + 1} · {formatDate(day.date)}</span>
                                    <span
                                        className="day-meta">{day.blocks.length} Stops · Est. {money(dayCost, trip.currency)}</span>
                                </div>

                                {/* Render Day Note if Exists */}
                                {specificDayNote && (
                                    <div className="day-note">
                                        📝 <strong>Note:</strong> {specificDayNote}
                                    </div>
                                )}

                                <table className="timeline-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '15%' }}>Time</th>
                                            <th style={{ width: '40%' }}>Activity</th>
                                            <th style={{ width: '45%' }}>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {day.blocks.map(b => (
                                            <tr key={b.id || b.title}>
                                                <td>
                                                    <div className="event-time">{whenLabel(b.when)}</div>
                                                    <div style={{
                                                        fontSize: '10px',
                                                        color: '#94a3b8',
                                                        marginTop: 2
                                                    }}>{minutes(b.duration_min)}</div>
                                                </td>
                                                <td>
                                                    <div className="event-title">{b.title}</div>
                                                    {b.place_id && (
                                                        <div className="event-details"
                                                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <span>📍</span> {placeName(b.place_id)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="event-details">
                                                        {b.est_cost > 0 && <span>Cost: {money(b.est_cost, trip.currency)}</span>}
                                                        {b.travel_min_from_prev > 0 && <span
                                                            style={{ marginLeft: 8 }}>🚗 {minutes(b.travel_min_from_prev)} travel</span>}
                                                    </div>
                                                    {b.notes && <div className="event-notes">{b.notes}</div>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    })}

                    {/* --- Trip Notes Section (Corrected) --- */}
                    <div className="notes-area page-break">
                        <h3>Trip Notes</h3>

                        {/* If general trip note exists, render it */}
                        {tripGeneralNote ? (
                            <div className="notes-content">
                                {tripGeneralNote}
                            </div>
                        ) : null}

                        {/* Fallback lines for manual notes */}
                        <div className="notes-lines"></div>
                    </div>
                </div>
            </body>
        </html>
    );
}