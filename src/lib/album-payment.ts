import { PLACED_STATUSES, type OrderStatus } from "@/lib/album-fulfilment";
import { notifyCustomer, ORDER_FIELDS, recordOrderEvent, type OrderRow } from "@/lib/album-orders-server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const metadata = transaction.metadata ?? {};
    if (transaction.reference !== reference || transaction.amount !== Math.round(Number(album.total_cost) * 100) || transaction.currency !== "GHS" ||
        metadata.purpose !== "album_order" || metadata.album_id !== album.id || metadata.user_id !== album.user_id) {
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
        } catch (notifyError) {
            console.error("[album-payment] Order confirmation failed:", notifyError);
        }
    }
    return "paid";
}
