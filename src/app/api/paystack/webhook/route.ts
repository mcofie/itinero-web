// /app/api/paystack/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const WH_SECRET =
    process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY!;

// IMPORTANT: service-role client (server-side only)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
    global: {
        headers: {
            "X-Client-Info": "paystack-webhook",
        },
    },
});

export async function POST(req: NextRequest) {
    const raw = await req.text();
    const sig = req.headers.get("x-paystack-signature") ?? "";

    const hash = crypto.createHmac("sha512", WH_SECRET).update(raw).digest("hex");
    if (hash !== sig) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const evt = JSON.parse(raw);

    if (evt.event === "charge.success") {
        const tx = evt.data;
        const meta = tx.metadata || {};

        // If you require a specific purpose flag, keep this check:
        if (meta.purpose && meta.purpose !== "points_topup") {
            return NextResponse.json({ ok: true });
        }
        if (!meta.quote_id) {
            return NextResponse.json({ ok: true });
        }

        // 1) Load quote
        const { data: quote, error: quoteErr } = await supabaseAdmin
            .schema("itinero")
            .from("points_quotes")
            .select("*")
            .eq("id", meta.quote_id)
            .single();

        if (quoteErr) {
            console.error("[webhook] Failed to load quote:", quoteErr);
            return NextResponse.json({ ok: false }, { status: 500 });
        }

        if (!quote || quote.status !== "pending") {
            // Already processed or invalid – safely ignore
            return NextResponse.json({ ok: true });
        }

        // 2) Mark quote as paid
        const { error: qErr } = await supabaseAdmin
            .schema("itinero")
            .from("points_quotes")
            .update({ status: "paid" })
            .eq("id", quote.id);

        if (qErr) {
            console.error("[webhook] Failed to mark quote paid:", qErr);
            return NextResponse.json({ ok: false }, { status: 500 });
        }

        // 3) Insert ledger entry (now using service role, so no RLS issues)
        const { error: ledgerErr } = await supabaseAdmin
            .schema("itinero")
            .from("points_ledger")
            .insert({
                user_id: quote.user_id,
                delta: quote.points,
                reason: "paystack_topup",
                ref_type: "paystack",
                ref_id: tx.reference,
                meta: {
                    paystack: {
                        id: tx.id,
                        currency: tx.currency,
                        amount: tx.amount,
                    },
                },
            });

        if (ledgerErr) {
            console.error("[webhook] Failed to insert ledger row:", ledgerErr);
            // You might want to log & still return 200 to avoid Paystack retries,
            // OR return 500 so you can retry – up to you.
            return NextResponse.json({ ok: false }, { status: 500 });
        }
    }

    return NextResponse.json({ ok: true });
}