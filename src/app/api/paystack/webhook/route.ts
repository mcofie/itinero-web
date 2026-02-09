// /app/api/paystack/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClientServerRSC } from "@/lib/supabase/server";
import { sendDiscordNotification, formatDiscordEmbed } from "@/lib/discord";

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

        const { error: qErr } = await sb
            .schema("itinero")
            .from("points_quotes")
            .update({ status: "paid" })
            .eq("id", quote.id);

        if (qErr) {
            console.error("[paystack-webhook] quote update error:", qErr);
            return NextResponse.json({ ok: false }, { status: 500 });
        }

        const { error: ledgerErr } = await sb
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

        if (ledgerErr) {
            console.error("[paystack-webhook] ledger insert error:", ledgerErr, {
                quoteId: quote.id,
                user_id: quote.user_id,
                delta: quote.points,
            });
            return NextResponse.json({ ok: false }, { status: 500 });
        }

        // 3) Notify Discord
        console.log("Attempting to notify Discord for top-up:", tx.reference);
        await sendDiscordNotification(
            `💰 Points Top-up`,
            formatDiscordEmbed(
                "Payment Successful",
                `**User:** ${tx.customer.email}\n**Points:** ${quote.points}\n**Amount:** ${tx.currency} ${tx.amount / 100}`,
                0xeab308 // yellow-500
            )
        );
    }

    return NextResponse.json({ ok: true });


}