// supabase/functions/build_preview_itinerary/index.ts
// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeModeClient } from "./normalizeModeClient.ts";

/** ---------------- Types ---------------- */
type Lodging = { name: string; lat: number; lng: number; address?: string };
type Input = {
    destinations: { id?: string; name: string; country?: string; lat?: number; lng?: number }[];
    start_date: string;
    end_date: string;
    budget_daily: number;
    currency?: string;
    party?: { adults: number; children?: number };
    interests?: string[];
    pace?: "chill" | "balanced" | "packed";
    mode?: "walk" | "bike" | "car" | "transit";
    lodging?: Lodging;
    lodging_by_date?: Record<string, Lodging>;
    soft_distance?: { anchor_km?: number; hop_km?: number };
};
type Alternative = {
    id: string | null;
    name: string;
    lat: number | null;
    lng: number | null;
    category?: string | null;
    tags?: string[] | null;
    est_cost: number;
    hint?: { hop_km?: number; score?: number };
};
type Block = {
    when: "morning" | "afternoon" | "evening";
    place_id: string | null;
    title: string;
    est_cost: number;
    duration_min: number;
    travel_min_from_prev: number;
    notes?: string;
    alternatives?: Alternative[];
};
type Day =
    & { date: string; blocks: Block[]; map_polyline?: string }
    & {
    lodging?: { name: string; lat: number; lng: number } | null;
    return_to_lodging_min?: number | null;
    est_day_cost?: number;
    budget_daily?: number;
};

