"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function Globe({ className }: { className?: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;

        if (!canvasRef.current) return;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [0.1, 0.8, 1],
            glowColor: [1, 1, 1],
            markers: [
                // location: [latitude, longitude], size: [0..1]
                { location: [37.7595, -122.4367], size: 0.03 }, // San Francisco
                { location: [40.7128, -74.006], size: 0.1 }, // New York
                { location: [51.5074, -0.1278], size: 0.05 }, // London
                { location: [5.6037, -0.1870], size: 0.1 }, // Accra
                { location: [-1.2921, 36.8219], size: 0.08 }, // Nairobi
                { location: [-33.9249, 18.4241], size: 0.08 }, // Cape Town
                { location: [35.6762, 139.6503], size: 0.05 }, // Tokyo
                { location: [25.2048, 55.2708], size: 0.05 }, // Dubai
            ],
            onRender: (state) => {
                // Called on every animation frame.
                // `state` will be an empty object, return updated params.
                state.phi = phi;
                phi += 0.01;
            },
        });

        return () => {
            globe.destroy();
        };
    }, []);

    return (
        <div className={cn("relative flex items-center justify-center w-full h-full", className)}>
            <canvas
                ref={canvasRef}
                style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
                className="opacity-90 transition-opacity duration-500 hover:opacity-100"
            />
        </div>
    );
}
