/** @jsxImportSource https://esm.sh/preact */
import { h } from "https://esm.sh/preact";
// deno-lint-ignore-file no-explicit-any
import satori from "https://esm.sh/satori@0.10.13";
import { Resvg, initWasm } from "https://esm.sh/@resvg/resvg-wasm@2.6.2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import fontkit from "https://esm.sh/fontkit@2.0.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

/* ========== resvg wasm ========== */
const RESVG_WASM_URL =
    "https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm";
const wasmBytes = new Uint8Array(await fetch(RESVG_WASM_URL).then((r) => r.arrayBuffer()));
await initWasm(wasmBytes);

/* ========== Font loading (Secrets → CDN TTF fallback) ========== */
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

/* ========== Layout sizes ========== */
const A4_PX = { width: 1240, height: 1754 };
const PDF_A4_PT = { width: 595.28, height: 841.89 };

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
    // rough width approximation for pdf-lib vector mode (Helvetica/TTF)
    return txt.length * size * 0.55;
}

/** Replace characters unsupported by WinAnsi when we can't embed Unicode TTF. */
function winAnsiSafe(s: string) {
    return s
        .replace(/\u2192/g, "->")   // →
        .replace(/\u2019/g, "'")    // ’
        .replace(/\u2018/g, "'")    // ‘
        .replace(/\u201C/g, '"')    // “
        .replace(/\u201D/g, '"')    // ”
        .replace(/\u00A0/g, " ");   // nbsp
}

