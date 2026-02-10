"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MapPin, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* Types adapted for the shared view */
type SharedPlace = {
    id: string;
    name: string;
    category?: string | null;
    description?: string | null;
    lat?: number | null;
    lng?: number | null;
    address?: string | null;
    photo_url?: string | null;
    rating?: number | null; // Assuming we might have this or map 'popularity' to it
    google_place_id?: string | null;
};

export default function SharedPlacesList({ places }: { places: SharedPlace[] }) {
    if (!places?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-200 dark:text-slate-700">
                    <MapPin className="h-8 w-8" />
                </motion.div>
                <p className="text-base font-medium text-slate-500 dark:text-slate-400">
                    No places added yet.
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Your discoveries will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((p, idx) => (
                <motion.div
                    key={p.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 p-6 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1.5 hover:border-blue-500/30"
                >
                    {/* Decorative Background Accent */}
                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <MapPin className="h-5 w-5" />
                            </div>
                            {p.rating && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100/50 dark:border-amber-800/30 transition-colors group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40">
                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 tabular-nums">{p.rating}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                {p.name}
                            </h3>
                            {p.category && (
                                <p className="mt-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-blue-500" />
                                    {p.category}
                                </p>
                            )}
                            {p.address && !p.category && (
                                <p className="mt-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 line-clamp-1">
                                    {p.address}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between relative z-10">
                        <div className="flex -space-x-2">
                            {/* Placeholder avatars or indicators */}
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-700" />
                                </div>
                            ))}
                        </div>
                        <a
                            href={p.google_place_id
                                ? `https://www.google.com/maps/place/?q=place_id:${p.google_place_id}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.address || ''}`)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </a>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
