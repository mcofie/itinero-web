import { NextResponse } from "next/server";
import { albumServerContext, UUID_PATTERN } from "@/lib/album-server";
import { quoteAlbumPrice } from "@/lib/album-pricing-server";

export const runtime = "nodejs";

/** Checks a discount code for an album before checkout. Checkout prices the order again. */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    const { user, admin } = await albumServerContext();
    if (!user) return NextResponse.json({ error: "Sign in to use a discount code." }, { status: 401 });
    if (!admin) return NextResponse.json({ error: "Discounts are unavailable right now." }, { status: 503 });
    const { data: album } = await admin.schema("itinero").from("photobooks").select("user_id").eq("id", id).maybeSingle();
    if (album && album.user_id !== user.id) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    const body = await request.json().catch(() => null);
    const quote = await quoteAlbumPrice(admin, { code: body?.code, userId: user.id, albumId: id });
    if ("error" in quote) return NextResponse.json({ error: quote.error }, { status: 400 });
    return NextResponse.json(quote);
}
