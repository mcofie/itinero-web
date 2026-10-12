import { PLACED_STATUSES, type OrderStatus } from "@/lib/album-fulfilment";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

export const ORDER_TABS = [
    { id: "todo", label: "To do", statuses: ["paid", "in_review"], sort: "waiting" },
    { id: "customer", label: "Waiting on customer", statuses: ["changes_requested"], sort: "waiting" },
    { id: "printing", label: "Printing", statuses: ["printing", "ready"], sort: "waiting" },
    { id: "delivery", label: "Out for delivery", statuses: ["out_for_delivery"], sort: "waiting" },
    { id: "delivered", label: "Delivered", statuses: ["delivered"], sort: "newest" },
    { id: "on_hold", label: "On hold", statuses: ["on_hold"], sort: "waiting" },
    { id: "cancelled", label: "Cancelled", statuses: ["cancelled"], sort: "newest" },
    { id: "unpaid", label: "Awaiting payment", statuses: ["pending_payment"], sort: "newest" },
    { id: "all", label: "All orders", statuses: [...PLACED_STATUSES], sort: "newest" },
] as const satisfies readonly { id: string; label: string; statuses: readonly OrderStatus[]; sort: OrderSort }[];

export type OrderTab = (typeof ORDER_TABS)[number];
export type OrderSort = "waiting" | "newest" | "oldest";

export const ORDER_LIST_FIELDS = "id,order_number,title,status,cover_template_id,album_year,cover_typeface,cover_text_color,customer_name,customer_email,shipping_address,paid_at,submitted_at,status_changed_at,created_at,total_cost,currency";

export type OrderFilters = { tab: OrderTab; q: string; from: string; to: string; sort: OrderSort; page: number };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export function parseOrderFilters(params: Record<string, string | string[] | undefined>): OrderFilters {
    const tab = ORDER_TABS.find(item => item.id === first(params.tab)) ?? ORDER_TABS[0];
    const sortParam = first(params.sort);
    const sort: OrderSort = sortParam === "newest" || sortParam === "oldest" || sortParam === "waiting" ? sortParam : tab.sort;
    const date = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
    return {
        tab, sort,
        q: first(params.q).slice(0, 80),
        from: date(first(params.from)),
        to: date(first(params.to)),
        page: Math.max(1, Number.parseInt(first(params.page), 10) || 1),
    };
}

/** Builds the orders query for a set of filters. Callers add paging. */
export function orderQuery(admin: AdminClient, filters: OrderFilters, fields: string, options?: { count?: "exact" }) {
    let query = admin.schema("itinero").from("photobooks").select(fields, options).in("status", [...filters.tab.statuses]);
    // Keep only characters that are safe inside a PostgREST filter value.
    const term = filters.q.replace(/[^\p{L}\p{N}@.+\- ]/gu, "").trim();
    const orderNumber = term.match(/^(?:itn-?)?(\d{3,})$/i);
    if (orderNumber) query = query.eq("order_number", Number(orderNumber[1]));
    else if (term) {
        const like = `"%${term}%"`;
        query = query.or([
            `customer_name.ilike.${like}`, `customer_email.ilike.${like}`, `title.ilike.${like}`,
            `payment_reference.ilike.${like}`, `shipping_address->>phone.ilike.${like}`, `shipping_address->>fullName.ilike.${like}`,
        ].join(","));
    }
    const dateColumn = filters.tab.id === "unpaid" ? "submitted_at" : "paid_at";
    if (filters.from) query = query.gte(dateColumn, `${filters.from}T00:00:00Z`);
    if (filters.to) query = query.lte(dateColumn, `${filters.to}T23:59:59Z`);
    if (filters.sort === "waiting") query = query.order("status_changed_at", { ascending: true, nullsFirst: true });
    else query = query.order(dateColumn, { ascending: filters.sort === "oldest", nullsFirst: false });
    return query.order("created_at", { ascending: false });
}
