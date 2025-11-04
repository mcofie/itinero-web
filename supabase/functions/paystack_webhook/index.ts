// supabase/functions/paystack_webhook/index.ts
// deno-lint-ignore-file
import {serve} from "https://deno.land/std@0.224.0/http/server.ts";
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";

/* ---------- Utility helpers ---------- */
const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
    });

const ok = () => json({ok: true}, 200);
const cors = () =>
    new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "content-type,x-paystack-signature",
        },
    });

function toHex(buf: ArrayBuffer) {
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

async function hmacSHA512(secret: string, data: string) {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        {name: "HMAC", hash: "SHA-512"},
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    return toHex(sig);
}

/* ---------- Main ---------- */
serve(async (req) => {
    if (req.method === "OPTIONS") return cors();
    if (req.method !== "POST") return json({message: "Method not allowed"}, 405);

    const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY") || "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!PAYSTACK_SECRET || !SUPABASE_URL || !SERVICE_ROLE)
        return json({message: "Missing environment variables"}, 500);

    // read raw text body for signature
    const raw = await req.text();
    const paystackSig = req.headers.get("x-paystack-signature") || "";

    // ✅ No “Missing authorization” rejection
    // Just verify the Paystack signature instead
    const computedSig = await hmacSHA512(PAYSTACK_SECRET, raw);
    if (computedSig.toLowerCase() !== paystackSig.toLowerCase()) {
        console.warn("Invalid Paystack signature");
        return ok(); // still respond 200 to avoid retry storm
    }

    let event: any;
    try {
        event = JSON.parse(raw);
    } catch {
        return ok();
    }

    const evtName: string = event?.event ?? "";
    const tx = event?.data;
    if (!tx) return ok();
    if (!evtName.toLowerCase().includes("success")) return ok();

    const reference = tx.reference;
    const currency = tx.currency;
    const amountMinor = tx.amount;
    const userId = tx.metadata?.user_id;
    if (!reference || !amountMinor || !currency || !userId) return ok();

    // Convert and compute points
    const major = amountMinor / 100;
    const rateGHS = Number(Deno.env.get("POINTS_PER_GHS") ?? "1");
    const rateNGN = Number(Deno.env.get("POINTS_PER_NGN") ?? "0.1");
    const rateUSD = Number(Deno.env.get("POINTS_PER_USD") ?? "10");

    let points = 0;
    switch (currency.toUpperCase()) {
        case "GHS":
            points = Math.floor(major * rateGHS);
            break;
        case "NGN":
            points = Math.floor(major * rateNGN);
            break;
        case "USD":
            points = Math.floor(major * rateUSD);
            break;
        default:
            points = Math.floor(major);
    }

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const refType = "paystack";
    const refId = reference;

    // prevent duplicates
    const {data: existing} = await sb
        .schema("itinero")
        .from("points_ledger")
        .select("id")
        .eq("ref_type", refType)
        .eq("ref_id", refId)
        .maybeSingle();
    if (existing) return ok();

    await sb.schema("itinero").from("points_ledger").insert({
        user_id: userId,
        delta: points,
        reason: "paystack_topup",
        ref_type: refType,
        ref_id: refId,
        meta: {currency, amount_minor: amountMinor, amount_major: major},
    });

    await sb
        .from("points_topups")
        .upsert({
            user_id: userId,
            reference,
            status: "paid",
            currency,
            amount: amountMinor,
            points_credited: points,
            updated_at: new Date().toISOString(),
        });

    return ok();
});