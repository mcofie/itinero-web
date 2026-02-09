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
    const base = snapshot.base_currency;

    // Helper to safely get rate: if same as base, it's 1.0. 
    // Otherwise look it up in rates.
    const getRate = (code: string) => {
        const c = code.toUpperCase();
        if (base && c === base.toUpperCase()) return 1.0;
        return rates[c];
    };

    const fromRate = getRate(from);
    const toRate = getRate(to);


    // Explicitly check for undefined because rate could be 0 (unlikely but possible)
    if (fromRate === undefined || toRate === undefined) return null;

    // same formula as the SQL fx_convert
    return amount * (toRate / fromRate);
}