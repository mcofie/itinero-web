"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import L, { LatLngExpression, LatLngTuple } from "leaflet";
import React from "react";

// With Turbopack/Next these resolve to URLs (string) or to an object { src: string } depending on config.
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// ---------- helpers for asset URLs (no `any`) ----------
type ImageLike = string | { src: string } | undefined;
function isObjWithSrc(x: unknown): x is { src: string } {
    return typeof x === "object" && x !== null && "src" in x && typeof (x as { src: unknown }).src === "string";
}
const asUrl = (x: ImageLike): string | undefined => {
    if (!x) return undefined;
    return typeof x === "string" ? x : isObjWithSrc(x) ? x.src : undefined;
};

// Remove Leaflet's internal URL resolver then inject ours
// @ts-expect-error private API on purpose
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: asUrl(marker2x),
    iconUrl: asUrl(marker1x),
    shadowUrl: asUrl(markerShadow),
    // Keep sizes/anchors explicit to avoid layout quirks
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

type Day = {
    date: string;
    blocks: Array<{ when: "morning" | "afternoon" | "evening"; place_id: string | null }>;
    map_polyline?: string;
    lodging?: { name: string; lat: number; lng: number } | null;
};
type Place = { id: string; name: string; lat?: number; lng?: number; category?: string | null };

export default function LeafletMap({
                                       day,
                                       placesById,
                                   }: {
    day: Day;
    placesById: Map<string, Place>;
}) {
    const poly: LatLngTuple[] = React.useMemo(() => {
        if (day?.map_polyline) {
            try {
                return decodePolyline(day.map_polyline, 1e6);
            } catch {
                // try standard precision
                try {
                    return decodePolyline(day.map_polyline, 1e5);
                } catch {
                    // fall through to waypoint collection below
                }
            }
        }
        const coords: LatLngTuple[] = [];
        for (const b of day.blocks) {
            if (!b.place_id) continue;
            const p = placesById.get(b.place_id);
            if (typeof p?.lat === "number" && typeof p?.lng === "number") {
                coords.push([p.lat, p.lng]);
            }
        }
        return coords;
    }, [day, placesById]);

    const bounds = React.useMemo(() => {
        if (!poly.length) return null;
        const latLngs = poly.map(([lat, lng]) => L.latLng(lat, lng));
        return L.latLngBounds(latLngs);
    }, [poly]);

    const markers = React.useMemo(() => {
        const out: Array<{ pos: LatLngTuple; label: string }> = [];
        day.blocks.forEach((b) => {
            if (!b.place_id) return;
            const p = placesById.get(b.place_id);
            if (typeof p?.lat === "number" && typeof p?.lng === "number") {
                out.push({ pos: [p.lat, p.lng], label: `${capitalize(b.when)} • ${p.name}` });
            }
        });
        return out;
    }, [day, placesById]);

    const lodgingPos: LatLngTuple | null =
        day.lodging && typeof day.lodging.lat === "number" && typeof day.lodging.lng === "number"
            ? [day.lodging.lat, day.lodging.lng]
            : null;

    return (
        <div className="h-full">
            {bounds ? (
                <MapContainer
                    key={day.date}
                    bounds={bounds}
                    boundsOptions={{ padding: [24, 24] }}
                    className="h-[calc(100vh-120px)] w-full"
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {!!poly.length && <Polyline positions={poly as LatLngExpression[]} />}

                    {lodgingPos && (
                        <Marker position={lodgingPos as LatLngExpression}>
                            <Popup>{`Lodging • ${day.lodging?.name ?? ""}`}</Popup>
                        </Marker>
                    )}

                    {lodgingPos && poly.length ? (
                        <Polyline positions={[poly[poly.length - 1], lodgingPos] as LatLngExpression[]} />
                    ) : null}

                    {markers.map((m, idx) => (
                        <Marker key={idx} position={m.pos as LatLngExpression}>
                            <Popup>{m.label}</Popup>
                        </Marker>
                    ))}
                </MapContainer>
            ) : (
                <div className="grid h-[calc(100vh-120px)] place-items-center text-sm text-muted-foreground">
                    No route to display
                </div>
            )}
        </div>
    );
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// Decode polyline to Leaflet-friendly [lat, lng] tuples.
// `coordinates` is an array we mutate with push — declare as const to satisfy prefer-const (the binding isn’t reassigned).
function decodePolyline(str: string, precision = 1e5): LatLngTuple[] {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates: LatLngTuple[] = [];
    const factor = 1 / precision;

    while (index < str.length) {
        let b: number;
        let shift = 0;
        let result = 0;

        do {
            b = str.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = str.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
        lng += dlng;

        coordinates.push([lat * factor, lng * factor]);
    }

    return coordinates;
}