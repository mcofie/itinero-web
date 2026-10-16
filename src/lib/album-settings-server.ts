import { DEFAULT_PRICING, type AlbumPricing } from "@/lib/album-pricing";
import type { PrintSpec } from "@/components/album-builder/album-pdf";
import type { createAdminClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

export const DEFAULT_PRINT_SPEC: PrintSpec = { interiorBleedMm: 3, coverWrapMm: 15, spineBaseMm: 4, spinePerPageMm: 0.1 };

export type AlbumSettings = { pricing: AlbumPricing; printSpec: PrintSpec; updatedAt: string | null; updatedBy: string | null };

function readPrintSpec(value: unknown): PrintSpec {
    const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
    const read = (key: keyof PrintSpec) => Number.isFinite(Number(input[key])) && Number(input[key]) >= 0 ? Number(input[key]) : DEFAULT_PRINT_SPEC[key];
    return { interiorBleedMm: read("interiorBleedMm"), coverWrapMm: read("coverWrapMm"), spineBaseMm: read("spineBaseMm"), spinePerPageMm: read("spinePerPageMm") };
}

/** Reads the single settings row. Falls back to the default price if the row or table is missing. */
export async function getAlbumSettings(admin: AdminClient | null): Promise<AlbumSettings> {
    const fallback: AlbumSettings = { pricing: DEFAULT_PRICING, printSpec: DEFAULT_PRINT_SPEC, updatedAt: null, updatedBy: null };
    if (!admin) return fallback;
    const { data, error } = await admin.schema("itinero").from("album_settings")
        .select("*").eq("id", 1).maybeSingle();
    if (error || !data) {
        if (error) console.error("[album-settings] Using default pricing:", error.message);
        return fallback;
    }
    return {
        pricing: { albumPrice: Number(data.album_price), deliveryFee: Number(data.delivery_fee), taxRate: Number(data.tax_rate), taxLabel: data.tax_label || "Tax" },
        printSpec: readPrintSpec(data.print_spec),
        updatedAt: data.updated_at, updatedBy: data.updated_by,
    };
}
