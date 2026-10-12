import { NextResponse } from "next/server";
import { ALBUM_BUCKET, ALBUM_PRICE_GHS } from "@/lib/album-order";
import { albumServerContext, UUID_PATTERN } from "@/lib/album-server";
import { TRAVEL_COVERS_BY_ID } from "@/lib/travel-covers";
import { EDITABLE_STATUSES, type OrderStatus } from "@/lib/album-fulfilment";
import { DEFAULT_COVER_TEXT_COLOR, DEFAULT_COVER_TYPEFACE, isCoverTextColor, isCoverTypeface } from "@/lib/album-cover-style";

export const runtime = "nodejs";

type PhotoInput = { id: string; name: string; storagePath: string; width: number; height: number; caption: string };

export async function POST(request: Request) {
    const { user, admin } = await albumServerContext();
    if (!user) return NextResponse.json({ error: "Sign in with Google to save this album." }, { status: 401 });
    if (!admin) return NextResponse.json({ error: "Album storage is not configured." }, { status: 503 });

    const body = await request.json().catch(() => null);
    const id = body?.id;
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const year = typeof body?.year === "string" ? body.year.trim() : "";
    const destinationId = body?.destinationId;
    const layout = body?.layout;
    const coverTypeface = body?.coverTypeface ?? DEFAULT_COVER_TYPEFACE;
    const coverTextColor = body?.coverTextColor ?? DEFAULT_COVER_TEXT_COLOR;
    const photos: PhotoInput[] = body?.photos;
    if (!UUID_PATTERN.test(id) || !title || title.length > 30 || !/^\d{4}$/.test(year) ||
        typeof destinationId !== "string" || !Object.hasOwn(TRAVEL_COVERS_BY_ID, destinationId) || !["gallery", "editorial", "collage"].includes(layout) ||
        !isCoverTypeface(coverTypeface) || !isCoverTextColor(coverTextColor) ||
        !Array.isArray(photos) || photos.length < 1 || photos.length > 40) {
        return NextResponse.json({ error: "Check the album details and photos." }, { status: 400 });
    }

    const folder = `${user.id}/${id}`;
    const ids = new Set<string>();
    for (const photo of photos) {
        if (!photo || !UUID_PATTERN.test(photo.id) || ids.has(photo.id) ||
            typeof photo.name !== "string" || photo.name.length > 200 ||
            typeof photo.storagePath !== "string" || !new RegExp(`^${folder}/${photo.id}\\.(jpe?g|png|webp|avif)$`, "i").test(photo.storagePath) ||
            !Number.isInteger(photo.width) || !Number.isInteger(photo.height) || photo.width < 1 || photo.height < 1 ||
            typeof photo.caption !== "string" || photo.caption.length > 90) {
            return NextResponse.json({ error: "One of the photos is invalid." }, { status: 400 });
        }
        ids.add(photo.id);
    }

    const { data: files, error: listError } = await admin.storage.from(ALBUM_BUCKET).list(folder, { limit: 100 });
    if (listError) return NextResponse.json({ error: "Could not confirm uploaded photos." }, { status: 503 });
    const uploaded = new Set((files ?? []).map(file => `${folder}/${file.name}`));
    if (photos.some(photo => !uploaded.has(photo.storagePath))) {
        return NextResponse.json({ error: "Some photos have not finished uploading." }, { status: 400 });
    }
    const { data: reusedIds, error: idsError } = await admin.schema("itinero").from("photobook_images")
        .select("id,photobook_id").in("id", [...ids]);
    if (idsError || (reusedIds ?? []).some(photo => photo.photobook_id !== id)) {
        return NextResponse.json({ error: "A photo ID belongs to a different album." }, { status: 409 });
    }

    const { data: existing, error: readError } = await admin.schema("itinero").from("photobooks")
        .select("id,status,user_id").eq("id", id).maybeSingle();
    if (readError) return NextResponse.json({ error: "Could not read the album." }, { status: 503 });
    if (existing && existing.user_id !== user.id) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    if (existing && !EDITABLE_STATUSES.includes(existing.status as OrderStatus)) return NextResponse.json({ error: "This order can no longer be edited." }, { status: 409 });
    // An order sent back for changes stays in that status until the customer resubmits it.
    const status = existing?.status === "changes_requested" ? "changes_requested" : "draft";

    const perPage = layout === "gallery" ? 1 : layout === "collage" ? 3 : 2;
    const values = {
        id, user_id: user.id, title, cover_template_id: destinationId, destination_id: destinationId,
        album_year: year, layout, cover_typeface: coverTypeface, cover_text_color: coverTextColor,
        page_count: Math.ceil(photos.length / perPage) + 3,
        status, total_cost: ALBUM_PRICE_GHS, currency: "GHS", updated_at: new Date().toISOString(),
    };
    const { data: savedBook, error: bookError } = existing
        ? await admin.schema("itinero").from("photobooks").update(values)
            .eq("id", id).eq("user_id", user.id).eq("status", status).select("id").maybeSingle()
        : await admin.schema("itinero").from("photobooks").insert(values).select("id").maybeSingle();
    if (bookError || !savedBook) return NextResponse.json({ error: "Could not save this draft. Refresh your albums and try again." }, { status: 409 });

    const { data: previous, error: previousError } = await admin.schema("itinero").from("photobook_images")
        .select("id,storage_path").eq("photobook_id", id);
    if (previousError) return NextResponse.json({ error: "Could not save the photo order." }, { status: 503 });
    const { error: imagesError } = await admin.schema("itinero").from("photobook_images").upsert(
        photos.map((photo, index) => ({ id: photo.id, photobook_id: id, storage_path: photo.storagePath,
            original_name: photo.name, width: photo.width, height: photo.height, order_index: index, caption: photo.caption })),
        { onConflict: "id" }
    );
    if (imagesError) return NextResponse.json({ error: "Could not save the photo order." }, { status: 503 });
    const removed = (previous ?? []).filter(photo => !ids.has(photo.id));
    if (removed.length) {
        await admin.schema("itinero").from("photobook_images").delete().in("id", removed.map(photo => photo.id));
        await admin.storage.from(ALBUM_BUCKET).remove(removed.map(photo => photo.storage_path));
    }

    return NextResponse.json({ id, status });
}
