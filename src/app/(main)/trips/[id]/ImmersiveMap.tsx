"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Place, Day } from "./page";

type LeafletMapProps = {
    theme?: "light" | "dark";
    day: Day | null;
    placesById: Map<string, Place>;
    selectedItemId?: string | null;
    onMarkerClick?: (itemId: string) => void;
};

const LeafletMap = dynamic<LeafletMapProps>(
    () => import("@/app/(main)/preview/_leaflet/LeafletMap"),
    { ssr: false }
);

export function ImmersiveMap({
    days,
    placesById,
    theme,
}: {
    days: Day[];
    placesById: Map<string, Place>;
    theme?: "light" | "dark";
}) {
    // Flatten all blocks to find all places
    // For the immersive map, we might want to show ALL points, not just one day.
    // The current LeafletMap might only support one day.
    // Let's check LeafletMap implementation if possible, but assuming it takes `day`.
    // If we want all points, we might need to construct a "fake" day containing all blocks.

    const allBlocks = React.useMemo(() => days.flatMap((d) => d.blocks), [days]);

    const fakeDay: Day = React.useMemo(() => ({
        date: "",
        blocks: allBlocks,
    }), [allBlocks]);

    return (
        <div className="relative h-[calc(100vh-250px)] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-sm dark:border-slate-800">
            <LeafletMap
                day={fakeDay}
                placesById={placesById}
                theme={theme}
            />

            {/* Overlay Controls could go here */}
            <div className="absolute bottom-6 left-6 z-[400] rounded-xl bg-white/90 px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-md dark:bg-slate-900/90 dark:text-white">
                Showing {allBlocks.length} locations
            </div>
        </div>
    );
}
