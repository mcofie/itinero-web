import { NextResponse } from "next/server";
import { ordersAdminContext } from "@/lib/album-orders-server";
import { formatGhs } from "@/lib/album-pricing";
import { getAlbumSettings } from "@/lib/album-settings-server";
import { ALERT_COLORS, sendOrderAlert } from "@/lib/order-alerts";

export const runtime = "nodejs";

const money = (value: unknown, min: number, max: number) => {
    const number = Math.round(Number(value) * 100) / 100;
    return Number.isFinite(number) && number >= min && number <= max ? number : null;
};

/** Saves album pricing (`pricing`) or the printer specification (`printSpec`). Prices apply to checkouts from now on. */
export async function PATCH(request: Request) {
    const auth = await ordersAdminContext();
    if (!auth) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    const body = await request.json().catch(() => null);
    const stamp = { updated_by: auth.actor, updated_at: new Date().toISOString() };

    if (body?.pricing) {
        const albumPrice = money(body.pricing.albumPrice, 1, 100000);
        const deliveryFee = money(body.pricing.deliveryFee, 0, 10000);
        const taxRate = money(body.pricing.taxRate, 0, 50);
        const taxLabel = typeof body.pricing.taxLabel === "string" ? body.pricing.taxLabel.trim().slice(0, 20) : "";
        if (albumPrice === null) return NextResponse.json({ error: "Album price must be above zero." }, { status: 400 });
        if (deliveryFee === null) return NextResponse.json({ error: "Delivery fee must be zero or more." }, { status: 400 });
        if (taxRate === null) return NextResponse.json({ error: "Tax rate must be between 0 and 50%." }, { status: 400 });
        if (!taxLabel) return NextResponse.json({ error: "Give the tax a name, such as VAT." }, { status: 400 });

        const before = (await getAlbumSettings(auth.admin)).pricing;
        const { error } = await auth.admin.schema("itinero").from("album_settings")
            .upsert({ id: 1, album_price: albumPrice, delivery_fee: deliveryFee, tax_rate: taxRate, tax_label: taxLabel, ...stamp });
        if (error) return NextResponse.json({ error: "Could not save prices." }, { status: 503 });

        const changes: [string, string][] = [];
        if (before.albumPrice !== albumPrice) changes.push(["Album price", `${formatGhs(before.albumPrice)} → ${formatGhs(albumPrice)}`]);
        if (before.deliveryFee !== deliveryFee) changes.push(["Delivery fee", `${formatGhs(before.deliveryFee)} → ${formatGhs(deliveryFee)}`]);
        if (before.taxRate !== taxRate || before.taxLabel !== taxLabel) changes.push(["Tax", `${before.taxLabel} ${before.taxRate}% → ${taxLabel} ${taxRate}%`]);
        if (changes.length) {
            await sendOrderAlert({ title: "Prices changed", fields: [...changes, ["By", auth.actor]], color: ALERT_COLORS.warning });
        }
        return NextResponse.json({ ok: true });
    }

    if (body?.printSpec) {
        const spec = {
            interiorBleedMm: money(body.printSpec.interiorBleedMm, 0, 20),
            coverWrapMm: money(body.printSpec.coverWrapMm, 0, 40),
            spineBaseMm: money(body.printSpec.spineBaseMm, 0, 30),
            spinePerPageMm: money(body.printSpec.spinePerPageMm, 0, 2),
        };
        if (Object.values(spec).some(value => value === null)) return NextResponse.json({ error: "Check the print measurements." }, { status: 400 });
        const { error } = await auth.admin.schema("itinero").from("album_settings").upsert({ id: 1, print_spec: spec, ...stamp });
        if (error) return NextResponse.json({ error: "Could not save the print settings." }, { status: 503 });
        return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
}
