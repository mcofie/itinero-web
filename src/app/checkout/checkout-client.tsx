"use client";

import * as React from "react";
import {useSearchParams, useRouter} from "next/navigation";
import {getSupabaseBrowser} from "@/lib/supabase/browser-singleton";
import {
    Loader2,
    CreditCard,
    ShieldCheck,
    Sparkles,
    ArrowLeft,
    Wallet,
} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";
import {getLatestFxSnapshot, convertUsingSnapshot} from "@/lib/fx/fx";
import {FxSnapshot} from "@/lib/fx/types";
import {toast} from "sonner";
import {cn} from "@/lib/utils";

const POINT_UNIT_PRICE_GHS = 0.4; // 40 pesewas base

export default function CheckoutClient({userEmail}: { userEmail: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sb = React.useMemo(() => getSupabaseBrowser(), []);

    // -- State --
    const [points, setPoints] = React.useState<number>(100);

    // FX State
    const [fxSnapshot, setFxSnapshot] = React.useState<FxSnapshot | null>(null);
    const [loadingFx, setLoadingFx] = React.useState(true);

    // Processing State
    const [isProcessing, setIsProcessing] = React.useState(false);

    // -- 1. Initialize Data --
    React.useEffect(() => {
        const init = async () => {
            // 1. Get Query Param
            const qPoints = searchParams.get("points");
            if (qPoints && !isNaN(Number(qPoints))) {
                setPoints(Math.max(10, parseInt(qPoints)));
            }

            // 2. Fetch FX
            try {
                const snap = await getLatestFxSnapshot("USD");
                setFxSnapshot(snap);
            } catch (e) {
                console.error("Failed to load FX", e);
            } finally {
                setLoadingFx(false);
            }
        };

        init();
    }, [searchParams]);

    // -- Calculations --
    // We default to displaying GHS as the payment currency
    const totalCostGHS = points * POINT_UNIT_PRICE_GHS;

    // Optional: Show USD estimate if we have FX data
    const totalCostUSD = fxSnapshot
        ? convertUsingSnapshot(fxSnapshot, totalCostGHS, "GHS", "USD")
        : null;

    // -- Handlers --
    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) setPoints(val);
    };

    const handleCheckout = async () => {
        if (points < 10) {
            toast.error("Minimum purchase is 10 points");
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Get Server Quote
            const qRes = await fetch("/api/points/quote", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({points}),
            });

            if (!qRes.ok) throw new Error("Failed to generate quote");
            const quote = await qRes.json();

            // 2. Initialize Paystack
            const initRes = await fetch("/api/paystack/init", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    quoteId: quote.quoteId,
                    email: userEmail,
                }),
            });

            if (!initRes.ok) throw new Error("Payment initialization failed");

            const init = await initRes.json();

            // 3. Redirect to Paystack
            window.location.href = init.authorization_url;
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
            setIsProcessing(false);
        }
    };

    if (loadingFx) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400"/>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Simple Header */}
            <header
                className="sticky top-0 z-10 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-800">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <div
                        className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                            <CreditCard className="h-4 w-4"/>
                        </div>
                        Itinero Checkout
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4"/> Cancel
                    </Button>
                </div>
            </header>

            <main className="mx-auto w-full max-w-4xl px-4 py-12">
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left: Inputs & Config */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Top Up Points
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                Add points to your wallet to unlock premium itineraries, export to
                                PDF, and sync with your calendar.
                            </p>
                        </div>

                        <Card className="border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-lg">How many points?</CardTitle>
                                <CardDescription>
                                    100 points = 1 Full Itinerary Unlock
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Preset Buttons */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[50, 100, 250].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setPoints(val)}
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-1 rounded-xl border p-4 transition-all",
                                                points === val
                                                    ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300"
                                                    : "bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900"
                                            )}
                                        >
                                            <span className="text-lg font-bold">{val}</span>
                                            <span className="text-xs font-medium opacity-70">
                        Points
                      </span>
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="custom-amount">Custom Amount</Label>
                                    <div className="relative">
                                        <Wallet className="absolute left-3 top-2.5 h-5 w-5 text-slate-400"/>
                                        <Input
                                            id="custom-amount"
                                            type="number"
                                            min={10}
                                            value={points}
                                            onChange={handlePointsChange}
                                            className="pl-10 h-12 text-lg font-medium dark:bg-slate-950"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 text-right">
                                        Minimum 10 points
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <div
                            className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                            <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5"/>
                            <div className="text-sm">
                                <strong>Secure Payment:</strong> Your transaction is processed
                                securely via Paystack. We do not store your card details.
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <Card
                                className="border-slate-200 shadow-lg overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                                <div className="h-2 w-full bg-blue-600 dark:bg-blue-500"/>
                                <CardHeader
                                    className="bg-slate-50/50 border-b border-slate-100 pb-4 dark:bg-slate-950/50 dark:border-slate-800">
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-amber-500"/>
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Item
                    </span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                      {points} Itinero Points
                    </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Rate
                    </span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                      {POINT_UNIT_PRICE_GHS.toFixed(2)} GHS / point
                    </span>
                                    </div>

                                    <Separator className="my-2 dark:bg-slate-800"/>

                                    <div className="flex justify-between items-end">
                    <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                      Total
                    </span>
                                        <div className="text-right">
                                            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                                GHS {totalCostGHS.toFixed(2)}
                                            </div>
                                            {totalCostUSD && (
                                                <div
                                                    className="text-xs text-slate-500 dark:text-slate-500 font-medium mt-1">
                                                    approx. ${totalCostUSD.toFixed(2)} USD
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 pb-6">
                                    <Button
                                        size="lg"
                                        className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 dark:bg-blue-600 dark:hover:bg-blue-500"
                                        onClick={handleCheckout}
                                        disabled={isProcessing || points < 10}
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                                                Processing...
                                            </>
                                        ) : (
                                            `Pay GHS ${totalCostGHS.toFixed(2)}`
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>

                            <div className="mt-6 text-center">
                                <p className="text-xs text-slate-400 dark:text-slate-600">
                                    By continuing, you agree to our Terms of Service.
                                    <br/>
                                    Points are non-refundable.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}