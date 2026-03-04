// /app/api/paystack/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { sendDiscordNotification, formatDiscordEmbed } from "@/lib/discord";

const WH_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

/**
 * Use a service-role Supabase client for the webhook handler.
 * Webhook calls are server-to-server (from Paystack) — there are
 * no cookies / user sessions, so the anon key would fail all
 * RLS-protected queries.
 */
function createServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) {
        throw new Error("[paystack-webhook] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    return createClient(url, serviceKey);
}

export async function POST(req: NextRequest) {
    const raw = await req.text();
    const sig = req.headers.get("x-paystack-signature") ?? "";
    const hash = crypto.createHmac("sha512", WH_SECRET).update(raw).digest("hex");

    if (hash !== sig) {
        console.error("[paystack-webhook] Signature mismatch");
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const evt = JSON.parse(raw);
    console.log("[paystack-webhook] Received event:", evt.event, "ref:", evt.data?.reference);

    if (evt.event === "charge.success") {
        const tx = evt.data;
        const meta = tx.metadata || {};

        if (meta.purpose !== "points_topup" || !meta.quote_id) {
            console.log("[paystack-webhook] Ignored: not a points_topup or missing quote_id", {
                purpose: meta.purpose,
                quote_id: meta.quote_id,
            });
            return NextResponse.json({ ok: true });
        }

        // Extra safety: verify the transaction with Paystack API
        try {
            const verifyRes = await fetch(
                `https://api.paystack.co/transaction/verify/${encodeURIComponent(tx.reference)}`,
                { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
            );
            if (verifyRes.ok) {
                const verifyData = await verifyRes.json();
                if (verifyData?.data?.status !== "success") {
                    console.error("[paystack-webhook] Paystack verify status is not success:", verifyData?.data?.status);
                    return NextResponse.json({ ok: true }); // ack but don't credit
                }
            } else {
                console.warn("[paystack-webhook] Paystack verify call failed, proceeding with webhook data:", verifyRes.status);
            }
        } catch (verifyErr) {
            console.warn("[paystack-webhook] Paystack verify error, proceeding:", verifyErr);
        }

        const sb = createServiceClient();

        // 1) Load quote
        const { data: quote, error: quoteReadErr } = await sb
            .schema("itinero")
            .from("points_quotes")
            .select("*")
            .eq("id", meta.quote_id)
            .single();

        if (quoteReadErr) {
            console.error("[paystack-webhook] quote read error:", quoteReadErr, { quote_id: meta.quote_id });
            return NextResponse.json({ ok: false, error: "quote_read_failed" }, { status: 500 });
        }

        if (!quote) {
            console.error("[paystack-webhook] quote not found:", meta.quote_id);
            return NextResponse.json({ ok: true });
        }

        if (quote.status !== "pending") {
            console.log("[paystack-webhook] quote already processed:", quote.id, "status:", quote.status);
            return NextResponse.json({ ok: true });
        }

        // 2) Mark quote as paid
        const { error: qErr } = await sb
            .schema("itinero")
            .from("points_quotes")
            .update({ status: "paid" })
            .eq("id", quote.id);

        if (qErr) {
            console.error("[paystack-webhook] quote update error:", qErr);
            return NextResponse.json({ ok: false }, { status: 500 });
        }

        // 3) Credit ledger
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

        console.log("[paystack-webhook] Successfully credited", quote.points, "points to user", quote.user_id);

        // 4) Notify Discord
        try {
            await sendDiscordNotification(
                `💰 Points Top-up`,
                formatDiscordEmbed(
                    "Payment Successful",
                    `**User:** ${tx.customer?.email ?? "unknown"}\n**Points:** ${quote.points}\n**Amount:** ${tx.currency} ${tx.amount / 100}`,
                    0xeab308 // yellow-500
                )
            );
        } catch (discordErr) {
            console.warn("[paystack-webhook] Discord notification failed:", discordErr);
        }
    }

    return NextResponse.json({ ok: true });
}