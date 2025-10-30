// supabase/functions/build_preview_itinerary/index.ts
// Deno/Edge Function
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Input = {
    destinations: { name: string; country?: string; lat?: number; lng?: number }[];
    start_date: string; // YYYY-MM-DD
    end_date: string;   // YYYY-MM-DD
    budget_daily: number;
    currency?: string;  // e.g. 'USD'
    party?: { adults: number; children?: number };
    interests?: string[]; // ['food','culture',...]
    pace?: "chill" | "balanced" | "packed";
    mode?: "walk" | "bike" | "car" | "transit";
};

type Block = {
    when: "morning" | "afternoon" | "evening";
    place_id: string | null;
    title: string;
    est_cost: number;
    duration_min: number;
    travel_min_from_prev: number;
    notes?: string;
};

type Day = { date: string; blocks: Block[]; map_polyline?: string };

serve(async (req) => {
    // CORS
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            },
        });
    }

    try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
        const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: req.headers.get("Authorization")! } } });

        const input: Input = await req.json();
        // Basic validation
        if (!input.destinations?.length || !input.start_date || !input.end_date) {
            return json({ error: "destinations[], start_date, end_date required" }, 400);
        }

        // (Optional) naive IP rate-limit (very light)
        const ip = req.headers.get("x-forwarded-for") ?? "unknown";
        // TODO: store counts in KV/Rate-limit table if needed

        // Example: choose first destination as anchor
        const anchor = input.destinations[0];

        // Pull a few candidate places (you likely have places_in_bbox or similar).
        // Here’s a safe fallback query by interest category:
        const interest = input.interests?.[0] ?? "culture";
        const { data: places, error: pErr } = await client
            .from("itinero.places")
            .select("id,name,lat,lng,category")
            .eq("category", interest)
            .limit(20);

        if (pErr) throw pErr;

        // Build day skeletons between start and end
        const days: Day[] = buildDays(input.start_date, input.end_date).map((d) => ({
            date: d,
            blocks: [
                mkBlock("morning", places?.[0]?.id, places?.[0]?.name ?? "Explore old town"),
                mkBlock("afternoon", places?.[1]?.id, places?.[1]?.name ?? "Local market walk"),
                mkBlock("evening", places?.[2]?.id, places?.[2]?.name ?? "Dinner & nightlife"),
            ],
        }));

        // TODO: enhance with: is_open_for_slot(), slot_schedule(), build_legs_for_day(), fx_convert(), etc.

        const resp = {
            trip_summary: {
                total_days: days.length,
                est_total_cost: Math.round((input.budget_daily ?? 100) * days.length),
                currency: input.currency ?? "USD",
            },
            days,
            places: places ?? [],
        };

        return json(resp, 200);
    } catch (e) {
        console.error(e);
        return json({ error: String(e?.message ?? e) }, 500);
    }
});

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
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

function mkBlock(when: Block["when"], place_id?: string, title?: string): Block {
    return {
        when,
        place_id: place_id ?? null,
        title: title ?? "Free time",
        est_cost: 10,
        duration_min: 120,
        travel_min_from_prev: 15,
    };
}