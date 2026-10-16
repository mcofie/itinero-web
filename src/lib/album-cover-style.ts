export const COVER_TYPEFACES = [
    { id: "bold", label: "Bold", sample: "WANDER" },
    { id: "serif", label: "Editorial", sample: "Wander" },
    { id: "handwritten", label: "Handwritten", sample: "Wander" },
] as const;

export type CoverTypeface = (typeof COVER_TYPEFACES)[number]["id"];
export const DEFAULT_COVER_TYPEFACE: CoverTypeface = "bold";
export const DEFAULT_COVER_TEXT_COLOR = "auto";

export const COVER_COLOR_SWATCHES = [
    { value: "auto", label: "Matched to cover" },
    { value: "#fff8dc", label: "Warm ivory" },
    { value: "#ffffff", label: "White" },
    { value: "#2b1a07", label: "Dark ink" },
    { value: "#e87836", label: "Terracotta" },
] as const;

// One ink for each background in the country-cover palette. These keep the
// lettering in the same colour family as the art while retaining clear contrast.
const COVER_PALETTE_INKS: Record<string, string> = {
    "#c7d9e6": "#24405b", // powder blue / navy
    "#c2d8d1": "#244b45", // sea glass / deep teal
    "#e8c3be": "#673b42", // soft rose / wine
    "#f1e7d6": "#583b2b", // warm ivory / walnut
    "#bdd1db": "#29465a", // misty blue / navy
    "#cedcc4": "#31513f", // pale sage / forest
    "#526f89": "#fff8e6", // deep slate blue / warm ivory
    "#75a19b": "#0d302d", // muted teal / deep teal
    "#708da3": "#071b2b", // slate blue / deep navy
    "#4e716d": "#fff8e6", // deep teal / warm ivory
    "#ebcbb5": "#653c2b", // soft peach / walnut
    "#eedfb9": "#654a29", // soft butter / umber
    "#d9cce3": "#4e3b59", // pale lilac / aubergine
    "#e8d9c7": "#5c402d", // soft linen / walnut
    "#d0e1dc": "#29514c", // pale aqua / deep teal
    "#a5bfda": "#284665", // cornflower / navy
    "#f2e6cd": "#8a302c", // warm cream / national red
    "#d9e3ce": "#285339", // pale leaf / forest
    "#e7c6c3": "#7e3035", // pale coral / burgundy
    "#d3dfc7": "#5b3030", // pale sage / deep wine
    "#4b6b55": "#fff7df", // deep forest / warm ivory
    "#e4bcb2": "#28523e", // soft terracotta / forest
    "#e6ccd3": "#6e2e43", // pale maroon / maroon
    "#e4cfad": "#31563e", // golden sand / forest
    "#d8b4b4": "#522f34", // dusty red / deep wine
    "#eee1cb": "#342d2a", // warm paper / near black
    "#a94c4f": "#fff7df", // Albanian red / warm ivory
    "#c9dbe6": "#8b3439", // soft flag blue / deep red
    "#f3d98d": "#85312c", // sun gold / deep red
    "#bcd8ad": "#285339", // fresh leaf / forest
    "#f0c28d": "#63402a", // warm apricot / umber
    "#f2bd8f": "#28465d", // clear apricot / navy
    "#add3e7": "#1e4965", // bright sky / navy
    "#d89a91": "#502936", // warm coral / wine
    "#b7d8b7": "#285339", // clear mint / forest
    "#eecb6d": "#2e523d", // bright gold / forest
    "#efd079": "#263f67", // sun yellow / navy
    "#9bcac4": "#0d302d", // bright sea glass / deep teal
};

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

function luminance(hexColor: string): number {
    const hex = hexColor.slice(1);
    const channels = [0, 2, 4].map(index => {
        const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return channels.reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(first: string, second: string): number {
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
}

export function coverInk(background: string): string {
    const normalized = background.toLowerCase();
    if (COVER_PALETTE_INKS[normalized]) return COVER_PALETTE_INKS[normalized];
    if (!/^#[0-9a-f]{6}$/.test(normalized)) return "#2b1a07";
    const ivory = "#fff8e6";
    const dark = "#2b1a07";
    return contrast(ivory, normalized) >= contrast(dark, normalized) ? ivory : dark;
}

export function resolveCoverTextColor(selected: string, background: string): string {
    const normalized = normalizeCoverTextColor(selected);
    return normalized === "auto" ? coverInk(background) : normalized;
}
