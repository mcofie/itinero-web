// supabase/functions/fx-refresh/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const BASE_CURRENCY = "USD";
const PROVIDER = "exchangerate-api";

function toUTCDateString(date: Date) {
    return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

serve(async (req) => {
    try {
        // Read env INSIDE the handler so we see them at runtime
        const EXCHANGE_RATE_API_KEY = Deno.env.get("EXCHANGE_RATE_API_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        console.log("fx-refresh: env debug", {
            hasEXCHANGE_RATE_API_KEY: !!EXCHANGE_RATE_API_KEY,
            hasSUPABASE_URL: !!SUPABASE_URL,
            hasSERVICE_ROLE: !!SUPABASE_SERVICE_ROLE_KEY,
        });

        if (!EXCHANGE_RATE_API_KEY) {
            console.error("fx-refresh: Missing EXCHANGE_RATE_API_KEY");
            return new Response(
                JSON.stringify({
                    status: "error",
                    step: "env",
                    message: "Missing EXCHANGE_RATE_API_KEY",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } },
            );
        }
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            console.error("fx-refresh: Missing supabase env");
            return new Response(
                JSON.stringify({
                    status: "error",
                    step: "env",
                    message: "Missing SUPABASE_URL or SERVICE_ROLE",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } },
            );
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const today = new Date();
        const asOf = toUTCDateString(today);

        // 1) Check if we already have a snapshot for today
        const { data: existing, error: checkErr } = await supabase
            .schema("itinero")                // 👈 use itinero schema
            .from("fx_snapshots")
            .select("id")
            .eq("provider", PROVIDER)
            .eq("base_currency", BASE_CURRENCY)
            .eq("as_of", asOf)
            .maybeSingle();

        if (checkErr) {
            console.error("fx-refresh: error checking existing snapshot", checkErr);
        }

        if (existing) {
            console.log("fx-refresh: snapshot already exists", existing.id);
            return new Response(
                JSON.stringify({
                    status: "ok",
                    step: "already-exists",
                    asOf,
                }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        }

        // 2) Call ExchangeRate-API
        const url = `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/${BASE_CURRENCY}`;
        console.log("fx-refresh: fetching", url);

        const fxRes = await fetch(url);
        const textClone = await fxRes.clone().text(); // for logging
        console.log(
            "fx-refresh: provider http",
            fxRes.status,
            textClone.slice(0, 200),
        );

        if (!fxRes.ok) {
            return new Response(
                JSON.stringify({
                    status: "error",
                    step: "provider-http",
                    code: fxRes.status,
                    body: textClone,
                }),
                { status: 500, headers: { "Content-Type": "application/json" } },
            );
        }

        const json = (await fxRes.json()) as {
            result?: string;
            base_code?: string;
            conversion_rates?: Record<string, number>;
            [k: string]: unknown;
        };

        console.log("fx-refresh: provider json summary", {
            result: json.result,
            base_code: json.base_code,
            ratesCount: json.conversion_rates
                ? Object.keys(json.conversion_rates).length
                : 0,
        });

        if (json.result !== "success" || !json.conversion_rates || !json.base_code) {
            console.error("fx-refresh: invalid payload", json);
            return new Response(
                JSON.stringify({
                    status: "error",
                    step: "provider-json",
                    message: "Invalid provider payload",
                }),
                { status: 500, headers: { "Content-Type": "application/json" } },
            );
        }

        const base = json.base_code;
        const rates = json.conversion_rates;

        // 3) Insert snapshot into itinero.fx_snapshots
        const { error: insertErr } = await supabase
            .schema("itinero")               // 👈 use itinero schema here too
            .from("fx_snapshots")
            .insert({
                provider: PROVIDER,
                base_currency: base,
                as_of: asOf,                   // column is as_of, value is asOf
                raw: json,
                rates,
            });

        if (insertErr) {
            console.error("fx-refresh: insert error", insertErr);
            return new Response(
                JSON.stringify({
                    status: "error",
                    step: "insert",
                    message: "Failed to insert snapshot",
                    details: insertErr,
                }),
                { status: 500, headers: { "Content-Type": "application/json" } },
            );
        }

        return new Response(
            JSON.stringify({
                status: "ok",
                step: "done",
                asOf,
                base,
                count: Object.keys(rates).length,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    } catch (e) {
        console.error("fx-refresh: unhandled exception", e);
        return new Response(
            JSON.stringify({
                status: "error",
                step: "unhandled",
                message: String(e),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
        );
    }
});