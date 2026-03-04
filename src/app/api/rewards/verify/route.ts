import { NextResponse } from "next/server";
import { createClientServerRoute } from "@/lib/supabase/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    if (!reference) {
        return NextResponse.json({ ok: false, message: "Missing reference" }, { status: 400 });
    }

    const sb = await createClientServerRoute();

    // Auth (server)
    const {
        data: { user },
        error: userErr,
    } = await sb.auth.getUser();

    if (userErr || !user) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    // Look for a ledger entry produced by webhook
    // ref_id is the primary match (set to tx.reference in the webhook handler)
    const { data: rows, error } = await sb
        .schema("itinero")
        .from("points_ledger")
        .select("delta, ref_type, ref_id, meta, created_at")
        .eq("user_id", user.id)
        .eq("ref_type", "paystack")
        .eq("ref_id", reference)
        .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()); // last 24h window

    if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    const credited = Array.isArray(rows) && rows.length > 0;

    // fresh balance via RPC, fallback to sum
    let balance: number | undefined;
    try {
        const { data: rpcBal, error: rpcErr } = await sb.rpc("get_points_balance");
        if (!rpcErr && typeof rpcBal === "number") {
            balance = rpcBal;
        } else {
            const { data: agg } = await sb
                .schema("itinero")
                .from("points_ledger")
                .select("sum:sum(delta)")
                .eq("user_id", user.id)
                .maybeSingle<{ sum: number | null }>();
            balance = Number(agg?.sum ?? 0);
        }
    } catch {
        // ignore; keep balance undefined
    }

    return NextResponse.json({ ok: true, credited, balance });
}