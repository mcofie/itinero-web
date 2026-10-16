"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { formatGhs, priceBreakdown, type AlbumPricing } from "@/lib/album-pricing";
import type { PrintSpec } from "@/components/album-builder/album-pdf";
import { cn } from "@/lib/utils";
import { card as baseCard, field, fieldLabel, primaryButton, sectionLabel, serifHeading } from "../admin-ui";

const card = cn(baseCard, "sm:p-6");


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
        <h2 className={cn(serifHeading, "text-[28px]")}>Pricing</h2>
        <p className="mt-1 text-sm text-[#776b60]">Discount codes come off the album price. Tax is added on the album after any discount, plus delivery.</p>
        <form className="mt-5 grid gap-6 md:grid-cols-[1fr_260px]" onSubmit={event => { event.preventDefault(); void submit(); }}>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className={fieldLabel}>Album price (GHS)<input required type="number" min={1} step="0.01" value={form.albumPrice} onChange={event => setForm({ ...form, albumPrice: event.target.value })} className={field} /></label>
                <label className={fieldLabel}>Delivery fee in Accra (GHS)<input required type="number" min={0} step="0.01" value={form.deliveryFee} onChange={event => setForm({ ...form, deliveryFee: event.target.value })} className={field} /><span className="mt-1 block font-normal normal-case tracking-normal text-[#a89a8a]">0 shows “Delivery included”.</span></label>
                <label className={fieldLabel}>Tax rate (%)<input required type="number" min={0} max={50} step="0.01" value={form.taxRate} onChange={event => setForm({ ...form, taxRate: event.target.value })} className={field} /><span className="mt-1 block font-normal normal-case tracking-normal text-[#a89a8a]">0 hides the tax line.</span></label>
                <label className={fieldLabel}>Tax name<input required maxLength={20} value={form.taxLabel} onChange={event => setForm({ ...form, taxLabel: event.target.value })} className={field} placeholder="VAT" /></label>
            </div>
            <div className="rounded-[12px] border-2 border-dashed border-[#dfd6ce] bg-[#fdfbf9] p-4 text-sm">
                <p className={cn(sectionLabel, "mb-2")}>Customer sees</p>
                <dl className="space-y-1.5 tabular-nums">
                    <div className="flex justify-between gap-3"><dt className="text-[#6d5c4b]">Album</dt><dd>{formatGhs(preview.subtotal)}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-[#6d5c4b]">Delivery</dt><dd>{preview.deliveryFee > 0 ? formatGhs(preview.deliveryFee) : "Included"}</dd></div>
                    {preview.tax > 0 && <div className="flex justify-between gap-3"><dt className="text-[#6d5c4b]">{preview.taxLabel} ({preview.taxRate}%)</dt><dd>{formatGhs(preview.tax)}</dd></div>}
                    <div className="flex justify-between gap-3 border-t-2 border-dashed border-[#dfd6ce] pt-1.5 font-bold"><dt>Total</dt><dd>{formatGhs(preview.total)}</dd></div>
                </dl>
                <button type="submit" className={cn(primaryButton, "mt-5 w-full")} disabled={busy || !changed}>{busy && <LoaderCircle size={15} className="animate-spin" />}Save prices</button>
            </div>
        </form>
    </section>;
}

export function PrintSpecSettings({ spec }: { spec: PrintSpec }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({ interiorBleedMm: String(spec.interiorBleedMm), coverWrapMm: String(spec.coverWrapMm), spineBaseMm: String(spec.spineBaseMm), spinePerPageMm: String(spec.spinePerPageMm) });
    const draft: PrintSpec = { interiorBleedMm: Number(form.interiorBleedMm) || 0, coverWrapMm: Number(form.coverWrapMm) || 0, spineBaseMm: Number(form.spineBaseMm) || 0, spinePerPageMm: Number(form.spinePerPageMm) || 0 };
    const changed = (Object.keys(spec) as (keyof PrintSpec)[]).some(key => draft[key] !== spec[key]);
    const example = (pages: number) => Math.round((draft.spineBaseMm + pages * draft.spinePerPageMm) * 10) / 10;
    const submit = async () => {
        setBusy(true);
        try {
            await save({ printSpec: draft });
            toast.success("Print settings saved");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save the print settings.");
        } finally { setBusy(false); }
    };
    const fields: { key: keyof PrintSpec; label: string; hint: string; step: string }[] = [
        { key: "interiorBleedMm", label: "Interior bleed (mm)", hint: "Added on every edge of each inside page.", step: "0.5" },
        { key: "coverWrapMm", label: "Cover wrap (mm)", hint: "Extra around the cover spread that folds over the boards.", step: "0.5" },
        { key: "spineBaseMm", label: "Spine allowance (mm)", hint: "Boards and binding, before any pages.", step: "0.5" },
        { key: "spinePerPageMm", label: "Spine per page (mm)", hint: "Paper thickness for each printed page.", step: "0.01" },
    ];
    return <section className={card}>
        <h2 className={cn(serifHeading, "text-[28px]")}>Print specification</h2>
        <p className="mt-1 text-sm text-[#776b60]">Used when you build print files: an interior PDF with bleed, and a cover spread (back, spine, front) with a wrap. Match these to your printer’s template.</p>
        <form className="mt-5 grid gap-6 md:grid-cols-[1fr_260px]" onSubmit={event => { event.preventDefault(); void submit(); }}>
            <div className="grid gap-4 sm:grid-cols-2">
                {fields.map(item => <label key={item.key} className={fieldLabel}>{item.label}
                    <input required type="number" min={0} step={item.step} value={form[item.key]} onChange={event => setForm({ ...form, [item.key]: event.target.value })} className={field} />
                    <span className="mt-1 block font-normal normal-case tracking-normal text-[#a89a8a]">{item.hint}</span>
                </label>)}
            </div>
            <div className="rounded-[12px] border-2 border-dashed border-[#dfd6ce] bg-[#fdfbf9] p-4 text-sm">
                <p className={cn(sectionLabel, "mb-2")}>Spine width</p>
                <dl className="space-y-1.5 tabular-nums">
                    {[12, 24, 42].map(pages => <div key={pages} className="flex justify-between gap-3"><dt className="text-[#6d5c4b]">{pages} pages</dt><dd>{example(pages)} mm</dd></div>)}
                </dl>
                <button type="submit" className={cn(primaryButton, "mt-5 w-full")} disabled={busy || !changed}>{busy && <LoaderCircle size={15} className="animate-spin" />}Save print settings</button>
            </div>
        </form>
    </section>;
}
