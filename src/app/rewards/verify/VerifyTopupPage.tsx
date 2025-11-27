"use client";

import * as React from "react";
import {useSearchParams, useRouter} from "next/navigation";
import {
    CheckCircle2,
    Clock,
    RefreshCw,
    XCircle,
    ArrowLeft,
    Loader2,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";

type VerifyState = "checking" | "success" | "timeout" | "error";

type VerifyResponse = {
    ok: boolean;
    credited: boolean; // found matching ledger entry for this reference
    balance?: number; // new balance (if available)
    message?: string;
};

export default function VerifyTopupPage() {
    const sp = useSearchParams();
    const router = useRouter();
    const reference = sp.get("reference") || sp.get("ref") || "";

    const [state, setState] = React.useState<VerifyState>("checking");
    const [message, setMessage] = React.useState<string>(
        "Hang tight, we’re verifying your payment…"
    );
    const [balance, setBalance] = React.useState<number | null>(null);
    const [tries, setTries] = React.useState(0);

    const poll = React.useCallback(async () => {
        if (!reference) {
            setState("error");
            setMessage("Missing payment reference.");
            return;
        }

        setState("checking");

        try {
            const r = await fetch(
                `/api/rewards/verify?reference=${encodeURIComponent(reference)}`,
                {
                    method: "GET",
                    headers: {"Content-Type": "application/json"},
                    cache: "no-store",
                }
            );

            const data = (await r.json()) as VerifyResponse;

            if (!data.ok) {
                setState("error");
                setMessage(data.message || "Verification failed.");
                return;
            }

            if (data.credited) {
                setState("success");
                setBalance(typeof data.balance === "number" ? data.balance : null);
                setMessage("Payment verified and points added to your balance.");
                return;
            }

            // Not credited yet (webhook may be lagging)
            setTries((t) => t + 1);
        } catch (e: unknown) {
            const msg =
                e instanceof Error ? e.message : "Couldn’t contact verify endpoint.";
            setState("error");
            setMessage(msg);
        }
    }, [reference]);

    // Auto-poll every 2s up to ~60s (30 tries), stop on terminal states
    React.useEffect(() => {
        if (!reference) return;

        if (state === "success" || state === "error" || state === "timeout") {
            return;
        }

        if (tries >= 30) {
            setState("timeout");
            setMessage(
                "We couldn’t confirm yet. Your bank may be slow. You can refresh your balance below."
            );
            return;
        }

        const timeoutId = setTimeout(() => {
            void poll();
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [reference, state, tries, poll]);

    async function refreshBalance() {
        try {
            const r = await fetch("/api/points/balance", {cache: "no-store"});
            const data = (await r.json()) as {
                ok: boolean;
                balance?: number;
                message?: string;
            };
            if (data.ok && typeof data.balance === "number") {
                setBalance(data.balance);
                setMessage("Balance refreshed.");
            } else {
                setMessage(data.message || "Couldn’t refresh balance.");
            }
        } catch {
            setMessage("Couldn’t refresh balance.");
        }
    }

    const Icon =
        state === "success"
            ? CheckCircle2
            : state === "error"
                ? XCircle
                : state === "timeout"
                    ? Clock
                    : Loader2;

    const title =
        state === "checking"
            ? "Verifying Payment"
            : state === "success"
                ? "Payment Verified"
                : state === "timeout"
                    ? "Still Verifying"
                    : "Verification Error";

    const subtitle =
        state === "checking"
            ? "This usually takes just a few seconds."
            : state === "success"
                ? "Your points are now in your account."
                : state === "timeout"
                    ? "Your bank or network might be taking a bit longer than usual."
                    : "Something went wrong while confirming your payment.";

    // Theme-aware styles for status icons
    const iconStyles = {
        success:
            "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
        error:
            "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20",
        timeout:
            "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
        checking:
            "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
    };

    const currentStyle = iconStyles[state] || iconStyles.checking;

    return (
        <AppShell userEmail={null}>
            <div
                className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center px-4 py-12 transition-colors duration-300">

                {/* Decorative Background Glow */}
                <div
                    className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent -z-10 pointer-events-none"/>

                <div className="relative z-10 w-full max-w-md">
                    <Card
                        className="overflow-hidden border-slate-200 bg-white shadow-xl shadow-slate-200/40 rounded-3xl dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                        <CardHeader
                            className="border-b border-slate-100 bg-white/50 px-6 py-6 dark:bg-slate-900/50 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => router.push("/trips")}
                                className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5"/>
                                Back to trips
                            </button>

                            <div className="flex items-start gap-4">
                                <div
                                    className={cn(
                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-4",
                                        currentStyle
                                    )}
                                >
                                    <Icon className={cn("h-6 w-6", state === "checking" && "animate-spin")}/>
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                        {title}
                                    </CardTitle>
                                    <p className="mt-1.5 text-sm text-slate-500 leading-relaxed dark:text-slate-400">
                                        {subtitle}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-6 px-6 py-6">
                            {/* Status message */}
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {message}
                            </div>

                            {/* Reference + balance block */}
                            <div
                                className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2 dark:bg-slate-950/50 dark:border-slate-800">
                                <div className="space-y-1.5">
                                    <div
                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        Payment Ref
                                    </div>
                                    <div
                                        className="inline-flex max-w-full items-center rounded-md bg-white px-2 py-1 text-xs font-mono text-slate-600 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                    <span className="truncate">
                      {reference || "Not available"}
                    </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div
                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                        New Balance
                                    </div>
                                    <div className="inline-flex items-baseline gap-1">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {balance ?? "—"}
                    </span>
                                        <span
                                            className="text-xs font-medium text-slate-500 dark:text-slate-400">pts</span>
                                    </div>
                                </div>
                            </div>

                            {/* Helper text */}
                            <div
                                className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30">
                                {state === "success" ? (
                                    <>You can now use your new points to unlock full itineraries.</>
                                ) : state === "timeout" ? (
                                    <>
                                        If your bank eventually completes the payment, your points
                                        will still be credited. You can refresh your balance at any
                                        time.
                                    </>
                                ) : state === "error" ? (
                                    <>
                                        If you were debited but we can’t find the payment, please
                                        contact support with your reference above.
                                    </>
                                ) : (
                                    <>We’re checking with the payment provider and your bank.</>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                <Button
                                    variant="default"
                                    onClick={() => router.push("/trips")}
                                    className="flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                >
                                    Go to Trips
                                </Button>

                                <Button
                                    onClick={refreshBalance}
                                    variant="outline"
                                    className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4"/>
                                    Refresh
                                </Button>

                                {state !== "success" && state !== "checking" && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setTries(0);
                                            void poll();
                                        }}
                                        className="flex-1 rounded-xl hover:bg-slate-100 text-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >
                                        Try again
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}