"use client";

import dynamic from "next/dynamic";
import * as React from "react";

const Map = dynamic(() => import("./ItineraryMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Map...</div>
        </div>
    )
});

interface Place {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

export default function DynamicItineraryMap(props: { places: Place[] }) {
    return <Map {...props} />;
}
