import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import type { FxSnapshot } from "./types";

const DEFAULT_BASE = "USD";

export async function getLatestFxSnapshot(
    base: string = DEFAULT_BASE
): Promise<FxSnapshot | null> {
    const sb = getSupabaseBrowser();

    const { data, error } = await sb
        .schema("itinero")
        .rpc("fx_latest_snapshot", { p_base: base })
        .single<FxSnapshot | null>();

    if (error) {
        console.error("getLatestFxSnapshot error", error);
        return null;
    }

    return data ?? null;
}

export function convertUsingSnapshot(
    snapshot: FxSnapshot | null,
    amount: number | null | undefined,
    from: string,
    to: string
): number | null {
    if (!snapshot || amount == null) return null;

    const rates = snapshot.rates;
    const fromRate = rates[from.toUpperCase()];
    const toRate = rates[to.toUpperCase()];

    if (!fromRate || !toRate) return null;

    // same formula as the SQL fx_convert
    return amount * (toRate / fromRate);
}