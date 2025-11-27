/** @jsxImportSource https://esm.sh/preact */
import { h } from "https://esm.sh/preact";
// deno-lint-ignore-file no-explicit-any
import satori from "https://esm.sh/satori@0.10.13";
import { Resvg, initWasm } from "https://esm.sh/@resvg/resvg-wasm@2.6.2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

/* ========== resvg wasm ========== */
const RESVG_WASM_URL =
    "https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm";
const wasmBytes = new Uint8Array(await fetch(RESVG_WASM_URL).then((r) => r.arrayBuffer()));
await initWasm(wasmBytes);

/* ========== Fonts (Secrets → CDN TTF fallback) ========== */
function b64ToU8(b64: string): Uint8Array {
    const bin = atob(b64.replace(/\s+/g, ""));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

async function loadFontFromUrlsTTF(urls: string[]): Promise<Uint8Array | null> {
    const errs: string[] = [];
    for (const u of urls) {
        try {
            const res = await fetch(u, { redirect: "follow" });
            if (!res.ok) { errs.push(`${u} -> HTTP ${res.status}`); continue; }
            const ab = await res.arrayBuffer();
            return new Uint8Array(ab);
        } catch (e) {
            errs.push(`${u} -> ${String(e)}`);
        }
    }
    if (errs.length) console.warn("Font fetch failed:", errs);
    return null;
}

async function getInterFonts(): Promise<{ regular: Uint8Array | null; bold: Uint8Array | null }> {
    // 1) Secrets (preferred, no external fetch)
    const rB64 = Deno.env.get("FONT_INTER_TTF_B64");
    const bB64 = Deno.env.get("FONT_INTER_BOLD_TTF_B64");
    let regular: Uint8Array | null = rB64 ? b64ToU8(rB64) : null;
    let bold: Uint8Array | null = bB64 ? b64ToU8(bB64) : null;

    if (regular && bold) return { regular, bold };

    // 2) CDN TTF fallback (never WOFF/WOFF2)
    if (!regular) {
        regular = await loadFontFromUrlsTTF([
            "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/static/Inter-Regular.ttf",
            "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.17/files/inter-latin-400-normal.ttf",
        ]);
    }
    if (!bold) {
        bold = await loadFontFromUrlsTTF([
            "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/static/Inter-Bold.ttf",
            "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.17/files/inter-latin-700-normal.ttf",
        ]);
    }
    return { regular, bold };
}

const { regular: INTER_REGULAR, bold: INTER_BOLD } = await getInterFonts();

/* ========== Types ========== */
type Place = {
    id: string; name: string; lat?: number; lng?: number;
    category?: string | null; tags?: string[] | null; popularity?: number | null;
    cost_typical?: number | null; cost_currency?: string | null;
};

type Day = {
    date: string;
    blocks: Array<{
        when: "morning" | "afternoon" | "evening";
        place_id: string | null;
        title: string;
        est_cost: number;
        duration_min: number;
        travel_min_from_prev: number;
        notes?: string;
    }>;
    map_polyline?: string;
    lodging?: { name: string; lat: number; lng: number } | null;
    return_to_lodging_min?: number | null;
    est_day_cost?: number;
    budget_daily?: number;
};

type PreviewLike = {
    trip_summary: {
        total_days: number;
        est_total_cost: number;
        currency?: string;
        inputs?: any;
        start_date?: string;
        end_date?: string;
    };
    days: Day[];
    places: Place[];
};

/* ========== Layout sizes & tokens ========== */
const A4_PX = { width: 1240, height: 1754 };
const PDF_A4_PT = { width: 595.28, height: 841.89 };

const TOK = {
    s: 6, m: 10, l: 16, xl: 24, xxl: 36, pagePad: 48,
    ink: "#0f172a",
    inkMute: "#475569",
    line: "#e2e8f0",
    cardBorder: "#e5e7eb",
    accent: "#3b82f6",
    accentSoftA: "rgba(30,64,175,0.08)",
    accentSoftB: "rgba(59,130,246,0.12)",
    shadow: "0 2px 10px rgba(15,23,42,0.06)",
} as const;

const FONT_STACK = "AppSans, Helvetica, Arial, sans-serif";

/* ========== Helpers ========== */
function cors() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };
}

