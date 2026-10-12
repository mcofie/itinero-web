import { DISCOUNT_FIELDS, discountAmount, discountLabel, discountState, normalizeDiscountCode, type AlbumDiscount } from "@/lib/album-discounts";
import { priceBreakdown, type PriceBreakdown } from "@/lib/album-pricing";
import { getAlbumSettings } from "@/lib/album-settings-server";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

/** Orders that hold a use of a code: placed (not cancelled) or waiting for payment. */
const USING_STATUSES = ["pending_payment", "paid", "in_review", "changes_requested", "printing", "ready", "out_for_delivery", "delivered", "on_hold"];

export type AlbumQuote = PriceBreakdown & {
    discount: { id: string; code: string; label: string; amount: number; maxUses: number | null } | null;
};

/** Counts the orders holding a use of a discount, optionally for one customer, leaving out the order being priced. */
export async function discountUses(admin: AdminClient, discountId: string, options: { userId?: string; excludeAlbumId?: string } = {}) {
    let query = admin.schema("itinero").from("photobooks").select("id", { count: "exact", head: true })
        .eq("discount_id", discountId).in("status", USING_STATUSES);
    if (options.excludeAlbumId) query = query.neq("id", options.excludeAlbumId);
    if (options.userId) query = query.eq("user_id", options.userId);
    const { count, error } = await query;
    return error ? null : count ?? 0;
}

/** Prices an album with the current settings, applying a discount code if one is given. `albumId` is the order being priced, so it doesn't count against its own code. */
export async function quoteAlbumPrice(admin: AdminClient, input: { code?: unknown; userId: string; albumId?: string }):
    Promise<AlbumQuote | { error: string }> {
    const { pricing } = await getAlbumSettings(admin);
    const code = normalizeDiscountCode(input.code);
    if (!code) return { ...priceBreakdown(pricing), discount: null };

    const { data: discount, error } = await admin.schema("itinero").from("album_discounts")
        .select(DISCOUNT_FIELDS).eq("code", code).maybeSingle<AlbumDiscount>();
    if (error) return { error: "Could not check that code. Please try again." };
    if (!discount) return { error: "That discount code isn’t valid." };

    const [total, mine] = await Promise.all([
        discountUses(admin, discount.id, { excludeAlbumId: input.albumId }),
        discountUses(admin, discount.id, { excludeAlbumId: input.albumId, userId: input.userId }),
    ]);
    if (total === null || mine === null) return { error: "Could not check that code. Please try again." };

    const state = discountState(discount, total);
    if (state === "expired") return { error: "That discount code has expired." };
    if (state === "used_up") return { error: "That discount code has been fully used." };
    if (state !== "active") return { error: "That discount code isn’t valid." };
    if (discount.once_per_customer && mine > 0) return { error: "You’ve already used this discount code." };

    const breakdown = priceBreakdown(pricing, discountAmount(discount, pricing.albumPrice));
    return {
        ...breakdown,
        discount: { id: discount.id, code: discount.code, label: discountLabel(discount), amount: breakdown.discountAmount, maxUses: discount.max_uses },
    };
}
