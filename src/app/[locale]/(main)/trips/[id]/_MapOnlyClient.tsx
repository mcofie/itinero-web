// app/trips/[id]/_MapOnlyClient.tsx
"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import type { PreviewLike } from "./page";

// reuse your Leaflet component
const LeafletMap = dynamic(() => import("@/app/[locale]/(main)/preview/_leaflet/LeafletMap"), { ssr: false });
import "leaflet/dist/leaflet.css";

/**
 * Shows the currently selected day on map; defaults to day 1.
 * You can extend with a day switcher later (URL param, context, etc.)
 */
export default function MapOnlyClient({ data }: { data: PreviewLike }) {
    const [dayIdx, setDayIdx] = React.useState(0);

    // Optional: if you want to sync with hash clicks (#day-2)
    React.useEffect(() => {
        const onHash = () => {
            const m = location.hash.match(/#day-(\d+)/i);
            if (m) {
                const idx = Math.max(0, Math.min(data.days.length - 1, Number(m[1]) - 1));
                setDayIdx(idx);
            }
        };
        onHash();
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, [data.days.length]);

    return (
        <div className="h-full w-full">
            <LeafletMap day={data.days[dayIdx]} placesById={new Map(data.places.map((p) => [p.id, p]))} />
        </div>
    );
}