function fmtRange(start?: string, end?: string) {
    if (!start && !end) return "—";
    const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString(undefined, {
        day: "2-digit", month: "short", year: "numeric",
    });
    if (start && end) return `${fmt(start)} → ${fmt(end)}`;
    return fmt(start || end!);
}

function textWidthApprox(txt: string, size: number) {
    return txt.length * size * 0.55;
}

/** Replace characters unsupported by WinAnsi when we can'share embed Unicode TTF. */
function winAnsiSafe(s: string) {
    return s
        .replace(/\u2192/g, "->")   // →
        .replace(/\u2190/g, "<-")   // ←
        .replace(/\u2014/g, "--")   // —
        .replace(/\u2013/g, "-")    // –
        .replace(/\u2022/g, "*")    // •
        .replace(/\u2026/g, "...")  // …
        .replace(/\u00B0/g, " deg ")// °
        .replace(/\u00A0/g, " ")
        .replace(/\u2019/g, "'")
        .replace(/\u2018/g, "'")
        .replace(/\u201C/g, '"')
        .replace(/\u201D/g, '"')
        .replace(/[^\x00-\x7F]/g, "?");
}

/* ========== Satori → PNG path (preferred if a TTF is available) ========== */
async function jsxToPng(jsx: any, width = A4_PX.width, height = A4_PX.height) {
    if (!INTER_REGULAR) {
        throw new Error("NO_SATORI_FONT");
    }
    const fonts = [
        { name: "AppSans", data: INTER_REGULAR, weight: 400, style: "normal" as const },
        ...(INTER_BOLD ? [{ name: "AppSans", data: INTER_BOLD, weight: 700, style: "normal" as const }] : []),
    ];
    const svg = await satori(jsx, { width, height, fonts });
    const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width }, background: "white" });
    return resvg.render().asPng();
}

/* ========== UI (Satori JSX) ========== */

function Pill({ children }: { children: any }) {
    return (
        <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: TOK.s,
            padding: "8px 12px",
            borderRadius: 999,
            background: "#fff",
            boxShadow: "0 4px 18px rgba(30,58,138,0.12)",
            fontSize: 14,
            color: TOK.ink,
        }}>
            {children}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "flex-start",
            padding: "8px 12px", border: `1px solid ${TOK.cardBorder}`, borderRadius: 10,
            minWidth: 120,
        }}>
            <div style={{ fontSize: 11, color: TOK.inkMute }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{value}</div>
        </div>
    );
}

function Cover({ trip }: { trip: PreviewLike }) {
    const title = (trip.trip_summary?.inputs?.destinations?.[0]?.name as string) ?? "Your Trip";
    const date = fmtRange(trip.trip_summary.start_date, trip.trip_summary.end_date);
    const est = Math.round(trip.trip_summary.est_total_cost ?? 0);
    const currency = trip.trip_summary.currency ?? "USD";
    const days = trip.trip_summary.total_days;

    return (
        <div style={{
            width: A4_PX.width, height: A4_PX.height, background: "#ffffff",
            color: TOK.ink, fontFamily: FONT_STACK, position: "relative",
            display: "flex", flexDirection: "column",
        }}>
            {/* Brand bar */}
            <div style={{
                height: 120,
                background: `linear-gradient(135deg, ${TOK.accentSoftA}, ${TOK.accentSoftB})`,
                borderBottom: `1px solid ${TOK.line}`,
            }} />

            {/* Body */}
            <div style={{ flex: 1, padding: TOK.pagePad, display: "flex", flexDirection: "column", gap: TOK.xl, marginTop: -60 }}>
                <div>
                    <div style={{ fontSize: 14, color: TOK.inkMute, marginBottom: TOK.s }}>Itinero — Smart Itinerary</div>
                    <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
                    <div style={{ fontSize: 18, color: TOK.inkMute, marginTop: TOK.s }}>{date}</div>
                </div>

                {/* Summary strip */}
                <div style={{ display: "flex", gap: TOK.l, flexWrap: "wrap" }}>
                    <Pill>Est. Total: <b>{currency} {est}</b></Pill>
                    <Pill>Duration: <b>{days} days</b></Pill>
                    {trip.trip_summary?.inputs?.partySize && (
                        <Pill>Travellers: <b>{String(trip.trip_summary.inputs.partySize)}</b></Pill>
                    )}
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: TOK.l, marginTop: TOK.l }}>
                    <Stat label="Currency" value={currency} />
                    <Stat label="Days" value={String(days)} />
                    {trip.places?.length ? <Stat label="Places" value={String(trip.places.length)} /> : null}
                </div>

                <div style={{ marginTop: "auto", fontSize: 12, color: TOK.inkMute, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Generated by Itinero</span>
                    <span>Share • Print • Offline</span>
                </div>
            </div>
        </div>
    );
}

