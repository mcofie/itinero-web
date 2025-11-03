// src/components/landing/DateRangePicker.tsx
"use client";

import * as React from "react";
import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange, Matcher } from "react-day-picker";
import { cn } from "@/lib/utils";

type Props = {
    /** Controlled value */
    value?: DateRange | null;
    /** Change handler from Calendar (react-day-picker) */
    onChange?: (range: DateRange | undefined) => void;
    /** Disable past dates */
    disablePast?: boolean;
    /** Extra className for the calendar wrapper */
    className?: string;
    /** How many months to render (default 2; set 1 for mobile at call site if you like) */
    months?: number;
};

export default function DateRangePicker({
                                            value,
                                            onChange,
                                            disablePast,
                                            className,
                                            months = 2,
                                        }: Props) {
    // Normalize possibly-null/partial into a proper DateRange or undefined
    const selected: DateRange | undefined = useMemo(() => {
        if (!value) return undefined;
        return {
            from: value.from ?? undefined,
            to: value.to ?? undefined,
        };
    }, [value]);

    const disabled: Matcher[] | undefined = useMemo(() => {
        if (!disablePast) return undefined;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return [{ before: today }];
    }, [disablePast]);

    return (
        <Calendar
            mode="range"
            numberOfMonths={months}
            selected={selected}
            onSelect={onChange}
            disabled={disabled}
            className={cn("rounded-xl border bg-card p-3 md:p-4", className)}
        />
    );
}