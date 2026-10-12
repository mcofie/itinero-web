export const ALBUM_PRICE_GHS = 800;
export const ALBUM_FORMAT = "8 × 10 in hardcover";
export const ALBUM_BUCKET = "photobooks";

export type AlbumShippingAddress = {
    fullName: string;
    phone: string;
    street: string;
    area: string;
    landmark: string;
    city: "Accra";
    region: "Greater Accra";
    country: "GH";
};

export function parseAccraAddress(value: unknown): AlbumShippingAddress | null {
    if (!value || typeof value !== "object") return null;
    const input = value as Record<string, unknown>;
    const fullName = String(input.fullName ?? "").trim();
    const phone = String(input.phone ?? "").trim();
    const street = String(input.street ?? "").trim();
    const area = String(input.area ?? "").trim();
    const landmark = String(input.landmark ?? "").trim();
    if (!fullName || !street || !area || !/^\+?[0-9 ()-]{8,20}$/.test(phone)) return null;
    if ([fullName, street, area, landmark].some(part => part.length > 140)) return null;
    return { fullName, phone, street, area, landmark, city: "Accra", region: "Greater Accra", country: "GH" };
}