function BudgetBar({ value, max }: { value: number; max?: number }) {
    const cap = Math.max(1, max ?? value);
    const pct = Math.min(100, Math.round((value / cap) * 100));
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 12, color: TOK.inkMute }}>Budget usage</div>
            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: TOK.accent }} />
            </div>
            <div style={{ fontSize: 12, color: TOK.inkMute }}>{pct}% of daily budget</div>
        </div>
    );
}

function MetricPill({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 10px", borderRadius: 999,
            border: `1px solid ${TOK.cardBorder}`, fontSize: 12
        }}>
            <span style={{ color: TOK.inkMute }}>{label}:</span>
            <b>{value}</b>
        </div>
    );
}

function DayPage(
    { day, index, allPlaces }: { day: Day; index: number; allPlaces: Map<string, Place> },
) {
    const dayCost = Math.max(0, Math.round(day.blocks.reduce((a, b) => a + (Number(b.est_cost) || 0), 0)));

    return (
        <div style={{
            width: A4_PX.width, height: A4_PX.height, background: "#ffffff",
            padding: TOK.pagePad, display: "grid", gridTemplateColumns: "16px 1fr", gap: TOK.l,
            color: TOK.ink, fontFamily: FONT_STACK,
        }}>
            {/* Timeline spine */}
            <div style={{ width: 16, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 2, background: TOK.line, borderRadius: 2 }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: TOK.l }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `1px solid ${TOK.line}`, paddingBottom: TOK.s }}>
                    <div>
                        <div style={{ fontSize: 12, color: TOK.inkMute }}>Day {index + 1}</div>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>
                            {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
                                weekday: "short", day: "2-digit", month: "short", year: "numeric",
                            })}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: TOK.s }}>
                        <MetricPill label="Est. day cost" value={`$${dayCost}`} />
                        {typeof day.budget_daily === "number" && (
                            <MetricPill label="Budget" value={`$${day.budget_daily}`} />
                        )}
                    </div>
                </div>

                {/* Blocks */}
                <div style={{ display: "flex", flexDirection: "column", gap: TOK.m }}>
                    {day.blocks.map((b, i) => {
                        const place = b.place_id ? allPlaces.get(b.place_id) : undefined;
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: TOK.l }}>
                                {/* Dot on timeline */}
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <div style={{
                                        width: 10, height: 10, borderRadius: 999,
                                        background: "#fff", border: `2px solid ${TOK.accent}`, marginTop: 8
                                    }} />
                                </div>

                                <div style={{
                                    border: `1px solid ${TOK.cardBorder}`, borderRadius: 12, padding: TOK.l,
                                    boxShadow: TOK.shadow, display: "grid",
                                    gridTemplateColumns: "1fr 260px", gap: TOK.l,
                                }}>
                                    <div>
                                        <div style={{
                                            fontSize: 10, letterSpacing: 0.6, color: TOK.inkMute,
                                            textTransform: "uppercase"
                                        }}>{b.when}</div>

                                        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{b.title}</div>

                                        {b.notes && <div style={{ marginTop: 6, fontSize: 13, color: TOK.inkMute }}>{b.notes}</div>}

                                        {place && (
                                            <div style={{ marginTop: 8, fontSize: 13 }}>
                                                <b>{place.name}</b>{place.category ? ` • ${place.category}` : ""}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: TOK.s, alignItems: "flex-end", justifyContent: "flex-end", flexWrap: "wrap" }}>
                                        <MetricPill label="Cost" value={`$${b.est_cost ?? 0}`} />
                                        <MetricPill label="Duration" value={`${b.duration_min ?? 0}m`} />
                                        <MetricPill label="Travel" value={`${b.travel_min_from_prev ?? 0}m`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Lodging + budget bar */}
                <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: "1fr 240px", gap: TOK.l, alignItems: "end" }}>
                    <div style={{ fontSize: 12, color: TOK.inkMute }}>
                        {day.lodging && (
                            <>
                                Base: <b style={{ color: TOK.ink }}>{day.lodging.name}</b>
                                {typeof day.return_to_lodging_min === "number" ? ` • Return ~ ${day.return_to_lodging_min}m` : ""}
                            </>
                        )}
                    </div>
                    {typeof day.budget_daily === "number" && (
                        <BudgetBar value={dayCost} max={day.budget_daily} />
                    )}
                </div>
            </div>
        </div>
    );
}

