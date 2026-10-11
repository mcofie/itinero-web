import { NextRequest, NextResponse } from "next/server";
import { albumServerContext } from "@/lib/album-server";
import { reconcileAlbumPayment } from "@/lib/album-payment";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    const reference = request.nextUrl.searchParams.get("reference") ?? "";
    if (!reference || reference.length > 150) return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });
    const { user, admin } = await albumServerContext();
    if (!user) return NextResponse.json({ error: "Sign in to check this payment." }, { status: 401 });
    if (!admin) return NextResponse.json({ error: "Payment verification is unavailable." }, { status: 503 });
    const { data: album } = await admin.schema("itinero").from("photobooks")
        .select("id").eq("payment_reference", reference).eq("user_id", user.id).maybeSingle();
    if (!album) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    try {
        const status = await reconcileAlbumPayment(reference);
        return NextResponse.json({ status, albumId: album.id });
    } catch {
        return NextResponse.json({ error: "Payment verification is temporarily unavailable." }, { status: 503 });
    }
}
