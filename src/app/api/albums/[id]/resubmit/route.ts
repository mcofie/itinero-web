import { NextResponse } from "next/server";
import { albumServerContext, UUID_PATTERN } from "@/lib/album-server";
import { transitionOrder } from "@/lib/album-orders-server";

export const runtime = "nodejs";

/** Sends an album the customer updated after a change request back for review. */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    const { user, admin } = await albumServerContext();
    if (!user) return NextResponse.json({ error: "Sign in to update this order." }, { status: 401 });
    if (!admin) return NextResponse.json({ error: "Album storage is unavailable." }, { status: 503 });

    const { data: album } = await admin.schema("itinero").from("photobooks")
        .select("id,user_id,status").eq("id", id).maybeSingle();
    if (!album || album.user_id !== user.id) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    if (album.status !== "changes_requested") return NextResponse.json({ error: "This order isn’t waiting for changes." }, { status: 409 });

    const result = await transitionOrder(admin, id, { to: "in_review", actor: user.email ?? "customer", note: "Customer sent an updated album." });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ status: result.order.status });
}
