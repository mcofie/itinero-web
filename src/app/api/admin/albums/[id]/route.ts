import { NextResponse } from "next/server";
import { albumServerContext, isAlbumAdmin, UUID_PATTERN } from "@/lib/album-server";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "Album not found." }, { status: 404 });
    const { user, admin } = await albumServerContext();
    if (!user || !(await isAlbumAdmin(user.id, user.email))) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    if (!admin) return NextResponse.json({ error: "Admin storage is unavailable." }, { status: 503 });
    const body = await request.json().catch(() => null);
    const next = body?.status;
    const allowed: Record<string, string[]> = { paid: ["processing"], processing: ["shipped"] };
    const { data: album } = await admin.schema("itinero").from("photobooks").select("status").eq("id", id).maybeSingle();
    if (!album || !allowed[album.status]?.includes(next)) {
        return NextResponse.json({ error: "This status change is not allowed." }, { status: 409 });
    }
    const { data: updated, error } = await admin.schema("itinero").from("photobooks")
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq("id", id).eq("status", album.status).select("status").maybeSingle();
    if (error || !updated) return NextResponse.json({ error: "Could not update the order." }, { status: 503 });
    return NextResponse.json({ status: updated.status });
}
