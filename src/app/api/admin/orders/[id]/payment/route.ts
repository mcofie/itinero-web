import { NextResponse } from "next/server";
import { UUID_PATTERN } from "@/lib/album-server";
import { ordersAdminContext } from "@/lib/album-orders-server";
import { reconcileAlbumPayment } from "@/lib/album-payment";

export const runtime = "nodejs";

/** Looks up an order's Paystack transaction. An unpaid order that Paystack shows as paid is marked paid. */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const auth = await ordersAdminContext();
    if (!auth) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    if (!process.env.PAYSTACK_SECRET_KEY) return NextResponse.json({ error: "Paystack is not configured." }, { status: 503 });
    const { data: order } = await auth.admin.schema("itinero").from("photobooks").select("status,payment_reference").eq("id", id).maybeSingle();
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (!order.payment_reference) return NextResponse.json({ error: "This order has no Paystack reference." }, { status: 404 });

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(order.payment_reference)}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }, cache: "no-store",
    });
    const result = await response.json().catch(() => null);
    const transaction = result?.data;
    if (!response.ok || !transaction) return NextResponse.json({ error: result?.message || "Paystack did not return this transaction." }, { status: 502 });

    let reconciled: string | null = null;
    if (order.status === "pending_payment" && transaction.status === "success") {
        try { reconciled = await reconcileAlbumPayment(order.payment_reference); }
        catch { return NextResponse.json({ error: "Paystack shows a payment, but the order could not be updated." }, { status: 503 }); }
    }
    return NextResponse.json({
        status: transaction.status, amount: transaction.amount / 100, currency: transaction.currency,
        paidAt: transaction.paid_at, channel: transaction.channel, reference: transaction.reference, reconciled,
    });
}