/* ========== Satori → PNG path (preferred if a TTF is available) ========== */
async function jsxToPng(jsx: any, width = A4_PX.width, height = A4_PX.height) {
    // Satori needs at least one TTF.
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
function Cover({ trip }: { trip: PreviewLike }) {
    const title = (trip.trip_summary?.inputs?.destinations?.[0]?.name as string) ?? "Your Trip";
    const date = fmtRange(trip.trip_summary.start_date, trip.trip_summary.end_date);
    const est = trip.trip_summary.est_total_cost ?? 0;
    const currency = trip.trip_summary.currency ?? "USD";

    return (
        <div style={{
            width: A4_PX.width, height: A4_PX.height,
            background: "linear-gradient(135deg, rgba(30,64,175,0.08), rgba(59,130,246,0.12))",
            padding: 64, display: "flex", flexDirection: "column", justifyContent: "space-between",
            color: "#0f172a", fontFamily: "AppSans, Helvetica, Arial, sans-serif",
        }}>
            <div style={{ fontSize: 14, opacity: 0.7 }}>Itinero — Smart Itinerary</div>

            <div>
                <div style={{ fontSize: 18, opacity: 0.7, marginBottom: 12 }}>Trip to</div>
                <div style={{ fontSize: 56, fontWeight: 700 }}>{title}</div>
                <div style={{ fontSize: 20, marginTop: 8 }}>{date}</div>

                <div style={{
                    marginTop: 24, display: "inline-flex", gap: 12, alignItems: "center",
                    padding: "10px 14px", borderRadius: 999, background: "white",
                    boxShadow: "0 4px 18px rgba(30,58,138,0.12)", fontSize: 16,
                }}>
                    <span style={{ opacity: 0.6 }}>Est. total:</span>
                    <span style={{ fontWeight: 600 }}>{currency} {Math.round(est)}</span>
                    <span style={{ opacity: 0.5 }}>• {trip.trip_summary.total_days} days</span>
                </div>
            </div>

            <div style={{ fontSize: 12, opacity: 0.7, display: "flex", justifyContent: "space-between" }}>
                <span>Generated by Itinero</span>
                <span>Share • Print • Offline</span>
            </div>
        </div>
    );
}

function DayPage(
    { day, index, allPlaces }: { day: Day; index: number; allPlaces: Map<string, Place> },
) {
    const dayCost = Math.max(0, Math.round(day.blocks.reduce((a, b) => a + (Number(b.est_cost) || 0), 0)));
    const metricBox = { border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", textAlign: "center", fontSize: 12 };
    const metricLabel = { opacity: 0.6 };
    const metricValue = { fontWeight: 600 } as const;

    return (
        <div style={{
            width: A4_PX.width, height: A4_PX.height, background: "#ffffff", padding: 48,
            display: "flex", flexDirection: "column", gap: 16, color: "#0f172a",
            fontFamily: "AppSans, Helvetica, Arial, sans-serif",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
                <div>
                    <div style={{ fontSize: 12, opacity: 0.6 }}>Day {index + 1}</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
                            weekday: "short", day: "2-digit", month: "short", year: "numeric",
                        })}
                    </div>
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Est. day cost: <b>${dayCost}</b></div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {day.blocks.map((b, i) => {
                    const place = b.place_id ? allPlaces.get(b.place_id) : undefined;
                    return (
                        <div key={i} style={{
                            border: "1px solid #e5e7eb", borderRadius: 12, padding: 16,
                            boxShadow: "0 2px 10px rgba(15,23,42,0.06)", display: "grid",
                            gridTemplateColumns: "1fr 240px", gap: 10,
                        }}>
                            <div>
                                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, opacity: 0.6 }}>{b.when}</div>
                                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{b.title}</div>
                                {b.notes && <div style={{ marginTop: 4, fontSize: 13, opacity: 0.7 }}>{b.notes}</div>}
                                {place && (
                                    <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                                        <b>{place.name}</b>{place.category ? ` • ${place.category}` : ""}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, alignSelf: "end" }}>
                                <div style={metricBox}><div style={metricLabel}>Est. cost</div><div style={metricValue}>${b.est_cost ?? 0}</div></div>
                                <div style={metricBox}><div style={metricLabel}>Duration</div><div style={metricValue}>{b.duration_min ?? 0}m</div></div>
                                <div style={metricBox}><div style={metricLabel}>Travel</div><div style={metricValue}>{b.travel_min_from_prev ?? 0}m</div></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {day.lodging && (
                <div style={{ marginTop: "auto", fontSize: 12, opacity: 0.7 }}>
                    Base: <b>{day.lodging.name}</b>
                    {typeof day.return_to_lodging_min === "number" ? ` • Return ~ ${day.return_to_lodging_min}m` : ""}
                </div>
            )}
        </div>
    );
}

/* ========== PDF-only fallback renderers (no Satori fonts needed) ========== */

function drawRoundedRect(page: any, x: number, y: number, w: number, h: number, r = 8, color = rgb(1,1,1), stroke?: { w: number; color: any }) {
    page.drawRectangle({ x, y, width: w, height: h, color, borderWidth: stroke?.w ?? 0, borderColor: stroke?.color });
}

function drawTextLine(page: any, text: string, x: number, y: number, size: number, font: any, color = rgb(0.06,0.09,0.16)) {
    page.drawText(text, { x, y, size, font, color });
}

function drawCoverVector(
    page: any,
    pdfFonts: { regular: any; bold: any },
    trip: PreviewLike,
    sanitize: (s: string) => string
) {
    const W = PDF_A4_PT.width;
    const H = PDF_A4_PT.height;

    // background
    drawRoundedRect(page, 0, 0, W, H, 0, rgb(1,1,1));
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.98, 0.99, 1) });

    const pad = 48;
    const rawTitle = (trip.trip_summary?.inputs?.destinations?.[0]?.name as string) ?? "Your Trip";
    const rawDate = fmtRange(trip.trip_summary.start_date, trip.trip_summary.end_date);
    const est = trip.trip_summary.est_total_cost ?? 0;
    const currency = trip.trip_summary.currency ?? "USD";

    const title = sanitize(rawTitle);
    const date = sanitize(rawDate);

    // header
    drawTextLine(page, sanitize("Itinero — Smart Itinerary"), pad, H - pad - 14, 12, pdfFonts.regular, rgb(0.1,0.15,0.3));

    // main title
    drawTextLine(page, sanitize("Trip to"), pad, H - pad - 60, 14, pdfFonts.regular, rgb(0.1,0.15,0.3));
    drawTextLine(page, title, pad, H - pad - 60 - 26, 28, pdfFonts.bold, rgb(0.06,0.09,0.16));
    drawTextLine(page, date, pad, H - pad - 60 - 26 - 20, 12, pdfFonts.regular, rgb(0.06,0.09,0.16));

    // pill
    const pillText = sanitize(`Est. total: ${currency} ${Math.round(est)}  •  ${trip.trip_summary.total_days} days`);
    const pillSize = 11;
    const pillWidth = textWidthApprox(pillText, pillSize) + 24;
    const pillX = pad;
    const pillY = H - pad - 60 - 26 - 20 - 32;
    drawRoundedRect(page, pillX, pillY, pillWidth, 22, 999, rgb(1,1,1));
    page.drawText(pillText, { x: pillX + 12, y: pillY + 6, size: pillSize, font: pdfFonts.regular, color: rgb(0.06,0.09,0.16) });

    // footer
    const footerY = pad;
    drawTextLine(page, sanitize("Generated by Itinero"), pad, footerY, 10, pdfFonts.regular, rgb(0.3,0.35,0.45));
    const right = sanitize("Share • Print • Offline");
    const rightW = textWidthApprox(right, 10);
    drawTextLine(page, right, W - pad - rightW, footerY, 10, pdfFonts.regular, rgb(0.3,0.35,0.45));
}

