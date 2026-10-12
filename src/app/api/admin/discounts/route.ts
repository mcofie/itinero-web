import { NextResponse } from "next/server";
import { ordersAdminContext } from "@/lib/album-orders-server";
import { parseNewDiscount } from "@/lib/admin-discount-input";

export const runtime = "nodejs";

export async function POST(request: Request) {
    const auth = await ordersAdminContext();
    if (!auth) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const input = parseNewDiscount(await request.json().catch(() => null));
    if ("error" in input) return NextResponse.json({ error: input.error }, { status: 400 });
    const { data, error } = await auth.admin.schema("itinero").from("album_discounts")
        .insert({ ...input, active: true, created_by: auth.actor }).select("id").maybeSingle();
    if (error?.code === "23505") return NextResponse.json({ error: "That code already exists." }, { status: 409 });
    if (error || !data) return NextResponse.json({ error: "Could not create the discount." }, { status: 503 });
    return NextResponse.json({ id: data.id });
}
