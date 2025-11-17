// ./src/app/rewards/verify/page.tsx
"use client";

import * as React from "react";
import {useSearchParams, useRouter} from "next/navigation";
import {CheckCircle2, Clock, RefreshCw, XCircle, ArrowLeft} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

type VerifyResponse = {
    ok: boolean;
    credited: boolean; // found matching ledger entry for this reference
    balance?: number;  // new balance (if available)
    message?: string;
};

export default function VerifyTopupPage() {
    const sp = useSearchParams();
    const router = useRouter();
    const reference = sp.get("reference") || sp.get("ref") || ""; // Paystack returns `reference`

    const [state, setState] = React.useState<
        "idle" | "checking" | "success" | "timeout" | "error"
    >("checking");
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

        setState((prev) => (prev === "success" ? prev : "checking"));

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

            // not credited yet (webhook might be lagging)
            setTries((t) => t + 1);
        } catch (e: unknown) {
            const msg =
                e instanceof Error ? e.message : "Couldn’t contact verify endpoint.";
            setState("error");
            setMessage(msg);
        }
    }, [reference]);

    // Auto-poll every 2s up to ~60s (30 tries)
    React.useEffect(() => {
        if (!reference) return;

        // ✅ If we’re in a terminal state, don’t start / restart polling
        if (state === "success" || state === "error" || state === "timeout") {
            return;
        }

        let mounted = true;
        let interval: ReturnType<typeof setInterval> | undefined;

        const start = async () => {
            await poll(); // initial

            interval = setInterval(async () => {
                if (!mounted) return;

                // If we reached a terminal state since the last render, stop polling
                if (
                    state === "success" ||
                    state === "error" ||
                    state === "timeout"
                ) {
                    if (interval) clearInterval(interval);
                    return;
                }

                if (tries >= 30) {
                    setState("timeout");
                    setMessage(
                        "We couldn’t confirm yet. Your bank may be slow. You can refresh your balance below."
                    );
                    if (interval) clearInterval(interval);
                    return;
                }

                await poll();
            }, 2000);
        };

        start();

        return () => {
            mounted = false;
            if (interval) clearInterval(interval);
        };
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
                    : RefreshCw;

    const title =
        state === "checking"
            ? "Verifying your payment"
            : state === "success"
                ? "Payment verified"
                : state === "timeout"
                    ? "Still verifying"
                    : "Verification error";

    const subtitle =
        state === "checking"
            ? "This usually takes just a few seconds."
            : state === "success"
                ? "Your points are now in your account."
                : state === "timeout"
                    ? "Your bank or network might be taking a bit longer than usual."
                    : "Something went wrong while confirming your payment.";

    const iconRingClass =
        state === "success"
            ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/30"
            : state === "error"
                ? "bg-red-500/10 text-red-500 ring-red-500/30"
                : state === "timeout"
                    ? "bg-amber-500/10 text-amber-500 ring-amber-500/30"
                    : "bg-primary/10 text-primary ring-primary/30";

    const iconClass =
        state === "checking" ? "h-8 w-8 animate-spin" : "h-8 w-8";

    return (
        <AppShell userEmail={null}>
            {/* 🔽 Less vertical space; card sits nearer top */}
            <div className="relative mx-auto w-full max-w-lg px-4 pt-8 pb-10">
                {/* Soft background glow */}
                <div
                    className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.09),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]"/>

                <Card className="relative z-10 overflow-hidden border-border/60 bg-card/90 shadow-xl backdrop-blur">
                    <CardHeader
                        className="space-y-3 border-b border-border/60 bg-gradient-to-br from-primary/5 via-background to-background">
                        <button
                            type="button"
                            onClick={() => router.push("/trips")}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-3 w-3"/>
                            Back to trips
                        </button>

                        <div className="flex items-center gap-3">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full ring-2 ${iconRingClass}`}
                            >
                                <Icon className={iconClass}/>
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold md:text-xl">
                                    {title}
                                </CardTitle>
                                <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                                    {subtitle}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5 pt-5">
                        {/* Status message */}
                        <p className="text-sm text-muted-foreground">{message}</p>

                        {/* Reference + balance block */}
                        <div
                            className="grid gap-3 rounded-xl border border-border/70 bg-muted/40 p-3 text-sm sm:grid-cols-2">
                            <div className="space-y-1">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Payment reference
                                </div>
                                <div
                                    className="inline-flex max-w-full items-center rounded-full bg-background px-3 py-1 text-xs font-mono">
                  <span className="truncate">
                    {reference || "Not available"}
                  </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Points balance
                                </div>
                                <div className="inline-flex items-baseline gap-1 rounded-xl bg-background px-3 py-2">
                  <span className="text-xs text-muted-foreground">
                    Current:
                  </span>
                                    <span className="text-base font-semibold">
                    {balance ?? "—"}
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* Helper text */}
                        <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
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
                        <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                                variant="secondary"
                                onClick={() => router.push("/trips")}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Go to trips
                            </Button>

                            <Button onClick={refreshBalance} variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4"/>
                                Refresh balance
                            </Button>

                            {state !== "success" && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setTries(0);
                                        poll();
                                    }}
                                >
                                    Try again
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}