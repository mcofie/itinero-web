import { ALBUM_PRICE_MINOR } from "@/lib/album-order";
import { createAdminClient } from "@/lib/supabase/admin";

export async function reconcileAlbumPayment(reference: string): Promise<"paid" | "pending" | "invalid"> {
    if (!process.env.PAYSTACK_SECRET_KEY || !reference) return "invalid";
    const admin = createAdminClient();
    if (!admin) return "invalid";
    const { data: album } = await admin.schema("itinero").from("photobooks")
        .select("id,user_id,status,payment_reference").eq("payment_reference", reference).maybeSingle();
    if (!album) return "invalid";
    if (["paid", "processing", "shipped"].includes(album.status)) return "paid";
    if (album.status !== "pending_payment") return "invalid";

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }, cache: "no-store",
    });
    if (!response.ok) return "pending";
    const result = await response.json().catch(() => null);
    const transaction = result?.data;
    if (!result?.status || transaction?.status !== "success") return "pending";
    const metadata = transaction.metadata ?? {};
    if (transaction.reference !== reference || transaction.amount !== ALBUM_PRICE_MINOR || transaction.currency !== "GHS" ||
        metadata.purpose !== "album_order" || metadata.album_id !== album.id || metadata.user_id !== album.user_id) {
        return "invalid";
    }

    const { error } = await admin.schema("itinero").from("photobooks")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("id", album.id).eq("status", "pending_payment").eq("payment_reference", reference);
    if (error) throw error;
    return "paid";
}
