"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { format } from "date-fns";
import { MapPin, Clock3, DollarSign, CalendarDays, ArrowRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Day, Place } from "./page";

export function StoryView({
    days,
    placesById,
    currency,
}: {
    days: Day[];
    placesById: Map<string, Place>;
    currency: string;
}) {
    return (
        <div className="relative mx-auto max-w-3xl space-y-24 pb-32 pt-12">
            {/* Central Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent dark:via-slate-800 md:left-1/2" />

            {days.map((day, dayIdx) => (
                <StoryChapter
                    key={dayIdx}
                    day={day}
                    dayIdx={dayIdx}
                    placesById={placesById}
                    currency={currency}
                />
            ))}
        </div>
    );
}

function StoryChapter({
    day,
    dayIdx,
    placesById,
    currency,
}: {
    day: Day;
    dayIdx: number;
    placesById: Map<string, Place>;
    currency: string;
}) {
    const date = new Date(day.date);
    const weekday = format(date, "EEEE");
    const fullDate = format(date, "MMMM do, yyyy");

    return (
        <div className="relative">
            {/* Chapter Header */}
            <div className="sticky top-24 z-20 mb-12 flex items-center justify-center">
                <div className="relative rounded-full border border-slate-200 bg-white px-6 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {dayIdx + 1}
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                                {weekday}
                            </div>
                            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {fullDate}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blocks */}
            <div className="space-y-16">
                {day.blocks.map((block, i) => {
                    const place = block.place_id ? placesById.get(block.place_id) : null;
                    const isEven = i % 2 === 0;

                    return (
                        <StoryBlock
                            key={i}
                            block={block}
                            place={place}
                            currency={currency}
                            isEven={isEven}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function StoryBlock({
    block,
    place,
    currency,
    isEven,
}: {
    block: Day["blocks"][0];
    place: Place | null | undefined;
    currency: string;
    isEven: boolean;
}) {
    const ref = React.useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <motion.div
            ref={ref}
            style={{ opacity }}
            className={cn(
                "relative flex flex-col gap-8 md:flex-row md:items-center",
                isEven ? "md:flex-row-reverse" : ""
            )}
        >
            {/* Timeline Dot */}
            <div className="absolute left-8 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-blue-500 shadow-sm dark:border-slate-950 md:left-1/2" />

            {/* Content Card */}
            <div className={cn("ml-16 flex-1 md:ml-0", isEven ? "md:pr-12" : "md:pl-12")}>
                <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {block.when}
                        </span>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5" />
                                {block.duration_min}m
                            </span>
                            {block.est_cost > 0 && (
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <DollarSign className="h-3.5 w-3.5" />
                                    {block.est_cost}
                                </span>
                            )}
                        </div>
                    </div>

                    <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                        {block.title}
                    </h3>

                    {block.notes && (
                        <div className="mb-4 flex gap-3 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:bg-amber-900/20 dark:text-amber-200">
                            <Quote className="h-5 w-5 shrink-0 opacity-50" />
                            <p>{block.notes}</p>
                        </div>
                    )}

                    {place && (
                        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors group-hover:border-blue-100 group-hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-800/50 dark:group-hover:border-blue-900 dark:group-hover:bg-blue-900/20">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                                <MapPin className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="truncate font-bold text-slate-900 dark:text-white">
                                    {place.name}
                                </div>
                                {place.category && (
                                    <div className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {place.category}
                                    </div>
                                )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-400 dark:text-slate-600" />
                        </div>
                    )}
                </div>
            </div>

            {/* Empty space for the other side of the timeline */}
            <div className="hidden flex-1 md:block" />
        </motion.div>
    );
}
