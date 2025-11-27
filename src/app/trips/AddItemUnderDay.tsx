// app/trips/AddItemUnderDay.tsx
"use client";

import * as React from "react";
import {useState, useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import {Plus, MapPin, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Separator} from "@/components/ui/separator";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog";
import {createClientBrowser} from "@/lib/supabase/browser";

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
                    const {data, error} = await sb
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

                    const {data, error} = await query;
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

            const {error} = await sb.schema("itinero").from("itinerary_items").insert(payload);
            if (error) throw error;

            setOpen(false);
            router.refresh();
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <Separator className="my-3"/>
            <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4"/>
                Add item
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-lg overflow-visible">
                    <DialogHeader>
                        <DialogTitle>Add itinerary item</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">

                        {/* --- SMART LOCATION/TITLE INPUT --- */}
                        <div className="grid gap-2 relative z-50">
                            <Label>Activity or Location</Label>
                            <div className="relative">
                                <Input
                                    placeholder="e.g. Visit Labadi Beach"
                                    value={placeQuery} // We map the input directly to the query
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setPlaceQuery(val);
                                        setTitle(val); // Default the title to what they type
                                        setSelectedPlace(null); // Clear specific location until selected
                                    }}
                                    className={selectedPlace ? "pl-9" : ""} // Make room for icon if selected
                                />

                                {/* Visual indicator that a Place is locked in */}
                                {selectedPlace && (
                                    <div className="absolute left-3 top-2.5 text-primary animate-in fade-in zoom-in">
                                        <MapPin className="h-4 w-4"/>
                                    </div>
                                )}

                                {/* --- FLOATING RESULTS LIST --- */}
                                {/* Only show if we have results OR are loading, AND we haven't just selected something */}
                                {(placeLoading || (placeResults.length > 0 && !selectedPlace)) && (
                                    <div
                                        className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1">
                                        {placeLoading ? (
                                            <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin"/>
                                                Finding places...
                                            </div>
                                        ) : (
                                            <ul className="max-h-60 overflow-y-auto">
                                                {placeResults.map((p) => (
                                                    <li key={p.id}>
                                                        <button
                                                            type="button"
                                                            className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                                                            onClick={() => {
                                                                setSelectedPlace(p);
                                                                setTitle(p.name || "");
                                                                setPlaceQuery(p.name || ""); // Lock the input text
                                                            }}
                                                        >
                                                            <div
                                                                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                                <MapPin className="h-3.5 w-3.5"/>
                                                            </div>
                                                            <div className="flex-1">
                          <span className="block text-sm font-medium leading-none mb-1">
                            {p.name}
                          </span>
                                                                <span
                                                                    className="block text-xs text-muted-foreground line-clamp-1">
                            {[p.city, p.country].filter(Boolean).join(", ")}
                                                                    {typeof p.distance_km === "number" && ` • ${p.distance_km.toFixed(1)} km`}
                          </span>
                                                            </div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- TIME & DURATION ROW --- */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>When</Label>
                                <WhenSelect value={when} onValueChange={setWhen}/>
                            </div>
                            <div className="grid gap-2">
                                <Label>Duration (min)</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        placeholder="90"
                                        value={durationMin}
                                        onChange={(e) => setDurationMin(e.target.value)}
                                    />
                                    <span
                                        className="absolute right-3 top-2.5 text-xs text-muted-foreground pointer-events-none">
              min
            </span>
                                </div>
                            </div>
                        </div>

                        {/* --- COST & NOTES --- */}
                        <div className="grid gap-2">
                            <Label>Estimated cost</Label>
                            <div className="relative">
             <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-medium">
              GHS
            </span>
                                <Input
                                    className="pl-12" // Make room for currency
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={estCost}
                                    onChange={(e) => setEstCost(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Notes</Label>
                            <Textarea
                                className="resize-none"
                                rows={3}
                                placeholder="Any booking details or reminders..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                            Cancel
                        </Button>
                        <Button onClick={onCreate} disabled={busy || !title}>
                            {busy ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Adding...
                                </>
                            ) : "Add Item"}
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