// /app/api/paystack/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClientServerRSC } from "@/lib/supabase/server";

const WH_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY!;

export async function POST(req: NextRequest) {
    const raw = await req.text();
    const sig = req.headers.get("x-paystack-signature") ?? "";
    const hash = crypto.createHmac("sha512", WH_SECRET).update(raw).digest("hex");
    if (hash !== sig) return NextResponse.json({ ok: false }, { status: 401 });

    const evt = JSON.parse(raw);

    if (evt.event === "charge.success") {
        const tx = evt.data;
        const meta = tx.metadata || {};
        if (meta.purpose !== "points_topup" || !meta.quote_id) {
            return NextResponse.json({ ok: true });
        }

        const sb = await createClientServerRSC();

        // 1) Load quote
        const { data: quote } = await sb
            .schema("itinero")
            .from("points_quotes")
            .select("*")
            .eq("id", meta.quote_id)
            .single();

        if (!quote || quote.status !== "pending") {
            return NextResponse.json({ ok: true });
        }

        // 2) Mark quote paid & add ledger in a transaction (RPC recommended; simplified here)
        const { error: qErr } = await sb
            .schema("itinero")
            .from("points_quotes")
            .update({ status: "paid" })
            .eq("id", quote.id);

        if (!qErr) {
            await sb
                .schema("itinero")
                .from("points_ledger")
                .insert({
                    user_id: quote.user_id,
                    delta: quote.points,
                    reason: "paystack_topup",
                    ref_type: "paystack",
                    ref_id: tx.reference,
                    meta: { paystack: { id: tx.id, currency: tx.currency, amount: tx.amount } },
                });
        }
    }

    return NextResponse.json({ ok: true });
}