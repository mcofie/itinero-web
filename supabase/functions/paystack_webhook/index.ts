// supabase/functions/paystack_webhook/index.ts
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function ok(text = "OK") {
    return new Response(text, { status: 200, headers: { "Access-Control-Allow-Origin": "*" } });
}
function bad(status = 400, text = "Bad") {
    return new Response(text, { status });
}

serve(async (req) => {
    // ---- quick reachability check
    if (req.method === "GET") {
        return ok("paystack_webhook alive");
    }
    if (req.method !== "POST") return bad(405, "Method Not Allowed");

    const secret = Deno.env.get("PAYSTACK_SECRET_KEY")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const raw = await req.text();
    const sig = req.headers.get("x-paystack-signature") ?? "";
    // Log request basics
    console.log("PS_HIT", {
        method: req.method,
        sig_present: Boolean(sig),
        cl: req.headers.get("content-length") ?? null,
        contentType: req.headers.get("content-type") ?? null,
    });

    // HMAC validation
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign", "verify"],
    );
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
    const macHex = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");

    if (macHex !== sig) {
        console.error("PS_SIG_FAIL");
        return bad(401, "Signature mismatch");
    }

    // Parse & log essential fields
    const event = JSON.parse(raw);
    const evtName: string = event?.event ?? "";
    const tx = event?.data;
    const reference: string | undefined = tx?.reference;
    const currency: string | undefined = tx?.currency;
    const amountMinor: number | undefined = tx?.amount;
    const metadataUserId: string | undefined = tx?.metadata?.user_id;

    console.log("PS_EVT", { evtName, reference, currency, amountMinor, metadataUserId });

    // (Optional) persist raw delivery to an inbox table for auditing (see section 2)
    try {
        const sbAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);
        await sbAdmin.from("webhook_inbox").insert({
            provider: "paystack",
            event_name: evtName,
            reference: reference ?? null,
            payload: event,
            signature: sig,
        });
    } catch (e) {
        console.error("PS_INBOX_FAIL", e);
    }

    if (!tx || !reference || !amountMinor || !currency) return ok("ignored");

    // Verify via Paystack API (extra safe)
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${secret}` },
    });
    if (!verifyRes.ok) {
        console.error("PS_VERIFY_FAIL", verifyRes.status);
        return ok("verify-not-ok");
    }
    const verify = await verifyRes.json();
    const verifiedStatus = verify?.data?.status; // "success"
    const verifiedAmount = verify?.data?.amount;
    const verifiedCurrency = verify?.data?.currency;
    const userId = metadataUserId ?? verify?.data?.metadata?.user_id;

    console.log("PS_VERIFY_OK", { verifiedStatus, verifiedAmount, verifiedCurrency, userId });

    if (verifiedStatus !== "success" || !userId) return ok("ignored");

    // Points conversion
    const rateGHS = Number(Deno.env.get("POINTS_PER_GHS") ?? "1");
    const rateNGN = Number(Deno.env.get("POINTS_PER_NGN") ?? "0.1");
    const rateUSD = Number(Deno.env.get("POINTS_PER_USD") ?? "10");

    const major = (verifiedAmount ?? amountMinor) / 100;
    let points = 0;
    switch ((verifiedCurrency ?? currency).toUpperCase()) {
        case "GHS": points = Math.floor(major * rateGHS); break;
        case "NGN": points = Math.floor(major * rateNGN); break;
        case "USD": points = Math.floor(major * rateUSD); break;
        default: points = Math.floor(major);
    }

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

    // ensure idempotency by reference
    const { data: topupRow } = await sb.from("points_topups").select("*").eq("reference", reference).maybeSingle();
    if (topupRow?.status === "paid") {
        console.log("PS_IDEMPOTENT_SKIP", reference);
        return ok("already-paid");
    }
    if (!topupRow) {
        await sb.from("points_topups").insert({
            user_id: userId,
            reference,
            status: "initialized",
            currency: verifiedCurrency ?? currency,
            amount: verifiedAmount ?? amountMinor,
            meta: { via: "webhook_create" },
        });
    }

    // credit ledger
    const { error: ledErr } = await sb
        .schema("itinero")
        .from("points_ledger")
        .insert({
            user_id: userId,
            delta: points,
            reason: "paystack_topup",
            ref_type: "paystack",
            ref_id: reference,
            meta: { reference, currency: verifiedCurrency ?? currency, amount_minor: verifiedAmount ?? amountMinor },
        });

    if (ledErr) {
        console.error("PS_LEDGER_FAIL", ledErr);
        return ok("ledger-failed"); // still 200 to Paystack
    }

    await sb.from("points_topups")
        .update({
            status: "paid",
            points_credited: points,
            updated_at: new Date().toISOString(),
            meta: { ...(topupRow?.meta ?? {}), verify_snapshot: verify?.data ?? null },
        })
        .eq("reference", reference);

    console.log("PS_DONE", { reference, points });
    return ok("credited");
});