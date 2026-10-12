"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { formatGhs, priceBreakdown, type AlbumPricing } from "@/lib/album-pricing";
import { cn } from "@/lib/utils";

const field = "mt-1 block w-full rounded-xl border border-[#e2d6c7] bg-white px-3 py-2 text-sm text-[#2b1a07] outline-none focus:border-[#c16b36]";
const primaryButton = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b1a07] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#53330e] disabled:opacity-60";
const card = "rounded-2xl border border-[#e4d9cb] bg-[#fdfbf8] p-5 sm:p-6";

async function save(body: unknown) {
    const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Could not save.");
}

export function PricingSettings({ pricing }: { pricing: AlbumPricing }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({ albumPrice: String(pricing.albumPrice), deliveryFee: String(pricing.deliveryFee), taxRate: String(pricing.taxRate), taxLabel: pricing.taxLabel });
    const draft: AlbumPricing = { albumPrice: Number(form.albumPrice) || 0, deliveryFee: Number(form.deliveryFee) || 0, taxRate: Number(form.taxRate) || 0, taxLabel: form.taxLabel.trim() || "Tax" };
    const preview = priceBreakdown(draft);
    const changed = draft.albumPrice !== pricing.albumPrice || draft.deliveryFee !== pricing.deliveryFee || draft.taxRate !== pricing.taxRate || draft.taxLabel !== pricing.taxLabel;

    const submit = async () => {
        if (!window.confirm(`Charge new customers ${formatGhs(preview.total)} per album?`)) return;
        setBusy(true);
        try {
            await save({ pricing: draft });
            toast.success("Prices saved");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save prices.");
        } finally { setBusy(false); }
    };

    return <section className={card}>
        <h2 className="font-[Georgia] text-2xl">Pricing</h2>
        <p className="mt-1 text-sm text-[#776b60]">Discount codes come off the album price. Tax is added on the album after any discount, plus delivery.</p>
        <form className="mt-5 grid gap-6 md:grid-cols-[1fr_260px]" onSubmit={event => { event.preventDefault(); void submit(); }}>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-[#6d5c4b]">Album price (GHS)<input required type="number" min={1} step="0.01" value={form.albumPrice} onChange={event => setForm({ ...form, albumPrice: event.target.value })} className={field} /></label>
                <label className="block text-xs font-semibold text-[#6d5c4b]">Delivery fee in Accra (GHS)<input required type="number" min={0} step="0.01" value={form.deliveryFee} onChange={event => setForm({ ...form, deliveryFee: event.target.value })} className={field} /><span className="mt-1 block font-normal text-[#a89a8a]">0 shows “Delivery included”.</span></label>
                <label className="block text-xs font-semibold text-[#6d5c4b]">Tax rate (%)<input required type="number" min={0} max={50} step="0.01" value={form.taxRate} onChange={event => setForm({ ...form, taxRate: event.target.value })} className={field} /><span className="mt-1 block font-normal text-[#a89a8a]">0 hides the tax line.</span></label>
                <label className="block text-xs font-semibold text-[#6d5c4b]">Tax name<input required maxLength={20} value={form.taxLabel} onChange={event => setForm({ ...form, taxLabel: event.target.value })} className={field} placeholder="VAT" /></label>
            </div>
            <div className="rounded-xl bg-[#f6f0e8] p-4 text-sm">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#8a7d70]">Customer sees</p>
                <dl className="space-y-1.5 tabular-nums">
                    <div className="flex justify-between gap-3"><dt className="text-[#6d5c4b]">Album</dt><dd>{formatGhs(preview.subtotal)}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-[#6d5c4b]">Delivery</dt><dd>{preview.deliveryFee > 0 ? formatGhs(preview.deliveryFee) : "Included"}</dd></div>
                    {preview.tax > 0 && <div className="flex justify-between gap-3"><dt className="text-[#6d5c4b]">{preview.taxLabel} ({preview.taxRate}%)</dt><dd>{formatGhs(preview.tax)}</dd></div>}
                    <div className="flex justify-between gap-3 border-t border-[#e2d6c7] pt-1.5 font-bold"><dt>Total</dt><dd>{formatGhs(preview.total)}</dd></div>
                </dl>
                <button type="submit" className={cn(primaryButton, "mt-4 w-full")} disabled={busy || !changed}>{busy && <LoaderCircle size={15} className="animate-spin" />}Save prices</button>
            </div>
        </form>
    </section>;
}
