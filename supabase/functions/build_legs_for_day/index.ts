// supabase/functions/build_legs_for_day/index.ts
import { serve } from "https://deno.land/std/http/server.ts";

type Point = { id: string | null; name?: string; lat: number; lng: number };
type Input = {
    mode: "walk" | "bike" | "car";   // map to mapbox profile
    start: Point;                    // lodging (or anchor)
    waypoints: Point[];              // selected POIs (1..N)
    end?: Point | null;              // if omitted => roundtrip to start
    roundtrip?: boolean;             // default true (return to start)
};

const PROFILE_MAP = { walk: "walking", bike: "cycling", car: "driving" } as const;

serve(async (req) => {
    if (req.method === "OPTIONS") return cors();
    try {
        const token = Deno.env.get("MAPBOX_TOKEN");
        if (!token) return j({ error: "Missing MAPBOX_TOKEN" }, 500);

        const input = (await req.json()) as Input;
        const profile = PROFILE_MAP[input.mode] ?? "walking";
        const roundtrip = input.roundtrip ?? true;

        // Build coordinates list & annotations
        // Order: start + waypoints (+ end if one-way)
        const coords: { lat: number; lng: number }[] = [];
        coords.push({ lat: input.start.lat, lng: input.start.lng });
        for (const w of input.waypoints) coords.push({ lat: w.lat, lng: w.lng });

        // If explicit end is provided and not roundtrip, include it as the last coordinate
        // Mapbox Optimization can handle separate source/ destination using "source" & "destination" params.
        const hasExplicitEnd = !!input.end && !roundtrip;
        if (hasExplicitEnd) coords.push({ lat: input.end!.lat, lng: input.end!.lng });

        // Build the Optimization API URL
        // Note: Optimization API expects lon,lat order
        const coordStr = coords.map(c => `${c.lng},${c.lat}`).join(";");
        const params = new URLSearchParams({
            geometries: "polyline6",
            overview: "full",
            steps: "false",
            annotations: "distance,duration",
            // If we want fixed start/end:
            // source=first, destination=last (when end is provided)
            ...(hasExplicitEnd ? { source: "first", destination: "last" } : {}),
            // If roundtrip, we allow Mapbox to return to start: roundtrip=true (default)
            // If not roundtrip and no explicit end => set destination=last waypt? (we already push end when not roundtrip)
            roundtrip: String(roundtrip),
        });

        const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/${profile}/${coordStr}?${params.toString()}&access_token=${token}`;
        const resp = await fetch(url);
        if (!resp.ok) {
            const txt = await resp.text();
            return j({ error: "Mapbox error", status: resp.status, body: txt }, 502);
        }
        const data = await resp.json();

        // Shape of Optimization API response:
        // trips[0] has: distance, duration, geometry, legs[]
        // waypoints[] includes a "waypoint_index" & "trips_index", and an "waypoint_index" mapping to original order
        if (!data?.trips?.length) return j({ error: "No trip found" }, 400);

        const trip = data.trips[0];
        const polyline = trip.geometry; // polyline6
        const legs = (trip.legs ?? []).map((l: any) => ({
            distance_m: l.distance,
            duration_s: l.duration,
        }));

        // Determine order mapping back to provided points
        // Mapbox waypoints array corresponds to coords list indices and provides "waypoint_index" (reordered position)
        // coords indices: 0 = start, 1..N = waypoints, (maybe last = end)
        // We produce "ordered_points" mirrored to start/waypoints/(end)
        type OrderedPoint = { type: "start" | "waypoint" | "end"; source_index: number; lat: number; lng: number; id: string | null; name?: string };

        const waypointsInfo: OrderedPoint[] = [];
        for (const wp of data.waypoints ?? []) {
            const srcIdx = wp.waypoint_index; // index in the ORIGINAL list (coords order)
            // Mapbox sometimes uses "waypoint_index" or "waypoint_index" mapping; we’ll trust "waypoint_index".
            const c = coords[srcIdx];
            // classify
            let type: OrderedPoint["type"] = "waypoint";
            if (srcIdx === 0) type = "start";
            else if (hasExplicitEnd && srcIdx === coords.length - 1) type = "end";

            // Map original to input arrays
            let id: string | null = null;
            let name: string | undefined = undefined;
            if (srcIdx === 0) { id = null; name = input.start.name; }
            else if (hasExplicitEnd && srcIdx === coords.length - 1) { id = null; name = input.end?.name; }
            else {
                const orig = input.waypoints[srcIdx - 1];
                id = orig?.id ?? null; name = orig?.name;
            }

            waypointsInfo.push({
                type,
                source_index: srcIdx,
                lat: c.lat, lng: c.lng,
                id, name
            });
        }

        // Sort by "trips_index" order if present (Mapbox sometimes provides)
        // Otherwise, keep waypointsInfo as-is; legs follow trip order already.
        // (In most responses, the order is what we need from "waypoints" sorted by 'trips_index' or 'waypoint_index')
        const ordered_points = waypointsInfo.sort((a: any, b: any) => (a?.trips_index ?? 0) - (b?.trips_index ?? 0));

        return j({
            provider: "mapbox",
            profile,
            distance_m: trip.distance,
            duration_s: trip.duration,
            polyline6: polyline,
            legs,               // per-leg distance/duration
            ordered_points,     // ordered waypoints incl. start/end classification
        });
    } catch (e) {
        console.error(e);
        return j({ error: String(e?.message ?? e) }, 500);
    }
});

function cors() {
    return new Response(null, { headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        }});
}
function j(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: {
            "content-type": "application/json", "Access-Control-Allow-Origin": "*"
        }});
}