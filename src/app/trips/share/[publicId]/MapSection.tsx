// app/share/[publicId]/MapSection.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";

// If you use react-leaflet components, dynamically import the inner map:
const MapInner = dynamic(() => import("./MapInner"), {ssr: false});

export default function MapSection({
                                       places,
                                   }: {
    places: Array<{ id: string; name: string; lat?: number | null; lng?: number | null }>;
}) {
    return <MapInner places={places}/>;
}