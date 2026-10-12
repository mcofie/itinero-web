import { DISCOUNT_CODE_PATTERN, normalizeDiscountCode } from "@/lib/album-discounts";

const date = (value: unknown) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;

/** Validates the editable discount fields from the admin form. Dates are whole days in Accra time (UTC). */
export function parseDiscountLimits(body: Record<string, unknown> | null) {
    const description = typeof body?.description === "string" ? body.description.trim().slice(0, 140) : "";
    const startsOn = date(body?.startsOn);
    const endsOn = date(body?.endsOn);
    const maxUsesRaw = body?.maxUses === "" || body?.maxUses === null || body?.maxUses === undefined ? null : Number(body.maxUses);
    if (maxUsesRaw !== null && (!Number.isInteger(maxUsesRaw) || maxUsesRaw < 1 || maxUsesRaw > 100000)) return { error: "Usage limit must be a whole number above zero." } as const;
    if (startsOn && endsOn && endsOn < startsOn) return { error: "The end date is before the start date." } as const;
    return {
        description: description || null,
        starts_at: startsOn ? `${startsOn}T00:00:00Z` : null,
        ends_at: endsOn ? `${endsOn}T23:59:59Z` : null,
        max_uses: maxUsesRaw,
        once_per_customer: body?.oncePerCustomer !== false,
    } as const;
}

export function parseNewDiscount(body: Record<string, unknown> | null) {
    const code = normalizeDiscountCode(body?.code);
    if (!DISCOUNT_CODE_PATTERN.test(code)) return { error: "Codes are 3–24 letters, numbers or dashes." } as const;
    const kind = body?.kind === "fixed" ? "fixed" : body?.kind === "percent" ? "percent" : null;
    if (!kind) return { error: "Choose a percentage or a fixed amount." } as const;
    const value = Math.round(Number(body?.value) * 100) / 100;
    if (!Number.isFinite(value) || value <= 0 || (kind === "percent" && value > 100) || value > 100000) {
        return { error: kind === "percent" ? "Percentage must be between 1 and 100." : "Enter an amount above zero." } as const;
    }
    const limits = parseDiscountLimits(body);
    if ("error" in limits) return limits;
    return { code, kind, value, ...limits } as const;
}