/* ========== Vector fallback drawing helpers (pdf-lib only) ========== */

function drawRoundedRect(page: any, x: number, y: number, w: number, h: number, color = rgb(1,1,1), stroke?: { w: number; color: any }) {
    page.drawRectangle({ x, y, width: w, height: h, color, borderWidth: stroke?.w ?? 0, borderColor: stroke?.color });
}
function drawTextLine(page: any, text: string, x: number, y: number, size: number, font: any, color = rgb(0.06,0.09,0.16)) {
    page.drawText(text, { x, y, size, font, color });
}

function drawCoverVector(page: any, pdfFonts: { regular: any; bold: any }, trip: PreviewLike, sanitize: (s: string) => string) {
    const W = PDF_A4_PT.width;
    const H = PDF_A4_PT.height;
    const pad = TOK.pagePad;

    // Brand bar
    drawRoundedRect(page, 0, H - 120, W, 120, rgb(0.98, 0.99, 1));
    page.drawLine({ start: { x: 0, y: H - 120 }, end: { x: W, y: H - 120 }, thickness: 0.5, color: rgb(0.88,0.91,0.95) });

    const rawTitle = (trip.trip_summary?.inputs?.destinations?.[0]?.name as string) ?? "Your Trip";
    const rawDate = fmtRange(trip.trip_summary.start_date, trip.trip_summary.end_date);
    const est = Math.round(trip.trip_summary.est_total_cost ?? 0);
    const currency = trip.trip_summary.currency ?? "USD";
    const days = trip.trip_summary.total_days;

    const title = sanitize(rawTitle);
    const date = sanitize(rawDate);

    drawTextLine(page, sanitize("Itinero — Smart Itinerary"), pad, H - 120 - 18, 12, pdfFonts.regular, rgb(0.3,0.35,0.45));
    drawTextLine(page, title, pad, H - 120 - 18 - 28, 24, pdfFonts.bold, rgb(0.06,0.09,0.16));
    drawTextLine(page, date, pad, H - 120 - 18 - 28 - 16, 11, pdfFonts.regular, rgb(0.2,0.25,0.35));

    const pillText = sanitize(`Est. Total: ${currency} ${est}   Duration: ${days} days`);
    const pillW = textWidthApprox(pillText, 10) + 24;
    const pillY = H - 120 - 18 - 28 - 16 - 26;
    drawRoundedRect(page, pad, pillY, pillW, 20, rgb(1,1,1), { w: 0.8, color: rgb(0.9,0.92,0.95) });
    page.drawText(pillText, { x: pad + 12, y: pillY + 5, size: 10, font: pdfFonts.regular, color: rgb(0.06,0.09,0.16) });

    // (Footer text drawn by caller)
}

