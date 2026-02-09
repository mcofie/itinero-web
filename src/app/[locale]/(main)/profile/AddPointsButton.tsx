"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { TopupDialogFxAware } from "@/components/layout/TopupDialogFxAware";
import { POINT_UNIT_PRICE_GHS } from "@/lib/points";
import { getLatestFxSnapshot, convertUsingSnapshot } from "@/lib/fx/fx";
import { toast } from "sonner";

type Props = {
    userEmail: string | null;
    userCurrency?: string | null;
};

export function AddPointsButton({ userEmail, userCurrency }: Props) {
    const [open, setOpen] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [points, setPoints] = React.useState("100");
    const [rate, setRate] = React.useState<number | null>(null);

    const currency = userCurrency || "GHS";

    React.useEffect(() => {
        if (currency !== "GHS") {
            const fetchRate = async () => {
                const snap = await getLatestFxSnapshot("USD");
                if (snap) {
                    const r = convertUsingSnapshot(snap, 1, "GHS", currency);
                    setRate(r);
                }
            };
            fetchRate();
        } else {
            setRate(1);
        }
    }, [currency]);

    const numericPoints = Number(points) || 0;
    const ghsPreview = numericPoints * POINT_UNIT_PRICE_GHS;

    const handleStartTopup = async () => {
        if (!userEmail) {
            toast.error("You must be logged in to buy points");
            return;
        }
        if (numericPoints < 1) {
            toast.error("Please enter a valid amount of points");
            return;
        }

        setBusy(true);
        try {
            const qRes = await fetch("/api/points/quote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ points: numericPoints }),
            });
            if (!qRes.ok) throw new Error("Quote failed");
            const { quoteId } = await qRes.json();

            const initRes = await fetch("/api/paystack/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quoteId, email: userEmail }),
            });
            if (!initRes.ok) throw new Error("Paystack init failed");
            const { authorization_url } = await initRes.json();

            window.location.href = authorization_url;
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Something went wrong");
            setBusy(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md dark:bg-blue-600 dark:hover:bg-blue-500"
            >
                Add Points
            </Button>

            <TopupDialogFxAware
                topupOpen={open}
                setTopupOpen={setOpen}
                topupBusy={busy}
                pointsInput={points}
                setPointsInput={setPoints}
                onPointsKeyDown={(e) => {
                    if (e.key === "Enter") handleStartTopup();
                }}
                startTopup={handleStartTopup}
                ghsPreview={ghsPreview}
                userCurrency={currency}
                ghsToUserRate={rate}
            />
        </>
    );
}
