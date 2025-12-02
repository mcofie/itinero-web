"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";

import {
    Pencil,
    Plus,
    X,
    Check,
    Calendar,
    Clock,
    DollarSign,
    AlignLeft,
    Type,
    Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";


/* ---------------- Types ---------------- */
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

export type TripConfig = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
};

export type DestinationMeta = {
    description?: string;
    history?: string;
    currency_code?: string;
    plugs?: string[];
    languages?: string[];
    weather_desc?: string;
    transport?: string[];
    esim_provider?: string;
    city?: string;
    fx_rate?: number;
    fx_base?: string;
    weather_temp_c?: number;
};

type Props = {
    tripId: UUID;
    tripTitle: string;
    startDate?: string;
    endDate?: string;
    days: Day[];
    places: Place[];
    useInputs: TripConfig | null;
};

/* ---------------- Component ---------------- */

export default function TripActionsClient({
    tripId,
    tripTitle,
    days,
}: Props) {
    const sb = getSupabaseBrowser();
    const router = useRouter();

    // Local state for title editing
    const [newTitle, setNewTitle] = useState(tripTitle || "");
    const [editing, setEditing] = useState(false);
    const [busy, setBusy] = useState(false);

    // Local state for adding items
    const [addingForDate, setAddingForDate] = useState<string | null>(null);
    const [newBlock, setNewBlock] = useState<Partial<DayBlock>>({
        when: "morning",
    });

    // Sync prop changes
    useEffect(() => {
        setNewTitle(tripTitle || "");
    }, [tripTitle]);

    /* --- Actions --- */

    async function saveTitle() {
        if (!newTitle.trim()) return;
        setBusy(true);
        try {
            const { error } = await sb
                .schema("itinero")
                .from("trips")
                .update({ title: newTitle.trim() })
                .eq("id", tripId);

            if (error) throw error;
            setEditing(false);
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

    async function confirmAddItem() {
        if (!addingForDate || !newBlock?.title) {
            setAddingForDate(null);
            return;
        }

        setBusy(true);
        try {

            const { data: last, error: lastErr } = await sb
                .schema("itinero")
                .from("itinerary_items")
                .select("order_index")
                .eq("trip_id", tripId)
                .eq("date", addingForDate)
                .order("order_index", { ascending: false })
                .limit(1)
                .maybeSingle<{ order_index: number }>();

            if (lastErr) console.error("[TripActionsClient] last item error:", lastErr);


            const order_index = (last?.order_index ?? -1) + 1;
            const when = (newBlock.when ?? "morning") as DayBlock["when"];


            const { error } = await sb
                .schema("itinero")
                .from("itinerary_items")
                .insert({
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

            if (error) {
                console.error("[TripActionsClient] insert error:", error);
                throw error;
            }


            setAddingForDate(null);
            router.refresh();
        } catch (err) {
            console.error("[TripActionsClient] confirmAddItem caught error:", err);
        } finally {
            setBusy(false);

        }
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* --- 1. Title Edit Mode --- */}
            {editing ? (
                <div
                    className="flex items-center gap-1 rounded-full bg-slate-900/90 p-1 pl-3 pr-1 shadow-lg border border-white/10 animate-in fade-in slide-in-from-left-2 duration-200 backdrop-blur-md">
                    <Input
                        className="h-8 w-48 border-transparent bg-transparent px-0 text-sm text-white placeholder:text-white/40 focus-visible:ring-0 font-medium"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Trip Name"
                        autoFocus
                        disabled={busy}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle();
                            if (e.key === "Escape") setEditing(false);
                        }}
                    />
                    <div className="flex items-center gap-1">
                        <button
                            onClick={saveTitle}
                            disabled={busy}
                            className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                        >
                            {busy ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Check className="h-3 w-3" />
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setNewTitle(tripTitle);
                                setEditing(false);
                            }}
                            disabled={busy}
                            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="h-9 gap-2 rounded-full text-white/80 hover:bg-white/10 hover:text-white border border-transparent transition-all"
                >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs font-medium uppercase tracking-wide">
                        Edit Title
                    </span>
                </Button>
            )}

            {/* Separator */}
            <div className="h-4 w-px bg-white/20 mx-1" />

            {/* --- 2. Add Activity Action --- */}
            {days.length > 0 && (
                <Button
                    size="sm"
                    className="h-9 gap-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 border border-blue-500 font-semibold transition-all dark:bg-blue-600 dark:hover:bg-blue-500"
                    onClick={() => openAddItem(days[0].date)}
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Activity</span>
                </Button>
            )}

            {/* --- Add Item Dialog --- */}
            <Dialog
                open={!!addingForDate}
                onOpenChange={(o) => !o && setAddingForDate(null)}
            >
                <DialogContent
                    className="sm:max-w-md rounded-3xl border-slate-100 bg-white p-0 shadow-2xl overflow-hidden gap-0 dark:bg-slate-900 dark:border-slate-800">
                    <div
                        className="bg-slate-50 px-6 py-5 border-b border-slate-100 dark:bg-slate-950/50 dark:border-slate-800">
                        <DialogHeader>
                            <DialogTitle
                                className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-blue-400">
                                    <Plus className="h-5 w-5" />
                                </div>
                                New Activity
                            </DialogTitle>
                            <div
                                className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Adding to</span>
                                <span
                                    className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700">
                                    {addingForDate}
                                </span>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="px-6 py-6 grid gap-5">
                        <div className="grid gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Activity Details
                            </span>
                            <div className="relative">
                                <Type className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="e.g. Dinner at Oseikrom"
                                    value={newBlock.title ?? ""}
                                    onChange={(e) =>
                                        setNewBlock((b) => ({ ...b, title: e.target.value }))
                                    }
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl text-base dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-600"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="grid gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Time
                                </span>
                                <div className="relative">
                                    <select
                                        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                                        value={newBlock.when ?? "morning"}
                                        onChange={(e) =>
                                            setNewBlock((b) => ({
                                                ...b,
                                                when: e.target.value as DayBlock["when"],
                                            }))
                                        }
                                    >
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                        <option value="evening">Evening</option>
                                    </select>
                                    <Clock
                                        className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none dark:text-slate-500" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Cost
                                </span>
                                <div className="relative">
                                    <DollarSign
                                        className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        className="pl-8 h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-600"
                                        value={String(newBlock.est_cost ?? "")}
                                        onChange={(e) =>
                                            setNewBlock((b) => ({
                                                ...b,
                                                est_cost: Number(e.target.value || 0),
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Duration
                                </span>
                                <div className="relative">
                                    <Clock
                                        className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="90"
                                        className="pl-8 h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-600"
                                        value={String(newBlock.duration_min ?? "")}
                                        onChange={(e) =>
                                            setNewBlock((b) => ({
                                                ...b,
                                                duration_min: Number(e.target.value || 0),
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Notes
                            </span>
                            <div className="relative">
                                <AlignLeft
                                    className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                <Textarea
                                    value={newBlock.notes ?? ""}
                                    onChange={(e) =>
                                        setNewBlock((b) => ({ ...b, notes: e.target.value }))
                                    }
                                    placeholder="Reservation numbers, directions, tips..."
                                    className="pl-10 min-h-[100px] bg-slate-50 border-slate-200 focus-visible:ring-blue-600 resize-none rounded-xl dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between gap-3 dark:bg-slate-950/50 dark:border-slate-800">
                        <Button
                            variant="outline"
                            onClick={() => setAddingForDate(null)}
                            disabled={busy}
                            className="h-11 flex-1 rounded-xl border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 font-medium dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmAddItem}
                            disabled={busy || !newBlock.title}
                            className="h-11 flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md font-bold dark:bg-blue-600 dark:hover:bg-blue-500"
                        >
                            {busy ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Activity"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}