function drawDayPageVector(page: any, pdfFonts: { regular: any; bold: any }, day: Day, index: number, placesMap: Map<string, Place>, sanitize: (s: string) => string) {
    const W = PDF_A4_PT.width;
    const H = PDF_A4_PT.height;
    const pad = TOK.pagePad;

    // Header
    const dateStr = sanitize(new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "short", day: "2-digit", month: "short", year: "numeric",
    }));
    drawTextLine(page, sanitize(`Day ${index + 1}`), pad, H - pad - 8, 10, pdfFonts.regular, rgb(0.35,0.4,0.5));
    drawTextLine(page, dateStr, pad, H - pad - 8 - 16, 14, pdfFonts.bold, rgb(0.06,0.09,0.16));
    // FIXED: include end.y explicitly
    page.drawLine({
        start: { x: pad, y: H - pad - 8 - 22 },
        end:   { x: W - pad, y: H - pad - 8 - 22 },
        thickness: 0.5,
        color: rgb(0.88,0.91,0.95),
    });

    const dayCost = Math.max(0, Math.round(day.blocks.reduce((a, b) => a + (Number(b.est_cost) || 0), 0)));
    const costTxt = sanitize(`Est. day cost: $${dayCost}`);
    const costW = textWidthApprox(costTxt, 10);
    drawTextLine(page, costTxt, W - pad - costW, H - pad - 8 - 16, 10, pdfFonts.regular, rgb(0.3,0.35,0.45));

    // Timeline spine
    page.drawRectangle({ x: pad - 16 + 7, y: pad + 40, width: 2, height: H - pad - 8 - 22 - 40 - pad, color: rgb(0.88,0.91,0.95) });

    // Blocks
    let y = H - pad - 8 - 22 - 14;
    for (const b of day.blocks) {
        y -= 76;
        if (y < pad + 64) break;

        // Dot
        page.drawCircle({ x: pad - 16 + 8, y: y + 52, size: 4, color: rgb(1,1,1), borderWidth: 2, borderColor: rgb(0.23,0.51,0.96) });

        // Card
        drawRoundedRect(page, pad, y, W - 2 * pad, 64, rgb(1,1,1), { w: 0.8, color: rgb(0.9,0.92,0.95) });

        // Left column
        const leftX = pad + 12;
        drawTextLine(page, sanitize((b.when || "").toUpperCase()), leftX, y + 64 - 16, 9, pdfFonts.regular, rgb(0.35,0.4,0.5));
        drawTextLine(page, sanitize(b.title || ""), leftX, y + 64 - 16 - 14, 12, pdfFonts.bold, rgb(0.06,0.09,0.16));
        if (b.notes) drawTextLine(page, sanitize(b.notes), leftX, y + 64 - 16 - 14 - 14, 10, pdfFonts.regular, rgb(0.2,0.25,0.35));

        const place = b.place_id ? placesMap.get(b.place_id) : undefined;
        if (place) {
            const meta = sanitize(`${place.name}${place.category ? ` • ${place.category}` : ""}`);
            drawTextLine(page, meta, leftX, y + 12, 10, pdfFonts.regular, rgb(0.2,0.25,0.35));
        }

        // Right metrics
        const rightW = 220;
        const rightX = W - pad - rightW - 12;
        const cellW = (rightW - 16) / 3;
        const baseY = y + 12;

        function metric(label: string, value: string, col: number) {
            const cx = rightX + col * (cellW + 8);
            drawRoundedRect(page, cx, baseY, cellW, 38, rgb(1,1,1), { w: 0.8, color: rgb(0.9,0.92,0.95) });
            drawTextLine(page, sanitize(label), cx + 8, baseY + 24, 9, pdfFonts.regular, rgb(0.35,0.4,0.5));
            drawTextLine(page, sanitize(value), cx + 8, baseY + 10, 10.5, pdfFonts.bold, rgb(0.06,0.09,0.16));
        }

        metric("Est. cost", `$${b.est_cost ?? 0}`, 0);
        metric("Duration", `${b.duration_min ?? 0}m`, 1);
        metric("Travel", `${b.travel_min_from_prev ?? 0}m`, 2);
    }

    if (day.lodging) {
        const foot = sanitize(`Base: ${day.lodging.name}${typeof day.return_to_lodging_min === "number" ? ` • Return ~ ${day.return_to_lodging_min}m` : ""}`);
        drawTextLine(page, foot, pad, pad + 10, 10, pdfFonts.regular, rgb(0.35,0.4,0.5));
    }
}

