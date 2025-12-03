"use client";

import * as React from "react";
import {
    Cloud,
    CloudDrizzle,
    CloudFog,
    CloudLightning,
    CloudRain,
    CloudSnow,
    CloudSun,
    Sun,
    Wind,
    Thermometer,
    Droplets,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DestinationMeta } from "@/app/(main)/trips/TripActionsClient";

type Props = {
    meta: DestinationMeta | null;
    className?: string;
};

export function WeatherWidget({ meta, className }: Props) {
    const { weather_desc, weather_temp_c } = meta || {};

    if (!weather_desc && weather_temp_c == null) {
        return (
            <div className={cn("relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm", className)}>
                <div className="flex items-center gap-4 opacity-50">
                    <Cloud className="h-10 w-10 text-slate-400" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Weather</span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Not available</span>
                    </div>
                </div>
            </div>
        );
    }

    // Simple heuristic to pick an icon based on description
    const desc = (weather_desc || "").toLowerCase();
    let Icon = Cloud;
    let gradient = "from-blue-400 to-blue-600";
    let textColor = "text-blue-50";

    if (desc.includes("sun") || desc.includes("clear")) {
        Icon = Sun;
        gradient = "from-amber-400 to-orange-500";
        textColor = "text-amber-50";
    } else if (desc.includes("partly") || desc.includes("cloud")) {
        Icon = CloudSun;
        gradient = "from-sky-400 to-blue-500";
        textColor = "text-sky-50";
    } else if (desc.includes("rain") || desc.includes("shower")) {
        Icon = CloudRain;
        gradient = "from-slate-600 to-slate-800";
        textColor = "text-slate-200";
    } else if (desc.includes("drizzle")) {
        Icon = CloudDrizzle;
        gradient = "from-slate-400 to-slate-600";
        textColor = "text-slate-100";
    } else if (desc.includes("storm") || desc.includes("thunder")) {
        Icon = CloudLightning;
        gradient = "from-indigo-600 to-purple-700";
        textColor = "text-indigo-100";
    } else if (desc.includes("snow") || desc.includes("ice")) {
        Icon = CloudSnow;
        gradient = "from-cyan-100 to-blue-200";
        textColor = "text-blue-900"; // Dark text for light bg
    } else if (desc.includes("fog") || desc.includes("mist")) {
        Icon = CloudFog;
        gradient = "from-slate-300 to-slate-400";
        textColor = "text-slate-800";
    } else if (desc.includes("wind")) {
        Icon = Wind;
        gradient = "from-teal-400 to-teal-600";
        textColor = "text-teal-50";
    }

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 shadow-sm transition-all hover:shadow-md",
                gradient,
                className
            )}
        >
            {/* Background Pattern */}
            <Icon className="absolute -right-4 -top-4 h-32 w-32 opacity-20 rotate-12" />

            <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                <div className="flex items-start justify-between">
                    <div className={cn("flex flex-col", textColor)}>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                            Forecast
                        </span>
                        <span className="text-lg font-bold capitalize leading-tight">
                            {weather_desc || "Unknown"}
                        </span>
                    </div>
                    <div className={cn("rounded-full bg-white/20 p-2 backdrop-blur-sm", textColor)}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>

                <div className="flex items-end gap-1">
                    {weather_temp_c != null && (
                        <div className={cn("text-5xl font-extrabold tracking-tighter", textColor)}>
                            {Math.round(weather_temp_c)}°
                        </div>
                    )}
                    {weather_temp_c != null && (
                        <div className={cn("mb-1.5 text-lg font-medium opacity-80", textColor)}>
                            C
                        </div>
                    )}
                </div>

                {/* Extra details (fake for now if not in meta, or derived) */}
                <div className={cn("flex gap-4 text-xs font-medium opacity-80", textColor)}>
                    <div className="flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5" />
                        <span>Feels like {weather_temp_c != null ? Math.round(weather_temp_c) : "--"}°</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5" />
                        <span>Humidity --%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
