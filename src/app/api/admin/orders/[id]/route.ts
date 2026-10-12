import { NextResponse } from "next/server";
import { UUID_PATTERN } from "@/lib/album-server";
import { ordersAdminContext, recordOrderEvent, transitionOrder } from "@/lib/album-orders-server";

export const runtime = "nodejs";

/** Order changes from the orders admin: a status move, an internal note, or delivery details. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const auth = await ordersAdminContext();
    if (!auth) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const { admin, actor } = auth;
    const body = await request.json().catch(() => null);

    if (body?.action === "transition") {
        const result = await transitionOrder(admin, id, { ...body, to: String(body.to ?? ""), actor });
        if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
        return NextResponse.json({ status: result.order.status });
    }

    if (body?.action === "note") {
        const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";
        if (!message) return NextResponse.json({ error: "Write a note first." }, { status: 400 });
        const { data: order } = await admin.schema("itinero").from("photobooks").select("id").eq("id", id).maybeSingle();
        if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
        await recordOrderEvent(admin, { photobookId: id, kind: "note", message, actor });
        return NextResponse.json({ ok: true });
    }

    if (body?.action === "delivery") {
        const courierName = typeof body.courierName === "string" ? body.courierName.trim().slice(0, 80) : "";
        const courierPhone = typeof body.courierPhone === "string" ? body.courierPhone.trim().slice(0, 20) : "";
        const deliveryDate = typeof body.deliveryDate === "string" ? body.deliveryDate.trim() : "";
        if (courierPhone && !/^\+?[0-9 ()-]{8,20}$/.test(courierPhone)) return NextResponse.json({ error: "Check the rider’s phone number." }, { status: 400 });
        if (deliveryDate && !/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate)) return NextResponse.json({ error: "Check the delivery date." }, { status: 400 });
        const { data: updated, error } = await admin.schema("itinero").from("photobooks")
            .update({ courier_name: courierName || null, courier_phone: courierPhone || null, delivery_date: deliveryDate || null, updated_at: new Date().toISOString() })
            .eq("id", id).select("id").maybeSingle();
        if (error) return NextResponse.json({ error: "Could not save delivery details." }, { status: 503 });
        if (!updated) return NextResponse.json({ error: "Order not found." }, { status: 404 });
        const summary = [courierName, courierPhone, deliveryDate && `delivery ${deliveryDate}`].filter(Boolean).join(" · ") || "Delivery details cleared";
        await recordOrderEvent(admin, { photobookId: id, kind: "delivery", message: summary, actor });
        return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
