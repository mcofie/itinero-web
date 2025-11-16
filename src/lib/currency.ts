// lib/currency.ts
export type CurrencyCode = "USD" | "EUR" | "GBP" | "GHS" | "KES";

export type CurrencyOption = {
    code: CurrencyCode;
    label: string;
    flag: string;
};

export const Currency: CurrencyOption[] = [
    {code: "USD", label: "US Dollar", flag: "🇺🇸"},
    {code: "EUR", label: "Euro", flag: "🇪🇺"},
    {code: "GBP", label: "British Pound", flag: "🇬🇧"},
    {code: "GHS", label: "Ghanaian Cedi", flag: "🇬🇭"},
    {code: "KES", label: "Kenyan Shilling", flag: "🇰🇪"},
];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export function getCurrencyOption(code?: string | null): CurrencyOption {
    const normalized = (code ?? DEFAULT_CURRENCY).toUpperCase() as CurrencyCode;
    return (
        Currency.find((c) => c.code === normalized) ??
        Currency.find((c) => c.code === DEFAULT_CURRENCY)!
    );
}