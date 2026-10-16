/** Customer text for the opening page, closing page and back cover. Safe to import in the browser. */
export type AlbumPageText = {
    /** Heading on the opening page; the cover title when empty. */
    openingTitle: string;
    /** Optional dedication or introduction on the opening page. */
    openingNote: string;
    /** Optional message on the closing page. */
    closingNote: string;
    /** Optional line on the back cover. */
    backNote: string;
};

export const PAGE_TEXT_LIMITS: Record<keyof AlbumPageText, number> = { openingTitle: 40, openingNote: 220, closingNote: 220, backNote: 120 };

export const EMPTY_PAGE_TEXT: AlbumPageText = { openingTitle: "", openingNote: "", closingNote: "", backNote: "" };

/** Keeps known fields as trimmed strings within their limits. Line breaks are kept in notes. */
export function normalizePageText(value: unknown): AlbumPageText {
    const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
    const clean = (key: keyof AlbumPageText) => {
        const text = typeof input[key] === "string" ? input[key] as string : "";
        const tidy = key === "openingTitle" ? text.replace(/\s+/g, " ") : text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n");
        return tidy.slice(0, PAGE_TEXT_LIMITS[key]);
    };
    return { openingTitle: clean("openingTitle"), openingNote: clean("openingNote"), closingNote: clean("closingNote"), backNote: clean("backNote") };
}

/** Pages in the print file besides photo pages: front cover, opening page, closing page and back cover. */
export const EXTRA_PAGES = 4;
