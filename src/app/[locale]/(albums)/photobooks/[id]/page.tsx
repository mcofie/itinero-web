import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isOrderStatus, PLACED_STATUSES } from "@/lib/album-fulfilment";
import { UUID_PATTERN } from "@/lib/album-server";
import { reconcileAlbumPayment } from "@/lib/album-payment";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClientServerRSC } from "@/lib/supabase/server";
import OrderView, { PaymentProcessingView } from "./OrderView";
import { ORDER_VIEW_FIELDS, toOrderView, type OrderRow } from "./order-view-data";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrderStatusPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const { id } = await params;
    const query = await searchParams;
    const fromPayment = query.payment === "return";
    // The old album studio lived at /photobooks/create; old links go to the album builder.
    if (id === "create") redirect("/make-album");
    if (!UUID_PATTERN.test(id)) notFound();
    const sb = await createClientServerRSC();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect(`/album-login?next=${encodeURIComponent(`/photobooks/${id}`)}`);

    const select = () => sb.schema("itinero").from("photobooks").select(ORDER_VIEW_FIELDS).eq("id", id).eq("user_id", user.id).maybeSingle<OrderRow>();
    let { data: order } = await select();
    if (!order) notFound();
    // Back from Paystack: confirm the payment here, so the customer lands on a paid order.
    if (fromPayment && order.status === "pending_payment" && order.payment_reference) {
        const result = await reconcileAlbumPayment(order.payment_reference).catch(() => "pending");
        if (result === "paid") ({ data: order } = await select());
        if (!order) notFound();
    }
    if (order.status === "pending_payment" && fromPayment) return <PaymentProcessingView order={toOrderView(order)} />;
    if (!isOrderStatus(order.status) || !PLACED_STATUSES.includes(order.status)) redirect(`/make-album?id=${id}`);

    // Ownership is checked above; the timeline table is only readable with the service role.
    const admin = createAdminClient();
    const { data: events } = admin ? await admin.schema("itinero").from("photobook_order_events")
        .select("to_status,created_at").eq("photobook_id", id).eq("kind", "status").order("created_at", { ascending: true }) : { data: [] };
    const reachedAt: Record<string, string> = {};
    for (const event of events ?? []) if (event.to_status) reachedAt[event.to_status] = event.created_at;
    if (order.paid_at && !reachedAt.paid) reachedAt.paid = order.paid_at;

    // Arriving straight from payment (or a fully discounted order) shows the thank-you note.
    return <OrderView order={toOrderView(order)} reachedAt={reachedAt} justConfirmed={fromPayment || query.confirmed === "1"} />;
}
