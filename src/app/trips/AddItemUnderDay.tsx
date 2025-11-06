// app/trips/AddItemUnderDay.tsx
"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createClientBrowser } from "@/lib/supabase/browser";

type UUID = string;
type When = "morning" | "afternoon" | "evening";

type PlaceLite = {
    id: string;
    name: string;
    city?: string | null;
    country?: string | null;
    lat?: number | null;
    lng?: number | null;
    distance_km?: number | null;
    tags?: string[] | null;
};

/** Insert shape for itinero.itinerary_items (adjust to your table) */
type NewItineraryItem = {
    trip_id: UUID;
    date: string | null;
    day_index: number;
    order_index: number;
    when: When;
    place_id: string | null;
    title: string;
    est_cost: number | null;
    duration_min: number | null;
    travel_min_from_prev: number | null;
    notes: string | null;
};

export function AddItemUnderDay({
                                    tripId,
                                    date, // yyyy-mm-dd (or null -> fallback ordering)
                                    nextOrderIndex, // pass the next index to append at end
                                    defaultWhen = "afternoon",
                                    destinationLat,
                                    destinationLng,
                                    radiusKm = 50,
                                    tripStartDate,
                                    preferenceTags, // e.g. ["food","culture"]
                                    dayIndex, // include if your table requires NOT NULL day_index
                                }: {
    tripId: UUID;
    date: string | null;
    nextOrderIndex: number;
    tripStartDate?: string; // e.g. "2025-07-20"
    defaultWhen?: When;
    destinationLat?: number;
    destinationLng?: number;
    radiusKm?: number;
    preferenceTags?: string[];
    dayIndex: number;
}) {
    const router = useRouter();
    const sb = createClientBrowser();

    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    // place-aware title input
    const [title, setTitle] = useState("");
    const [when, setWhen] = useState<When>(defaultWhen);
    const [estCost, setEstCost] = useState<string>("");
    const [durationMin, setDurationMin] = useState<string>("");
    const [notes, setNotes] = useState<string>("");

    const [placeQuery, setPlaceQuery] = useState("");
    const [placeLoading, setPlaceLoading] = useState(false);
    const [placeResults, setPlaceResults] = useState<PlaceLite[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<PlaceLite | null>(null);

    // when dialog closes, clear transient state
    useEffect(() => {
        if (!open) {
            setTitle("");
            setWhen(defaultWhen);
            setEstCost("");
            setDurationMin("");
            setNotes("");
            setPlaceQuery("");
            setPlaceResults([]);
            setSelectedPlace(null);
            setPlaceLoading(false);
        }
    }, [open, defaultWhen]);

    // keep title in sync when selecting a place (but let users edit later)
    useEffect(() => {
        if (selectedPlace && (!title || title === placeQuery)) {
            setTitle(selectedPlace.name ?? "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPlace?.id]);

    // debounced search
    const debounceRef = useRef<number | null>(null);
    useEffect(() => {
        if (!open) return;

        // no query and no location => do nothing
        if (!placeQuery && (typeof destinationLat !== "number" || typeof destinationLng !== "number")) {
            setPlaceResults([]);
            return;
        }

        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        const ctrl = new AbortController();

        debounceRef.current = window.setTimeout(async () => {
            setPlaceLoading(true);
            try {
                const q = placeQuery.trim();
                let results: PlaceLite[] | null = null;

                // Try RPC first when we have a location
                if (typeof destinationLat === "number" && typeof destinationLng === "number") {
                    const { data, error } = await sb
                        .schema("itinero")
                        .rpc("find_places_near", {
                            lat: destinationLat,
                            lng: destinationLng,
                            q: q || null,
                            radius_km: radiusKm,
                            limit_count: 12, // <-- fix from `limit` to `limit_count`
                            tags: preferenceTags ?? null,
                        })
                        .abortSignal(ctrl.signal);

                    if (!error && Array.isArray(data)) {
                        results = data as PlaceLite[];
                    }
                }

                // Fallback if RPC not available OR no location:
                if (!results) {
                    let query = sb
                        .schema("itinero")
                        .from("places")
                        .select("id,name,city,country,lat,lng,tags")
                        .ilike("name", `%${q || ""}%`)
                        .limit(12);

                    if (preferenceTags && preferenceTags.length > 0) {
                        query = query.overlaps("tags", preferenceTags);
                    }

                    const { data, error } = await query;
                    if (!error && Array.isArray(data)) {
                        results = data as PlaceLite[];
                    }
                }

                setPlaceResults(results ?? []);
            } catch (e: unknown) {
                // ignore aborts, log others if you wish
                if (errorName(e) !== "AbortError") {
                    // console.error(e);
                }
            } finally {
                setPlaceLoading(false);
            }
        }, 280);

        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
            ctrl.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placeQuery, destinationLat, destinationLng, radiusKm, JSON.stringify(preferenceTags), open]);

    // Optional: defensive fallback if parent didn’t pass dayIndex
    function deriveDayIndex(): number {
        if (dayIndex != null) {
            if (Number.isInteger(dayIndex)) return dayIndex;
            if (tripStartDate && date) {
                const d0 = new Date(tripStartDate + "T00:00:00");
                const d1 = new Date(date + "T00:00:00");
                const diff = Math.floor((d1.getTime() - d0.getTime()) / 86_400_000);
                return Math.max(0, diff);
            }
        }
        return 0;
    }

    async function onCreate() {
        setBusy(true);
        try {
            const payload: NewItineraryItem = {
                trip_id: tripId,
                date,
                day_index: deriveDayIndex(),
                order_index: nextOrderIndex,
                when,
                place_id: selectedPlace ? selectedPlace.id : null,
                title: (title || selectedPlace?.name || "New item").trim(),
                est_cost: estCost === "" ? null : Number(estCost),
                duration_min: durationMin === "" ? null : Number(durationMin),
                travel_min_from_prev: null,
                notes: notes.trim() || null,
            };

            // include explicit day_index override if parent passed it (optional)
            if (typeof dayIndex === "number") {
                payload.day_index = dayIndex;
            }

            const { error } = await sb.schema("itinero").from("itinerary_items").insert(payload);
            if (error) throw error;

            setOpen(false);
            router.refresh();
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <Separator className="my-3" />
            <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add item
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add itinerary item</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-3">
                        {/* Place-aware title */}
                        <div className="grid gap-1.5">
                            <Label>Title (search places near you)</Label>

                            {/* 1) The visible search box */}
                            <Input
                                placeholder="Search a place e.g. Labadi Beach"
                                value={placeQuery}
                                onChange={(e) => {
                                    setPlaceQuery(e.target.value);
                                    setSelectedPlace(null); // unselect when user types again
                                }}
                                onKeyDown={(e) => {
                                    // Enter with no selection => copy query to title
                                    if (e.key === "Enter" && !selectedPlace && placeQuery) {
                                        setTitle(placeQuery);
                                    }
                                }}
                            />

                            {/* 2) Results list */}
                            <div className="rounded-md border bg-background">
                                {placeLoading ? (
                                    <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Searching…
                                    </div>
                                ) : placeResults.length > 0 ? (
                                    <ul className="max-h-56 overflow-auto">
                                        {placeResults.map((p) => {
                                            const active = selectedPlace?.id === p.id;
                                            return (
                                                <li key={p.id}>
                                                    <button
                                                        type="button"
                                                        className={`flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted/60 ${
                                                            active ? "bg-muted" : ""
                                                        }`}
                                                        onClick={() => {
                                                            setSelectedPlace(p);
                                                            setTitle(p.name || "");
                                                            setPlaceQuery(p.name || "");
                                                        }}
                                                    >
                            <span className="mt-0.5 rounded-sm bg-primary/10 p-1 text-primary">
                              <MapPin className="h-3.5 w-3.5" />
                            </span>
                                                        <span className="flex-1">
                              <span className="block text-sm font-medium">{p.name}</span>
                                                            {p.city || p.country || typeof p.distance_km === "number" ? (
                                                                <span className="block text-xs text-muted-foreground">
                                  {[p.city, p.country].filter(Boolean).join(", ")}
                                                                    {typeof p.distance_km === "number" ? ` • ${p.distance_km.toFixed(1)} km` : ""}
                                </span>
                                                            ) : null}
                            </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : placeQuery ? (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">No matches. Keep typing…</div>
                                ) : (
                                    <div className="px-3 py-2 text-sm text-muted-foreground">
                                        {typeof destinationLat === "number" && typeof destinationLng === "number"
                                            ? "Type to search nearby places…"
                                            : "Add location to get better suggestions, or type to search…"}
                                    </div>
                                )}
                            </div>

                            {/* 3) Freeform title (editable after select) */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs text-muted-foreground">Or override the title</Label>
                                <Input
                                    placeholder="e.g. Jamestown walking tour"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* When + Cost */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>When</Label>
                                <WhenSelect value={when} onValueChange={setWhen} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Estimated cost</Label>
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="e.g. 10"
                                    value={estCost}
                                    onChange={(e) => setEstCost(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="grid gap-1.5">
                            <Label>Duration (min)</Label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="e.g. 90"
                                value={durationMin}
                                onChange={(e) => setDurationMin(e.target.value)}
                            />
                        </div>

                        {/* Notes */}
                        <div className="grid gap-1.5">
                            <Label>Notes</Label>
                            <Textarea rows={3} placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                            Cancel
                        </Button>
                        <Button onClick={onCreate} disabled={busy}>
                            {busy ? "Adding…" : "Add item"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

/* ----- small helper ----- */

function WhenSelect({
                        value,
                        onValueChange,
                    }: {
    value: When;
    onValueChange: (w: When) => void;
}) {
    return (
        <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={value}
            onChange={(e) => onValueChange(e.target.value as When)}
        >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
        </select>
    );
}

/** Safely read an Error-like name without using `any` */
function errorName(e: unknown): string | undefined {
    if (typeof e === "object" && e !== null && "name" in e) {
        const n = (e as { name?: unknown }).name;
        if (typeof n === "string") return n;
    }
    return undefined;
}