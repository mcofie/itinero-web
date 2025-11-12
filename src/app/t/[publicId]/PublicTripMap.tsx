"use client";

import * as React from "react";
import {MapContainer, TileLayer, Marker, Popup, useMap} from "react-leaflet";
import type {LatLngBoundsExpression} from "leaflet";
import L from "leaflet";

// If your project already patches the default icon globally, you can delete this block.
import "leaflet/dist/leaflet.css";

const DefaultIcon = L.icon({
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export type MapPlace = {
    id: string;
    name: string;
    lat: number;
    lng: number;
};

function FitBounds({places}: { places: MapPlace[] }) {
    const map = useMap();
    React.useEffect(() => {
        if (!places.length) return;
        if (places.length === 1) {
            map.setView([places[0].lat, places[0].lng], 14, {animate: false});
            return;
        }
        const bounds = L.latLngBounds(places.map(p => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds as LatLngBoundsExpression, {padding: [40, 40], maxZoom: 15});
    }, [map, places]);
    return null;
}

export default function PublicTripMap({places}: { places: MapPlace[] }) {
    const valid = places.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
    const center = valid.length
        ? ([valid[0].lat, valid[0].lng] as [number, number])
        : ([0, 0] as [number, number]);

    return (
        <div className="h-[360px] w-full overflow-hidden rounded-xl border border-border/60">
            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={true}
                style={{height: "100%", width: "100%"}}
            >
                {/* Use your project’s tile layer if you have one configured */}
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitBounds places={valid}/>

                {valid.map(p => {
                    const gmaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.lat},${p.lng}`)}`;
                    return (
                        <Marker key={p.id} position={[p.lat, p.lng]}>
                            <Popup>
                                <div className="space-y-1">
                                    <div className="font-semibold">{p.name}</div>
                                    <a
                                        href={gmaps}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm"
                                    >
                                        Open in Google Maps
                                        {/* tiny arrow icon */}
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2">
                                            <path d="M7 7h10v10"/>
                                            <path d="M7 17 17 7"/>
                                        </svg>
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}