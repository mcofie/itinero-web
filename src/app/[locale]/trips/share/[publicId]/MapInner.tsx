// app/share/[publicId]/MapInner.tsx
"use client";
import "leaflet/dist/leaflet.css";
import * as React from "react";
import type * as Leaflet from "leaflet";

export default function MapInner({
    places,
}: {
    places: Array<{ id: string; name: string; lat?: number | null; lng?: number | null }>;
}) {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const mapRef = React.useRef<Leaflet.Map | null>(null);

    React.useEffect(() => {
        let isStale = false;
        let L: typeof Leaflet;

        (async () => {
            L = (await import("leaflet")).default;
            if (isStale) return;

            // Ensure default marker icons resolve from CDN (avoid bundler URL issues)
            const defaultProto = L.Icon.Default.prototype as unknown as {
                _getIconUrl?: unknown;
            };
            // Some setups keep a private _getIconUrl reference; remove it so mergeOptions takes effect
            delete defaultProto._getIconUrl;

            L.Icon.Default.mergeOptions({
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            if (!ref.current) return;

            // If map already exists (e.g. from a previous effect that didn't clean up yet)
            // though mapRef.current.remove() should handle it, we safeguard.
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }

            const map = L.map(ref.current);
            mapRef.current = map;

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            const valid = places.filter(
                (p): p is { id: string; name: string; lat: number; lng: number } =>
                    Number.isFinite(p.lat) && Number.isFinite(p.lng)
            );

            if (valid.length) {
                const bounds = L.latLngBounds([]);
                valid.forEach((p) => {
                    L.marker([p.lat, p.lng]).addTo(map).bindPopup(p.name);
                    bounds.extend([p.lat, p.lng]);
                });
                map.fitBounds(bounds.pad(0.2));
            } else {
                map.setView([0, 0], 2);
            }
        })();

        return () => {
            isStale = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [places]);

    // This wrapper creates a stacking context and clips tiles/controls.
    return (
        <div className="relative isolate overflow-hidden rounded-xl border border-border/60">
            <div ref={ref} className="h-80 w-full" />
        </div>
    );
}