/** ---------------- Server ---------------- */
serve(async (req) => {
    if (req.method === "OPTIONS") return cors();
    try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
        const auth = req.headers.get("Authorization") ?? "";

        const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            db: { schema: "itinero" },
            global: { headers: { Authorization: auth } },
        });

        const input = (await req.json()) as Input;
        if (!input?.destinations?.length) return j({ error: "destinations[] is required" }, 400);
        if (!input.start_date || !input.end_date) return j({ error: "start_date and end_date are required" }, 400);

        const interests = (input.interests ?? []).map((s) => s.trim().toLowerCase()).filter(Boolean);
        const pace = input.pace ?? "balanced";
        const mode = normalizeModeClient(input.mode ?? "walking");

        // anchor
        const destAnchor = input.destinations[0];
        const hasDestCoords = typeof destAnchor.lat === "number" && typeof destAnchor.lng === "number";

        // ⚡ transport speed once
        const { data: speedRow } = await client
            .from("transport_speeds")
            .select("km_per_hour")
            .eq("mode", mode)
            .maybeSingle();
        const kmph = Number(speedRow?.km_per_hour ?? 4.5);

        // budget + distance prefs once
        const dailyBudget = Number.isFinite(input.budget_daily) ? input.budget_daily : 100;
        const slotBudgetShare = { morning: 0.35, afternoon: 0.35, evening: 0.30 } as const;
        const softAnchorKm = input.soft_distance?.anchor_km ?? 12;
        const hopPrefKm = input.soft_distance?.hop_km ?? (pace === "chill" ? 12 : pace === "packed" ? 18 : 15);

        // ⚡ day list once
        const dayDates = buildDays(input.start_date, input.end_date);
        const days: Day[] = dayDates.map((date) => ({ date, blocks: [] }));
        const rotatedInterests = days.map((_, i) => (interests.length ? interests[i % interests.length] : null));

        // Lodging accessor (no allocations in loop)
        const lodgingFor = (date: string): Lodging | null => {
            if (input.lodging_by_date?.[date]) return input.lodging_by_date[date];
            if (input.lodging && isNum(input.lodging.lat) && isNum(input.lodging.lng)) return input.lodging;
            return null;
        };

        // ⚡ Candidate pool (smaller & pre-filtered by bbox if we have coords)
        // Keep limit modest; we only need ~60–120 good candidates for greedy picking
        const delta = 0.35;
        const bbox = hasDestCoords
            ? {
                latMin: destAnchor.lat! - delta,
                latMax: destAnchor.lat! + delta,
                lngMin: destAnchor.lng! - delta,
                lngMax: destAnchor.lng! + delta,
            }
            : null;

        let q = client
            .from("places")
            .select("id,name,lat,lng,category,tags,popularity,cost_typical,cost_currency");

        if (bbox) {
            q = q
                .gte("lat", bbox.latMin).lte("lat", bbox.latMax)
                .gte("lng", bbox.lngMin).lte("lng", bbox.lngMax);
        }

        // ⚡ smaller pool
        const { data: places, error: pErr } = await q.order("popularity", { ascending: false }).limit(120);
        if (pErr) throw pErr;
        const pool = places ?? [];

        // ⚡ Opening hours map once
        const ids = pool.map((p) => p.id);
        const { data: hours } = ids.length
            ? await client.from("place_hours").select("place_id,dow,open_min,close_min").in("place_id", ids)
            : { data: [] as any[] };

        const hoursByPlace: Record<string, { [dow: number]: { open: number; close: number } }> = {};
        for (const r of (hours ?? [])) {
            (hoursByPlace[r.place_id] ??= {})[Number(r.dow)] = {
                open: Number(r.open_min),
                close: Number(r.close_min),
            };
        }

        // ⚡ global chosen set prevents repeats
        const chosen = new Set<string>();

        for (let di = 0; di < days.length; di++) {
            const date = days[di].date;
            const dow = new Date(date + "T00:00:00").getDay();
            const interestOfDay = rotatedInterests[di];

            const L = lodgingFor(date);
            const hasLodge = !!L;
            const anchorLat = hasLodge ? L!.lat : (hasDestCoords ? destAnchor.lat! : null);
            const anchorLng = hasLodge ? L!.lng : (hasDestCoords ? destAnchor.lng! : null);

            const targetBySlot = {
                morning: dailyBudget * slotBudgetShare.morning,
                afternoon: dailyBudget * slotBudgetShare.afternoon,
                evening: dailyBudget * slotBudgetShare.evening,
            } as const;

            // ⚡ One pass base score (no string allocations inside tight spots)
            const baseScored = pool.map((p) => {
                const tags: string[] = Array.isArray(p.tags) ? p.tags.map((t: any) => String(t).toLowerCase()) : [];
                const cat = (p.category ?? "").toLowerCase();
                const pop = isNum(p.popularity) ? Number(p.popularity) : 50;
                const cost = isNum(p.cost_typical) ? Number(p.cost_typical) : 10;

                let interestScore = 0;
                if (interestOfDay) {
                    if (cat === interestOfDay) interestScore += 1.2;
                    if (tags.includes(interestOfDay)) interestScore += 1.0;
                }

                let distKm = 6;
                if (anchorLat != null && anchorLng != null && isNum(p.lat) && isNum(p.lng)) {
                    distKm = haversineKm(anchorLat, anchorLng, p.lat, p.lng);
                }
                const prox = Math.max(0, 1 - Math.min(distKm, 25) / 25);
                const openBonus = isOpenForSlot(hoursByPlace[p.id], dow, "morning") ? 0.4 : 0;
                const farPenalty = Math.max(0, (distKm - softAnchorKm) / 20);
                const base = interestScore + prox * 0.9 + (pop / 100) * 0.5 + openBonus - 0.3 * farPenalty;

                return { ...p, _base: base, _cost: cost };
            });

            const picks: any[] = [];
            let last: any = hasLodge ? { lat: L!.lat, lng: L!.lng, id: null, name: L!.name } : null;
            const ALT_K = 4;
            const perSlotAlts: Alternative[][] = [];

            // ⚡ per-slot: just walk the pre-scored list once, keep top via small buffer
            for (const slot of ["morning", "afternoon", "evening"] as const) {
                const target = targetBySlot[slot];

                // small top buffer, no full sort
                let best: any | null = null;
                const altBuf: any[] = [];

                for (const p of baseScored) {
                    if (chosen.has(p.id)) continue;

                    const hopKmFromLast = last ? hopKm(last, p) : 0;
                    const priceDelta = Math.abs((p._cost ?? 10) - target);
                    const pricePenalty = Math.min(1, priceDelta / Math.max(10, target || 10));
                    const hopPenalty = Math.max(0, (hopKmFromLast - hopPrefKm) / (2 * hopPrefKm));

                    // no jitter → deterministic
                    const score = p._base - 0.6 * pricePenalty - 0.3 * hopPenalty;

                    const cand = { ...p, _slotScore: score, _hopKm: hopKmFromLast };
                    if (!best || cand._slotScore > best._slotScore) {
                        if (best) altBuf.push(best);
                        best = cand;
                    } else if (altBuf.length < ALT_K - 1) {
                        altBuf.push(cand);
                    }
                    if (best && altBuf.length >= ALT_K - 1) {
                        // good enough; bail early to avoid scanning everything every time
                        // (you can tune this; keeping it simple)
                    }
                }

                const pick = best ?? null;
                const alts: Alternative[] = (altBuf.sort((a, b) => b._slotScore - a._slotScore).slice(0, ALT_K - 1)).map((c) => ({
                    id: c.id ?? null,
                    name: c.name ?? "Alternative",
                    lat: isNum(c.lat) ? c.lat : null,
                    lng: isNum(c.lng) ? c.lng : null,
                    category: c.category ?? null,
                    tags: Array.isArray(c.tags) ? c.tags : null,
                    est_cost: isNum(c._cost) ? Number(c._cost) : 10,
                    hint: {
                        hop_km: isNum(c._hopKm) ? Math.round(c._hopKm * 10) / 10 : undefined,
                        score: isNum(c._slotScore) ? Math.round(c._slotScore * 100) / 100 : undefined,
                    },
                }));

                perSlotAlts.push(alts);
                picks.push(pick);
                if (pick) {
                    chosen.add(pick.id);
                    last = pick;
                }
            }

            // === Routing (optional, time-boxed) ===
            const waypoints = picks.filter(Boolean).map((p: any) => ({ id: p.id ?? null, name: p.name, lat: p.lat, lng: p.lng }));
            let orderedPicks = [...picks];
            let legsDurMin: number[] | null = null;
            let polyline: string | undefined;

            if (waypoints.length >= 2 && (anchorLat != null && anchorLng != null || (L && L.lat && L.lng))) {
                const routingPayload = {
                    mode: mode === "walk" ? "walk" : mode === "bike" ? "bike" : "car" as "walk" | "bike" | "car",
                    start: L
                        ? { id: null, name: L.name, lat: L.lat, lng: L.lng }
                        : { id: null, name: "Anchor", lat: anchorLat!, lng: anchorLng! },
                    waypoints,
                    roundtrip: true,
                };

                const res = await withTimeout(fetch(`${SUPABASE_URL}/functions/v1/build_legs_for_day`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": auth,
                        "apikey": SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify(routingPayload),
                }), 1800); // ⚡ 1.8s budget

                if (res?.ok) {
                    const legsResp = await res.json();
                    const orderIds = (legsResp?.ordered_points ?? [])
                        .filter((pt: any) => pt.type === "waypoint")
                        .map((pt: any) => pt.id ?? null);

                    const pickById = new Map<string, any>();
                    for (const p of picks) if (p?.id) pickById.set(p.id, p);

                    const newOrder: any[] = [];
                    for (const id of orderIds) {
                        const found = id ? pickById.get(id) : null;
                        if (found) newOrder.push(found);
                    }
                    if (newOrder.length === waypoints.length) {
                        while (newOrder.length < 3) newOrder.push(null);
                        orderedPicks = newOrder;
                    }

                    if (Array.isArray(legsResp?.legs)) {
                        legsDurMin = legsResp.legs.map((l: any) => Math.max(1, Math.round((l?.duration_s ?? 0) / 60)));
                    }
                    polyline = legsResp?.polyline6 ?? legsResp?.polyline;
                }
            }

            // ---- Build blocks (dedupe alts within day) ----
            const usedPrimaryIds = new Set<string>(orderedPicks.filter((p: any) => p?.id).map((p: any) => p.id));
            const dayAltUsed = new Set<string>();
            const blocks: Block[] = [];
            let dayCost = 0;

            for (let bi = 0; bi < 3; bi++) {
                const slot = (["morning", "afternoon", "evening"] as const)[bi];
                const p = orderedPicks[bi];

                let travelMin = 15;
                if (legsDurMin && isNum(legsDurMin[bi])) {
                    travelMin = legsDurMin[bi]!;
                } else if (hasLodge) {
                    if (bi === 0 && p) travelMin = Math.round((hopKm(L!, p) / kmph) * 60);
                    else if (bi > 0 && p && orderedPicks[bi - 1]) travelMin = Math.round((hopKm(orderedPicks[bi - 1], p) / kmph) * 60);
                } else if (bi > 0 && p && orderedPicks[bi - 1]) {
                    travelMin = Math.round((hopKm(orderedPicks[bi - 1], p) / kmph) * 60);
                }

                const estCost = isNum(p?._cost) ? Number(p._cost) : 10;
                dayCost += estCost;

                const rawAlts = perSlotAlts[bi] ?? [];
                const alts = rawAlts
                    .filter(a =>
                        a?.id &&
                        !usedPrimaryIds.has(a.id) &&
                        !chosen.has(a.id) &&
                        !dayAltUsed.has(a.id)
                    )
                    .slice(0, 3);

                for (const a of alts) dayAltUsed.add(a.id!);

                blocks.push({
                    when: slot,
                    place_id: p?.id ?? null,
                    title: p?.name ?? (slot === "morning" ? "Explore" : slot === "afternoon" ? "Local walk" : "Dinner"),
                    est_cost: estCost,
                    duration_min: pace === "packed" ? 150 : pace === "chill" ? 90 : 120,
                    travel_min_from_prev: travelMin,
                    notes: p?.category ? `Category: ${p.category}` : undefined,
                    alternatives: alts,
                });
            }

            let returnMin: number | null = null;
            if (hasLodge) {
                const lastPick = orderedPicks.filter(Boolean).at(-1);
                if (lastPick) returnMin = Math.round((hopKm(lastPick, L!) / kmph) * 60);
            }

            days[di].blocks = blocks;
            days[di].lodging = hasLodge ? { name: L!.name, lat: L!.lat, lng: L!.lng } : null;
            days[di].return_to_lodging_min = returnMin;
            days[di].est_day_cost = Math.round(dayCost);
            days[di].budget_daily = dailyBudget;
            if (polyline) days[di].map_polyline = polyline;
        }

        const estTripCost = days.reduce((acc, d: any) => acc + (d.est_day_cost ?? dailyBudget), 0);

        return j({
            trip_summary: {
                total_days: days.length,
                est_total_cost: Math.round(estTripCost),
                currency: input.currency ?? "USD",
                start_date: input.start_date,
                end_date: input.end_date,
                primary_destination_id: destAnchor?.id ?? null,
                inputs: {
                    destinations: input.destinations.map((d) => ({
                        id: d.id ?? null,
                        name: d.name,
                        lat: d.lat,
                        lng: d.lng,
                        country: d.country ?? null,
                    })),
                    interests,
                    pace,
                    mode,
                    lodging: input.lodging ?? null,
                    lodging_by_date: input.lodging_by_date ?? null,
                    soft_distance: input.soft_distance ?? null,
                },
            },
            days,
            // Keep if your UI uses it; otherwise you can drop for smaller payloads
            places: (pool ?? []).map(({ id, name, lat, lng, category, tags, popularity, cost_typical, cost_currency }) => ({
                id, name, lat, lng, category, tags, popularity, cost_typical, cost_currency,
            })),
        });
    } catch (e) {
        console.error(e);
        return j({ error: String(e?.message ?? e) }, 500);
    }
});