function drawDayPageVector(
    page: any,
    pdfFonts: { regular: any; bold: any },
    day: Day,
    index: number,
    placesMap: Map<string, Place>,
    sanitize: (s: string) => string
) {
    const W = PDF_A4_PT.width;
    const H = PDF_A4_PT.height;
    const pad = 36;

    // header with date + cost
    const dateStr = sanitize(new Date(day.date + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "short", day: "2-digit", month: "short", year: "numeric",
    }));
    drawTextLine(page, sanitize(`Day ${index + 1}`), pad, H - pad - 8, 10, pdfFonts.regular, rgb(0.35,0.4,0.5));
    drawTextLine(page, dateStr, pad, H - pad - 8 - 16, 14, pdfFonts.bold, rgb(0.06,0.09,0.16));
    page.drawLine({ start: { x: pad, y: H - pad - 8 - 22 }, end: { x: W - pad, y: H - pad - 8 - 22 }, thickness: 0.5, color: rgb(0.88,0.91,0.95) });

    const dayCost = Math.max(0, Math.round(day.blocks.reduce((a, b) => a + (Number(b.est_cost) || 0), 0)));
    const costTxt = sanitize(`Est. day cost: $${dayCost}`);
    const costW = textWidthApprox(costTxt, 10);
    drawTextLine(page, costTxt, W - pad - costW, H - pad - 8 - 16, 10, pdfFonts.regular, rgb(0.3,0.35,0.45));

    // blocks
    let y = H - pad - 8 - 22 - 14;
    for (const b of day.blocks) {
        y -= 76;
        if (y < pad + 48) break; // simple overflow guard

        // card
        drawRoundedRect(page, pad, y, W - 2 * pad, 64, 12, rgb(1,1,1), { w: 0.8, color: rgb(0.9,0.92,0.95) });

        // left column
        const leftX = pad + 12;
        drawTextLine(page, sanitize((b.when || "").toUpperCase()), leftX, y + 64 - 16, 9, pdfFonts.regular, rgb(0.35,0.4,0.5));
        drawTextLine(page, sanitize(b.title || ""), leftX, y + 64 - 16 - 14, 12, pdfFonts.bold, rgb(0.06,0.09,0.16));
        if (b.notes) drawTextLine(page, sanitize(b.notes), leftX, y + 64 - 16 - 14 - 14, 10, pdfFonts.regular, rgb(0.2,0.25,0.35));

        const place = b.place_id ? placesMap.get(b.place_id) : undefined;
        if (place) {
            const meta = sanitize(`${place.name}${place.category ? ` • ${place.category}` : ""}`);
            drawTextLine(page, meta, leftX, y + 12, 10, pdfFonts.regular, rgb(0.2,0.25,0.35));
        }

        // right metrics grid (3 cols)
        const rightW = 220;
        const rightX = W - pad - rightW - 12;
        const cellW = (rightW - 16) / 3;
        const baseY = y + 12;

        function metric(label: string, value: string, col: number) {
            const cx = rightX + col * (cellW + 8);
            drawRoundedRect(page, cx, baseY, cellW, 38, 8, rgb(1,1,1), { w: 0.8, color: rgb(0.9,0.92,0.95) });
            drawTextLine(page, sanitize(label), cx + 8, baseY + 24, 9, pdfFonts.regular, rgb(0.35,0.4,0.5));
            drawTextLine(page, sanitize(value), cx + 8, baseY + 10, 10.5, pdfFonts.bold, rgb(0.06,0.09,0.16));
        }

        metric("Est. cost", `$${b.est_cost ?? 0}`, 0);
        metric("Duration", `${b.duration_min ?? 0}m`, 1);
        metric("Travel", `${b.travel_min_from_prev ?? 0}m`, 2);
    }

    if (day.lodging) {
        const foot = sanitize(`Base: ${day.lodging.name}${typeof day.return_to_lodging_min === "number" ? ` • Return ~ ${day.return_to_lodging_min}m` : ""}`);
        drawTextLine(page, foot, pad, pad, 10, pdfFonts.regular, rgb(0.35,0.4,0.5));
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

            pdf = await PDFDocument.create();
            // Footer uses ASCII text only; StandardFonts are safe here.
            const font = await pdf.embedFont(StandardFonts.Helvetica);

            for (const img of images) {
                const pngEmbed = await pdf.embedPng(img);
                const page = pdf.addPage([PDF_A4_PT.width, PDF_A4_PT.height]);
                const { width, height } = pngEmbed.scaleToFit(PDF_A4_PT.width, PDF_A4_PT.height);
                page.drawImage(pngEmbed, {
                    x: (PDF_A4_PT.width - width) / 2,
                    y: (PDF_A4_PT.height - height) / 2,
                    width, height,
                });
                page.drawText("Itinero", { x: 24, y: 18, size: 8, font, color: rgb(0.35, 0.4, 0.5) });
            }
        } catch (e) {
            // If it's the missing-font case or any satori failure, switch to vector PDF mode.
            const isNoFont = String(e?.message || e) === "NO_SATORI_FONT" ||
                String(e?.message || e).includes("No fonts loaded");
            console.warn("[Export] Falling back to vector PDF mode.", isNoFont ? "(reason: no satori font)" : "", e);

            // Vector mode (pdf-lib only)
            pdf = await PDFDocument.create();
            pdf.registerFontkit(fontkit);

            // Prefer Unicode TTF (Inter) if we have it; else fall back to StandardFonts with sanitizer.
            let regular, bold, isUnicode = false;

            if (INTER_REGULAR) {
                regular = await pdf.embedFont(INTER_REGULAR, { subset: true });
                bold = INTER_BOLD ? await pdf.embedFont(INTER_BOLD, { subset: true }) : regular;
                isUnicode = true;
            } else {
                regular = await pdf.embedFont(StandardFonts.Helvetica);
                bold = await pdf.embedFont(StandardFonts.HelveticaBold);
                isUnicode = false;
            }

            const sanitize = (s: string) => (isUnicode ? s : winAnsiSafe(s));

            // Cover
            {
                const page = pdf.addPage([PDF_A4_PT.width, PDF_A4_PT.height]);
                drawCoverVector(page, { regular, bold }, trip, sanitize);
                page.drawText(sanitize("Itinero"), { x: 24, y: 18, size: 8, font: regular, color: rgb(0.35, 0.4, 0.5) });
            }
            // Days
            for (let i = 0; i < (trip.days?.length || 0); i++) {
                const page = pdf.addPage([PDF_A4_PT.width, PDF_A4_PT.height]);
                drawDayPageVector(page, { regular, bold }, trip.days[i], i, placesMap, sanitize);
                page.drawText(sanitize("Itinero"), { x: 24, y: 18, size: 8, font: regular, color: rgb(0.35, 0.4, 0.5) });
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