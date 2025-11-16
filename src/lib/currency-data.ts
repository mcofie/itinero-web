// lib/currency-data.ts

export type CurrencyCode = string;

export type CurrencyOption = {
    code: CurrencyCode;
    label: string;
    flag: string;
    symbol: string;
};

export const WORLD_CURRENCIES: CurrencyOption[] = [
    // Africa
    { code: "GHS", label: "Ghanaian Cedi", flag: "🇬🇭", symbol: "₵" },
    { code: "KES", label: "Kenyan Shilling", flag: "🇰🇪", symbol: "KSh" },
    { code: "NGN", label: "Nigerian Naira", flag: "🇳🇬", symbol: "₦" },
    { code: "ZAR", label: "South African Rand", flag: "🇿🇦", symbol: "R" },
    { code: "MAD", label: "Moroccan Dirham", flag: "🇲🇦", symbol: "د.م." },
    { code: "XOF", label: "West African CFA Franc", flag: "🇸🇳", symbol: "CFA" },
    { code: "XAF", label: "Central African CFA Franc", flag: "🇨🇲", symbol: "FCFA" },

    // North America
    { code: "USD", label: "US Dollar", flag: "🇺🇸", symbol: "$" },
    { code: "CAD", label: "Canadian Dollar", flag: "🇨🇦", symbol: "$" },
    { code: "MXN", label: "Mexican Peso", flag: "🇲🇽", symbol: "$" },

    // South America
    { code: "BRL", label: "Brazilian Real", flag: "🇧🇷", symbol: "R$" },
    { code: "ARS", label: "Argentine Peso", flag: "🇦🇷", symbol: "$" },

    // Europe
    { code: "EUR", label: "Euro", flag: "🇪🇺", symbol: "€" },
    { code: "GBP", label: "British Pound", flag: "🇬🇧", symbol: "£" },
    { code: "CHF", label: "Swiss Franc", flag: "🇨🇭", symbol: "Fr" },
    { code: "SEK", label: "Swedish Krona", flag: "🇸🇪", symbol: "kr" },
    { code: "NOK", label: "Norwegian Krone", flag: "🇳🇴", symbol: "kr" },
    { code: "DKK", label: "Danish Krone", flag: "🇩🇰", symbol: "kr" },
    { code: "PLN", label: "Polish Złoty", flag: "🇵🇱", symbol: "zł" },
    { code: "CZK", label: "Czech Koruna", flag: "🇨🇿", symbol: "Kč" },
    { code: "HUF", label: "Hungarian Forint", flag: "🇭🇺", symbol: "Ft" },

    // Middle East & Asia
    { code: "AED", label: "UAE Dirham", flag: "🇦🇪", symbol: "د.إ" },
    { code: "SAR", label: "Saudi Riyal", flag: "🇸🇦", symbol: "﷼" },
    { code: "QAR", label: "Qatari Riyal", flag: "🇶🇦", symbol: "﷼" },
    { code: "INR", label: "Indian Rupee", flag: "🇮🇳", symbol: "₹" },
    { code: "PKR", label: "Pakistani Rupee", flag: "🇵🇰", symbol: "₨" },
    { code: "CNY", label: "Chinese Yuan", flag: "🇨🇳", symbol: "¥" },
    { code: "JPY", label: "Japanese Yen", flag: "🇯🇵", symbol: "¥" },
    { code: "KRW", label: "South Korean Won", flag: "🇰🇷", symbol: "₩" },

    // Oceania
    { code: "AUD", label: "Australian Dollar", flag: "🇦🇺", symbol: "$" },
    { code: "NZD", label: "New Zealand Dollar", flag: "🇳🇿", symbol: "$" },
];

// Fast lookup by code
export const CURRENCY_BY_CODE: Record<string, CurrencyOption> = WORLD_CURRENCIES.reduce(
    (acc, cur) => {
        acc[cur.code] = cur;
        return acc;
    },
    {} as Record<string, CurrencyOption>
);

export function getCurrencyMeta(code?: string | null): CurrencyOption {
    if (!code) return CURRENCY_BY_CODE["USD"];
    return CURRENCY_BY_CODE[code.toUpperCase()] ?? CURRENCY_BY_CODE["USD"];
}