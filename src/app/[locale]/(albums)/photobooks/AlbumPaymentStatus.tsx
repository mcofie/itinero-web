"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleAlert, Clock } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import ui from "@/components/album/album-ui.module.css";

type PaymentState = { tone: "checking" | "pending" | "problem"; title: string; detail: string } | null;

/**
 * Paystack returns customers to /photobooks?payment=return&reference=…. A confirmed payment goes
 * straight to that order's page; anything else stays here with a clear message.
 */
export default function AlbumPaymentStatus() {
    const router = useRouter();
    const [state, setState] = useState<PaymentState>(null);
    const [reference, setReference] = useState<string | null>(null);

    const check = useCallback(async (paymentReference: string) => {
        setState({ tone: "checking", title: "Confirming your payment…", detail: "This takes a moment." });
        try {
            const response = await fetch(`/api/albums/verify?reference=${encodeURIComponent(paymentReference)}`, { cache: "no-store" });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "We couldn’t confirm your payment just now.");
            if (result.status === "paid" && result.albumId) { router.replace(`/photobooks/${result.albumId}?confirmed=1`); return; }
            if (result.status === "pending") setState({ tone: "pending", title: "Your payment is still processing", detail: "Mobile money can take a few minutes. We’ll update your order as soon as it’s confirmed; you don’t need to pay again." });
            else setState({ tone: "problem", title: "We couldn’t match this payment to your album", detail: "Please contact us before paying again, and include your payment reference: " + paymentReference });
        } catch (error) {
            setState({ tone: "problem", title: "We couldn’t confirm your payment just now", detail: `${error instanceof Error ? error.message : "Please try again."} Don’t pay again. Your payment reference is ${paymentReference}.` });
        }
    }, [router]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("payment") !== "return") return;
        const found = params.get("reference") || params.get("trxref");
        if (!found) { setState({ tone: "problem", title: "We couldn’t find a payment reference", detail: "If you’ve paid, your order will update shortly. Your albums are below." }); return; }
        setReference(found);
        void check(found);
    }, [check]);

    if (!state) return null;
    const Icon = state.tone === "problem" ? CircleAlert : Clock;
    return <div className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
        <div role={state.tone === "problem" ? "alert" : "status"} className={cn(ui.card, "flex gap-3 px-5 py-4 font-sans text-sm leading-6",
            state.tone === "problem" ? "border-[#b4441c] text-[#7a2e12]" : "text-[#5e4a38]")}>
            {state.tone === "checking" ? <span className="mt-1.5 h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[#ed7936]" aria-hidden /> : <Icon size={18} className="mt-0.5 shrink-0" />}
            <div className="min-w-0">
                <strong className="block font-[family-name:var(--font-album-serif)] text-base font-normal text-[#2b1a07]">{state.title}</strong>
                <p>{state.detail}</p>
                {state.tone !== "checking" && reference && <button type="button" onClick={() => void check(reference)} className="mt-2 text-xs font-bold underline underline-offset-2">Check again</button>}
            </div>
        </div>
    </div>;
}
