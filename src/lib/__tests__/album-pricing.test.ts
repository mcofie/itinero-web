import { describe, expect, it } from "vitest";
import { priceBreakdown } from "@/lib/album-pricing";
import { discountAmount, discountState, normalizeDiscountCode, type AlbumDiscount } from "@/lib/album-discounts";
import { paymentMatchesOrder } from "@/lib/album-payment";

const pricing = { albumPrice: 800, deliveryFee: 45, taxRate: 15, taxLabel: "VAT" };

describe("priceBreakdown", () => {
    it("adds delivery and tax with no discount", () => {
        expect(priceBreakdown(pricing)).toEqual({ subtotal: 800, discountAmount: 0, deliveryFee: 45, taxRate: 15, taxLabel: "VAT", tax: 126.75, total: 971.75 });
    });
    it("taxes the album after discount plus delivery", () => {
        const price = priceBreakdown(pricing, 80);
        expect(price.tax).toBe(114.75);
        expect(price.total).toBe(879.75);
    });
    it("never discounts more than the album price", () => {
        const price = priceBreakdown({ ...pricing, deliveryFee: 0, taxRate: 0 }, 5000);
        expect(price.discountAmount).toBe(800);
        expect(price.total).toBe(0);
    });
    it("leaves delivery and tax to pay when a code covers the album", () => {
        expect(priceBreakdown(pricing, 800).total).toBe(51.75);
    });
});

describe("discounts", () => {
    const base: AlbumDiscount = { id: "d", code: "SUMMER", description: null, kind: "percent", value: 10, starts_at: null, ends_at: null, max_uses: null, once_per_customer: true, active: true, created_by: null, created_at: "" };
    const now = Date.parse("2026-10-16T12:00:00Z");

    it("computes percentage and fixed amounts, capped at the price", () => {
        expect(discountAmount({ kind: "percent", value: 12.5 }, 800)).toBe(100);
        expect(discountAmount({ kind: "fixed", value: 150 }, 800)).toBe(150);
        expect(discountAmount({ kind: "fixed", value: 1500 }, 800)).toBe(800);
    });
    it("reports the state of a code", () => {
        expect(discountState(base, 0, now)).toBe("active");
        expect(discountState({ ...base, active: false }, 0, now)).toBe("paused");
        expect(discountState({ ...base, starts_at: "2026-11-01T00:00:00Z" }, 0, now)).toBe("scheduled");
        expect(discountState({ ...base, ends_at: "2026-10-01T23:59:59Z" }, 0, now)).toBe("expired");
        expect(discountState({ ...base, max_uses: 3 }, 3, now)).toBe("used_up");
        expect(discountState({ ...base, max_uses: 3 }, 2, now)).toBe("active");
    });
    it("normalises codes customers type", () => {
        expect(normalizeDiscountCode("  summer 26 ")).toBe("SUMMER26");
        expect(normalizeDiscountCode(42)).toBe("");
    });
});

describe("paymentMatchesOrder", () => {
    const order = { reference: "ref_1", id: "album-1", userId: "user-1", totalCost: 971.75 };
    const good = { reference: "ref_1", amount: 97175, currency: "GHS", metadata: { purpose: "album_order", album_id: "album-1", user_id: "user-1" } };

    it("accepts a matching charge", () => expect(paymentMatchesOrder(good, order)).toBe(true));
    it("rejects a different amount, currency, reference or order", () => {
        expect(paymentMatchesOrder({ ...good, amount: 97100 }, order)).toBe(false);
        expect(paymentMatchesOrder({ ...good, currency: "NGN" }, order)).toBe(false);
        expect(paymentMatchesOrder({ ...good, reference: "ref_2" }, order)).toBe(false);
        expect(paymentMatchesOrder({ ...good, metadata: { ...good.metadata, album_id: "album-2" } }, order)).toBe(false);
        expect(paymentMatchesOrder({ ...good, metadata: { ...good.metadata, purpose: "points_topup" } }, order)).toBe(false);
        expect(paymentMatchesOrder({ ...good, metadata: null }, order)).toBe(false);
    });
});
