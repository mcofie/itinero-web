"use client";

import { useState } from "react";
import { LoaderCircle, Plus, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DISCOUNT_STATE_LABELS, discountLabel, type AlbumDiscount, type DiscountState } from "@/lib/album-discounts";
import { ALBUM_PRICE_GHS } from "@/lib/album-order";
import { cn } from "@/lib/utils";

export type DiscountSummary = AlbumDiscount & { uses: number; sold: number; given: number; revenue: number; everUsed: boolean; state: DiscountState };

const field = "mt-1 block w-full rounded-xl border border-[#e2d6c7] bg-white px-3 py-2 text-sm text-[#2b1a07] outline-none focus:border-[#c16b36]";
const primaryButton = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b1a07] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#53330e] disabled:opacity-60";
const quietButton = "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e2d6c7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5e4a38] transition hover:bg-[#f6efe6] disabled:opacity-60";
const stateTone: Record<DiscountState, string> = {
    active: "bg-[#dcefdf] text-[#22603a]", paused: "bg-[#efe8de] text-[#6d5c4b]", scheduled: "bg-[#dcebf5] text-[#215479]",
    expired: "bg-[#ece6e3] text-[#7d6f69]", used_up: "bg-[#fbecc2] text-[#7a5a06]",
};
const money = (value: number) => `GHS ${value.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
const day = (value: string | null) => value ? value.slice(0, 10) : "";
const shortDay = (value: string | null) => value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null;

type FormState = { code: string; description: string; kind: "percent" | "fixed"; value: string; startsOn: string; endsOn: string; maxUses: string; oncePerCustomer: boolean };
const emptyForm: FormState = { code: "", description: "", kind: "percent", value: "10", startsOn: "", endsOn: "", maxUses: "", oncePerCustomer: true };

function randomCode() {
    const letters = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    return `ALBUM-${Array.from(crypto.getRandomValues(new Uint8Array(5)), byte => letters[byte % letters.length]).join("")}`;
}

async function send(url: string, method: string, body?: unknown) {
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Something went wrong.");
    return result;
}

export default function DiscountsManager({ discounts }: { discounts: DiscountSummary[] }) {
    const router = useRouter();
    const [editing, setEditing] = useState<DiscountSummary | "new" | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [busy, setBusy] = useState<string | null>(null);

    const openNew = () => { setForm({ ...emptyForm, code: randomCode() }); setEditing("new"); };
    const openEdit = (discount: DiscountSummary) => {
        setForm({ code: discount.code, description: discount.description ?? "", kind: discount.kind, value: String(discount.value),
            startsOn: day(discount.starts_at), endsOn: day(discount.ends_at), maxUses: discount.max_uses ? String(discount.max_uses) : "", oncePerCustomer: discount.once_per_customer });
        setEditing(discount);
    };

    const save = async () => {
        if (!editing) return;
        setBusy("save");
        try {
            const limits = { description: form.description, startsOn: form.startsOn, endsOn: form.endsOn, maxUses: form.maxUses, oncePerCustomer: form.oncePerCustomer };
            if (editing === "new") await send("/api/admin/discounts", "POST", { ...limits, code: form.code, kind: form.kind, value: form.value });
            else await send(`/api/admin/discounts/${editing.id}`, "PATCH", limits);
            toast.success(editing === "new" ? `Created ${form.code.toUpperCase()}` : `Updated ${editing.code}`);
            setEditing(null);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save the discount.");
        } finally { setBusy(null); }
    };

    const toggle = async (discount: DiscountSummary) => {
        setBusy(discount.id);
        try {
            await send(`/api/admin/discounts/${discount.id}`, "PATCH", { active: !discount.active });
            toast.success(`${discount.code} ${discount.active ? "paused" : "resumed"}`);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update the discount.");
        } finally { setBusy(null); }
    };

    const remove = async (discount: DiscountSummary) => {
        if (!window.confirm(`Delete ${discount.code}? This can’t be undone.`)) return;
        setBusy(discount.id);
        try {
            await send(`/api/admin/discounts/${discount.id}`, "DELETE");
            toast.success(`Deleted ${discount.code}`);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not delete the discount.");
        } finally { setBusy(null); }
    };

    const preview = Number(form.value) > 0
        ? Math.max(0, ALBUM_PRICE_GHS - (form.kind === "percent" ? ALBUM_PRICE_GHS * Math.min(100, Number(form.value)) / 100 : Number(form.value)))
        : ALBUM_PRICE_GHS;

    return <>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="font-[Georgia] text-3xl tracking-[-.02em]">Discounts</h1>
                <p className="mt-1 text-sm text-[#776b60]">Codes customers enter at checkout. Each code takes a percentage or a fixed amount off the GHS {ALBUM_PRICE_GHS} album.</p>
            </div>
            <button type="button" className={primaryButton} onClick={openNew}><Plus size={16} /> New code</button>
        </div>

        {discounts.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[#d9c8b5] bg-[#fbf8f3] px-6 py-16 text-center text-sm text-[#8a7d70]">No discount codes yet.</div>
            : <div className="mt-6 overflow-x-auto rounded-2xl border border-[#e4d9cb] bg-[#fdfbf8]">
                <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-[#eee4d8] text-[11px] font-bold uppercase tracking-[.08em] text-[#8a7d70]">
                        <tr><th className="px-4 py-3">Code</th><th className="px-3 py-3">Discount</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Uses</th><th className="px-3 py-3">Valid</th><th className="px-3 py-3 text-right">Given</th><th className="px-3 py-3 text-right">Revenue</th><th className="px-4 py-3" /></tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0e8dd]">
                        {discounts.map(discount => <tr key={discount.id} className="align-top">
                            <td className="px-4 py-3"><strong className="font-mono text-[13px]">{discount.code}</strong>{discount.description && <span className="mt-0.5 block max-w-56 text-xs text-[#8a7d70]">{discount.description}</span>}</td>
                            <td className="px-3 py-3">{discountLabel(discount)}<span className="block text-xs text-[#8a7d70]">{discount.once_per_customer ? "Once per customer" : "Reusable"}</span></td>
                            <td className="px-3 py-3"><span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", stateTone[discount.state])}>{DISCOUNT_STATE_LABELS[discount.state]}</span></td>
                            <td className="px-3 py-3 tabular-nums">{discount.uses}{discount.max_uses ? ` / ${discount.max_uses}` : ""}</td>
                            <td className="px-3 py-3 text-xs text-[#6d5c4b]">{!discount.starts_at && !discount.ends_at ? "No end date" : <>{shortDay(discount.starts_at) ?? "Now"} – {shortDay(discount.ends_at) ?? "no end"}</>}</td>
                            <td className="px-3 py-3 text-right tabular-nums">{money(discount.given)}</td>
                            <td className="px-3 py-3 text-right tabular-nums">{money(discount.revenue)}<span className="block text-[11px] text-[#8a7d70]">{discount.sold} {discount.sold === 1 ? "order" : "orders"}</span></td>
                            <td className="px-4 py-3">
                                <div className="flex justify-end gap-1.5">
                                    <button type="button" className={quietButton} disabled={busy === discount.id} onClick={() => void toggle(discount)}>{discount.active ? "Pause" : "Resume"}</button>
                                    <button type="button" className={quietButton} onClick={() => openEdit(discount)}>Edit</button>
                                    {!discount.everUsed && <button type="button" className={cn(quietButton, "text-[#a33a1a]")} disabled={busy === discount.id} onClick={() => void remove(discount)}>Delete</button>}
                                </div>
                            </td>
                        </tr>)}
                    </tbody>
                </table>
            </div>}
        <p className="mt-3 text-xs text-[#8a7d70]">Uses include orders waiting for payment. Given and revenue count paid orders that weren’t cancelled.</p>

        <Dialog open={!!editing} onOpenChange={open => { if (!open && !busy) setEditing(null); }}>
            <DialogContent className="border-[#e4d9cb] bg-[#fdfbf8] text-[#2b1a07] sm:max-w-lg">
                <form onSubmit={event => { event.preventDefault(); void save(); }}>
                    <DialogHeader>
                        <DialogTitle className="font-[Georgia] text-2xl font-normal">{editing === "new" ? "New discount code" : `Edit ${form.code}`}</DialogTitle>
                        <DialogDescription className="text-[#776b60]">{editing === "new" ? "The code and amount can’t be changed after you create it." : "The code and amount are fixed. You can change the dates, limits and note."}</DialogDescription>
                    </DialogHeader>
                    <div className="my-5 grid gap-4 sm:grid-cols-2">
                        <label className="block text-xs font-semibold text-[#6d5c4b] sm:col-span-2">Code
                            <span className="mt-1 flex gap-2">
                                <input required disabled={editing !== "new"} value={form.code} maxLength={24} onChange={event => setForm({ ...form, code: event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") })} className={cn(field, "mt-0 font-mono uppercase disabled:bg-[#f3ede5]")} />
                                {editing === "new" && <button type="button" className={cn(quietButton, "shrink-0 px-3")} onClick={() => setForm({ ...form, code: randomCode() })} aria-label="Generate a random code"><Shuffle size={14} /></button>}
                            </span>
                        </label>
                        <label className="block text-xs font-semibold text-[#6d5c4b]">Type
                            <select disabled={editing !== "new"} value={form.kind} onChange={event => setForm({ ...form, kind: event.target.value as FormState["kind"] })} className={cn(field, "disabled:bg-[#f3ede5]")}>
                                <option value="percent">Percentage off</option><option value="fixed">Amount off (GHS)</option>
                            </select>
                        </label>
                        <label className="block text-xs font-semibold text-[#6d5c4b]">{form.kind === "percent" ? "Percent" : "Amount (GHS)"}
                            <input required disabled={editing !== "new"} type="number" min={1} max={form.kind === "percent" ? 100 : undefined} step="0.01" value={form.value} onChange={event => setForm({ ...form, value: event.target.value })} className={cn(field, "disabled:bg-[#f3ede5]")} />
                        </label>
                        <p className="-mt-2 text-xs text-[#8a7d70] sm:col-span-2">Customers pay <strong className="text-[#2b1a07]">GHS {Math.round(preview * 100) / 100}</strong>{preview <= 0 && " — a free album, placed without payment"}.</p>
                        <label className="block text-xs font-semibold text-[#6d5c4b]">Starts<input type="date" value={form.startsOn} onChange={event => setForm({ ...form, startsOn: event.target.value })} className={field} /></label>
                        <label className="block text-xs font-semibold text-[#6d5c4b]">Ends<input type="date" value={form.endsOn} onChange={event => setForm({ ...form, endsOn: event.target.value })} className={field} /></label>
                        <label className="block text-xs font-semibold text-[#6d5c4b]">Usage limit<input type="number" min={1} step={1} placeholder="Unlimited" value={form.maxUses} onChange={event => setForm({ ...form, maxUses: event.target.value })} className={field} /></label>
                        <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-[#5e4a38]"><input type="checkbox" checked={form.oncePerCustomer} onChange={event => setForm({ ...form, oncePerCustomer: event.target.checked })} className="h-4 w-4 accent-[#2b1a07]" />Once per customer</label>
                        <label className="block text-xs font-semibold text-[#6d5c4b] sm:col-span-2">Note (internal)<input value={form.description} maxLength={140} placeholder="Instagram giveaway, October" onChange={event => setForm({ ...form, description: event.target.value })} className={field} /></label>
                    </div>
                    <DialogFooter className="gap-2">
                        <button type="button" className={cn(quietButton, "px-4 py-2.5 text-sm")} onClick={() => setEditing(null)} disabled={!!busy}>Cancel</button>
                        <button type="submit" className={primaryButton} disabled={!!busy}>{busy === "save" && <LoaderCircle size={15} className="animate-spin" />}{editing === "new" ? "Create code" : "Save changes"}</button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </>;
}
