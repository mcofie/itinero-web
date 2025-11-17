"use client";

import * as React from "react";

export type LodgingPickerMapProps = {
    center: { lat: number; lng: number };
    value: { lat: number; lng: number } | null;
    onChange: (coords: { lat: number; lng: number }) => void;
};

/**
 * A lightweight “fake map” used only to pick an approximate point.
 * - Renders a grid + glow background.
 * - When clicked, it computes a lat/lng offset around the given `center`.
 * - Shows a pin + coordinate pill when a value exists.
 */
export default function LodgingPickerMap({
                                             center,
                                             value,
                                             onChange,
                                         }: LodgingPickerMapProps) {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        // Fake-but-stable offset within ~±0.02°–0.03° of the center.
        const lat = center.lat + (y - 0.5) * 0.04;
        const lng = center.lng + (x - 0.5) * 0.04;

        onChange({lat, lng});
    };

    return (
        <div
            className="relative flex h-full w-full cursor-crosshair items-center justify-center overflow-hidden rounded-2xl"
            onClick={handleClick}
        >
            {/* Background “tiles” */}
            <div
                className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.25)_1px,transparent_1px)] bg-[length:32px_32px] bg-slate-900/80 dark:bg-slate-950"/>

            {/* Soft lighting */}
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),transparent_60%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.28),transparent_60%)] mix-blend-screen opacity-80"/>

            {/* Center prompt */}
            <div className="relative z-10 text-center text-[11px] text-slate-100/90 drop-shadow">
                Click anywhere to drop a pin
                {value && (
                    <div
                        className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px]">
                        {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
                    </div>
                )}
            </div>

            {/* Pin marker */}
            {value && (
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(248,113,113,0.9)]"/>
                        <div className="mx-auto mt-1 h-4 w-px bg-rose-300/70"/>
                    </div>
                </div>
            )}
        </div>
    );
}