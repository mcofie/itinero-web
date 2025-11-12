// /lib/points.ts
export const POINT_UNIT_PRICE_GHS = 0.40;         // 40 pesewas per point
export const POINTS_MIN = 1;                       // tweak if you want a floor (e.g., 100)
export const QUOTE_TTL_MIN = 15;

export function toMinor(ghs: number) {
    return Math.round(ghs * 100);                    // pesewas (minor units)
}

export function money2dp(n: number) {
    return Math.round(n * 100) / 100;                // 2 dp rounding
}

export function computeTopup(points: number) {
    const amountGhs = money2dp(points * POINT_UNIT_PRICE_GHS);
    const amountMinor = toMinor(amountGhs);
    return {amountGhs, amountMinor};
}