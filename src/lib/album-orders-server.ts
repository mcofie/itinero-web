import { allowedMoves, formatOrderNumber, isOrderStatus, moveRequirements, STATUS_INFO, type OrderStatus } from "@/lib/album-fulfilment";
import { albumServerContext, isAlbumAdmin } from "@/lib/album-server";
import { NOTIFY_STATUSES, orderMessage } from "@/lib/order-messages";
import { ALERT_COLORS, orderFields, sendOrderAlert } from "@/lib/order-alerts";
import { discountUses } from "@/lib/album-pricing-server";
import { SITE_URL } from "@/lib/site-metadata";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

export const ORDER_FIELDS = "id,user_id,order_number,title,status,held_from_status,destination_id,cover_template_id,album_year,layout,cover_typeface,cover_text_color,page_count,subtotal,discount_id,discount_code,discount_amount,delivery_fee,tax_rate,tax_amount,total_cost,currency,shipping_address,pdf_path,payment_reference,customer_email,customer_name,customer_message,courier_name,courier_phone,delivery_date,delivered_at,paid_at,submitted_at,status_changed_at,created_at,updated_at";

export type OrderRow = {
    id: string;
    user_id: string;
    order_number: number | null;
    title: string;
    status: string;
    held_from_status: string | null;
    destination_id: string | null;
    cover_template_id: string;
    album_year: string | null;
    layout: string | null;
    cover_typeface: string | null;
    cover_text_color: string | null;
    page_count: number | null;
    subtotal: number | null;
    discount_id: string | null;
    discount_code: string | null;
    discount_amount: number | null;
    delivery_fee: number | null;
    tax_rate: number | null;
    tax_amount: number | null;
    total_cost: number | null;
    currency: string | null;
    shipping_address: { fullName?: string; phone?: string; street?: string; area?: string; landmark?: string } | null;
    pdf_path: string | null;
    payment_reference: string | null;
    customer_email: string | null;
    customer_name: string | null;
    customer_message: string | null;
    courier_name: string | null;
    courier_phone: string | null;
    delivery_date: string | null;
    delivered_at: string | null;
    paid_at: string | null;
    submitted_at: string | null;
    status_changed_at: string | null;
    created_at: string;
    updated_at: string | null;
};

/** The signed-in orders admin with a service-role client, or null. */
export async function ordersAdminContext() {
    const { user, admin } = await albumServerContext();
    if (!user || !admin || !isAlbumAdmin(user.email)) return null;
    return { user, admin, actor: user.email ?? "admin" };
}

export async function recordOrderEvent(admin: AdminClient, event: {
    photobookId: string; kind: "status" | "note" | "notification" | "delivery";
    fromStatus?: string | null; toStatus?: string | null; message?: string | null;
    actor: string; metadata?: Record<string, unknown>;
}) {
    const { error } = await admin.schema("itinero").from("photobook_order_events").insert({
        photobook_id: event.photobookId, kind: event.kind, from_status: event.fromStatus ?? null,
        to_status: event.toStatus ?? null, message: event.message ?? null, actor: event.actor, metadata: event.metadata ?? {},
    });
    if (error) console.error("[orders] Could not record order event:", error.message);
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

function emailHtml(body: string) {
    const html = escapeHtml(body)
        .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#c16b36">$1</a>')
        .split("\n\n").map(paragraph => `<p style="margin:0 0 16px">${paragraph.replaceAll("\n", "<br>")}</p>`).join("");
    return `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.55;color:#2b1a07;max-width:560px">${html}<p style="margin:24px 0 0;font-size:13px;color:#8a7d70">Itinero · travel albums</p></div>`;
}

/** Emails the customer about a status change and logs the attempt on the timeline. */
export async function notifyCustomer(admin: AdminClient, order: OrderRow, status: OrderStatus) {
    const message = orderMessage(status, {
        id: order.id, title: order.title, orderNumber: order.order_number,
        customerName: order.shipping_address?.fullName || order.customer_name,
        customerMessage: order.customer_message, courierName: order.courier_name,
        courierPhone: order.courier_phone, deliveryDate: order.delivery_date, siteUrl: SITE_URL.origin,
    });
    if (!message) return;
    const to = order.customer_email;
    let result: "sent" | "skipped" | "failed";
    let detail = "";
    if (!to) { result = "skipped"; detail = "No customer email on the order."; }
    else if (!process.env.RESEND_API_KEY || !process.env.ORDER_EMAIL_FROM) { result = "skipped"; detail = "Email sending is not set up yet."; }
    else {
        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    from: process.env.ORDER_EMAIL_FROM, to: [to], subject: message.subject,
                    text: message.body, html: emailHtml(message.body),
                    ...(process.env.ORDER_EMAIL_REPLY_TO ? { reply_to: process.env.ORDER_EMAIL_REPLY_TO } : {}),
                }),
                cache: "no-store",
            });
            result = response.ok ? "sent" : "failed";
            if (!response.ok) detail = (await response.text().catch(() => "")).slice(0, 300);
        } catch (error) {
            result = "failed"; detail = error instanceof Error ? error.message : "Network error";
        }
    }
    await recordOrderEvent(admin, {
        photobookId: order.id, kind: "notification", toStatus: status, message: message.subject,
        actor: "system", metadata: { channel: "email", result, detail, to },
    });
    if (result === "failed") {
        await sendOrderAlert(admin, "email_failed", {
            title: `Email to customer failed · ${message.subject}`, description: detail || undefined,
            fields: orderFields(order), orderId: order.id, color: ALERT_COLORS.problem,
        });
    }
}

