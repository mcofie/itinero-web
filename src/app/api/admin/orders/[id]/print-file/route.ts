import { NextResponse } from "next/server";
import { ALBUM_BUCKET } from "@/lib/album-order";
import { getAlbumSettings } from "@/lib/album-settings-server";

const PRINT_ASSETS_BUCKET = "print-assets";
import { normalizePageText } from "@/lib/album-page-text";
import { UUID_PATTERN } from "@/lib/album-server";
import { ordersAdminContext, recordOrderEvent } from "@/lib/album-orders-server";
import { TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";

export const runtime = "nodejs";

/**
 * The print file is built in the admin's browser from the original photos, then stored privately.
 * `prepare` returns the album, short-lived photo and cover art links, the print spec and two upload slots;
 * `complete` attaches the uploaded interior and cover spread to the order.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const auth = await ordersAdminContext();
    if (!auth) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const body = await request.json().catch(() => null);
    const { data: order } = await auth.admin.schema("itinero").from("photobooks")
        .select("id,user_id,status,title,album_year,destination_id,cover_template_id,cover_typeface,cover_text_color,cover_color,layout,page_text")
        .eq("id", id).maybeSingle();
    if (!order || ["draft", "pending_payment"].includes(order.status)) return NextResponse.json({ error: "Only paid orders get a print file." }, { status: 409 });
    const folder = `${order.user_id}/${id}`;

    if (body?.action === "prepare") {
        const { data: photos, error } = await auth.admin.schema("itinero").from("photobook_images")
            .select("id,storage_path,original_name,width,height,caption,order_index,focus_x,focus_y").eq("photobook_id", id).order("order_index", { ascending: true });
        if (error || !photos?.length) return NextResponse.json({ error: "This order has no photos." }, { status: 409 });
        const { data: signed, error: signError } = await auth.admin.storage.from(ALBUM_BUCKET).createSignedUrls(photos.map(photo => photo.storage_path), 3600);
        if (signError || !signed) return NextResponse.json({ error: "Could not open the original photos." }, { status: 503 });
        const stamp = Date.now();
        const paths = { interior: `${folder}/interior-${stamp}.pdf`, cover: `${folder}/cover-${stamp}.pdf` };
        const [interiorUpload, coverUpload] = await Promise.all([
            auth.admin.storage.from(ALBUM_BUCKET).createSignedUploadUrl(paths.interior),
            auth.admin.storage.from(ALBUM_BUCKET).createSignedUploadUrl(paths.cover),
        ]);
        if (interiorUpload.error || coverUpload.error || !interiorUpload.data || !coverUpload.data) return NextResponse.json({ error: "Could not prepare file storage." }, { status: 503 });
        const coverId = (order.destination_id ?? order.cover_template_id) as TravelCoverId;
        const cover = TRAVEL_COVERS_BY_ID[coverId] ?? TRAVEL_COVERS_BY_ID.italy;
        const background = order.cover_color ?? "auto";
        // Print-resolution art lives in the private print-assets bucket; without it the web image is used.
        const artPath = `${background === "auto" ? "print-covers" : "cover-objects"}/${Object.hasOwn(TRAVEL_COVERS_BY_ID, coverId) ? coverId : "italy"}.webp`;
        const { data: art } = await auth.admin.storage.from(PRINT_ASSETS_BUCKET).createSignedUrl(artPath, 3600);
        const { printSpec } = await getAlbumSettings(auth.admin);
        return NextResponse.json({
            album: {
                title: order.title, year: order.album_year ?? "", coverId: Object.hasOwn(TRAVEL_COVERS_BY_ID, coverId) ? coverId : "italy",
                destination: cover.country, coverColor: cover.color, typeface: order.cover_typeface, textColor: order.cover_text_color, background, layout: order.layout,
                pageText: normalizePageText(order.page_text),
            },
            photos: photos.map((photo, index) => ({ id: photo.id, name: photo.original_name ?? `Photo ${index + 1}`, width: photo.width, height: photo.height, caption: photo.caption ?? "", focusX: Number(photo.focus_x ?? 0.5), focusY: Number(photo.focus_y ?? 0.5), url: signed[index]?.signedUrl })),
            upload: { interior: { path: paths.interior, token: interiorUpload.data.token }, cover: { path: paths.cover, token: coverUpload.data.token } },
            coverArtUrl: art?.signedUrl ?? null,
            printSpec,
        });
    }

    if (body?.action === "complete") {
        const interiorPath = typeof body.interiorPath === "string" ? body.interiorPath : "";
        const coverPath = typeof body.coverPath === "string" ? body.coverPath : "";
        if (!new RegExp(`^${folder}/interior-\\d+\\.pdf$`).test(interiorPath) || !new RegExp(`^${folder}/cover-\\d+\\.pdf$`).test(coverPath)) {
            return NextResponse.json({ error: "Unexpected file path." }, { status: 400 });
        }
        const { data: files } = await auth.admin.storage.from(ALBUM_BUCKET).list(folder, { limit: 200 });
        const names = new Set((files ?? []).map(file => `${folder}/${file.name}`));
        if (!names.has(interiorPath) || !names.has(coverPath)) return NextResponse.json({ error: "The print files didn’t finish uploading." }, { status: 409 });
        const { error } = await auth.admin.schema("itinero").from("photobooks")
            .update({ pdf_path: interiorPath, cover_pdf_path: coverPath, updated_at: new Date().toISOString() }).eq("id", id);
        if (error) return NextResponse.json({ error: "Could not save the print files." }, { status: 503 });
        // Older print files are replaced; customers can't read any of them.
        const stale = [...names].filter(name => name !== interiorPath && name !== coverPath && /\/(print-\d+|interior-\d+|cover-\d+|proof)\.pdf$/.test(name));
        if (stale.length) await auth.admin.storage.from(ALBUM_BUCKET).remove(stale);
        const spine = typeof body.spineMm === "number" ? ` Spine ${body.spineMm} mm.` : "";
        await recordOrderEvent(auth.admin, { photobookId: id, kind: "note", message: `Print files built: interior and cover spread.${spine}`, actor: auth.actor });
        return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
