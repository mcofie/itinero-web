
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sun, Moon, Sunset, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
type Slot = "Morning" | "Afternoon" | "Evening";

const DAYS: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS: { id: Slot; label: string; icon: React.ElementType }[] = [
    { id: "Morning", label: "Morning", icon: Sun },
    { id: "Afternoon", label: "Afternoon", icon: Sunset },
    { id: "Evening", label: "Evening", icon: Moon },
];

export type Availability = Record<DayOfWeek, Slot[]>;

interface Props {
    value: Availability;
    onChange: (value: Availability) => void;
    disabled?: boolean;
}

export function AvailabilityPicker({ value, onChange, disabled }: Props) {
    const toggleSlot = (day: DayOfWeek, slot: Slot) => {
        if (disabled) return;
        const currentSlots = value[day] || [];
        const newSlots = currentSlots.includes(slot)
            ? currentSlots.filter((s) => s !== slot)
            : [...currentSlots, slot];

        onChange({
            ...value,
            [day]: newSlots,
        });
    };

    const toggleDay = (day: DayOfWeek) => {
        if (disabled) return;
        // If has slots, clear all. If empty, select all.
        const currentSlots = value[day] || [];
        if (currentSlots.length > 0) {
            onChange({
                ...value,
                [day]: [],
            });
        } else {
            onChange({
                ...value,
                [day]: ["Morning", "Afternoon", "Evening"],
            });
        }
    };

    return (
        <div className="space-y-3 select-none">
            {DAYS.map((day) => {
                const daySlots = value[day] || [];
                const isActive = daySlots.length > 0;

                return (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                        <button
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-bold text-sm transition-all",
                                isActive
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                            )}
                        >
                            {day}
                        </button>

                        <div className="flex flex-wrap gap-2 flex-1">
                            {SLOTS.map((slot) => {
                                const isSelected = daySlots.includes(slot.id);
                                const Icon = slot.icon;

                                return (
                                    <button
                                        key={slot.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => toggleSlot(day, slot.id)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                            isSelected
                                                ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 shadow-sm"
                                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700"
                                        )}
                                    >
                                        <Icon className="h-3 w-3" />
                                        <span>{slot.label}</span>
                                        {isSelected && <Check className="h-3 w-3 ml-0.5" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function formatAvailability(avail: Availability): string {
    return JSON.stringify(avail);
}
