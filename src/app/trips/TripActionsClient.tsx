"use client";

import * as React from "react";
import {useState, useMemo, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog";
import {createClientBrowser} from "@/lib/supabase/browser";
import {CalendarPlus, FileDown, Link as LinkIcon, Pencil, Plus, Share2, Trash2, Save, X, Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
import ExportPdfButtonClient from "@/app/trips/[id]/ExportPdfButtonClient";


type UUID = string;

export type DayBlock = {
    when: "morning" | "afternoon" | "evening";
    place_id: string | null;
    title: string;
    est_cost: number;
    duration_min: number;
    travel_min_from_prev: number;
    notes?: string;
};
export type Day = { date: string; blocks: DayBlock[] };
export type Place = { id: string; name: string; lat?: number; lng?: number };

type Props = {
    tripId: UUID;
    tripTitle: string;
    startDate?: string;
    endDate?: string;
    days: Day[];
    places: Place[];
    useInputs: TripConfig | null;
};

export type DestinationMeta = {
    currency_code?: string;
    fx_base?: string;
    fx_rate?: number;
    money_tools?: string[];
    city?: string;
    timezone?: string;
    plugs?: string[];
    languages?: string[];
    weather_desc?: string;
    weather_temp_c?: number;
    transport?: string[];
    esim_provider?: string;
    description?: string;
    history?: string;
};


export type TripConfig = {
    mode: "driving" | "walking" | "transit" | "biking" | string;
    pace: "balanced" | "fast" | "slow" | string;
    lodging: string | null;
    interests: string[];
    destinations: {
        id: string;
        lat: number;
        lng: number;
        name: string;
        country: string;
    }[];
    soft_distance: number | null;
    lodging_by_date: Record<string, string> | null;
    destination_meta?: DestinationMeta; // ⬅️ add this optional field
};

export default function TripActionsClient({
                                              tripId,
                                              tripTitle,
                                              startDate,
                                              endDate,
                                              days,
                                              places,
                                              useInputs: TripConfig
                                          }: Props) {
    const sb = createClientBrowser();
    const router = useRouter();

    // keep a display title and an editable draft
    const [title, setTitle] = useState(tripTitle);
    const [newTitle, setNewTitle] = useState(tripTitle || "");

    // if the prop changes (e.g., server refresh), sync local state
    useEffect(() => {
        setTitle(tripTitle);
        setNewTitle(tripTitle || "");
    }, [tripTitle]);

    const [editing, setEditing] = useState(false);
    const [addingForDate, setAddingForDate] = useState<string | null>(null);
    const [newBlock, setNewBlock] = useState<Partial<DayBlock>>({when: "morning"});
    const [busy, setBusy] = useState(false);

    const shareUrl = useMemo(() => (typeof window !== "undefined" ? window.location.href : ""), []);

    /* ====================== SHARE ====================== */
    async function share() {
        if (navigator.share) {
            try {
                await navigator.share({title: title || "Trip", url: shareUrl});
            } catch {
                /* cancelled */
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard");
        }
    }

    /* ====================== CALENDAR (.ics) ====================== */
    function downloadICS() {
        const lines: string[] = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Itinero//Trip Export//EN"];

        const toDT = (d: string, h = 9) => {
            const dt = new Date(d + "T00:00:00");
            dt.setHours(h, 0, 0, 0);
            const pad = (n: number) => String(n).padStart(2, "0");
            return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(
                dt.getMinutes()
            )}${pad(dt.getSeconds())}`;
        };

        for (const day of days) {
            // Whole-day container event
            lines.push("BEGIN:VEVENT");
            lines.push(`UID:${crypto.randomUUID()}@itinero`);
            lines.push(`DTSTAMP:${toDT(day.date, 8)}`);
            lines.push(`DTSTART:${toDT(day.date, 8)}`);
            lines.push(`DTEND:${toDT(day.date, 20)}`);
            lines.push(`SUMMARY:${escapeICS(title || "Trip")} — ${day.date}`);
            lines.push(`DESCRIPTION:${escapeICS("Exported from Itinero")}`);
            lines.push("END:VEVENT");

            // Block items
            const slotHour: Record<DayBlock["when"], number> = {morning: 9, afternoon: 14, evening: 19};
            for (const b of day.blocks) {
                const start = toDT(day.date, slotHour[b.when] || 9);
                const end = toDT(day.date, (slotHour[b.when] || 9) + Math.max(1, Math.round((b.duration_min || 90) / 60)));
                lines.push("BEGIN:VEVENT");
                lines.push(`UID:${crypto.randomUUID()}@itinero`);
                lines.push(`DTSTAMP:${start}`);
                lines.push(`DTSTART:${start}`);
                lines.push(`DTEND:${end}`);
                lines.push(`SUMMARY:${escapeICS(b.title)}`);
                if (b.notes) lines.push(`DESCRIPTION:${escapeICS(b.notes)}`);
                lines.push("END:VEVENT");
            }
        }

        lines.push("END:VCALENDAR");
        const blob = new Blob([lines.join("\r\n")], {type: "text/calendar;charset=utf-8"});
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${(title || "trip").replace(/\s+/g, "_")}.ics`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    /* ====================== PDF (print-to-PDF) ====================== */
    function printToPDF() {
        window.print();
    }

    /* ====================== EDITS ====================== */
    async function saveTitle() {
        setBusy(true);
        try {
            const {error} = await sb.schema("itinero").from("trips").update({title: newTitle || null}).eq("id", tripId);
            if (error) throw error;

            // optimistic UI + keep draft in sync
            setTitle(newTitle);
            setEditing(false);

            // revalidate server components using this trip (optional but recommended)
            router.refresh();
        } catch (err) {
            console.error("Failed to save title:", err);
        } finally {
            setBusy(false);
        }
    }

    function openAddItem(date: string) {
        setAddingForDate(date);
        setNewBlock({
            when: "morning",
            title: "",
            est_cost: 0,
            duration_min: 90,
            travel_min_from_prev: 0,
            place_id: null,
        });
    }


    function DownloadPdfButton({tripId}: { tripId: string }) {
        const [loading, setLoading] = useState(false);

        const onClick = async () => {
            if (loading) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/trips/${tripId}/pdf`, {
                    method: "GET",
                    credentials: "include", // carry auth cookies to the API route
                });

                if (!res.ok) {
                    const text = await res.text().catch(() => "");
                    throw new Error(text || `Failed with ${res.status}`);
                }

                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `trip-${tripId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } catch (err) {
                console.error("PDF download failed:", err);
                alert("Failed to generate PDF. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        return (
            <Button size="sm" variant="secondary" onClick={onClick} disabled={loading} aria-busy={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        Generating…
                    </>
                ) : (
                    <>
                        <FileDown className="mr-2 h-4 w-4"/>
                        Download PDF
                    </>
                )}
            </Button>
        );
    }

    async function confirmAddItem() {
        if (!addingForDate || !newBlock?.title) {
            setAddingForDate(null);
            return;
        }
        setBusy(true);
        try {
            const {data: last} = await sb
                .schema("itinero")
                .from("itinerary_items")
                .select("order_index")
                .eq("trip_id", tripId)
                .eq("date", addingForDate)
                .order("order_index", {ascending: false})
                .limit(1)
                .maybeSingle<{ order_index: number }>();

            const order_index = (last?.order_index ?? -1) + 1;
            const when = (newBlock.when ?? "morning") as DayBlock["when"];

            const {error} = await sb.schema("itinero").from("itinerary_items").insert({
                trip_id: tripId,
                day_index: 0,
                date: addingForDate,
                order_index,
                when,
                place_id: newBlock.place_id ?? null,
                title: newBlock.title!,
                est_cost: Number(newBlock.est_cost ?? 0),
                duration_min: Number(newBlock.duration_min ?? 90),
                travel_min_from_prev: Number(newBlock.travel_min_from_prev ?? 0),
                notes: newBlock.notes ?? null,
            });
            if (error) throw error;

            setAddingForDate(null);
            router.refresh();
        } finally {
            setBusy(false);
        }
    }


    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Edit trip title */}
            {!editing ? (
                <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4"/> Edit
                </Button>
            ) : (
                <div className="flex items-center gap-2">
                    <Input
                        className="h-8 w-56"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Trip title"
                    />
                    <Button size="sm" onClick={saveTitle} disabled={busy}>
                        <Save className="mr-2 h-4 w-4"/> Save
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setNewTitle(title);
                            {/* reset draft to current title */
                            }
                            setEditing(false);
                        }}
                        disabled={busy}
                    >
                        <X className="mr-2 h-4 w-4"/> Cancel
                    </Button>
                </div>
            )}

            {/* Add item (opens per-day dialog) */}
            {days.length > 0 && (
                <div className="relative">
                    <Button size="sm" variant="secondary" onClick={() => openAddItem(days[0].date)}>
                        <Plus className="mr-2 h-4 w-4"/> Add item
                    </Button>
                </div>
            )}

            {/* Export / Share */}
            <Button size="sm" variant="secondary" onClick={downloadICS}>
                <CalendarPlus className="mr-2 h-4 w-4"/> Calendar
            </Button>
            <DownloadPdfButton tripId={tripId}/>
            {/*<ExportPdfButtonClient*/}
            {/*    tripId={tripId}*/}
            {/*/>*/}
            <Button size="sm" onClick={share}>
                <Share2 className="mr-2 h-4 w-4"/> Share
            </Button>

            {/* Add item dialog */}
            <Dialog open={!!addingForDate} onOpenChange={(o) => !o && setAddingForDate(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add item — {addingForDate}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <label className="text-xs text-muted-foreground">Title</label>
                        <Input value={newBlock.title ?? ""}
                               onChange={(e) => setNewBlock((b) => ({...b, title: e.target.value}))}/>

                        <div className="grid grid-cols-3 gap-2">
                            <select
                                className="h-9 rounded-md border bg-background px-2 text-sm"
                                value={newBlock.when ?? "morning"}
                                onChange={(e) => setNewBlock((b) => ({...b, when: e.target.value as DayBlock["when"]}))}
                            >
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                            </select>
                            <Input
                                type="number"
                                min={0}
                                placeholder="Cost"
                                value={String(newBlock.est_cost ?? "")}
                                onChange={(e) => setNewBlock((b) => ({...b, est_cost: Number(e.target.value || 0)}))}
                            />
                            <Input
                                type="number"
                                min={0}
                                placeholder="Duration (min)"
                                value={String(newBlock.duration_min ?? "")}
                                onChange={(e) => setNewBlock((b) => ({
                                    ...b,
                                    duration_min: Number(e.target.value || 0)
                                }))}
                            />
                        </div>

                        <label className="text-xs text-muted-foreground">Notes</label>
                        <Input
                            value={newBlock.notes ?? ""}
                            onChange={(e) => setNewBlock((b) => ({...b, notes: e.target.value}))}
                            placeholder="Optional notes"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setAddingForDate(null)} disabled={busy}>
                            Cancel
                        </Button>
                        <Button onClick={confirmAddItem} disabled={busy || !newBlock.title}>
                            Add
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* ===== helpers ===== */

function escapeICS(s: string) {
    return s.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}