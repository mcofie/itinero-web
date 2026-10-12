import { DISCOUNT_FIELDS, discountState, type AlbumDiscount } from "@/lib/album-discounts";
import { createAdminClient } from "@/lib/supabase/admin";
import DiscountsManager, { type DiscountSummary } from "./DiscountsManager";

/** Orders that count against a code's limit, and those that count as completed sales. */
const HOLDING = new Set(["pending_payment", "paid", "in_review", "changes_requested", "printing", "ready", "out_for_delivery", "delivered", "on_hold"]);

export default async function DiscountsPage() {
    const admin = createAdminClient();
    if (!admin) return <p className="mx-auto max-w-7xl p-6 text-sm">Order storage is not configured.</p>;
    const [{ data: discounts, error }, { data: orders }] = await Promise.all([
        admin.schema("itinero").from("album_discounts").select(DISCOUNT_FIELDS).order("created_at", { ascending: false }),
        admin.schema("itinero").from("photobooks").select("discount_id,discount_amount,total_cost,status").not("discount_id", "is", null),
    ]);

    const usage = new Map<string, { uses: number; sold: number; given: number; revenue: number; everUsed: boolean }>();
    for (const order of orders ?? []) {
        const entry = usage.get(order.discount_id) ?? { uses: 0, sold: 0, given: 0, revenue: 0, everUsed: false };
        entry.everUsed = true;
        if (HOLDING.has(order.status)) entry.uses++;
        if (HOLDING.has(order.status) && order.status !== "pending_payment") {
            entry.sold++;
            entry.given += Number(order.discount_amount);
            entry.revenue += Number(order.total_cost);
        }
        usage.set(order.discount_id, entry);
    }
    const now = Date.now();
    const rows: DiscountSummary[] = ((discounts ?? []) as AlbumDiscount[]).map(discount => {
        const entry = usage.get(discount.id) ?? { uses: 0, sold: 0, given: 0, revenue: 0, everUsed: false };
        return { ...discount, ...entry, state: discountState(discount, entry.uses, now) };
    });

    return <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Could not load discounts: {error.message}</p>
            : <DiscountsManager discounts={rows} />}
    </main>;
}
