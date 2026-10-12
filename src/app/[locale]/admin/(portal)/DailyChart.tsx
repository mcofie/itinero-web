"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type DailyPoint = { date: string; orders: number; revenue: number };

const METRICS = {
    orders: { label: "Orders", format: (value: number) => String(value) },
    revenue: { label: "Revenue", format: (value: number) => `GHS ${value.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` },
} as const;
type Metric = keyof typeof METRICS;

const dayLabel = (date: string, long = false) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", long ? { weekday: "short", day: "numeric", month: "short" } : { day: "numeric", month: "short" });

/** Rounds the axis maximum up to a readable step. */
function niceMax(value: number) {
    if (value <= 4) return 4;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const step = [1, 2, 2.5, 5, 10].find(candidate => candidate * magnitude >= value / 4)! * magnitude;
    return Math.ceil(value / step) * step;
}

/** Single-series daily column chart with a per-day hover tooltip and a table view. */
export default function DailyChart({ points }: { points: DailyPoint[] }) {
    const [metric, setMetric] = useState<Metric>("orders");
    const [hovered, setHovered] = useState<number | null>(null);
    const values = points.map(point => point[metric]);
    const max = niceMax(Math.max(0, ...values));
    const ticks = [max, max / 2, 0];
    const format = METRICS[metric].format;
    const labelIndexes = new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]);

    return <div>
        <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[.14em] text-[#8a7d70]">{METRICS[metric].label} per day</h2>
            <div className="flex rounded-lg border border-[#e2d6c7] bg-white p-0.5 text-xs font-semibold" role="group" aria-label="Chart measure">
                {(Object.keys(METRICS) as Metric[]).map(key => <button key={key} type="button" aria-pressed={metric === key} onClick={() => setMetric(key)}
                    className={cn("rounded-md px-2.5 py-1 transition", metric === key ? "bg-[#2b1a07] text-white" : "text-[#6d5c4b] hover:bg-[#f6efe6]")}>{METRICS[key].label}</button>)}
            </div>
        </div>

        <div className="flex gap-2">
            <div className="flex h-48 w-14 shrink-0 flex-col justify-between text-right text-[10px] tabular-nums text-[#a89a8a]" aria-hidden>
                {ticks.map(tick => <span key={tick} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{metric === "revenue" ? tick.toLocaleString("en-GB") : tick}</span>)}
            </div>
            <div className="relative min-w-0 flex-1">
                <div className="absolute inset-0 flex flex-col justify-between" aria-hidden>
                    {ticks.map(tick => <span key={tick} className={cn("border-t", tick === 0 ? "border-[#d9cbb9]" : "border-dashed border-[#eee4d8]")} />)}
                </div>
                <div className="relative flex h-48 items-end gap-[2px]" role="img" aria-label={`${METRICS[metric].label} per day, ${dayLabel(points[0]?.date ?? "")} to ${dayLabel(points.at(-1)?.date ?? "")}`} onMouseLeave={() => setHovered(null)}>
                    {points.map((point, index) => {
                        const value = point[metric];
                        return <div key={point.date} className="relative flex h-full min-w-0 flex-1 cursor-default items-end justify-center" onMouseEnter={() => setHovered(index)}>
                            {value > 0 && <div className={cn("w-full max-w-6 rounded-t-[4px] transition-colors", hovered === index ? "bg-[#9c5528]" : "bg-[#c16b36]")} style={{ height: `${Math.max(2, value / max * 100)}%` }} />}
                            {hovered === index && <div className={cn("pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-[#2b1a07] px-2.5 py-1.5 text-xs text-white shadow-lg",
                                index < points.length / 3 ? "left-0" : index > points.length * 2 / 3 ? "right-0" : "left-1/2 -translate-x-1/2")}>
                                <span className="block text-[10px] text-white/70">{dayLabel(point.date, true)}</span>
                                {point.orders} {point.orders === 1 ? "order" : "orders"} · GHS {point.revenue.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                            </div>}
                        </div>;
                    })}
                </div>
                <div className="mt-2 flex text-[10px] text-[#a89a8a]" aria-hidden>
                    {points.map((point, index) => <span key={point.date} className={cn("min-w-0 flex-1 whitespace-nowrap", index === points.length - 1 ? "text-right" : index === 0 ? "text-left" : "text-center")}>
                        {labelIndexes.has(index) ? dayLabel(point.date) : ""}
                    </span>)}
                </div>
            </div>
        </div>

        <details className="mt-3 text-xs text-[#6d5c4b]">
            <summary className="cursor-pointer font-semibold">Show as table</summary>
            <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-[#eee4d8]">
                <table className="w-full text-left tabular-nums">
                    <thead className="sticky top-0 bg-[#f6f0e8]"><tr><th className="px-3 py-1.5">Day</th><th className="px-3 py-1.5 text-right">Orders</th><th className="px-3 py-1.5 text-right">Revenue</th></tr></thead>
                    <tbody>{points.filter(point => point.orders > 0).map(point => <tr key={point.date} className="border-t border-[#f0e8dd]"><td className="px-3 py-1.5">{dayLabel(point.date, true)}</td><td className="px-3 py-1.5 text-right">{point.orders}</td><td className="px-3 py-1.5 text-right">{METRICS.revenue.format(point.revenue)}</td></tr>)}</tbody>
                </table>
            </div>
        </details>
    </div>;
}
