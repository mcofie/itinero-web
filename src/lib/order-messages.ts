import { formatOrderNumber, type OrderStatus } from "@/lib/album-fulfilment";

/** Customer-facing order update text, shared by the email sender and the
 * admin's WhatsApp button. Safe to import in the browser.
 */
export type OrderMessageInput = {
    id: string;
    title: string;
    orderNumber: number | null;
    customerName: string | null;
    customerMessage?: string | null;
    courierName?: string | null;
    courierPhone?: string | null;
    deliveryDate?: string | null;
    siteUrl: string;
};

/** Statuses that send the customer an automatic update. */
export const NOTIFY_STATUSES: readonly OrderStatus[] = ["paid", "changes_requested", "printing", "out_for_delivery", "delivered", "cancelled"];

export function orderTrackingUrl(siteUrl: string, id: string) {
    return `${siteUrl.replace(/\/$/, "")}/photobooks/${id}`;
}

export function orderMessage(status: OrderStatus, order: OrderMessageInput): { subject: string; body: string } | null {
    const number = formatOrderNumber(order.orderNumber);
    const album = `“${order.title}”`;
    const firstName = order.customerName?.trim().split(/\s+/)[0];
    const greeting = firstName ? `Hi ${firstName},` : "Hi,";
    const track = `Follow your order: ${orderTrackingUrl(order.siteUrl, order.id)}`;
    const date = order.deliveryDate
        ? new Date(`${order.deliveryDate}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
        : null;

    switch (status) {
        case "paid":
            return { subject: `We’ve got your album order ${number}`, body: `${greeting}\n\nThank you for your order ${number}. We’ve received your payment for your album ${album}.\n\nWe’ll check your photos and pages before printing, and keep you posted along the way.\n\n${track}` };
        case "changes_requested":
            return { subject: `A quick change for your album ${number}`, body: `${greeting}\n\nBefore we print your album ${album} (${number}), we need a small change:\n\n${order.customerMessage?.trim() || "Please review your photos."}\n\nOpen your order to update the album and send it back to us: ${orderTrackingUrl(order.siteUrl, order.id)}` };
        case "printing":
            return { subject: `Your album ${number} is being printed`, body: `${greeting}\n\nGood news: your album ${album} (${number}) is now being printed and bound.\n\n${track}` };
        case "out_for_delivery": {
            const rider = order.courierName ? `\n\nYour delivery is with ${order.courierName}${order.courierPhone ? ` (${order.courierPhone})` : ""}.` : "";
            const when = date ? `\n\nExpected delivery: ${date}.` : "";
            return { subject: `Your album ${number} is on its way`, body: `${greeting}\n\nYour album ${album} (${number}) is on its way to you.${rider}${when}\n\n${track}` };
        }
        case "delivered":
            return { subject: `Your album ${number} has been delivered`, body: `${greeting}\n\nYour album ${album} (${number}) has been delivered. We hope you love holding your trip in your hands.\n\nThank you for making it with Itinero.` };
        case "cancelled":
            return { subject: `Your album order ${number} was cancelled`, body: `${greeting}\n\nYour album order ${number} for ${album} has been cancelled. If you have any questions, just reply to this message.` };
        default:
            return null;
    }
}
