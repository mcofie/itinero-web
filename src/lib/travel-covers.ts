/** Popular country destinations, guided by UN Tourism's November 2025 arrivals table.
 * Country-level artwork only; see docs/design/country-cover-library.md for selection notes.
 */
export const TRAVEL_COVERS = [
    { id: "france", country: "France", color: "#023678" },
    { id: "spain", country: "Spain", color: "#da2a1b" },
    { id: "usa", country: "United States", color: "#e87275" },
    { id: "turkey", country: "Türkiye", color: "#fef6d7" },
    { id: "italy", country: "Italy", color: "#e8ac0f" },
    { id: "mexico", country: "Mexico", color: "#fba702" },
    { id: "uk", country: "United Kingdom", color: "#09325d" },
    { id: "germany", country: "Germany", color: "#99b686" },
    { id: "japan", country: "Japan", color: "#fdf5d8" },
    { id: "china", country: "China", color: "#bf1414" },
    { id: "greece", country: "Greece", color: "#025ba9" },
    { id: "thailand", country: "Thailand", color: "#fd7f8e" },
    { id: "austria", country: "Austria", color: "#9dd3f2" },
    { id: "uae", country: "United Arab Emirates", color: "#edb446" },
    { id: "saudi-arabia", country: "Saudi Arabia", color: "#edac1e" },
    { id: "portugal", country: "Portugal", color: "#fef7da" },
    { id: "malaysia", country: "Malaysia", color: "#035829" },
    { id: "netherlands", country: "Netherlands", color: "#134f25" },
    { id: "india", country: "India", color: "#fe8b0e" },
    { id: "canada", country: "Canada", color: "#fdf7dd" },
    { id: "poland", country: "Poland", color: "#9fced6" },
    { id: "denmark", country: "Denmark", color: "#feefa4" },
    { id: "vietnam", country: "Vietnam", color: "#b1070e" },
    { id: "morocco", country: "Morocco", color: "#ea6320" },
    { id: "croatia", country: "Croatia", color: "#2ebacc" },
    { id: "south-korea", country: "South Korea", color: "#fef7dd" },
    { id: "russia", country: "Russia", color: "#6db0d6" },
    { id: "egypt", country: "Egypt", color: "#fdefb3" },
    { id: "czechia", country: "Czechia", color: "#f9976e" },
    { id: "indonesia", country: "Indonesia", color: "#fca56f" },
    { id: "ghana", country: "Ghana", color: "#d94d2f", artOnly: true },
    { id: "south-africa", country: "South Africa", color: "#5fa992", artOnly: true },
    { id: "kenya", country: "Kenya", color: "#f3ac30", artOnly: true },
    { id: "nigeria", country: "Nigeria", color: "#0c3174", artOnly: true },
    { id: "tanzania", country: "Tanzania", color: "#d2736f", artOnly: true },
    { id: "switzerland", country: "Switzerland", color: "#15473b", artOnly: true },
    { id: "australia", country: "Australia", color: "#f86761", artOnly: true },
    { id: "brazil", country: "Brazil", color: "#fc7612", artOnly: true },
    { id: "ireland", country: "Ireland", color: "#28432c", artOnly: true },
    { id: "norway", country: "Norway", color: "#143351", artOnly: true },
    { id: "singapore", country: "Singapore", color: "#e95245", artOnly: true },
    { id: "philippines", country: "Philippines", color: "#10a6ad", artOnly: true },
    { id: "cambodia", country: "Cambodia", color: "#f8ac24", artOnly: true },
    { id: "new-zealand", country: "New Zealand", color: "#065655", artOnly: true },
    { id: "argentina", country: "Argentina", color: "#a984a2", artOnly: true },
    { id: "chile", country: "Chile", color: "#f6783d", artOnly: true },
    { id: "peru", country: "Peru", color: "#ae3623", artOnly: true },
    { id: "colombia", country: "Colombia", color: "#18b4c3", artOnly: true },
    { id: "rwanda", country: "Rwanda", color: "#8a9c7f", artOnly: true },
    { id: "senegal", country: "Senegal", color: "#f87372", artOnly: true },
] as const;

export type TravelCoverId = (typeof TRAVEL_COVERS)[number]["id"];
export type TravelCover = (typeof TRAVEL_COVERS)[number];
export type FeaturedTravelCovers = readonly [TravelCoverId, TravelCoverId, TravelCoverId, TravelCoverId, TravelCoverId, TravelCoverId];

export const TRAVEL_COVERS_BY_ID = Object.fromEntries(
    TRAVEL_COVERS.map(cover => [cover.id, cover]),
) as Record<TravelCoverId, TravelCover>;

export function coverImagePath(id: TravelCoverId) {
    const cover = TRAVEL_COVERS_BY_ID[id];
    return `/images/landing/covers/${id}.${"artOnly" in cover ? "webp" : "png"}`;
}

export function coverThumbnailPath(id: TravelCoverId) {
    return `/images/landing/covers/thumbs/${id}.webp`;
}

