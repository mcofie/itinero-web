/** Illustrated country destinations for the album builder and landing page.
 * See docs/design/country-cover-library.md for artwork and selection notes.
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
    { id: "ghana", country: "Ghana", color: "#d94d2f" },
    { id: "south-africa", country: "South Africa", color: "#5fa992" },
    { id: "kenya", country: "Kenya", color: "#f3ac30" },
    { id: "nigeria", country: "Nigeria", color: "#0c3174" },
    { id: "tanzania", country: "Tanzania", color: "#d2736f" },
    { id: "switzerland", country: "Switzerland", color: "#15473b" },
    { id: "australia", country: "Australia", color: "#f86761" },
    { id: "brazil", country: "Brazil", color: "#fc7612" },
    { id: "ireland", country: "Ireland", color: "#28432c" },
    { id: "norway", country: "Norway", color: "#143351" },
    { id: "singapore", country: "Singapore", color: "#e95245" },
    { id: "philippines", country: "Philippines", color: "#10a6ad" },
    { id: "cambodia", country: "Cambodia", color: "#f8ac24" },
    { id: "new-zealand", country: "New Zealand", color: "#065655" },
    { id: "argentina", country: "Argentina", color: "#a984a2" },
    { id: "chile", country: "Chile", color: "#f6783d" },
    { id: "peru", country: "Peru", color: "#ae3623" },
    { id: "colombia", country: "Colombia", color: "#18b4c3" },
    { id: "rwanda", country: "Rwanda", color: "#8a9c7f" },
    { id: "senegal", country: "Senegal", color: "#f87372" },
    { id: "cote-divoire", country: "Côte d’Ivoire", color: "#dcb176" },
    { id: "togo", country: "Togo", color: "#b9905b" },
    { id: "benin", country: "Benin", color: "#6ba4a5" },
    { id: "uganda", country: "Uganda", color: "#759d71" },
    { id: "namibia", country: "Namibia", color: "#d8845b" },
    { id: "mauritius", country: "Mauritius", color: "#70aeb4" },
    { id: "tunisia", country: "Tunisia", color: "#a1b6b1" },
    { id: "sweden", country: "Sweden", color: "#6fa8bd" },
    { id: "finland", country: "Finland", color: "#748f90" },
    { id: "iceland", country: "Iceland", color: "#789aa5" },
    { id: "belgium", country: "Belgium", color: "#b87969" },
    { id: "hungary", country: "Hungary", color: "#9b6c84" },
    { id: "jordan", country: "Jordan", color: "#b76454" },
    { id: "qatar", country: "Qatar", color: "#b98471" },
    { id: "sri-lanka", country: "Sri Lanka", color: "#bf784c" },
    { id: "nepal", country: "Nepal", color: "#677c9c" },
    { id: "taiwan", country: "Taiwan", color: "#d57570" },
    { id: "costa-rica", country: "Costa Rica", color: "#518e81" },
    { id: "dominican-republic", country: "Dominican Republic", color: "#73adb7" },
    { id: "ecuador", country: "Ecuador", color: "#97a0aa" },
] as const;

export type TravelCoverId = (typeof TRAVEL_COVERS)[number]["id"];
export type TravelCover = (typeof TRAVEL_COVERS)[number];
export type FeaturedTravelCovers = readonly [TravelCoverId, TravelCoverId, TravelCoverId, TravelCoverId, TravelCoverId, TravelCoverId];

export const TRAVEL_COVERS_BY_ID = Object.fromEntries(
    TRAVEL_COVERS.map(cover => [cover.id, cover]),
) as Record<TravelCoverId, TravelCover>;

export function coverImagePath(id: TravelCoverId) {
    return `/images/landing/covers/${id}.webp`;
}

export function coverThumbnailPath(id: TravelCoverId) {
    return `/images/landing/covers/thumbs/${id}.webp`;
}

