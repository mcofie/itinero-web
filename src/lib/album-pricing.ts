/** Album price rules shared by checkout, the album builder and the admin. Safe to import in the browser. */
export type AlbumPricing = { albumPrice: number; deliveryFee: number; taxRate: number; taxLabel: string };

export const DEFAULT_PRICING: AlbumPricing = { albumPrice: 800, deliveryFee: 0, taxRate: 0, taxLabel: "VAT" };

export type PriceBreakdown = {
    subtotal: number;
    discountAmount: number;
    deliveryFee: number;
    taxRate: number;
    taxLabel: string;
    tax: number;
    total: number;
};

const round = (value: number) => Math.round(value * 100) / 100;

/** A discount comes off the album price only. Tax is added on the album after discount plus delivery. */
export function priceBreakdown(pricing: AlbumPricing, discountAmount = 0): PriceBreakdown {
    const subtotal = round(pricing.albumPrice);
    const discount = Math.min(subtotal, round(discountAmount));
    const taxable = subtotal - discount + pricing.deliveryFee;
    const tax = round(taxable * pricing.taxRate / 100);
    return {
        subtotal, discountAmount: discount, deliveryFee: round(pricing.deliveryFee),
        taxRate: pricing.taxRate, taxLabel: pricing.taxLabel, tax, total: round(taxable + tax),
    };
}

export const formatGhs = (value: number) => `GHS ${Number(value).toLocaleString("en-GB", { minimumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2, maximumFractionDigits: 2 })}`;
