"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/browser";

import {
    CalendarPlus,
    Share2,
    Pencil,
    Plus,
    X,
    MoreHorizontal,
    Check,
    Calendar,
    Clock,
    DollarSign,
    AlignLeft,
    Type,
    Copy
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TripPrintDialogClient } from "@/app/trips/[id]/print/TripPrintDialogClient";
import { cn } from "@/lib/utils";

/* ---------------- Types (Preserved) ---------------- */
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
    destination_meta?: DestinationMeta;
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
    const sb = createClientBrowser();
    const router = useRouter();

    // Local state for title editing
    const [title, setTitle] = useState(tripTitle);
    const [newTitle, setNewTitle] = useState(tripTitle || "");
    const [editing, setEditing] = useState(false);
    const [busy, setBusy] = useState(false);

    // Local state for adding items
    const [addingForDate, setAddingForDate] = useState<string | null>(null);
    const [newBlock, setNewBlock] = useState<Partial<DayBlock>>({
        when: "morning",
    });

    // Share feedback state
    const [copied, setCopied] = useState(false);

    // Sync prop changes
    useEffect(() => {
        setTitle(tripTitle);
        setNewTitle(tripTitle || "");
    }, [tripTitle]);

    const shareUrl = useMemo(
        () => (typeof window !== "undefined" ? window.location.href : ""),
        []
    );

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
            setTitle(newTitle.trim());
            setEditing(false);
            router.refresh();
        } catch (err) {
            console.error("Failed to save title:", err);
        } finally {
            setBusy(false);
        }
    }

    async function share() {
        if (navigator.share) {
            try {
                await navigator.share({ title: title || "Trip", url: shareUrl });
            } catch {
                /* cancelled */
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    function downloadICS() {
        const lines: string[] = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Itinero//Trip Export//EN",
        ];

        const toDT = (d: string, h = 9) => {
            const dt = new Date(d + "T00:00:00");
            dt.setHours(h, 0, 0, 0);
            const pad = (n: number) => String(n).padStart(2, "0");
            return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(
                dt.getDate()
            )}T${pad(dt.getHours())}${pad(dt.getMinutes())}${pad(dt.getSeconds())}`;
        };

        for (const day of days) {
            lines.push("BEGIN:VEVENT");
            lines.push(`UID:${crypto.randomUUID()}@itinero`);
            lines.push(`DTSTAMP:${toDT(day.date, 8)}`);
            lines.push(`DTSTART:${toDT(day.date, 8)}`);
            lines.push(`DTEND:${toDT(day.date, 20)}`);
            lines.push(`SUMMARY:${escapeICS(title || "Trip")} — ${day.date}`);
            lines.push(`DESCRIPTION:${escapeICS("Exported from Itinero")}`);
            lines.push("END:VEVENT");

            const slotHour: Record<DayBlock["when"], number> = {
                morning: 9,
                afternoon: 14,
                evening: 19,
            };
            for (const b of day.blocks) {
                const start = toDT(day.date, slotHour[b.when] || 9);
                const end = toDT(
                    day.date,
                    (slotHour[b.when] || 9) +
                    Math.max(1, Math.round((b.duration_min || 90) / 60))
                );
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
        const blob = new Blob([lines.join("\r\n")], {
            type: "text/calendar;charset=utf-8",
        });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${(title || "trip").replace(/\s+/g, "_")}.ics`;
        a.click();
        URL.revokeObjectURL(a.href);
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
            const { data: last } = await sb
                .schema("itinero")
                .from("itinerary_items")
                .select("order_index")
                .eq("trip_id", tripId)
                .eq("date", addingForDate)
                .order("order_index", { ascending: false })
                .limit(1)
                .maybeSingle<{ order_index: number }>();

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
            if (error) throw error;

            setAddingForDate(null);
            router.refresh();
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* --- Title Edit Mode --- */}
            {editing ? (
                <div className="flex items-center gap-1 rounded-full bg-slate-900/90 p-1 pl-3 pr-1 shadow-lg border border-white/10 animate-in fade-in slide-in-from-left-2 duration-200 backdrop-blur-md">
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
                            <Check className="h-3 w-3" />
                        </button>
                        <button
                            onClick={() => {
                                setNewTitle(title);
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
                    className="h-9 gap-2 rounded-full text-slate-500 hover:bg-white/10 hover:text-white border border-transparent transition-all"
                >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs font-medium uppercase tracking-wide">Edit Title</span>
                </Button>
            )}

            <div className="h-4 w-px bg-white/20 mx-1" />

            {/* --- Action Buttons --- */}
            <div className="flex items-center gap-2">
                {/* Add Item */}
                {days.length > 0 && (
                    <Button
                        size="sm"
                        className="h-9 gap-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow-md border border-blue-500 font-semibold transition-all"
                        onClick={() => openAddItem(days[0].date)}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Activity</span>
                    </Button>
                )}

                {/* Share */}
                <Button
                    size="sm"
                    variant="secondary"
                    className={cn(
                        "h-9 gap-2 rounded-full border transition-all duration-300",
                        copied
                            ? "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
                            : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                    )}
                    onClick={share}
                >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
                </Button>

                {/* More Menu (Export, Print) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="h-9 w-9 rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-colors"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 rounded-xl border-slate-100 shadow-xl p-1.5 bg-white">
                        <DropdownMenuLabel className="text-xs font-bold text-slate-400 px-2 py-1.5 uppercase tracking-wider">Options</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100 my-1" />

                        <DropdownMenuItem onClick={downloadICS} className="gap-3 cursor-pointer rounded-lg p-2.5 focus:bg-slate-50 text-slate-700 focus:text-blue-600">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                                <CalendarPlus className="h-4 w-4" />
                            </div>
                            <span className="font-medium">Export Calendar</span>
                        </DropdownMenuItem>

                        {/* Print Dialog Integration */}
                        <div className="px-1">
                            <TripPrintDialogClient tripId={tripId} />
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* --- Add Item Dialog --- */}
            <Dialog
                open={!!addingForDate}
                onOpenChange={(o) => !o && setAddingForDate(null)}
            >
                <DialogContent className="sm:max-w-md rounded-3xl border-slate-100 bg-white p-0 shadow-2xl overflow-hidden gap-0">
                    <div className="bg-slate-50 px-6 py-5 border-b border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-lg font-bold text-slate-900">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm border border-slate-100">
                                    <Plus className="h-5 w-5" />
                                </div>
                                New Activity
                            </DialogTitle>
                            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Adding to</span>
                                <span className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{addingForDate}</span>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="px-6 py-6 grid gap-5">
                        <div className="grid gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity Details</span>
                            <div className="relative">
                                <Type className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="e.g. Dinner at Oseikrom"
                                    value={newBlock.title ?? ""}
                                    onChange={(e) => setNewBlock((b) => ({ ...b, title: e.target.value }))}
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl text-base"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="grid gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</span>
                                <div className="relative">
                                    <select
                                        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                                        value={newBlock.when ?? "morning"}
                                        onChange={(e) => setNewBlock((b) => ({ ...b, when: e.target.value as DayBlock["when"] }))}
                                    >
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                        <option value="evening">Evening</option>
                                    </select>
                                    <Clock className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cost</span>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="0"
                                        className="pl-8 h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl"
                                        value={String(newBlock.est_cost ?? "")}
                                        onChange={(e) => setNewBlock((b) => ({ ...b, est_cost: Number(e.target.value || 0) }))}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</span>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="90"
                                        className="pl-8 h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 rounded-xl"
                                        value={String(newBlock.duration_min ?? "")}
                                        onChange={(e) => setNewBlock((b) => ({ ...b, duration_min: Number(e.target.value || 0) }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes</span>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Textarea
                                    value={newBlock.notes ?? ""}
                                    onChange={(e) => setNewBlock((b) => ({ ...b, notes: e.target.value }))}
                                    placeholder="Reservation numbers, directions, tips..."
                                    className="pl-10 min-h-[100px] bg-slate-50 border-slate-200 focus-visible:ring-blue-600 resize-none rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setAddingForDate(null)}
                            disabled={busy}
                            className="h-11 flex-1 rounded-xl border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmAddItem}
                            disabled={busy || !newBlock.title}
                            className="h-11 flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md font-bold"
                        >
                            {busy ? "Saving..." : "Save Activity"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function escapeICS(s: string) {
    return s.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}