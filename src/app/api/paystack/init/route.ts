import { NextResponse } from "next/server";
import { createClientServerRoute } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(req: Request) {
    try {
        if (!PAYSTACK_SECRET) {
            return NextResponse.json({ error: "Paystack key missing" }, { status: 500 });
        }

        const sb = await createClientServerRoute();
        const { data: auth } = await sb.auth.getUser();
        const user = auth?.user;
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { quoteId, email, preview } = await req.json().catch(() => ({}));
        if (!quoteId) return NextResponse.json({ error: "quoteId required" }, { status: 400 });

        const { data: quote, error: qErr } = await sb
            .schema("itinero")
            .from("points_quotes")
            .select("id,user_id,amount_minor,currency,points,status")
            .eq("id", quoteId)
            .maybeSingle();

        if (qErr) {
            console.error("quote select error:", qErr);
            return NextResponse.json({ error: "Quote read failed" }, { status: 500 });
        }
        if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        if (quote.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        // Initialize Paystack
        const callbackBase = `${BASE_URL}/rewards/verify`;
        const callbackUrl = preview
            ? `${callbackBase}?preview=true`
            : callbackBase;

        const payload = {
            email: email || user.email || "user@example.com",
            amount: quote.amount_minor,     // pesewas
            currency: quote.currency || "GHS",
            metadata: { quote_id: quote.id, points: quote.points, purpose: "points_topup" },
            callback_url: callbackUrl,
        };

        const res = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.status) {
            console.error("paystack init failed:", json);
            return NextResponse.json({ error: "Paystack init failed", detail: json }, { status: 502 });
        }

        return NextResponse.json({
            authorization_url: json.data.authorization_url,
            reference: json.data.reference,
            access_code: json.data.access_code,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}