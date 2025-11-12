// app/api/points/quote/route.ts
import {NextResponse} from "next/server";
import {createClientServerRoute} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const QUOTE_TTL_MIN = Number(process.env.POINTS_QUOTE_TTL_MIN ?? 15);

export async function POST(req: Request) {
    try {
        const sb = await createClientServerRoute();
        const {data: auth} = await sb.auth.getUser();
        const user = auth?.user;
        if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});

        const {points} = await req.json();
        const pts = Number(points);
        if (!Number.isFinite(pts) || pts <= 0) {
            return NextResponse.json({error: "Invalid points"}, {status: 400});
        }

        // Pricing
        const UNIT_PRICE_GHS =
            Number(process.env.NEXT_PUBLIC_POINTS_PRICE_GHS ?? process.env.POINTS_PRICE_GHS ?? 0.4);
        const UNIT_PRICE_MINOR = Math.round(UNIT_PRICE_GHS * 100);
        const amount_minor = pts * UNIT_PRICE_MINOR;
        const amount_ghs = Number((pts * UNIT_PRICE_GHS).toFixed(2));

        // Expiry
        const now = Date.now();
        const expiresAtISO = new Date(now + QUOTE_TTL_MIN * 60_000).toISOString();

        const id = crypto.randomUUID();

        const {error: insErr} = await sb
            .schema("itinero")
            .from("points_quotes")
            .insert({
                id,
                user_id: user.id,
                points: pts,
                currency: "GHS",
                unit_price_ghs: UNIT_PRICE_GHS,
                unit_price_minor: UNIT_PRICE_MINOR,
                amount_minor,
                amount_ghs,
                status: "pending",
                expires_at: expiresAtISO, // <-- REQUIRED
            });

        if (insErr) {
            return NextResponse.json({error: "Insert failed", detail: insErr}, {status: 500});
        }

        return NextResponse.json({
            quoteId: id,
            points: pts,
            currency: "GHS",
            unit_price_ghs: UNIT_PRICE_GHS,
            unit_price_minor: UNIT_PRICE_MINOR,
            amount_minor,
            amount_ghs,
            expires_at: expiresAtISO,
            ttl_min: QUOTE_TTL_MIN,
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({error: "Server error"}, {status: 500});
    }
}