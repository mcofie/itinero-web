/** Popular country destinations, guided by UN Tourism's November 2025 arrivals table.
 * Country-level artwork only; see docs/design/country-cover-library.md for selection notes.
 */
export const TRAVEL_COVERS = [
    { id: "france", country: "France", color: "#1e4968" },
    { id: "spain", country: "Spain", color: "#d84d32" },
    { id: "usa", country: "United States", color: "#d9a0ac" },
    { id: "turkey", country: "Türkiye", color: "#f4efdc" },
    { id: "italy", country: "Italy", color: "#e6ac08" },
    { id: "mexico", country: "Mexico", color: "#ec9c30" },
    { id: "uk", country: "United Kingdom", color: "#112e52" },
    { id: "germany", country: "Germany", color: "#9dbba9" },
    { id: "japan", country: "Japan", color: "#f4efdc" },
    { id: "china", country: "China", color: "#b72828" },
    { id: "greece", country: "Greece", color: "#377dc5" },
    { id: "thailand", country: "Thailand", color: "#f2a6b2" },
    { id: "austria", country: "Austria", color: "#b6d1d7" },
    { id: "uae", country: "United Arab Emirates", color: "#ddbd8c" },
    { id: "saudi-arabia", country: "Saudi Arabia", color: "#e5bd80" },
    { id: "portugal", country: "Portugal", color: "#f4ebd6" },
    { id: "malaysia", country: "Malaysia", color: "#153f32" },
    { id: "netherlands", country: "Netherlands", color: "#203c2a" },
    { id: "india", country: "India", color: "#e78134" },
    { id: "canada", country: "Canada", color: "#f0dfbb" },
    { id: "poland", country: "Poland", color: "#a7c9cc" },
    { id: "denmark", country: "Denmark", color: "#efd993" },
    { id: "vietnam", country: "Vietnam", color: "#b52420" },
    { id: "morocco", country: "Morocco", color: "#e78343" },
    { id: "croatia", country: "Croatia", color: "#76b7c4" },
    { id: "south-korea", country: "South Korea", color: "#f3e6d6" },
    { id: "russia", country: "Russia", color: "#a9c8d0" },
    { id: "egypt", country: "Egypt", color: "#ecd29b" },
    { id: "czechia", country: "Czechia", color: "#e6b0a2" },
    { id: "indonesia", country: "Indonesia", color: "#edac86" },
] as const;

export type TravelCoverId = (typeof TRAVEL_COVERS)[number]["id"];
export type TravelCover = (typeof TRAVEL_COVERS)[number];
export type FeaturedTravelCovers = readonly [TravelCoverId, TravelCoverId, TravelCoverId, TravelCoverId, TravelCoverId, TravelCoverId];

export const TRAVEL_COVERS_BY_ID = Object.fromEntries(
    TRAVEL_COVERS.map(cover => [cover.id, cover]),
) as Record<TravelCoverId, TravelCover>;

