"use client";

import { useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/routing";
import { daysSince, formatOrderNumber, isOrderStatus, STALE_AFTER_DAYS } from "@/lib/album-fulfilment";
import AlbumCoverThumb from "@/components/album/AlbumCoverThumb";
import { cn } from "@/lib/utils";
import StatusBadge from "../StatusBadge";

export type OrderListRow = {
    id: string;
    order_number: number | null;
    title: string;
    status: string;
    cover_template_id: string;
    album_year: string | null;
    cover_typeface: string | null;
    cover_text_color: string | null;
    customer_name: string | null;
    customer_email: string | null;
    shipping_address: { fullName?: string; phone?: string; area?: string } | null;
    paid_at: string | null;
    submitted_at: string | null;
    status_changed_at: string | null;
    created_at: string;
    total_cost: number | null;
    currency: string | null;
};

const BULK_MOVES = [
    { from: "paid", to: "in_review", label: "Start review" },
    { from: "in_review", to: "printing", label: "Send to print" },
    { from: "printing", to: "ready", label: "Mark ready" },
] as const;

const shortDate = (value: string | null) => value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";

export default function OrdersTable({ rows, exportAllHref, emptyLabel }: { rows: OrderListRow[]; exportAllHref: string; emptyLabel: string }) {
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [busy, setBusy] = useState<string | null>(null);
    const chosen = rows.filter(row => selected.has(row.id));
    const allChosen = rows.length > 0 && chosen.length === rows.length;
    const toggle = (id: string) => setSelected(current => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });

    const bulkMove = async (from: string, to: string, label: string) => {
        const ids = chosen.filter(row => row.status === from).map(row => row.id);
        if (!ids.length || busy) return;
        setBusy(to);
        try {
            const response = await fetch("/api/admin/orders/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, to }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Could not update the orders.");
            if (result.failed?.length) toast.warning(`${label}: ${result.updated} updated, ${result.failed.length} could not be changed.`);
            else toast.success(`${label}: ${result.updated} ${result.updated === 1 ? "order" : "orders"} updated.`);
            setSelected(new Set());
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update the orders.");
        } finally { setBusy(null); }
    };

    if (!rows.length) return <div className="mt-6 rounded-2xl border border-dashed border-[#d9c8b5] bg-[#fbf8f3] px-6 py-16 text-center text-sm text-[#8a7d70]">{emptyLabel}</div>;

    return <section className="mt-6">
        <div className="mb-3 flex min-h-10 flex-wrap items-center gap-2 text-sm">
            {chosen.length > 0 ? <>
                <span className="mr-1 font-semibold">{chosen.length} selected</span>
                {BULK_MOVES.map(move => {
                    const eligible = chosen.filter(row => row.status === move.from).length;
                    return eligible > 0 && <button key={move.to} type="button" disabled={!!busy} onClick={() => void bulkMove(move.from, move.to, move.label)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#2b1a07] px-3 py-2 font-semibold text-white transition hover:bg-[#53330e] disabled:opacity-60">
                        {busy === move.to && <LoaderCircle size={14} className="animate-spin" />}{move.label} ({eligible})
                    </button>;
                })}
                <a href={`/api/admin/orders/export?ids=${chosen.map(row => row.id).join(",")}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2d6c7] bg-[#fdfbf8] px-3 py-2 font-semibold"><Download size={14} /> Print list (CSV)</a>
                <button type="button" onClick={() => setSelected(new Set())} className="px-2 py-2 text-[#8a7d70] underline-offset-2 hover:underline">Clear</button>
            </> : <a href={exportAllHref} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[#e2d6c7] bg-[#fdfbf8] px-3 py-2 font-semibold"><Download size={14} /> Export these orders (CSV)</a>}
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e4d9cb] bg-[#fdfbf8]">
            <table className="w-full text-left text-sm">
                <thead className="hidden border-b border-[#eee4d8] text-[11px] font-bold uppercase tracking-[.08em] text-[#8a7d70] md:table-header-group">
                    <tr>
                        <th className="w-10 px-4 py-3"><input type="checkbox" aria-label="Select all orders" checked={allChosen} onChange={() => setSelected(allChosen ? new Set() : new Set(rows.map(row => row.id)))} className="accent-[#2b1a07]" /></th>
                        <th className="px-2 py-3">Order</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Waiting</th><th className="px-3 py-3">Paid</th><th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e8dd]">
                    {rows.map(row => {
                        const waited = daysSince(row.status_changed_at ?? row.paid_at ?? row.created_at);
                        const staleAfter = isOrderStatus(row.status) ? STALE_AFTER_DAYS[row.status] : undefined;
                        const stale = staleAfter !== undefined && waited >= staleAfter;
                        const name = row.shipping_address?.fullName || row.customer_name || row.customer_email || "Customer";
                        return <tr key={row.id} className={cn("flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 transition md:table-row md:p-0", selected.has(row.id) ? "bg-[#fbf1e6]" : "hover:bg-[#faf6f0]")}>
                            <td className="md:px-4 md:py-3"><input type="checkbox" aria-label={`Select order ${formatOrderNumber(row.order_number)}`} checked={selected.has(row.id)} onChange={() => toggle(row.id)} className="accent-[#2b1a07]" /></td>
                            <td className="min-w-0 flex-1 md:px-2 md:py-3">
                                <Link href={`/admin/orders/${row.id}`} className="flex items-center gap-3">
                                    <AlbumCoverThumb coverId={row.cover_template_id} title={row.title} year={row.album_year} typeface={row.cover_typeface} textColor={row.cover_text_color} height={56} className="shadow-[2px_3px_6px_#2b1a0726]" />
                                    <span className="min-w-0"><strong className="block font-mono text-[13px]">{formatOrderNumber(row.order_number)}</strong><span className="block truncate text-xs text-[#8a7d70]">{row.title}</span></span>
                                </Link>
                            </td>
                            <td className="w-full md:w-auto md:px-3 md:py-3"><span className="block truncate font-medium">{name}</span><span className="block truncate text-xs text-[#8a7d70]">{row.shipping_address?.phone || row.customer_email}{row.shipping_address?.area && ` · ${row.shipping_address.area}`}</span></td>
                            <td className="md:px-3 md:py-3"><StatusBadge status={row.status} /></td>
                            <td className={cn("text-xs md:px-3 md:py-3", stale ? "font-bold text-[#b4441c]" : "text-[#8a7d70]")}>{waited === 0 ? "Today" : `${waited} ${waited === 1 ? "day" : "days"}`}{stale && " · overdue"}</td>
                            <td className="text-xs text-[#8a7d70] md:px-3 md:py-3">{shortDate(row.paid_at ?? row.submitted_at)}</td>
                            <td className="ml-auto text-right font-semibold md:px-4 md:py-3">{row.currency || "GHS"} {row.total_cost}</td>
                        </tr>;
                    })}
                </tbody>
            </table>
        </div>
    </section>;
}
