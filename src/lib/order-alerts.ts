import { formatOrderNumber, isOrderStatus, STATUS_INFO } from "@/lib/album-fulfilment";
import { formatGhs } from "@/lib/album-pricing";
import { getAlbumSettings } from "@/lib/album-settings-server";
import { sendDiscordNotification } from "@/lib/discord";
import { alertEnabled, type AlertType } from "@/lib/order-alert-types";
import { SITE_URL } from "@/lib/site-metadata";
import type { createAdminClient } from "@/lib/supabase/admin";
import { TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

export const ALERT_COLORS = { money: 0x22c55e, info: 0x3b82f6, warning: 0xf59e0b, problem: 0xef4444, neutral: 0x8a7d70 } as const;

type AlertOrder = {
    id: string; order_number?: number | null; title?: string | null; destination_id?: string | null;
    customer_name?: string | null; customer_email?: string | null; status?: string | null;
    shipping_address?: { fullName?: string; phone?: string; area?: string } | null;
    total_cost?: number | null; discount_code?: string | null; discount_amount?: number | null;
};

/** The standard order fields shown on an alert. */
export function orderFields(order: AlertOrder): [string, string][] {
    const destination = order.destination_id && Object.hasOwn(TRAVEL_COVERS_BY_ID, order.destination_id)
        ? TRAVEL_COVERS_BY_ID[order.destination_id as TravelCoverId].country : order.destination_id;
    const fields: [string, string][] = [];
    if (order.order_number) fields.push(["Order", formatOrderNumber(order.order_number)]);
    fields.push(["Customer", [order.shipping_address?.fullName || order.customer_name, order.customer_email].filter(Boolean).join(" · ") || "—"]);
    if (order.title) fields.push(["Album", [order.title, destination].filter(Boolean).join(" · ")]);
    if (order.total_cost !== undefined && order.total_cost !== null) fields.push(["Total", formatGhs(Number(order.total_cost))]);
    if (order.discount_code) fields.push(["Discount", `${order.discount_code} (− ${formatGhs(Number(order.discount_amount ?? 0))})`]);
    if (order.shipping_address?.area) fields.push(["Area", order.shipping_address.area]);
    if (order.status && isOrderStatus(order.status)) fields.push(["Status", STATUS_INFO[order.status].label]);
    return fields;
}

/**
 * Posts an alert to the Discord webhook when that alert type is switched on.
 * Never throws: an alert must not break the order flow it reports on.
 */
export async function sendOrderAlert(admin: AdminClient | null, type: AlertType, alert: {
    title: string; description?: string; fields?: [string, string][]; orderId?: string; color?: number; force?: boolean;
}) {
    try {
        if (!process.env.DISCORD_WEBHOOK_URL) return;
        if (!alert.force) {
            const { alerts } = await getAlbumSettings(admin);
            if (!alertEnabled(type, alerts)) return;
        }
        await sendDiscordNotification("", {
            title: alert.title,
            description: alert.description,
            url: alert.orderId ? `${SITE_URL.origin}/admin/orders/${alert.orderId}` : undefined,
            color: alert.color ?? ALERT_COLORS.info,
            fields: (alert.fields ?? []).map(([name, value]) => ({ name, value: value.slice(0, 1024) || "—", inline: value.length < 40 })),
            timestamp: new Date().toISOString(),
            footer: { text: "Itinero orders" },
        });
    } catch (error) {
        console.error("[order-alerts] Discord alert failed:", error);
    }
}
