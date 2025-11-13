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
    credited: boolean;  // found matching ledger entry for this reference
    balance?: number;   // new balance (if available)
    message?: string;
};

export default function VerifyTopupPage() {
    const sp = useSearchParams();
    const router = useRouter();
    const reference = sp.get("reference") || sp.get("ref") || ""; // Paystack returns `reference`

    const [state, setState] = React.useState<"idle" | "checking" | "success" | "timeout" | "error">("checking");
    const [message, setMessage] = React.useState<string>("Hang tight, we’re verifying your payment…");
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
            const r = await fetch(`/api/rewards/verify?reference=${encodeURIComponent(reference)}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                cache: "no-store",
            });
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
            const msg = e instanceof Error ? e.message : "Couldn’t contact verify endpoint.";
            setState("error");
            setMessage(msg);
        }
    }, [reference]);

    // Auto-poll every 2s up to ~60s (30 tries)
    React.useEffect(() => {
        if (!reference) return;
        let mounted = true;
        let interval: ReturnType<typeof setInterval> | undefined;

        const start = async () => {
            await poll(); // initial
            interval = setInterval(async () => {
                if (!mounted) return;
                if (state === "success" || state === "error") {
                    if (interval) clearInterval(interval);
                    return;
                }
                if (tries >= 30) {
                    setState("timeout");
                    setMessage("We couldn’t confirm yet. Your bank may be slow. You can refresh your balance below.");
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reference, tries]);

    async function refreshBalance() {
        try {
            const r = await fetch("/api/points/balance", {cache: "no-store"});
            const data = (await r.json()) as { ok: boolean; balance?: number; message?: string };
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
        state === "success" ? CheckCircle2 :
            state === "error" ? XCircle :
                state === "timeout" ? Clock :
                    RefreshCw;

    return (
        <AppShell userEmail={null}>
            <div className="mx-auto w-full max-w-md px-4 py-10">
                <Card className="overflow-hidden border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icon
                                className={
                                    state === "success"
                                        ? "text-green-600"
                                        : state === "error"
                                            ? "text-red-600"
                                            : state === "timeout"
                                                ? "text-amber-600"
                                                : "animate-spin"
                                }
                            />
                            {state === "checking"
                                ? "Verifying payment"
                                : state === "success"
                                    ? "Payment verified"
                                    : state === "timeout"
                                        ? "Still verifying"
                                        : "Verification error"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{message}</p>

                        <div className="rounded-md border border-border p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Reference</span>
                                <span className="font-mono text-xs">{reference || "—"}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-muted-foreground">Points balance</span>
                                <span className="font-medium">{balance ?? "—"}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" onClick={() => router.push("/trips")}>
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Continue
                            </Button>
                            <Button onClick={refreshBalance}>
                                <RefreshCw className="mr-2 h-4 w-4"/>
                                Refresh balance
                            </Button>
                            {state !== "success" && (
                                <Button
                                    variant="outline"
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