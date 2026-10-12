import { NextRequest, NextResponse } from "next/server";
import { UUID_PATTERN } from "@/lib/album-server";
import { ordersAdminContext, ORDER_FIELDS, type OrderRow } from "@/lib/album-orders-server";
import { orderQuery, parseOrderFilters } from "@/lib/admin-order-filters";
import { formatOrderNumber, isOrderStatus, STATUS_INFO } from "@/lib/album-fulfilment";
import { TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";

export const runtime = "nodejs";

const cell = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    // Quote every cell, and stop spreadsheet apps from evaluating formulas.
    return `"${(/^[=+\-@]/.test(text) ? `'${text}` : text).replaceAll('"', '""')}"`;
};

/** CSV of selected orders (`ids`) or of an order list view (its filters), for the printer or accounts. */
export async function GET(request: NextRequest) {
    const auth = await ordersAdminContext();
    if (!auth) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const params = request.nextUrl.searchParams;
    const ids = (params.get("ids") ?? "").split(",").filter(id => UUID_PATTERN.test(id)).slice(0, 500);

    const query = ids.length
        ? auth.admin.schema("itinero").from("photobooks").select(`${ORDER_FIELDS},images:photobook_images(count)`).in("id", ids).order("order_number", { ascending: true })
        : orderQuery(auth.admin, parseOrderFilters(Object.fromEntries(params)), `${ORDER_FIELDS},images:photobook_images(count)`).limit(2000);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: "Could not export orders." }, { status: 503 });

    const origin = request.nextUrl.origin;
    const header = ["Order", "Status", "Album title", "Destination", "Year", "Typeface", "Title colour", "Layout", "Pages", "Photos",
        "Customer", "Phone", "Email", "Street", "Area", "Landmark", "Paid at", "Price", "Discount code", "Discount", "Charged", "Currency", "Rider", "Rider phone", "Delivery date", "Proof PDF"];
    const lines = ((data ?? []) as unknown as (OrderRow & { images: { count: number }[] })[]).map(order => {
        const address = order.shipping_address ?? {};
        const cover = order.destination_id && Object.hasOwn(TRAVEL_COVERS_BY_ID, order.destination_id) ? TRAVEL_COVERS_BY_ID[order.destination_id as TravelCoverId].country : order.destination_id;
        return [formatOrderNumber(order.order_number), isOrderStatus(order.status) ? STATUS_INFO[order.status].label : order.status,
            order.title, cover, order.album_year, order.cover_typeface, order.cover_text_color, order.layout, order.page_count, order.images?.[0]?.count ?? 0,
            address.fullName || order.customer_name, address.phone, order.customer_email, address.street, address.area, address.landmark,
            order.paid_at ? new Date(order.paid_at).toISOString().slice(0, 16).replace("T", " ") : "", order.subtotal ?? order.total_cost, order.discount_code, order.discount_amount, order.total_cost, order.currency,
            order.courier_name, order.courier_phone, order.delivery_date, order.pdf_path ? `${origin}/api/admin/albums/${order.id}/file` : "",
        ].map(cell).join(",");
    });
    const csv = `﻿${[header.map(cell).join(","), ...lines].join("\r\n")}\r\n`;
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="itinero-orders-${stamp}.csv"`, "Cache-Control": "no-store" } });
}
