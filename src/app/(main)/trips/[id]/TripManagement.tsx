"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Share2,
    Download,
    Calendar,
    Copy,
    Trash2,
    FileText,
    Users,
    Globe,
    Check,
    ExternalLink,
    Lock,
} from "lucide-react";
import DeleteTripClient from "./DeleteTripClient";
import PublicToggle from "@/app/(main)/trips/PublicToggle";
import { TripPrintDialogClient } from "@/app/trips/[id]/print/TripPrintDialogClient";
import { cn } from "@/lib/utils";
import type { Day } from "./page";

/* --- Helper: ICS Download Logic --- */
function downloadICS(title: string, days: Day[]) {
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

        const slotHour: Record<string, number> = {
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
    toast.success("Calendar file downloaded");
}

function escapeICS(s: string) {
    return s.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

/* --- 1. Share Card --- */
export function ShareCard({
    tripId,
    publicId,
    isPublic,
}: {
    tripId: string;
    publicId: string | null;
    isPublic: boolean;
}) {
    const [copied, setCopied] = React.useState(false);

    const shareUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/trips/share/${publicId || tripId}`
            : "";

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card
            className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                            <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-500" /> Sharing
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                            Control who can see this trip.
                        </CardDescription>
                    </div>
                    <div
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                            isPublic
                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                        )}
                    >
                        {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col justify-end space-y-4">
                {/* Toggle Section */}
                <div
                    className="flex flex-col items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950/50 p-4 border border-slate-100 dark:border-slate-800">
                    <PublicToggle tripId={tripId} publicId={publicId} />
                </div>

                {/* Link Section */}
                {isPublic && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label
                            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Share Link
                        </Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    readOnly
                                    value={shareUrl}
                                    className="h-10 truncate rounded-xl border-slate-200 bg-white pr-10 text-sm font-medium text-slate-600 focus-visible:ring-blue-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                                />
                                <div className="absolute right-0 top-0 flex h-full items-center px-3">
                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mr-3" />
                                    <button
                                        onClick={handleCopy}
                                        className="text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 shrink-0 rounded-xl border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                                asChild
                            >
                                <Link href={`/trips/share/${publicId}`} target="_blank">
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* --- 2. Exports Card --- */
export function ExportCard({
    tripId,
    title,
    days,
}: {
    tripId: string;
    title: string;
    days: Day[];
}) {
    return (
        <Card
            className="flex flex-col rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                    <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-500" /> Export
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                    Take your itinerary offline.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
                {/* PDF Export - FIXED CLICK AREA */}
                <div
                    className="group relative flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/50 transition-all hover:border-blue-200 hover:bg-blue-50 dark:bg-slate-950/50 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-slate-900">
                    {/* Invisible Trigger Overlay */}
                    <div className="absolute inset-0 z-10 opacity-0 [&_button]:h-full [&_button]:w-full">
                        <TripPrintDialogClient tripId={tripId} />
                    </div>

                    {/* Visual Representation */}
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-colors group-hover:text-blue-600 dark:bg-slate-800 dark:text-slate-500 dark:group-hover:text-blue-400">
                        <FileText className="h-5 w-5" />
                    </div>
                    <span
                        className="text-xs font-bold text-slate-600 group-hover:text-blue-700 dark:text-slate-400 dark:group-hover:text-blue-400">
                        PDF Guide
                    </span>
                </div>

                {/* Calendar Sync */}
                <Button
                    variant="outline"
                    className="group flex h-24 flex-col gap-3 rounded-2xl border-slate-200 bg-slate-50/50 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:bg-slate-950/50 dark:border-slate-800 dark:hover:border-purple-900 dark:hover:bg-slate-900 dark:hover:text-purple-400"
                    onClick={() => downloadICS(title, days)}
                >
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-colors group-hover:text-purple-600 dark:bg-slate-800 dark:text-slate-500 dark:group-hover:text-purple-400">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold dark:text-slate-400">Sync Calendar</span>
                </Button>
            </CardContent>
        </Card>
    );
}

/* --- 3. Collaborators --- */
export function CollaboratorsCard() {
    return (
        <Card
            className="flex flex-col rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-500" /> Team
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                    Plan together with friends.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-end space-y-4">
                <div className="flex items-center -space-x-2 pl-2">
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-bold text-slate-500 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-400">
                        You
                    </div>
                    <div
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-300 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-600">
                        <Users className="h-4 w-4" />
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full rounded-xl border-dashed border-slate-300 text-slate-500 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:border-slate-700 dark:bg-transparent dark:text-slate-400 dark:hover:border-purple-700 dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
                    disabled
                >
                    + Invite Friend (Soon)
                </Button>
            </CardContent>
        </Card>
    );
}

/* --- 4. Danger Zone --- */
export function DangerZoneCard({
    tripId,
    title,
}: {
    tripId: string;
    title: string;
}) {
    return (
        <Card
            className="rounded-3xl border border-red-100 bg-red-50/30 dark:bg-red-900/10 dark:border-red-900/50 shadow-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-red-900 dark:text-red-400">
                    <Trash2 className="h-5 w-5" /> Danger Zone
                </CardTitle>
                <CardDescription className="text-red-700/80 dark:text-red-400/60">
                    Irreversible actions. Proceed with caution.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className="flex flex-col gap-4 rounded-xl border border-red-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:bg-slate-950/50 dark:border-red-900/30">
                    <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                            Delete this trip
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            Once deleted, it will be gone forever.
                        </div>
                    </div>
                    <DeleteTripClient tripId={tripId} title={title} />
                </div>
            </CardContent>
        </Card>
    );
}