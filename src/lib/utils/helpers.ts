// Shared stable date utilities (paste into both files that format dates)

const STABLE_DATE_LOCALE = "en-GB"; // or "en-US" if you prefer that style
const STABLE_DATE_TIMEZONE = "UTC";

const STABLE_DTF = new Intl.DateTimeFormat(STABLE_DATE_LOCALE, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: STABLE_DATE_TIMEZONE,
});

function parseYMDtoUTC(ymd: string): Date | null {
    // ymd is expected to be "YYYY-MM-DD"
    if (!ymd || typeof ymd !== "string") return null;
    const [y, m, d] = ymd.split("-").map((n) => Number(n));
    if (!y || !m || !d) return null;
    // Construct a UTC date so client/server don’t diverge by TZ
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

function formatISODate(x?: string) {
    if (!x) return "—";
    const d = parseYMDtoUTC(x);
    return d ? STABLE_DTF.format(d) : x;
}

function formatDateRange(start?: string, end?: string) {
    if (!start && !end) return "—";
    const s = start ? parseYMDtoUTC(start) : null;
    const e = end ? parseYMDtoUTC(end) : null;
    const fmt = (d: Date) => STABLE_DTF.format(d);
    if (s && e) return `${fmt(s)} → ${fmt(e)}`;
    if (s) return fmt(s);
    if (e) return fmt(e);
    return "—";
}