/** Announces a newly paid order, and warns when its discount code has just been used up. */
export async function announcePaidOrder(admin: AdminClient, order: OrderRow, how: "paystack" | "free") {
    await sendOrderAlert(admin, how === "free" ? "free_order" : "order_paid", {
        title: how === "free" ? `🎁 Free order ${formatOrderNumber(order.order_number)}` : `💰 New order ${formatOrderNumber(order.order_number)}`,
        fields: orderFields(order), orderId: order.id, color: ALERT_COLORS.money,
    });
    if (!order.discount_id) return;
    const { data: discount } = await admin.schema("itinero").from("album_discounts").select("code,max_uses").eq("id", order.discount_id).maybeSingle();
    if (!discount?.max_uses) return;
    const uses = await discountUses(admin, order.discount_id);
    if (uses !== null && uses >= discount.max_uses) {
        await sendOrderAlert(admin, "discount_used_up", {
            title: `🏷️ Discount code ${discount.code} is used up`, description: `All ${discount.max_uses} uses are taken. Pause it or raise the limit in Discounts.`,
            color: ALERT_COLORS.warning,
        });
    }
}

export type TransitionInput = {
    to: string;
    actor: string;
    note?: unknown;
    customerMessage?: unknown;
    courierName?: unknown;
    courierPhone?: unknown;
    deliveryDate?: unknown;
};

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

/** Validates and applies a status move, then records and announces it. */
export async function transitionOrder(admin: AdminClient, id: string, input: TransitionInput):
    Promise<{ order: OrderRow } | { error: string; status: number }> {
    const { data: order, error: readError } = await admin.schema("itinero").from("photobooks")
        .select(ORDER_FIELDS).eq("id", id).maybeSingle<OrderRow>();
    if (readError) return { error: "Could not read the order.", status: 503 };
    if (!order || !isOrderStatus(order.status)) return { error: "Order not found.", status: 404 };
    const from = order.status;
    const move = allowedMoves(from, order.held_from_status).find(item => item.to === input.to);
    if (!move) return { error: "That status change isn’t allowed from here. Refresh and try again.", status: 409 };

    const required = moveRequirements(move);
    const note = text(input.note, 1000);
    const customerMessage = text(input.customerMessage, 1000);
    const courierName = text(input.courierName, 80);
    const courierPhone = text(input.courierPhone, 20);
    const deliveryDate = text(input.deliveryDate, 10);
    if (required.note && !note) return { error: "Add a short reason for this change.", status: 400 };
    if (required.customerMessage && !customerMessage) return { error: "Tell the customer what to change.", status: 400 };
    if (courierPhone && !/^\+?[0-9 ()-]{8,20}$/.test(courierPhone)) return { error: "Check the rider’s phone number.", status: 400 };
    if (deliveryDate && !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) return { error: "Check the delivery date.", status: 400 };

    const now = new Date().toISOString();
    const update: Record<string, unknown> = { status: move.to, status_changed_at: now, updated_at: now };
    if (move.kind === "hold") update.held_from_status = from;
    if (from === "on_hold") update.held_from_status = null;
    if (move.to === "changes_requested") update.customer_message = customerMessage;
    if (from === "changes_requested") update.customer_message = null;
    if (required.delivery) Object.assign(update, { courier_name: courierName || null, courier_phone: courierPhone || null, delivery_date: deliveryDate || null });
    if (move.to === "delivered") update.delivered_at = now;
    if (from === "delivered") update.delivered_at = null;

    const { data: updated, error } = await admin.schema("itinero").from("photobooks")
        .update(update).eq("id", id).eq("status", from).select(ORDER_FIELDS).maybeSingle<OrderRow>();
    if (error) return { error: "Could not update the order.", status: 503 };
    if (!updated) return { error: "This order changed in the meantime. Refresh and try again.", status: 409 };

    await recordOrderEvent(admin, {
        photobookId: id, kind: "status", fromStatus: from, toStatus: move.to, message: note || null, actor: input.actor,
        metadata: move.to === "changes_requested" ? { customerMessage } : {},
    });
    if ((move.kind === "forward" || move.kind === "cancel") && NOTIFY_STATUSES.includes(move.to)) {
        await notifyCustomer(admin, updated, move.to);
    }
    const fields = orderFields(updated);
    if (note) fields.push(["Note", note]);
    if (move.to === "cancelled") {
        await sendOrderAlert(admin, "order_cancelled", { title: `Order ${formatOrderNumber(updated.order_number)} cancelled`, fields, orderId: id, color: ALERT_COLORS.neutral });
    } else if (from === "changes_requested" && move.to === "in_review" && input.actor === updated.customer_email) {
        await sendOrderAlert(admin, "customer_resubmitted", { title: `✏️ ${formatOrderNumber(updated.order_number)} updated by the customer`, description: "The album is back in review.", fields, orderId: id, color: ALERT_COLORS.info });
    } else {
        await sendOrderAlert(admin, "status_changed", { title: `${formatOrderNumber(updated.order_number)}: ${STATUS_INFO[from].label} → ${STATUS_INFO[move.to].label}`, fields, orderId: id, color: ALERT_COLORS.neutral });
    }
    return { order: updated };
}
