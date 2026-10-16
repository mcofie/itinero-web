import { NextRequest, NextResponse } from "next/server";
import { ALBUM_BUCKET } from "@/lib/album-order";
import { albumServerContext, isAlbumAdmin, UUID_PATTERN } from "@/lib/album-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    const { user, admin } = await albumServerContext();
    if (!user || !isAlbumAdmin(user.email)) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    if (!admin) return NextResponse.json({ error: "File storage is unavailable." }, { status: 503 });
    const { data: album } = await admin.schema("itinero").from("photobooks").select("pdf_path,cover_pdf_path").eq("id", id).maybeSingle();
    if (!album?.pdf_path) return NextResponse.json({ error: "No album PDF has been submitted." }, { status: 404 });
    const photoId = request.nextUrl.searchParams.get("photo");
    let path = request.nextUrl.searchParams.get("file") === "cover" ? album.cover_pdf_path : album.pdf_path;
    if (!path) return NextResponse.json({ error: "That print file hasn’t been built." }, { status: 404 });
    if (photoId) {
        if (!UUID_PATTERN.test(photoId)) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
        const { data: photo } = await admin.schema("itinero").from("photobook_images")
            .select("storage_path").eq("photobook_id", id).eq("id", photoId).maybeSingle();
        if (!photo) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
        path = photo.storage_path;
    }
    const { data, error } = await admin.storage.from(ALBUM_BUCKET).createSignedUrl(path, 60);
    if (error || !data?.signedUrl) return NextResponse.json({ error: "Could not open the file." }, { status: 503 });
    return NextResponse.redirect(data.signedUrl);
}
