import { ALBUM_PRICE_GHS } from "@/lib/album-order";
import { DISCOUNT_FIELDS, discountAmount, discountLabel, discountState, normalizeDiscountCode, type AlbumDiscount } from "@/lib/album-discounts";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

/** Orders that hold a use of a code: placed (not cancelled) or waiting for payment. */
const USING_STATUSES = ["pending_payment", "paid", "in_review", "changes_requested", "printing", "ready", "out_for_delivery", "delivered", "on_hold"];

export type AlbumQuote = {
    subtotal: number;
    total: number;
    discount: { id: string; code: string; label: string; amount: number } | null;
};

/** Prices an album, applying a discount code if one is given. `albumId` is the order being priced, so it doesn't count against its own code. */
export async function quoteAlbumPrice(admin: AdminClient, input: { code?: unknown; userId: string; albumId?: string }):
    Promise<AlbumQuote | { error: string }> {
    const subtotal = ALBUM_PRICE_GHS;
    const code = normalizeDiscountCode(input.code);
    if (!code) return { subtotal, total: subtotal, discount: null };

    const { data: discount, error } = await admin.schema("itinero").from("album_discounts")
        .select(DISCOUNT_FIELDS).eq("code", code).maybeSingle<AlbumDiscount>();
    if (error) return { error: "Could not check that code. Please try again." };
    if (!discount) return { error: "That discount code isn’t valid." };

    const uses = (filter: "all" | "customer") => {
        let query = admin.schema("itinero").from("photobooks").select("id", { count: "exact", head: true })
            .eq("discount_id", discount.id).in("status", USING_STATUSES);
        if (input.albumId) query = query.neq("id", input.albumId);
        if (filter === "customer") query = query.eq("user_id", input.userId);
        return query;
    };
    const [{ count: total, error: totalError }, { count: mine, error: mineError }] = await Promise.all([uses("all"), uses("customer")]);
    if (totalError || mineError) return { error: "Could not check that code. Please try again." };

    const state = discountState(discount, total ?? 0);
    if (state === "expired") return { error: "That discount code has expired." };
    if (state === "used_up") return { error: "That discount code has been fully used." };
    if (state !== "active") return { error: "That discount code isn’t valid." };
    if (discount.once_per_customer && (mine ?? 0) > 0) return { error: "You’ve already used this discount code." };

    const amount = discountAmount(discount, subtotal);
    return {
        subtotal, total: Math.round((subtotal - amount) * 100) / 100,
        discount: { id: discount.id, code: discount.code, label: discountLabel(discount), amount },
    };
}
