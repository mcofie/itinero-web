import { NextResponse } from "next/server";
import { UUID_PATTERN } from "@/lib/album-server";
import { ordersAdminContext, transitionOrder } from "@/lib/album-orders-server";

export const runtime = "nodejs";

const BULK_TARGETS = new Set(["in_review", "printing", "ready"]);

/** Moves several orders forward at once. Each order is validated on its own. */
export async function POST(request: Request) {
    const auth = await ordersAdminContext();
    if (!auth) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const body = await request.json().catch(() => null);
    const ids: unknown = body?.ids;
    const to = String(body?.to ?? "");
    if (!BULK_TARGETS.has(to) || !Array.isArray(ids) || ids.length < 1 || ids.length > 100 || ids.some(id => typeof id !== "string" || !UUID_PATTERN.test(id))) {
        return NextResponse.json({ error: "Choose up to 100 orders and a valid status." }, { status: 400 });
    }
    let updated = 0;
    const failed: { id: string; error: string }[] = [];
    for (const id of ids as string[]) {
        const result = await transitionOrder(auth.admin, id, { to, actor: auth.actor });
        if ("error" in result) failed.push({ id, error: result.error }); else updated++;
    }
    return NextResponse.json({ updated, failed });
}