/* ========== DB loader ========== */
async function loadTripFromDb(tripId: string): Promise<PreviewLike> {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRole) {
        throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const sb = createClient(supabaseUrl, serviceRole, {
        auth: { persistSession: false },
        global: { headers: { "X-Client-Info": "export-itinerary-pdf" } },
    });

    const { data: tripRow, error: tripErr } = await sb
        .schema("itinero")
        .from("trips")
        .select("id, user_id, title, start_date, end_date, est_total_cost, currency, inputs")
        .eq("id", tripId)
        .single();

    if (tripErr || !tripRow) throw new Error("Trip not found");

    const { data: items, error: itemsErr } = await sb
        .schema("itinero")
        .from("itinerary_items")
        .select("day_index, date, order_index, when, place_id, title, est_cost, duration_min, travel_min_from_prev, notes")
        .eq("trip_id", tripId)
        .order("day_index", { ascending: true })
        .order("order_index", { ascending: true });

    if (itemsErr) throw itemsErr;

    const daysMap = new Map<number, Day>();
    for (const it of (items ?? [])) {
        const dIdx = Number(it.day_index ?? 0);
        if (!daysMap.has(dIdx)) {
            daysMap.set(dIdx, {
                date: (it.date as string) ?? (tripRow.start_date as string) ?? "",
                blocks: [],
            });
        }
        daysMap.get(dIdx)!.blocks.push({
            when: it.when, place_id: it.place_id, title: it.title,
            est_cost: Number(it.est_cost) || 0, duration_min: Number(it.duration_min) || 0,
            travel_min_from_prev: Number(it.travel_min_from_prev) || 0, notes: it.notes ?? undefined,
        });
    }

    const days: Day[] = Array.from(daysMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([_, d]) => d);

    let places: Place[] = [];
    const placeIds = Array.from(new Set((items ?? []).map((it) => it.place_id).filter(Boolean) as string[]));
    if (placeIds.length) {
        const { data: placeRows, error: placesErr } = await sb
            .schema("itinero")
            .from("places")
            .select("id, name, lat, lng, category, tags, popularity, cost_typical, cost_currency")
            .in("id", placeIds);
        if (placesErr) throw placesErr;
        places = (placeRows ?? []) as Place[];
    }

    return {
        trip_summary: {
            total_days: Math.max(1, days.length),
            est_total_cost: Number(tripRow.est_total_cost) || 0,
            currency: tripRow.currency ?? "USD",
            inputs: tripRow.inputs,
            start_date: tripRow.start_date ?? undefined,
            end_date: tripRow.end_date ?? undefined,
        },
        days,
        places,
    };
}

