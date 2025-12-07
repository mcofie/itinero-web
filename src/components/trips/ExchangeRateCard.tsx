"use client";

import * as React from "react";
import {cn} from "@/lib/utils";
import {DestinationMeta} from "@/app/[locale]/(main)/trips/TripActionsClient";
import {Coins, ArrowRightLeft, Loader2, RefreshCw} from "lucide-react";
import {getLatestFxSnapshot, convertUsingSnapshot} from "@/lib/fx/fx";
import {FxSnapshot} from "@/lib/fx/types";
import {Input} from "@/components/ui/input";

type Props = {
    meta: DestinationMeta | null;
    className?: string;
    baseCurrency?: string;
};

export function ExchangeRateCard({meta, className, baseCurrency = "USD"}: Props) {
    const {currency_code} = meta || {};
    const [snapshot, setSnapshot] = React.useState<FxSnapshot | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [amount, setAmount] = React.useState<string>("1");

    React.useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                // Always fetch USD snapshot as it's the most reliable source
                // convertUsingSnapshot handles cross-rates correctly
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
    }, []); // Only load once on mount

    // Fallback if no currency data
    if (!currency_code) {
        return (
            <div
                className={cn("relative overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-sm", className)}>
                <div className="flex items-center gap-4 opacity-50">
                    <Coins className="h-10 w-10 text-slate-400"/>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Currency</span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Not available</span>
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
                "relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-sm transition-all hover:shadow-md",
                className
            )}
        >
            {/* Background Pattern */}
            <Coins className="absolute -right-4 -top-4 h-32 w-32 opacity-20 rotate-12 text-white"/>

            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between text-emerald-50">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                        Exchange Rate
                    </span>
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin opacity-50"/>
                    ) : (
                        <div
                            className="flex items-center gap-1 text-[10px] font-medium opacity-60 bg-black/10 px-2 py-0.5 rounded-full">
                            <RefreshCw className="h-3 w-3"/>
                            Live
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Input Row */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-12 rounded-xl border-0 bg-white/20 text-xl font-bold text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-white/30 px-4 tabular-nums shadow-inner"
                                placeholder="0"
                            />
                            <span
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-100">
                                {baseCurrency}
                            </span>
                        </div>
                        <ArrowRightLeft className="h-5 w-5 text-emerald-200 shrink-0"/>
                    </div>

                    {/* Result Row */}
                    <div className="flex flex-col items-end">
                        <div className="text-4xl font-extrabold tracking-tighter text-white tabular-nums leading-none">
                            {converted ? converted.toFixed(2) : "---"}
                        </div>
                        <div className="text-sm font-bold text-emerald-100 mt-1">
                            {currency_code}
                        </div>
                    </div>
                </div>

                {/* Rate Info */}
                {snapshot && converted !== null && (
                    <div
                        className="text-[10px] font-medium text-emerald-100/60 text-center border-t border-white/10 pt-3">
                        1 {baseCurrency} ≈ {(converted / (val || 1)).toFixed(2)} {currency_code}
                    </div>
                )}
            </div>
        </div>
    );
}
