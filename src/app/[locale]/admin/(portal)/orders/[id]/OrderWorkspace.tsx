"use client";

import { useState } from "react";
import { LoaderCircle, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { allowedMoves, formatOrderNumber, isOrderStatus, moveLabel, moveRequirements, STATUS_INFO, type OrderMove } from "@/lib/album-fulfilment";
import { NOTIFY_STATUSES, orderMessage, orderTrackingUrl, type OrderMessageInput } from "@/lib/order-messages";
import { cn } from "@/lib/utils";

const field = "mt-1 block w-full rounded-xl border border-[#e2d6c7] bg-white px-3 py-2 text-sm text-[#2b1a07] outline-none focus:border-[#c16b36]";
const primaryButton = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#2b1a07] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#53330e] disabled:opacity-60";
const quietButton = "inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#e2d6c7] bg-white px-3 py-2 text-sm font-semibold text-[#5e4a38] transition hover:bg-[#f6efe6] disabled:opacity-60";

async function patchOrder(id: string, body: Record<string, unknown>) {
    const response = await fetch(`/api/admin/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Something went wrong.");
    return result;
}

type StatusOrder = { id: string; status: string; heldFrom: string | null; courierName: string | null; courierPhone: string | null; deliveryDate: string | null };

export function StatusActions({ order, hasEmail }: { order: StatusOrder; hasEmail: boolean }) {
    const router = useRouter();
    const [active, setActive] = useState<OrderMove | null>(null);
    const [busy, setBusy] = useState(false);
    const [note, setNote] = useState("");
    const [customerMessage, setCustomerMessage] = useState("");
    const [delivery, setDelivery] = useState({ courierName: order.courierName ?? "", courierPhone: order.courierPhone ?? "", deliveryDate: order.deliveryDate ?? "" });

    if (!isOrderStatus(order.status)) return null;
    const moves = allowedMoves(order.status, order.heldFrom);
    if (order.status === "pending_payment") return <p className="text-sm text-[#776b60]">Waiting for the customer to pay. If they say they’ve paid, use <strong>Check with Paystack</strong> under Payment.</p>;
    if (!moves.length) return <p className="text-sm text-[#776b60]">{order.status === "cancelled" ? "This order is cancelled." : "Nothing left to do for this order."}</p>;

    const main = moves.filter(move => move.kind === "forward" || move.kind === "resume");
    const other = moves.filter(move => move.kind !== "forward" && move.kind !== "resume");
    const required = active ? moveRequirements(active) : null;
    const emails = active && (active.kind === "forward" || active.kind === "cancel") && NOTIFY_STATUSES.includes(active.to);

    const open = (move: OrderMove) => { setActive(move); setNote(""); setCustomerMessage(""); };
    const submit = async () => {
        if (!active || busy) return;
        setBusy(true);
        try {
            await patchOrder(order.id, { action: "transition", to: active.to, note, customerMessage, ...(required?.delivery ? delivery : {}) });
            toast.success(`${formatStatus(active.to)}${emails && hasEmail ? " · customer update sent" : ""}`);
            setActive(null);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update the order.");
        } finally { setBusy(false); }
    };

    return <>
        <div className="flex flex-wrap gap-2">
            {main.map(move => <button key={move.to} type="button" className={primaryButton} onClick={() => open(move)}>{moveLabel(move)}</button>)}
        </div>
        {other.length > 0 && <div className={cn("flex flex-wrap gap-2", main.length > 0 && "mt-3")}>
            {other.map(move => <button key={`${move.kind}-${move.to}`} type="button" onClick={() => open(move)}
                className={cn(quietButton, move.kind === "cancel" && "text-[#a33a1a]")}>{moveLabel(move)}</button>)}
        </div>}

        <Dialog open={!!active} onOpenChange={value => { if (!value && !busy) setActive(null); }}>
            <DialogContent className="border-[#e4d9cb] bg-[#fdfbf8] text-[#2b1a07] sm:max-w-md">
                {active && required && <form onSubmit={event => { event.preventDefault(); void submit(); }}>
                    <DialogHeader>
                        <DialogTitle className="font-[Georgia] text-2xl font-normal">{moveLabel(active)}</DialogTitle>
                        <DialogDescription className="text-[#776b60]">
                            Moves the order to <strong>{formatStatus(active.to)}</strong>.{emails ? hasEmail ? " The customer gets an email update." : " The order has no email, so no update is sent." : " The customer isn’t notified."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-5 space-y-4">
                        {required.customerMessage && <label className="block text-xs font-semibold text-[#6d5c4b]">Message to the customer
                            <textarea required rows={4} maxLength={1000} value={customerMessage} onChange={event => setCustomerMessage(event.target.value)} className={field}
                                placeholder="Photo 12 is very low resolution and would print blurry. Could you replace it with the original file?" />
                        </label>}
                        {required.delivery && <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block text-xs font-semibold text-[#6d5c4b]">Rider name<input value={delivery.courierName} maxLength={80} onChange={event => setDelivery({ ...delivery, courierName: event.target.value })} className={field} /></label>
                            <label className="block text-xs font-semibold text-[#6d5c4b]">Rider phone<input value={delivery.courierPhone} inputMode="tel" maxLength={20} onChange={event => setDelivery({ ...delivery, courierPhone: event.target.value })} className={field} /></label>
                            <label className="block text-xs font-semibold text-[#6d5c4b] sm:col-span-2">Expected delivery date<input type="date" value={delivery.deliveryDate} onChange={event => setDelivery({ ...delivery, deliveryDate: event.target.value })} className={field} /></label>
                        </div>}
                        <label className="block text-xs font-semibold text-[#6d5c4b]">{required.note ? "Reason (internal)" : "Internal note (optional)"}
                            <textarea required={required.note} rows={2} maxLength={1000} value={note} onChange={event => setNote(event.target.value)} className={field}
                                placeholder={active.kind === "cancel" ? "Customer asked to cancel. Refunded in Paystack on …" : active.kind === "hold" ? "Waiting for the printer to restock covers" : ""} />
                        </label>
                    </div>
                    <DialogFooter className="gap-2">
                        <button type="button" className={quietButton} onClick={() => setActive(null)} disabled={busy}>Back</button>
                        <button type="submit" className={cn(primaryButton, active.kind === "cancel" && "bg-[#a33a1a] hover:bg-[#82290f]")} disabled={busy}>{busy && <LoaderCircle size={15} className="animate-spin" />}{moveLabel(active)}</button>
                    </DialogFooter>
                </form>}
            </DialogContent>
        </Dialog>
    </>;
}

const formatStatus = (status: string) => isOrderStatus(status) ? STATUS_INFO[status].label : status;

/** Opens WhatsApp with the customer update for the current status, ready to send. */
export function WhatsAppUpdate({ phone, status, message }: { phone: string | null; status: string; message: OrderMessageInput }) {
    if (!isOrderStatus(status) || status === "pending_payment") return null;
    const firstName = message.customerName?.trim().split(/\s+/)[0];
    const text = orderMessage(status, message)?.body
        ?? `${firstName ? `Hi ${firstName},` : "Hi,"}\n\nAn update on your album “${message.title}” (${formatOrderNumber(message.orderNumber)}): ${STATUS_INFO[status].customerDescription}\n\nFollow your order: ${orderTrackingUrl(message.siteUrl, message.id)}`;
    if (!phone) return <p className="text-xs text-[#8a7d70]">No phone number for a WhatsApp update.</p>;
    return <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <a href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1f7a4a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#17603a]">
            <MessageCircle size={16} /> Send WhatsApp update
        </a>
        <details className="min-w-0 text-xs text-[#776b60]">
            <summary className="cursor-pointer py-2.5 font-semibold">Preview message</summary>
            <p className="whitespace-pre-line rounded-xl bg-[#f6f0e8] p-3 leading-5">{text}</p>
        </details>
    </div>;
}

export function NoteForm({ orderId }: { orderId: string }) {
    const router = useRouter();
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    const submit = async () => {
        if (!note.trim() || busy) return;
        setBusy(true);
        try {
            await patchOrder(orderId, { action: "note", message: note });
            setNote("");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not add the note.");
        } finally { setBusy(false); }
    };
    return <form className="flex flex-col gap-2 sm:flex-row" onSubmit={event => { event.preventDefault(); void submit(); }}>
        <textarea rows={1} value={note} maxLength={2000} onChange={event => setNote(event.target.value)} placeholder="Add an internal note…" aria-label="Internal note" className={cn(field, "mt-0 min-h-10 flex-1 resize-y")} />
        <button type="submit" className={cn(quietButton, "shrink-0")} disabled={busy || !note.trim()}>{busy && <LoaderCircle size={14} className="animate-spin" />}Add note</button>
    </form>;
}

export function DeliveryForm({ orderId, courierName, courierPhone, deliveryDate }: { orderId: string; courierName: string | null; courierPhone: string | null; deliveryDate: string | null }) {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [busy, setBusy] = useState(false);
    const [values, setValues] = useState({ courierName: courierName ?? "", courierPhone: courierPhone ?? "", deliveryDate: deliveryDate ?? "" });
    const save = async () => {
        setBusy(true);
        try {
            await patchOrder(orderId, { action: "delivery", ...values });
            setEditing(false);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save delivery details.");
        } finally { setBusy(false); }
    };
    if (!editing) return <div className="text-sm">
        {courierName || courierPhone || deliveryDate ? <dl className="space-y-1.5">
            {courierName && <div className="flex justify-between gap-3"><dt className="text-[#8a7d70]">Rider</dt><dd>{courierName}</dd></div>}
            {courierPhone && <div className="flex justify-between gap-3"><dt className="text-[#8a7d70]">Phone</dt><dd><a href={`tel:${courierPhone}`} className="text-[#a2602f]">{courierPhone}</a></dd></div>}
            {deliveryDate && <div className="flex justify-between gap-3"><dt className="text-[#8a7d70]">Expected</dt><dd>{new Date(`${deliveryDate}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</dd></div>}
        </dl> : <p className="text-[#8a7d70]">No rider assigned yet.</p>}
        <button type="button" className={cn(quietButton, "mt-3")} onClick={() => setEditing(true)}>Edit delivery</button>
    </div>;
    return <form className="space-y-3" onSubmit={event => { event.preventDefault(); void save(); }}>
        <label className="block text-xs font-semibold text-[#6d5c4b]">Rider name<input value={values.courierName} maxLength={80} onChange={event => setValues({ ...values, courierName: event.target.value })} className={field} /></label>
        <label className="block text-xs font-semibold text-[#6d5c4b]">Rider phone<input value={values.courierPhone} inputMode="tel" maxLength={20} onChange={event => setValues({ ...values, courierPhone: event.target.value })} className={field} /></label>
        <label className="block text-xs font-semibold text-[#6d5c4b]">Expected delivery<input type="date" value={values.deliveryDate} onChange={event => setValues({ ...values, deliveryDate: event.target.value })} className={field} /></label>
        <div className="flex gap-2">
            <button type="submit" className={primaryButton} disabled={busy}>{busy && <LoaderCircle size={14} className="animate-spin" />}Save</button>
            <button type="button" className={quietButton} onClick={() => setEditing(false)} disabled={busy}>Cancel</button>
        </div>
    </form>;
}

type PaymentResult = { status: string; amount: number; currency: string; paidAt: string | null; channel: string | null; reconciled: string | null };

export function PaymentCheck({ orderId }: { orderId: string }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<PaymentResult | null>(null);
    const check = async () => {
        setBusy(true);
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/payment`, { method: "POST" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Could not reach Paystack.");
            setResult(data);
            if (data.reconciled === "paid") { toast.success("Payment confirmed. The order is now marked paid."); router.refresh(); }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not reach Paystack.");
        } finally { setBusy(false); }
    };
    return <div className="mt-3">
        <button type="button" className={quietButton} onClick={() => void check()} disabled={busy}>{busy ? <LoaderCircle size={14} className="animate-spin" /> : <RefreshCw size={14} />}Check with Paystack</button>
        {result && <p className={cn("mt-2 rounded-lg p-2 text-xs", result.status === "success" ? "bg-[#dcefdf] text-[#22603a]" : "bg-[#f6f0e8] text-[#6d5c4b]")}>
            Paystack: <strong>{result.status}</strong> · {result.currency} {result.amount}{result.channel && ` · ${result.channel}`}{result.paidAt && ` · ${new Date(result.paidAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`}
        </p>}
    </div>;
}