/* ========== HTTP handler + probe ========== */
Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors() });

    try {
        const url = new URL(req.url);

        // Probe: verify DB + fonts status
        if (url.searchParams.get("probe") === "1") {
            const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "(unset)";
            const srv = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ? "(set)" : "(unset)";
            const id = decodeURIComponent((url.searchParams.get("trip_id") || "").trim());
            const sb = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
            const q = await sb.schema("itinero").from("trips").select("id, title").eq("id", id);
            return new Response(JSON.stringify({
                project: supabaseUrl,
                serviceRoleKey: srv,
                idRaw: url.searchParams.get("trip_id"),
                idDecodedTrimmed: id,
                found: q.data?.length ?? 0,
                rows: q.data ?? [],
                error: q.error?.message ?? null,
                fonts: { interRegular: !!INTER_REGULAR, interBold: !!INTER_BOLD },
            }, null, 2), { status: 200, headers: { "Content-Type": "application/json", ...cors() }});
        }

        const tripId = url.searchParams.get("trip_id");
        let trip: PreviewLike | null = null;

        if (tripId) {
            trip = await loadTripFromDb(tripId);
        } else if (req.method === "POST") {
            trip = (await req.json()) as PreviewLike;
        } else {
            return new Response(JSON.stringify({ error: "Provide ?trip_id=... or POST a PreviewLike body" }),
                { status: 400, headers: { ...cors(), "Content-Type": "application/json" }});
        }

        // Build a places map
        const placesMap = new Map<string, Place>();
        for (const p of trip.places || []) placesMap.set(p.id, p);

        // Try Satori path first (needs TTF)
        let pdf: PDFDocument | null = null;

        try {
            const images: Uint8Array[] = [];
            images.push(await jsxToPng(<Cover trip={trip} />));
            for (let i = 0; i < (trip.days?.length || 0); i++) {
                images.push(await jsxToPng(<DayPage day={trip.days[i]} index={i} allPlaces={placesMap} />));
            }

            const totalPages = images.length;
            pdf = await PDFDocument.create();
            const footerFont = await pdf.embedFont(StandardFonts.Helvetica);

            for (let idx = 0; idx < images.length; idx++) {
                const img = images[idx];
                const pngEmbed = await pdf.embedPng(img);
                const page = pdf.addPage([PDF_A4_PT.width, PDF_A4_PT.height]);
                const { width, height } = pngEmbed.scaleToFit(PDF_A4_PT.width, PDF_A4_PT.height);
                page.drawImage(pngEmbed, {
                    x: (PDF_A4_PT.width - width) / 2,
                    y: (PDF_A4_PT.height - height) / 2,
                    width, height,
                });
                const n = idx + 1;
                const footer = `Itinero — Page ${n} of ${totalPages}`;
                page.drawText(footer, { x: 24, y: 18, size: 8, font: footerFont, color: rgb(0.35, 0.4, 0.5) });
            }
        } catch (e) {
            // Satori failure → vector fallback (pdf-lib only, sanitized for WinAnsi)
            const isNoFont = String(e?.message || e) === "NO_SATORI_FONT" ||
                String(e?.message || e).includes("No fonts loaded");
            console.warn("[Export] Falling back to vector PDF mode.", isNoFont ? "(reason: no satori font)" : "", e);

            pdf = await PDFDocument.create();
            const regular = await pdf.embedFont(StandardFonts.Helvetica);
            const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
            const sanitize = winAnsiSafe;

            const totalPages = 1 + (trip.days?.length || 0);
            let pageIndex = 0;

            // Cover
            {
                const page = pdf.addPage([PDF_A4_PT.width, PDF_A4_PT.height]);
                drawCoverVector(page, { regular, bold }, trip, sanitize);
                pageIndex++;
                const footer = sanitize(`Itinero — Page ${pageIndex} of ${totalPages}`);
                page.drawText(footer, { x: 24, y: 18, size: 8, font: regular, color: rgb(0.35, 0.4, 0.5) });
            }
            // Days
            for (let i = 0; i < (trip.days?.length || 0); i++) {
                const page = pdf.addPage([PDF_A4_PT.width, PDF_A4_PT.height]);
                drawDayPageVector(page, { regular, bold }, trip.days[i], i, placesMap, sanitize);
                pageIndex++;
                const footer = sanitize(`Itinero — Page ${pageIndex} of ${totalPages}`);
                page.drawText(footer, { x: 24, y: 18, size: 8, font: regular, color: rgb(0.35, 0.4, 0.5) });
            }
        }

        const bytes = await pdf!.save();
        const filenameBase = (trip.trip_summary?.inputs?.destinations?.[0]?.name as string) ?? "itinerary";
        const filename = `${filenameBase.replace(/\s+/g, "-").toLowerCase()}.pdf`;

        return new Response(bytes, {
            status: 200,
            headers: {
                ...cors(),
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
            status: 500, headers: { ...cors(), "Content-Type": "application/json" },
        });
    }
});