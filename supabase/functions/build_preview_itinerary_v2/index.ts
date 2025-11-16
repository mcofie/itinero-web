// supabase/functions/build_preview_itinerary_v2/index.ts
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
    budget_daily: number; // per-person
    currency?: string;
    party?: { adults: number; children?: number };
    interests?: string[];
    pace?: "chill" | "balanced" | "packed";
    mode?: "walk" | "bike" | "car" | "transit";
    lodging?: Lodging;
    lodging_by_date?: Record<string, Lodging>;
    soft_distance?: { anchor_km?: number; hop_km?: number };
    debug?: boolean;
    avoid_tags?: string[];
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
    est_cost: number; // in user’s currency
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
    est_day_cost?: number;       // in user’s currency
    budget_daily?: number;       // user’s total per-day budget
    budget_status?: "under" | "balanced" | "over";
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

        const targetCurrency = (input.currency || "USD").toUpperCase();

        const userInterests = (input.interests ?? [])
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);

        const avoidTags = (input.avoid_tags ?? [])
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);

        const pace = input.pace ?? "balanced";
        const mode = normalizeModeClient(input.mode ?? "walking");

        // Party size & budget
        const adults = input.party?.adults ?? 1;
        const children = input.party?.children ?? 0;
        const partySize = Math.max(1, adults + children);
        const budgetPerPerson = Number.isFinite(input.budget_daily) ? input.budget_daily : 100;
        const dailyBudgetTotal = budgetPerPerson * partySize;

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

        // budget + distance prefs
        const slotBudgetShare = { morning: 0.35, afternoon: 0.35, evening: 0.30 } as const;
        const softAnchorKm = input.soft_distance?.anchor_km ?? 12;
        const hopPrefKm = input.soft_distance?.hop_km ?? (pace === "chill" ? 12 : pace === "packed" ? 18 : 15);

        // ⚡ day list once
        const dayDates = buildDays(input.start_date, input.end_date);
        const days: Day[] = dayDates.map((date) => ({ date, blocks: [] }));

        // Slot themes to bias interests
        const slotThemes: Record<Block["when"], string[]> = {
            morning: ["coffee", "culture", "outdoors", "park", "viewpoint"],
            afternoon: ["museum", "shopping", "food", "market"],
            evening: ["nightlife", "bar", "music", "dining"],
        };

        const pickSlotInterest = (slot: Block["when"]): string | null => {
            if (!userInterests.length) return null;
            const themes = slotThemes[slot];
            const found = userInterests.find((i) => themes.some((t) => i.includes(t) || t.includes(i)));
            return found ?? userInterests[0];
        };

        // Lodging accessor
        const lodgingFor = (date: string): Lodging | null => {
            if (input.lodging_by_date?.[date]) return input.lodging_by_date[date];
            if (input.lodging && isNum(input.lodging.lat) && isNum(input.lodging.lng)) return input.lodging;
            return null;
        };

        // ⚡ Candidate pool w/ bbox
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
            .select("id,name,lat,lng,category,tags,popularity,cost_typical,cost_currency,description");

        if (bbox) {
            q = q
                .gte("lat", bbox.latMin).lte("lat", bbox.latMax)
                .gte("lng", bbox.lngMin).lte("lng", bbox.lngMax);
        }

        const { data: places, error: pErr } = await q.order("popularity", { ascending: false }).limit(120);
        if (pErr) throw pErr;
        const pool = places ?? [];

        // ⚡ FX map: place currency -> rate to targetCurrency
        const fxMap: Record<string, number> = {};
        {
            const allCurrencies = new Set<string>();
            for (const p of pool) {
                if (typeof p.cost_currency === "string") {
                    allCurrencies.add(p.cost_currency.toUpperCase());
                }
            }
            allCurrencies.delete(targetCurrency);

            if (allCurrencies.size > 0) {
                const { data: fxRows, error: fxErr } = await client
                    .from("fx_rates")
                    .select("base_currency,quote_currency,rate")
                    .eq("quote_currency", targetCurrency)
                    .in("base_currency", [...allCurrencies]);
                if (fxErr) {
                    console.error("FX lookup error:", fxErr);
                } else {
                    for (const r of fxRows ?? []) {
                        const base = (r.base_currency || "").toUpperCase();
                        const rate = Number(r.rate);
                        if (base && isNum(rate)) fxMap[base] = rate;
                    }
                }
            }
        }

        const convertToTarget = (amount: number, fromCurrency?: string | null): number => {
            if (!isNum(amount)) return 0;
            const cur = (fromCurrency || targetCurrency).toUpperCase();
            if (cur === targetCurrency) return amount;
            const rate = fxMap[cur];
            if (isNum(rate)) return amount * rate;
            // fallback: assume 1:1 if we have no rate
            return amount;
        };

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

        // ⚡ Base precomputation
        const baseScored = pool.map((p) => {
            const tagsLower: string[] = Array.isArray(p.tags)
                ? p.tags.map((t: any) => String(t).toLowerCase())
                : [];
            const catLower = (p.category ?? "").toLowerCase();
            const pop = isNum(p.popularity) ? Number(p.popularity) : 50;

            const nativeCost = isNum(p.cost_typical) ? Number(p.cost_typical) : 10;
            const nativeCurrency = typeof p.cost_currency === "string" ? p.cost_currency.toUpperCase() : targetCurrency;
            const convertedCost = convertToTarget(nativeCost, nativeCurrency);

            let distKm = 6;
            let prox = 0.5;

            if (hasDestCoords && isNum(p.lat) && isNum(p.lng)) {
                distKm = haversineKm(destAnchor.lat!, destAnchor.lng!, p.lat, p.lng);
                prox = Math.max(0, 1 - Math.min(distKm, 25) / 25);
            }

            const farPenalty = Math.max(0, (distKm - softAnchorKm) / 20);
            const base = prox * 0.9 + (pop / 100) * 0.5 - 0.3 * farPenalty;

            return {
                ...p,
                _base: base,
                _cost_native: nativeCost,
                _cost_currency: nativeCurrency,
                _cost_converted: convertedCost,
                _tagsLower: tagsLower,
                _catLower: catLower,
                _distKm: distKm,
            };
        });

        // ⚡ global chosen set prevents repeats
        const chosen = new Set<string>();
        const debugDays: any[] = [];

        for (let di = 0; di < days.length; di++) {
            const date = days[di].date;
            const dow = new Date(date + "T00:00:00").getDay();
            const L = lodgingFor(date);
            const hasLodge = !!L;

            const anchorLat = hasLodge ? L!.lat : (hasDestCoords ? destAnchor.lat! : null);
            const anchorLng = hasLodge ? L!.lng : (hasDestCoords ? destAnchor.lng! : null);

            const targetBySlot = {
                morning: dailyBudgetTotal * slotBudgetShare.morning,
                afternoon: dailyBudgetTotal * slotBudgetShare.afternoon,
                evening: dailyBudgetTotal * slotBudgetShare.evening,
            } as const;

            const perSlotAlts: Alternative[][] = [];
            const picks: any[] = [];
            const slotDebug: any[] = [];
            let last: any = hasLodge ? { lat: L!.lat, lng: L!.lng, id: null, name: L!.name } : null;
            const catCount: Record<string, number> = {};

            for (const slot of ["morning", "afternoon", "evening"] as const) {
                const target = targetBySlot[slot];
                const slotInterest = pickSlotInterest(slot);

                let best: any | null = null;
                const altBuf: any[] = [];
                const ALT_K = 4;

                for (const p of baseScored) {
                    if (chosen.has(p.id)) continue;

                    // Opening hours per slot
                    const isOpen = isOpenForSlot(hoursByPlace[p.id], dow, slot);
                    if (!isOpen) continue;

                    // Negative interests / avoid tags
                    const hasAvoid = avoidTags.some((a) =>
                        p._catLower.includes(a) || p._tagsLower.some((t: string) => t.includes(a))
                    );
                    if (hasAvoid) continue;

                    let interestScore = 0;
                    if (slotInterest) {
                        if (p._catLower.includes(slotInterest)) interestScore += 1.2;
                        if (p._tagsLower.includes(slotInterest)) interestScore += 1.0;
                    }

                    // Category diversity
                    const catKey = p._catLower || "other";
                    const usedCount = catCount[catKey] ?? 0;
                    const catPenalty = usedCount === 0 ? 0 : usedCount === 1 ? 0.25 : 0.6;

                    const hopKmFromLast = last ? hopKm(last, p) : 0;
                    const priceDelta = Math.abs((p._cost_converted ?? 10) - target);
                    const pricePenalty = Math.min(1, priceDelta / Math.max(10, target || 10));
                    const hopPenalty = Math.max(0, (hopKmFromLast - hopPrefKm) / (2 * hopPrefKm));

                    const openBonus = 0.4;

                    const score =
                        p._base +
                        interestScore +
                        openBonus -
                        0.6 * pricePenalty -
                        0.3 * hopPenalty -
                        catPenalty;

                    const cand = { ...p, _slotScore: score, _hopKm: hopKmFromLast, _slot: slot };

                    if (!best || cand._slotScore > best._slotScore) {
                        if (best) altBuf.push(best);
                        best = cand;
                    } else if (altBuf.length < ALT_K - 1) {
                        altBuf.push(cand);
                    }
                }

                const pick = best ?? null;
                const alts: Alternative[] = (altBuf
                    .sort((a, b) => b._slotScore - a._slotScore)
                    .slice(0, ALT_K - 1)).map((c) => ({
                    id: c.id ?? null,
                    name: c.name ?? "Alternative",
                    lat: isNum(c.lat) ? c.lat : null,
                    lng: isNum(c.lng) ? c.lng : null,
                    category: c.category ?? null,
                    tags: Array.isArray(c.tags) ? c.tags : null,
                    est_cost: isNum(c._cost_converted) ? Number(c._cost_converted) : 10,
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
                    const cKey = pick._catLower || "other";
                    catCount[cKey] = (catCount[cKey] ?? 0) + 1;
                }

                if (input.debug) {
                    slotDebug.push({
                        slot,
                        chosen_id: pick?.id ?? null,
                        chosen_name: pick?.name ?? null,
                        chosen_score: pick?._slotScore ?? null,
                        chosen_cost_converted: pick?._cost_converted ?? null,
                        budget_target_slot: target,
                    });
                }
            }

            // === Routing (RPC with fallback) ===
            const waypoints = picks.filter(Boolean).map((p: any) => ({
                id: p.id ?? null,
                name: p.name,
                lat: p.lat,
                lng: p.lng,
            }));

            let orderedPicks = [...picks];
            let legsDurMin: number[] | null = null;
            let polyline: string | undefined;

            const anchorStart = L
                ? { id: null, name: L.name, lat: L.lat, lng: L.lng }
                : (anchorLat != null && anchorLng != null
                    ? { id: null, name: "Anchor", lat: anchorLat, lng: anchorLng }
                    : null);

            if (waypoints.length >= 2 && anchorStart) {
                const routingPayload = {
                    mode: mode === "walk" ? "walk" : mode === "bike" ? "bike" : "car" as "walk" | "bike" | "car",
                    start: anchorStart,
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
                }), 1800);

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
                        legsDurMin = legsResp.legs.map((l: any) =>
                            Math.max(1, Math.round((l?.duration_s ?? 0) / 60))
                        );
                    }
                    polyline = legsResp?.polyline6 ?? legsResp?.polyline;
                } else {
                    // 🔁 Fallback: nearest-neighbour route + approximate legs + synthetic polyline
                    const nn = nearestNeighbourRoute(anchorStart, waypoints);
                    orderedPicks = ["morning", "afternoon", "evening"].map((slot, idx) => {
                        const id = nn[idx]?.id;
                        return id ? picks.find((p: any) => p?.id === id) ?? null : null;
                    });
                    legsDurMin = computeLegsDurFromOrder(orderedPicks, anchorStart, kmph);

                    // Build a simple roundtrip polyline from anchor -> waypoints -> anchor
                    const polyPoints = [
                        { lat: anchorStart.lat, lng: anchorStart.lng },
                        ...nn
                            .filter((w) => isNum(w.lat) && isNum(w.lng))
                            .map((w) => ({ lat: w.lat, lng: w.lng })),
                        { lat: anchorStart.lat, lng: anchorStart.lng },
                    ];
                    if (polyPoints.length >= 2) {
                        polyline = encodePolyline(polyPoints);
                    }
                }
            }

            // ---- Build blocks ----
            const usedPrimaryIds = new Set<string>(
                orderedPicks.filter((p: any) => p?.id).map((p: any) => p.id)
            );
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
                    else if (bi > 0 && p && orderedPicks[bi - 1]) {
                        travelMin = Math.round((hopKm(orderedPicks[bi - 1], p) / kmph) * 60);
                    }
                } else if (bi > 0 && p && orderedPicks[bi - 1]) {
                    travelMin = Math.round((hopKm(orderedPicks[bi - 1], p) / kmph) * 60);
                }

                const estCost = isNum(p?._cost_converted) ? Number(p._cost_converted) : 10;
                dayCost += estCost;

                const rawAlts = perSlotAlts[bi] ?? [];
                const alts = rawAlts
                    .filter((a) =>
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
                    title: p?.name ?? (slot === "morning"
                        ? "Explore"
                        : slot === "afternoon"
                            ? "Local walk"
                            : "Dinner"),
                    est_cost: estCost, // already in targetCurrency
                    duration_min: pace === "packed" ? 150 : pace === "chill" ? 90 : 120,
                    travel_min_from_prev: travelMin,
                    notes: p?.description ? p.description : undefined,
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
            days[di].budget_daily = dailyBudgetTotal;

            const ratio = dayCost / Math.max(1, dailyBudgetTotal);
            days[di].budget_status =
                ratio > 1.2 ? "over" :
                    ratio < 0.6 ? "under" :
                        "balanced";

            if (polyline) days[di].map_polyline = polyline;

            if (input.debug) {
                debugDays.push({
                    date,
                    day_cost: dayCost,
                    budget_daily_total: dailyBudgetTotal,
                    budget_status: days[di].budget_status,
                    slots: slotDebug,
                });
            }
        }

        const estTripCost = days.reduce(
            (acc, d: any) => acc + (d.est_day_cost ?? dailyBudgetTotal),
            0,
        );

        const response: any = {
            trip_summary: {
                total_days: days.length,
                est_total_cost: Math.round(estTripCost),
                currency: targetCurrency,
                start_date: input.start_date,
                end_date: input.end_date,
                primary_destination_id: destAnchor?.id ?? null,
                budget_daily_per_person: budgetPerPerson,
                budget_daily_total: dailyBudgetTotal,
                party_size: partySize,
                inputs: {
                    destinations: input.destinations.map((d) => ({
                        id: d.id ?? null,
                        name: d.name,
                        lat: d.lat,
                        lng: d.lng,
                        country: d.country ?? null,
                    })),
                    interests: userInterests,
                    avoid_tags: avoidTags,
                    pace,
                    mode,
                    lodging: input.lodging ?? null,
                    lodging_by_date: input.lodging_by_date ?? null,
                    soft_distance: input.soft_distance ?? null,
                },
            },
            days,
            places: (pool ?? []).map(
                ({ id, name, lat, lng, category, tags, popularity, cost_typical, cost_currency, description }) => ({
                    id,
                    name,
                    lat,
                    lng,
                    category,
                    tags,
                    popularity,
                    cost_typical,
                    cost_currency,
                    description,
                }),
            ),
        };

        if (input.debug) {
            response.debug = {
                fx_used: fxMap,
                days: debugDays,
            };
        }

        return j(response);
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
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        out.push(d.toISOString().slice(0, 10));
    }
    return out;
}

