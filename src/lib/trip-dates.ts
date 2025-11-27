// lib/trip-dates.ts

// Stable, SSR-safe date formatting (explicit locale + UTC)
const STABLE_DATE_LOCALE = "en-GB";
const STABLE_DATE_TIMEZONE = "UTC";

const STABLE_DTF = new Intl.DateTimeFormat(STABLE_DATE_LOCALE, {
    weekday: "short", // Tue
    day: "2-digit",   // 02
    month: "short",   // Dec
    year: "numeric",
    timeZone: STABLE_DATE_TIMEZONE,
});

function parseYMDtoUTC(ymd: string): Date | null {
    if (!ymd || typeof ymd !== "string") return null;
    const [y, m, d] = ymd.split("-").map((n) => Number(n));
    if (!y || !m || !d) return null;
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

export function formatDateRange(start?: string, end?: string) {
    if (!start && !end) return "—";

    const s = start ? parseYMDtoUTC(start) : null;
    const e = end ? parseYMDtoUTC(end) : null;
    const fmt = (d: Date) => STABLE_DTF.format(d);

    if (s && e) return `${fmt(s)} → ${fmt(e)}`;
    if (s) return fmt(s);
    if (e) return fmt(e);
    return "—";
}