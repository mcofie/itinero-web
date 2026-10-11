"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AlbumPaymentStatus() {
    const router = useRouter();
    const [message, setMessage] = useState("");
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("payment") !== "return") return;
        const reference = params.get("reference");
        if (!reference) { setMessage("We could not find a payment reference. Your albums are below."); return; }
        setMessage("Confirming your payment…");
        void fetch(`/api/albums/verify?reference=${encodeURIComponent(reference)}`, { cache: "no-store" })
            .then(async response => {
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "Could not verify payment.");
                if (result.status === "paid") {
                    setMessage("Payment confirmed. Your album is now in production review.");
                    router.refresh();
                } else if (result.status === "pending") setMessage("Payment has not been confirmed yet. You can check this page again shortly.");
                else setMessage("This payment could not be matched to your album. Please contact us before paying again.");
            })
            .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Could not verify payment."));
    }, [router]);
    return message ? <div className="mx-auto max-w-7xl px-6 pb-4"><div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">{message}</div></div> : null;
}
