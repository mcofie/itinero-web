// supabase/functions/create_topup_session/index.ts
// deno-lint-ignore-file
import {serve} from "https://deno.land/std/http/server.ts";
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
    amount: number;       // e.g. 100 (GHS), in MAJOR unit from the client UI
    currency?: "GHS" | "NGN" | "USD";
    email?: string;       // fallback if you want to pass user's email to Paystack
    metadata?: Record<string, unknown>;
};

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {"content-type": "application/json", "Access-Control-Allow-Origin": "*"},
    });
}

function cors() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "authorization, apikey, content-type",
        },
    });
}

serve(async (req) => {
    if (req.method === "OPTIONS") return cors();

    try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
        const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
        const APP_BASE = Deno.env.get("PUBLIC_APP_BASE_URL") ?? "http://localhost:3000";

        const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {headers: {Authorization: req.headers.get("Authorization") ?? ""}},
        });

        // 1) Auth (user must be signed in)
        const {data: auth} = await sb.auth.getUser();
        const userId = auth?.user?.id;
        const userEmail = auth?.user?.email ?? undefined;
        if (!userId) return json({error: "Not authenticated"}, 401);

        // 2) Parse body
        const body = (await req.json()) as Body;
        const currency = (body.currency ?? "GHS").toUpperCase() as "GHS" | "NGN" | "USD";
        const amountMajor = Number(body.amount);
        if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
            return json({error: "Invalid amount"}, 400);
        }

        // Paystack expects MINOR units: kobo/pesewa/cents
        const amountMinor = Math.round(amountMajor * 100);

        // 3) Initialize Paystack transaction
        const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: body.email ?? userEmail ?? "no-email@yourapp.tld",
                amount: amountMinor,
                currency,
                reference: crypto.randomUUID(),                     // you may also pre-generate your own
                callback_url: `${APP_BASE}/rewards/verify`,        // optional, you can rely solely on webhook
                metadata: {
                    user_id: userId,
                    source: "itinero-topup",
                    ...body.metadata,
                },
            }),
        });

        if (!initRes.ok) {
            const errTxt = await initRes.text();
            return json({error: "Paystack initialize failed", details: errTxt}, 502);
        }

        const initData = await initRes.json();
        const reference = initData?.data?.reference as string;
        const authUrl = initData?.data?.authorization_url as string;

        // 4) Record initialized topup (idempotency + audit)
        await sb.from("points_topups").insert({
            user_id: userId,
            reference,
            status: "initialized",
            currency,
            amount: amountMinor,
            meta: {origin: "create_topup_session"},
        });

        // 5) Return Paystack auth url to redirect the user
        return json({authorization_url: authUrl, reference});
    } catch (e) {
        console.error(e);
        return json({error: String(e?.message ?? e)}, 500);
    }
});