export type FxSnapshot = {
    id: string;
    provider: string;
    base_currency: string;
    as_of: string; // YYYY-MM-DD
    rates: Record<string, number>;
    created_at: string;
    raw: unknown;
};