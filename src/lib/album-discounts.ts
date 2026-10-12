/** Discount code rules shared by checkout and the orders admin. Safe to import in the browser. */
export type DiscountKind = "percent" | "fixed";

export type AlbumDiscount = {
    id: string;
    code: string;
    description: string | null;
    kind: DiscountKind;
    value: number;
    starts_at: string | null;
    ends_at: string | null;
    max_uses: number | null;
    once_per_customer: boolean;
    active: boolean;
    created_by: string | null;
    created_at: string;
};

export const DISCOUNT_FIELDS = "id,code,description,kind,value,starts_at,ends_at,max_uses,once_per_customer,active,created_by,created_at";
export const DISCOUNT_CODE_PATTERN = /^[A-Z0-9-]{3,24}$/;

/** Codes are stored upper case; customers may type them in any case. */
export function normalizeDiscountCode(value: unknown) {
    return typeof value === "string" ? value.trim().toUpperCase().replace(/\s+/g, "") : "";
}

export function discountLabel(discount: Pick<AlbumDiscount, "kind" | "value">, currency = "GHS") {
    return discount.kind === "percent" ? `${Number(discount.value)}% off` : `${currency} ${Number(discount.value)} off`;
}

/** Discount in currency units, rounded to pesewas and never more than the subtotal. */
export function discountAmount(discount: Pick<AlbumDiscount, "kind" | "value">, subtotal: number) {
    const raw = discount.kind === "percent" ? subtotal * Number(discount.value) / 100 : Number(discount.value);
    return Math.min(subtotal, Math.round(raw * 100) / 100);
}

export type DiscountState = "active" | "paused" | "scheduled" | "expired" | "used_up";

export function discountState(discount: AlbumDiscount, uses: number, now = Date.now()): DiscountState {
    if (!discount.active) return "paused";
    if (discount.starts_at && new Date(discount.starts_at).getTime() > now) return "scheduled";
    if (discount.ends_at && new Date(discount.ends_at).getTime() < now) return "expired";
    if (discount.max_uses !== null && uses >= discount.max_uses) return "used_up";
    return "active";
}

export const DISCOUNT_STATE_LABELS: Record<DiscountState, string> = {
    active: "Active", paused: "Paused", scheduled: "Scheduled", expired: "Expired", used_up: "Used up",
};