function isNum(v: any): v is number {
    return typeof v === "number" && Number.isFinite(v);
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
    const R = 6371,
        toRad = (x: number) => x * Math.PI / 180;
    const dLat = toRad(bLat - aLat),
        dLon = toRad(bLng - aLng);
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

function nearestNeighbourRoute(
    start: { lat: number; lng: number },
    waypoints: { id: string | null; name: string; lat: number; lng: number }[],
) {
    const remaining = [...waypoints];
    const ordered: typeof waypoints = [];
    let current = start;

    while (remaining.length) {
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let i = 0; i < remaining.length; i++) {
            const wp = remaining[i];
            const d = haversineKm(current.lat, current.lng, wp.lat, wp.lng);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        }
        const [picked] = remaining.splice(bestIdx, 1);
        ordered.push(picked);
        current = picked;
    }

    return ordered;
}

function computeLegsDurFromOrder(
    orderedPicks: any[],
    start: { lat: number; lng: number },
    kmph: number,
): number[] {
    const legs: number[] = [];
    let prev = start;
    for (const p of orderedPicks) {
        if (!p || !isNum(p.lat) || !isNum(p.lng)) {
            legs.push(15);
            continue;
        }
        const d = haversineKm(prev.lat, prev.lng, p.lat, p.lng);
        const mins = Math.max(1, Math.round((d / Math.max(1e-3, kmph)) * 60));
        legs.push(mins);
        prev = p;
    }
    return legs;
}

async function withTimeout<T>(p: Promise<T>, ms = 1800): Promise<T | null> {
    return await Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);
}

/**
 * Encode an array of {lat,lng} into a Google-style polyline string.
 * Simple implementation suitable for Edge functions (no external deps).
 */
function encodePolyline(points: { lat: number; lng: number }[]): string {
    let lastLat = 0;
    let lastLng = 0;
    let result = "";

    for (const pt of points) {
        const lat = Math.round(pt.lat * 1e5);
        const lng = Math.round(pt.lng * 1e5);

        const dLat = lat - lastLat;
        const dLng = lng - lastLng;

        result += encodeSigned(dLat);
        result += encodeSigned(dLng);

        lastLat = lat;
        lastLng = lng;
    }

    return result;
}

function encodeSigned(num: number): string {
    let s = num << 1;
    if (num < 0) s = ~s;
    return encodeUnsigned(s);
}

function encodeUnsigned(num: number): string {
    let result = "";
    while (num >= 0x20) {
        result += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
        num >>= 5;
    }
    result += String.fromCharCode(num + 63);
    return result;
}