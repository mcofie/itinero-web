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
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DestinationMeta } from "@/app/[locale]/(main)/trips/TripActionsClient";

type Props = {
    meta: DestinationMeta | null;
    className?: string;
};

export function WeatherWidget({ meta, className, lat, lng, startDate, endDate }: Props & { lat?: number, lng?: number, startDate?: string, endDate?: string }) {
    const [fetchedWeather, setFetchedWeather] = React.useState<{ desc: string, temp: number } | null>(null);
    const [loading, setLoading] = React.useState(false);

    const { weather_desc, weather_temp_c, city } = meta || {};
    const displayDesc = weather_desc || fetchedWeather?.desc;
    const displayTemp = weather_temp_c != null ? weather_temp_c : fetchedWeather?.temp;

    // Seasonal Calculation
    const getSeason = (month: number, latitude: number) => {
        const isNorth = latitude >= 0;
        if (month >= 2 && month <= 4) return isNorth ? "Spring" : "Autumn";
        if (month >= 5 && month <= 7) return isNorth ? "Summer" : "Winter";
        if (month >= 8 && month <= 10) return isNorth ? "Autumn" : "Spring";
        return isNorth ? "Winter" : "Summer";
    };

    const tripMonth = startDate ? new Date(startDate).getMonth() : new Date().getMonth();
    const season = getSeason(tripMonth, lat || 0);

    // Dynamic Seasonal Description & Typical Range
    const getSeasonalInsights = (s: string, latitude: number) => {
        const isNorth = latitude >= 0;
        const absLat = Math.abs(latitude);
        const isTropical = absLat < 23.5;

        if (isTropical) {
            if (s === "Summer" || s === "Autumn") return { desc: "Wet Season", condition: "Frequent showers, high humidity", range: "25°C - 32°C" };
            return { desc: "Dry Season", condition: "Clear skies, pleasant breezes", range: "20°C - 28°C" };
        }

        const insights: Record<string, { desc: string, condition: string, range: string }> = {
            "Spring": { desc: "Springtime", condition: "Refreshing blooms & mild air", range: "12°C - 20°C" },
            "Summer": { desc: "Peak Summer", condition: "Sun-drenched days & warm nights", range: "22°C - 30°C" },
            "Autumn": { desc: "Crisp Autumn", condition: "Golden leaves & cooling breezes", range: "10°C - 18°C" },
            "Winter": { desc: "Winter Frost", condition: "Cool atmosphere & crisp skies", range: "0°C - 8°C" },
        };
        return insights[s] || insights["Spring"];
    };

    const seasonal = getSeasonalInsights(season, lat || 0);

    React.useEffect(() => {
        if (!lat || !lng) return;

        async function fetchWeather() {
            setLoading(true);
            try {
                // Determine if we can get a forecast for the trip dates
                let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;

                const res = await fetch(url);
                const data = await res.json();
                if (data.current_weather) {
                    const code = data.current_weather.weathercode;
                    const descriptions: Record<number, string> = {
                        0: "Clear sky",
                        1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
                        45: "Fog", 48: "Depositing rime fog",
                        51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
                        61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
                        71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
                        95: "Thunderstorm",
                    };
                    setFetchedWeather({
                        desc: descriptions[code] || "Clear",
                        temp: data.current_weather.temperature
                    });
                }
            } catch (e) {
                console.error("Failed to fetch weather:", e);
            } finally {
                setLoading(false);
            }
        }

        fetchWeather();
    }, [lat, lng]);

    // Simple heuristic to pick an icon based on description
    const weatherKey = (displayDesc || "").toLowerCase();
    let Icon = Cloud;
    let gradient = "from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900";
    let accentColor = "text-slate-500 dark:text-slate-400";

    if (weatherKey.includes("sun") || weatherKey.includes("clear")) {
        Icon = Sun;
        gradient = "from-amber-100/50 to-orange-100/50 dark:from-amber-950/20 dark:to-orange-950/20";
        accentColor = "text-amber-600 dark:text-amber-500";
    } else if (weatherKey.includes("partly") || weatherKey.includes("cloud")) {
        Icon = CloudSun;
        gradient = "from-sky-100/50 to-blue-100/50 dark:from-sky-950/20 dark:to-blue-950/20";
        accentColor = "text-sky-600 dark:text-sky-500";
    } else if (weatherKey.includes("rain") || weatherKey.includes("shower")) {
        Icon = CloudRain;
        gradient = "from-blue-100/50 to-indigo-100/50 dark:from-blue-950/20 dark:to-indigo-950/20";
        accentColor = "text-blue-600 dark:text-blue-500";
    } else if (weatherKey.includes("storm") || weatherKey.includes("thunder")) {
        Icon = CloudLightning;
        gradient = "from-purple-100/50 to-indigo-100/50 dark:from-purple-950/20 dark:to-indigo-950/20";
        accentColor = "text-purple-600 dark:text-purple-500";
    }

    return (
        <div className={cn("relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:shadow-md", className)}>
            <div className="flex flex-col gap-6">
                {/* Header: Current Weather */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500", gradient, accentColor)}>
                            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Icon className="h-6 w-6" />}
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current in {city || "Destination"}</span>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                                    {displayTemp != null ? `${Math.round(displayTemp)}°C` : loading ? "--" : "N/A"}
                                </h4>
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{displayDesc || (loading ? "Fetching..." : "Unknown")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seasonal Outlook Section */}
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Trip Outlook • {season}</span>
                        </div>
                        {startDate && (
                            <span className="text-[9px] font-bold text-slate-400">
                                {new Date(startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                            </span>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{seasonal.desc}</span>
                            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{seasonal.range}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium italic">
                            "{seasonal.condition}"
                        </p>
                    </div>
                </div>

                {/* Quick Info Bar */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                        <Thermometer className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400">High: {displayTemp ? Math.round(displayTemp + 2) : "--"}°</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Droplets className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400">Low: {displayTemp ? Math.round(displayTemp - 4) : "--"}°</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Wind className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400">Breeze</span>
                    </div>
                </div>
            </div>
            {/* Artistic background icon blur */}
            <Icon className="absolute -right-6 -bottom-6 h-32 w-32 text-slate-200 dark:text-slate-800 opacity-20 -rotate-12 blur-sm pointer-events-none" />
        </div>
    );
}

