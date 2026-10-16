import { describe, expect, it } from "vitest";
import { allowedMoves, moveRequirements, whatsappNumber } from "@/lib/album-fulfilment";
import { orderMessage } from "@/lib/order-messages";
import { normalizePageText } from "@/lib/album-page-text";
import { normalizeCoverBackground, resolveCoverBackground } from "@/lib/album-cover-style";

const moves = (from: Parameters<typeof allowedMoves>[0], heldFrom?: string) => allowedMoves(from, heldFrom).map(move => `${move.kind}:${move.to}`);

describe("order status moves", () => {
    it("follows the fulfilment path", () => {
        expect(moves("paid")).toEqual(["forward:in_review", "hold:on_hold", "cancel:cancelled"]);
        expect(moves("in_review")).toContain("forward:changes_requested");
        expect(moves("out_for_delivery")).toContain("forward:delivered");
        expect(moves("delivered")).toEqual(["back:out_for_delivery"]);
    });
    it("resumes a held order where it was", () => {
        expect(moves("on_hold", "printing")).toEqual(["resume:printing", "cancel:cancelled"]);
        expect(moves("on_hold", "nonsense")).toEqual(["cancel:cancelled"]);
    });
    it("allows nothing from final or unpaid states", () => {
        expect(moves("cancelled")).toEqual([]);
        expect(moves("pending_payment")).toEqual([]);
        expect(moves("draft")).toEqual([]);
    });
    it("asks for a reason when going back, holding or cancelling", () => {
        expect(moveRequirements({ to: "in_review", kind: "back" }).note).toBe(true);
        expect(moveRequirements({ to: "printing", kind: "forward" }).note).toBe(false);
        expect(moveRequirements({ to: "changes_requested", kind: "forward" }).customerMessage).toBe(true);
        expect(moveRequirements({ to: "out_for_delivery", kind: "forward" }).delivery).toBe(true);
    });
});

describe("customer messages", () => {
    const order = { id: "a1", title: "Italy", orderNumber: 1042, customerName: "Ama Mensah", siteUrl: "https://tryitinero.com" };
    it("includes rider and date when out for delivery", () => {
        const message = orderMessage("out_for_delivery", { ...order, courierName: "Kojo", courierPhone: "024 000 0000", deliveryDate: "2026-10-20" });
        expect(message?.subject).toContain("ITN-1042");
        expect(message?.body).toContain("Hi Ama,");
        expect(message?.body).toContain("Kojo (024 000 0000)");
        expect(message?.body).toContain("Tuesday 20 October");
        expect(message?.body).toContain("https://tryitinero.com/photobooks/a1");
    });
    it("sends nothing for internal stages", () => {
        expect(orderMessage("in_review", order)).toBeNull();
        expect(orderMessage("ready", order)).toBeNull();
    });
    it("formats Ghana numbers for WhatsApp", () => {
        expect(whatsappNumber("024 123 4567")).toBe("233241234567");
        expect(whatsappNumber("+233 24 123 4567")).toBe("233241234567");
        expect(whatsappNumber("")).toBeNull();
    });
});

describe("album options", () => {
    it("trims page text to its limits", () => {
        const text = normalizePageText({ openingTitle: "  Lemons   and\nlunches ", openingNote: "x".repeat(500), backNote: 7 });
        expect(text.openingTitle).toBe(" Lemons and lunches ");
        expect(text.openingNote).toHaveLength(220);
        expect(text.backNote).toBe("");
        expect(text.closingNote).toBe("");
    });
    it("validates cover colours", () => {
        expect(normalizeCoverBackground("#526F89")).toBe("#526f89");
        expect(normalizeCoverBackground("blue")).toBe("auto");
        expect(resolveCoverBackground("auto", "#bcd8ad")).toBe("#bcd8ad");
        expect(resolveCoverBackground("#526f89", "#bcd8ad")).toBe("#526f89");
    });
});
