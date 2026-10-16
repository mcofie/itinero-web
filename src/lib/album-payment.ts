import { PLACED_STATUSES, type OrderStatus } from "@/lib/album-fulfilment";
import { announcePaidOrder, notifyCustomer, ORDER_FIELDS, recordOrderEvent, type OrderRow } from "@/lib/album-orders-server";
import { ALERT_COLORS, sendOrderAlert } from "@/lib/order-alerts";
import { createAdminClient } from "@/lib/supabase/admin";

type PaystackTransaction = { reference?: string; amount?: number; currency?: string; metadata?: Record<string, unknown> | null };

/** A successful Paystack charge counts for an order only if reference, amount (in pesewas), currency and order details all match. */
export function paymentMatchesOrder(transaction: PaystackTransaction, order: { reference: string; id: string; userId: string; totalCost: number }) {
    const metadata = transaction.metadata ?? {};
    return transaction.reference === order.reference && transaction.amount === Math.round(order.totalCost * 100) && transaction.currency === "GHS"
        && metadata.purpose === "album_order" && metadata.album_id === order.id && metadata.user_id === order.userId;
}

export async function reconcileAlbumPayment(reference: string): Promise<"paid" | "pending" | "invalid"> {
    if (!process.env.PAYSTACK_SECRET_KEY || !reference) return "invalid";
    const admin = createAdminClient();
    if (!admin) return "invalid";
    const { data: album } = await admin.schema("itinero").from("photobooks")
        .select("id,user_id,status,payment_reference,total_cost").eq("payment_reference", reference).maybeSingle();
    if (!album) return "invalid";
    if (PLACED_STATUSES.includes(album.status as OrderStatus)) return "paid";
    if (album.status !== "pending_payment") return "invalid";

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }, cache: "no-store",
    });
    if (!response.ok) return "pending";
    const result = await response.json().catch(() => null);
    const transaction = result?.data;
    if (!result?.status || transaction?.status !== "success") return "pending";
    if (!paymentMatchesOrder(transaction, { reference, id: album.id, userId: album.user_id, totalCost: Number(album.total_cost) })) {
        await sendOrderAlert({
            title: "⚠️ Payment doesn’t match its order",
            description: "Paystack reports a successful payment, but its amount, currency or details don’t match the order, so the order was not marked paid. Check it in Paystack.",
            fields: [["Reference", reference], ["Paystack amount", `${transaction.currency} ${transaction.amount / 100}`], ["Order total", `GHS ${album.total_cost}`]],
            orderId: album.id, color: ALERT_COLORS.problem,
        });
        return "invalid";
    }

    const now = new Date().toISOString();
    const { data: paid, error } = await admin.schema("itinero").from("photobooks")
        .update({ status: "paid", paid_at: now, status_changed_at: now, updated_at: now })
        .eq("id", album.id).eq("status", "pending_payment").eq("payment_reference", reference)
        .select(ORDER_FIELDS).maybeSingle<OrderRow>();
    if (error) throw error;
    // Only the request that made the change announces it; a concurrent webhook finds no row.
    if (paid) {
        try {
            await recordOrderEvent(admin, { photobookId: paid.id, kind: "status", fromStatus: "pending_payment", toStatus: "paid", actor: "Paystack", metadata: { reference } });
            await notifyCustomer(admin, paid, "paid");
            await announcePaidOrder(admin, paid, "paystack");
        } catch (notifyError) {
            console.error("[album-payment] Order confirmation failed:", notifyError);
        }
    }
    return "paid";
}
