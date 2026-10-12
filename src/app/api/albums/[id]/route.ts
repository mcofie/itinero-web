import { NextResponse } from "next/server";
import { albumServerContext, UUID_PATTERN } from "@/lib/album-server";
import { ALBUM_BUCKET } from "@/lib/album-order";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    const { user, sessionClient } = await albumServerContext();
    if (!user) return NextResponse.json({ error: "Sign in to open this album." }, { status: 401 });
    const { data: album, error } = await sessionClient.schema("itinero").from("photobooks")
        .select("id,title,destination_id,cover_template_id,album_year,layout,cover_typeface,cover_text_color,status,page_count,total_cost,currency,shipping_address,pdf_path,customer_message,order_number,subtotal,discount_code,discount_amount,created_at,updated_at")
        .eq("id", id).eq("user_id", user.id).maybeSingle();
    if (error || !album) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    const { data: photos, error: photoError } = await sessionClient.schema("itinero").from("photobook_images")
        .select("id,storage_path,original_name,width,height,caption,order_index")
        .eq("photobook_id", id).order("order_index", { ascending: true });
    if (photoError) return NextResponse.json({ error: "Could not load album photos." }, { status: 503 });
    return NextResponse.json({ album, photos: photos ?? [] });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    const { user, admin } = await albumServerContext();
    if (!user) return NextResponse.json({ error: "Sign in to delete this draft." }, { status: 401 });
    if (!admin) return NextResponse.json({ error: "Album storage is unavailable." }, { status: 503 });
    const { data: album } = await admin.schema("itinero").from("photobooks")
        .select("id,status").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (!album) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    if (album.status !== "draft") return NextResponse.json({ error: "Placed orders cannot be deleted here." }, { status: 409 });
    const folder = `${user.id}/${id}`;
    const { data: files, error: listError } = await admin.storage.from(ALBUM_BUCKET).list(folder, { limit: 100 });
    if (listError) return NextResponse.json({ error: "Could not list stored photos." }, { status: 503 });
    if (files?.length) {
        const { error: removeError } = await admin.storage.from(ALBUM_BUCKET).remove(files.map(file => `${folder}/${file.name}`));
        if (removeError) return NextResponse.json({ error: "Could not remove stored photos." }, { status: 503 });
    }
    const { error: deleteError } = await admin.schema("itinero").from("photobooks")
        .delete().eq("id", id).eq("user_id", user.id).eq("status", "draft");
    if (deleteError) return NextResponse.json({ error: "Could not delete this draft." }, { status: 503 });
    return NextResponse.json({ deleted: true });
}
