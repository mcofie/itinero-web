import { NextResponse } from "next/server";
import { UUID_PATTERN } from "@/lib/album-server";
import { ordersAdminContext } from "@/lib/album-orders-server";
import { parseDiscountLimits } from "@/lib/admin-discount-input";

export const runtime = "nodejs";

/** Pauses or resumes a code (`active`), or changes its description, dates and limits. Code and amount stay fixed once created. */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Discount not found." }, { status: 404 });
    const auth = await ordersAdminContext();
    if (!auth) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const body = await request.json().catch(() => null);
    let update: Record<string, unknown>;
    if (typeof body?.active === "boolean" && Object.keys(body).length === 1) update = { active: body.active };
    else {
        const limits = parseDiscountLimits(body);
        if ("error" in limits) return NextResponse.json({ error: limits.error }, { status: 400 });
        update = { ...limits };
    }
    const { data, error } = await auth.admin.schema("itinero").from("album_discounts").update(update).eq("id", id).select("id").maybeSingle();
    if (error) return NextResponse.json({ error: "Could not update the discount." }, { status: 503 });
    if (!data) return NextResponse.json({ error: "Discount not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
}

/** Deletes a code that no order has used. Used codes are paused instead, to keep order history intact. */
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Discount not found." }, { status: 404 });
    const auth = await ordersAdminContext();
    if (!auth) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const { count, error: countError } = await auth.admin.schema("itinero").from("photobooks")
        .select("id", { count: "exact", head: true }).eq("discount_id", id);
    if (countError) return NextResponse.json({ error: "Could not check the discount." }, { status: 503 });
    if (count) return NextResponse.json({ error: "This code has been used on orders. Pause it instead." }, { status: 409 });
    const { error } = await auth.admin.schema("itinero").from("album_discounts").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Could not delete the discount." }, { status: 503 });
    return NextResponse.json({ deleted: true });
}