/** ---------------- helpers ---------------- */
function cors() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
    });
}
function j(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
}
function buildDays(start: string, end: string): string[] {
    const out: string[] = [];
    const s = new Date(start + "T00:00:00");
    const e = new Date(end + "T00:00:00");
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) out.push(d.toISOString().slice(0, 10));
    return out;
}
function isNum(v: any): v is number {
    return typeof v === "number" && Number.isFinite(v);
}
function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
    const R = 6371, toRad = (x: number) => x * Math.PI / 180;
    const dLat = toRad(bLat - aLat), dLon = toRad(bLng - aLng);
    const v = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(v));
}
function hopKm(a: any, b: any) {
    if (!a || !b || a.lat == null || b.lat == null) return 3;
    return haversineKm(a.lat, a.lng, b.lat, b.lng);
}
function isOpenForSlot(
    hours: Record<number, { open: number; close: number }> | undefined,
    dow: number,
    when: "morning" | "afternoon" | "evening",
) {
    if (!hours) return false;
    const slotMin = when === "morning" ? 9 * 60 : when === "afternoon" ? 14 * 60 : 19 * 60;
    const h = hours[dow];
    return !!h && slotMin >= h.open && slotMin <= h.close;
}
async function withTimeout<T>(p: Promise<T>, ms = 1800): Promise<T | null> {
    return await Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);
}