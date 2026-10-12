import { DEFAULT_PRICING, type AlbumPricing } from "@/lib/album-pricing";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

export type AlbumSettings = { pricing: AlbumPricing; alerts: Record<string, boolean>; updatedAt: string | null; updatedBy: string | null };

/** Reads the single settings row. Falls back to the default price if the row or table is missing. */
export async function getAlbumSettings(admin: AdminClient | null): Promise<AlbumSettings> {
    const fallback: AlbumSettings = { pricing: DEFAULT_PRICING, alerts: {}, updatedAt: null, updatedBy: null };
    if (!admin) return fallback;
    const { data, error } = await admin.schema("itinero").from("album_settings")
        .select("album_price,delivery_fee,tax_rate,tax_label,discord_alerts,updated_at,updated_by").eq("id", 1).maybeSingle();
    if (error || !data) {
        if (error) console.error("[album-settings] Using default pricing:", error.message);
        return fallback;
    }
    return {
        pricing: { albumPrice: Number(data.album_price), deliveryFee: Number(data.delivery_fee), taxRate: Number(data.tax_rate), taxLabel: data.tax_label || "Tax" },
        alerts: (data.discord_alerts ?? {}) as Record<string, boolean>,
        updatedAt: data.updated_at, updatedBy: data.updated_by,
    };
}
