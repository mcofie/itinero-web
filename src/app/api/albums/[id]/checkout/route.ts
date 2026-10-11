import { NextRequest, NextResponse } from "next/server";
import { ALBUM_BUCKET, ALBUM_PRICE_GHS, ALBUM_PRICE_MINOR, parseAccraAddress } from "@/lib/album-order";
import { albumServerContext, UUID_PATTERN } from "@/lib/album-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    const { user, admin } = await albumServerContext();
    if (!user) return NextResponse.json({ error: "Sign in with Google before ordering." }, { status: 401 });
    if (!user.email) return NextResponse.json({ error: "Your Google account needs an email address for payment." }, { status: 400 });
    if (!admin || !process.env.PAYSTACK_SECRET_KEY) return NextResponse.json({ error: "Checkout is not configured." }, { status: 503 });
    const body = await request.json().catch(() => null);
    if (body?.confirmedAccra !== true) return NextResponse.json({ error: "Confirm that the delivery address is within Accra." }, { status: 400 });
    const address = parseAccraAddress(body?.shippingAddress);
    if (!address) return NextResponse.json({ error: "Enter a name, phone number, street and Accra area." }, { status: 400 });

    const { data: album, error: albumError } = await admin.schema("itinero").from("photobooks")
        .select("id,user_id,status,page_count,payment_reference,payment_url").eq("id", id).maybeSingle();
    if (albumError || !album || album.user_id !== user.id) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    if (!["draft", "pending_payment"].includes(album.status)) return NextResponse.json({ error: "This album has already been ordered." }, { status: 409 });
    if (album.status === "pending_payment") {
        if (!album.payment_url || !album.payment_reference) {
            return NextResponse.json({ error: "This payment needs help from our team. Please contact us before trying again." }, { status: 409 });
        }
        const { data: updated, error: updateError } = await admin.schema("itinero").from("photobooks")
            .update({ shipping_address: address, updated_at: new Date().toISOString() })
            .eq("id", id).eq("user_id", user.id).eq("status", "pending_payment").select("id").maybeSingle();
        if (updateError || !updated) return NextResponse.json({ error: "Could not update delivery details. Please refresh your albums." }, { status: 409 });
        return NextResponse.json({ authorizationUrl: album.payment_url, reference: album.payment_reference });
    }
    const { count, error: countError } = await admin.schema("itinero").from("photobook_images")
        .select("id", { count: "exact", head: true }).eq("photobook_id", id);
    if (countError || !count) return NextResponse.json({ error: "Save at least one photo before ordering." }, { status: 400 });
    const proofPath = `${user.id}/${id}/proof.pdf`;
    const { data: files, error: listError } = await admin.storage.from(ALBUM_BUCKET).list(`${user.id}/${id}`, { limit: 100 });
    if (listError || !(files ?? []).some(file => file.name === "proof.pdf")) {
        return NextResponse.json({ error: "Your album PDF is still uploading." }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            email: user.email, amount: ALBUM_PRICE_MINOR, currency: "GHS",
            callback_url: `${origin}/photobooks?payment=return`,
            metadata: { purpose: "album_order", album_id: id, user_id: user.id },
        }),
        cache: "no-store",
    });
    const payment = await paystackResponse.json().catch(() => null);
    if (!paystackResponse.ok || !payment?.status || !payment?.data?.authorization_url || !payment?.data?.reference) {
        return NextResponse.json({ error: "Could not open secure payment. Please try again." }, { status: 502 });
    }

    const { data: saved, error: saveError } = await admin.schema("itinero").from("photobooks").update({
        status: "pending_payment", shipping_address: address, pdf_path: proofPath,
        total_cost: ALBUM_PRICE_GHS, currency: "GHS", payment_reference: payment.data.reference,
        payment_url: payment.data.authorization_url,
        submitted_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq("id", id).eq("user_id", user.id).eq("status", "draft").select("id").maybeSingle();
    if (saveError || !saved) return NextResponse.json({ error: "Could not record your order. Please try again." }, { status: 503 });
    return NextResponse.json({ authorizationUrl: payment.data.authorization_url, reference: payment.data.reference });
}
