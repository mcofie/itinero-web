"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DestinationMeta } from "@/app/[locale]/(main)/trips/TripActionsClient";
import { Coins, ArrowRightLeft, Loader2, RefreshCw } from "lucide-react";
import { getLatestFxSnapshot, convertUsingSnapshot } from "@/lib/fx/fx";
import { FxSnapshot } from "@/lib/fx/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
    meta: DestinationMeta | null;
    className?: string;
    baseCurrency?: string;
};

export function ExchangeRateCard({ meta, className, baseCurrency = "USD" }: Props) {
    const { currency_code } = meta || {};
    const [snapshot, setSnapshot] = React.useState<FxSnapshot | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [amount, setAmount] = React.useState<string>("1");

    React.useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                const snap = await getLatestFxSnapshot("USD");
                if (mounted) setSnapshot(snap);
            } catch (e) {
                console.error(e);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, []);

    if (!currency_code) {
        return (
            <div
                className={cn("relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm", className)}>
                <div className="flex items-center gap-4 opacity-50">
                    <Coins className="h-8 w-8 text-slate-400" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Currency</span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Unavailable</span>
                    </div>
                </div>
            </div>
        );
    }

    const val = parseFloat(amount);
    const converted = !isNaN(val) && snapshot
        ? convertUsingSnapshot(snapshot, val, baseCurrency, currency_code)
        : null;

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 p-8 shadow-sm hover:shadow-2xl transition-all duration-500",
                className
            )}
        >
            <div className="absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <ArrowRightLeft className="h-5 w-5" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Exchange Rate</h4>
                </div>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
            </div>

            <div className="space-y-6 relative z-10">
                <div className="relative group/input">
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-16 pl-6 pr-16 text-xl font-bold bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/30 dark:bg-slate-900 dark:focus:bg-slate-900 rounded-2xl transition-all"
                        placeholder="0"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {baseCurrency}
                    </div>
                </div>

                <div className="relative py-8 px-4 rounded-[2rem] bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/30 dark:border-indigo-900/20 text-center group-hover:bg-indigo-50/50 transition-colors">
                    <div className="text-4xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tighter line-clamp-1">
                        {converted ? converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "---"}
                    </div>
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-3 uppercase tracking-[0.2em]">
                        {currency_code}
                    </div>
                </div>

                {snapshot && converted !== null && (
                    <div className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-[0.1em] opacity-80">
                        1 {baseCurrency} ≈ {(converted / (val || 1)).toFixed(2)} {currency_code}
                    </div>
                )}
            </div>
        </div>
    );
}
