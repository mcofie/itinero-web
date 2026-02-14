"use client";

import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Place {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

interface ItineraryMapProps {
    places: Place[];
    center?: [number, number];
    zoom?: number;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

export default function ItineraryMap({ places, center, zoom = 13 }: ItineraryMapProps) {
    const mapCenter: [number, number] = center || [
        places[0]?.lat || 0,
        places[0]?.lng || 0
    ];

    const polyline = places.map(p => [p.lat, p.lng] as [number, number]);

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="map-tiles"
                />

                {places.map((place, idx) => (
                    <Marker key={place.id} position={[place.lat, place.lng]}>
                        <Popup>
                            <div className="font-bold">{place.name}</div>
                            <div className="text-xs uppercase text-slate-500">Stop #{idx + 1}</div>
                        </Popup>
                    </Marker>
                ))}

                {places.length > 1 && (
                    <Polyline
                        positions={polyline}
                        color="#3b82f6"
                        weight={3}
                        opacity={0.6}
                        dashArray="10, 10"
                    />
                )}

                <ChangeView center={mapCenter} zoom={zoom} />
            </MapContainer>

            <style jsx global>{`
                .leaflet-container {
                    background: #f8fafc;
                }
                .dark .leaflet-container {
                    background: #020617;
                    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
                }
                .map-tiles {
                    filter: grayscale(10%) contrast(110%);
                }
            `}</style>
        </div>
    );
}
