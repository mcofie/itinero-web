export const COVER_TYPEFACES = [
    { id: "bold", label: "Bold", sample: "WANDER" },
    { id: "serif", label: "Editorial", sample: "Wander" },
    { id: "handwritten", label: "Handwritten", sample: "Wander" },
] as const;

export type CoverTypeface = (typeof COVER_TYPEFACES)[number]["id"];
export const DEFAULT_COVER_TYPEFACE: CoverTypeface = "bold";
export const DEFAULT_COVER_TEXT_COLOR = "auto";

export const COVER_COLOR_SWATCHES = [
    { value: "auto", label: "Automatic contrast" },
    { value: "#fff8dc", label: "Warm ivory" },
    { value: "#ffffff", label: "White" },
    { value: "#2b1a07", label: "Dark ink" },
    { value: "#e87836", label: "Terracotta" },
] as const;

export function isCoverTypeface(value: unknown): value is CoverTypeface {
    return COVER_TYPEFACES.some(typeface => typeface.id === value);
}

export function isCoverTextColor(value: unknown): value is string {
    return value === "auto" || (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value));
}

export function normalizeCoverTypeface(value: unknown): CoverTypeface {
    return isCoverTypeface(value) ? value : DEFAULT_COVER_TYPEFACE;
}

export function normalizeCoverTextColor(value: unknown): string {
    return isCoverTextColor(value) ? value.toLowerCase() : DEFAULT_COVER_TEXT_COLOR;
}

export function coverInk(background: string): string {
    const hex = background.replace("#", "");
    const channels = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255);
    const brightness = channels.reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    return brightness < 0.55 ? "#fff8dc" : "#2b1a07";
}

export function resolveCoverTextColor(selected: string, background: string): string {
    const normalized = normalizeCoverTextColor(selected);
    return normalized === "auto" ? coverInk(background) : normalized;
}
