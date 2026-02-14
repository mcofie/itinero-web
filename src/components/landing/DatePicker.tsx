// src/components/landing/HeroDatePicker.tsx
"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { useMemo, useState } from "react";
import Link from "next/link";
import { differenceInDays } from "date-fns";

export default function HeroDatePicker() {
    const [range, setRange] = useState<DateRange | undefined>({
        from: undefined,
        to: undefined,
    });

    const isInvalidRange = useMemo(() => {
        if (!range?.from || !range?.to) return false;
        return differenceInDays(range.to, range.from) >= 14;
    }, [range]);

    const summary = useMemo(() => {
        const f = range?.from ? range.from.toLocaleDateString() : "Start";
        const t = range?.to ? range.to.toLocaleDateString() : "End";
        if (isInvalidRange) return "Limit exceeded (Max 14 days)";
        return `${f} — ${t}`;
    }, [range, isInvalidRange]);

    const qs = useMemo(() => {
        const p = new URLSearchParams();
        if (range?.from) p.set("start", range.from.toISOString());
        if (range?.to) p.set("end", range.to.toISOString());
        return p.toString() ? `?${p.toString()}` : "";
    }, [range]);

    const disabled =
        !range?.from || !range?.to || range.to < range.from || isInvalidRange;

    const onSelect = (newRange: DateRange | undefined) => {
        if (newRange?.from && newRange?.to) {
            const days = differenceInDays(newRange.to, newRange.from) + 1;
            if (days > 14) return;
        }
        setRange(newRange);
    };

    return (
        <div
            className="mx-auto mt-6 w-full max-w-2xl rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/70">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Pick travel dates
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                        Choose a start and end date (max 14 days).
                    </div>
                </div>
                <div className="text-xs tabular-nums text-slate-700 dark:text-slate-300">
                    {summary}
                </div>
            </div>

            <div
                className="mt-3 rounded-lg bg-white p-2 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <Calendar
                    mode="range"
                    numberOfMonths={2}
                    selected={range}
                    onSelect={onSelect}
                    defaultMonth={range?.from}
                    className="w-full"
                    max={14}
                />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    className="border-slate-300 dark:border-slate-700"
                    onClick={() => setRange({ from: undefined, to: undefined })}
                >
                    Clear
                </Button>
                <Button asChild disabled={disabled} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href={`/signup${qs}`}>Use these dates</Link>
                </Button>
            </div>
        </div>
    );
}