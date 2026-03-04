import {
    Heart, Camera, Sun, Mountain, Globe, Compass, Plane, MapPin,
} from "lucide-react";
import {
    Flower, Butterfly, Bird, Anchor,
    Lighthouse, SuitcaseRolling, Buildings, CastleTurret, Bridge, Cube,
} from "@phosphor-icons/react";

export const MATERIALS = {
    linen: { id: 'linen', name: 'Natural Linen', texture: 'https://www.transparenttextures.com/patterns/linen.png', opacity: 0.05, blend: 'overlay' },
    silk: { id: 'silk', name: 'Silk Matte', texture: 'https://www.transparenttextures.com/patterns/subtle-white-feathers.png', opacity: 0.1, blend: 'soft-light' },
    grain: { id: 'grain', name: 'Heavy Grain', texture: 'https://www.transparenttextures.com/patterns/leather.png', opacity: 0.08, blend: 'multiply' },
} as const;

export const FONTS = [
    { id: 'font-outfit', name: 'Outfit Modern', family: '"Outfit", sans-serif', import: 'Outfit:wght@100..900' },
    { id: 'font-playfair', name: 'Playfair Serif', family: '"Playfair Display", serif', import: 'Playfair+Display:wght@400..900' },
    { id: 'font-cormorant', name: 'Cormorant Luxe', family: '"Cormorant Garamond", serif', import: 'Cormorant+Garamond:wght@300..700' },
    { id: 'font-montserrat', name: 'Montserrat Bold', family: '"Montserrat", sans-serif', import: 'Montserrat:wght@100..900' },
    { id: 'font-inter', name: 'Inter Clean', family: '"Inter", sans-serif', import: 'Inter:wght@100..900' },
    { id: 'font-marker', name: 'Wild Spirit', family: '"Permanent Marker", cursive', import: 'Permanent+Marker' },
    { id: 'font-script', name: 'Tropical Soul', family: '"Pacifico", cursive', import: 'Pacifico' },
    { id: 'font-rounded', name: 'Sunbeam', family: '"Comfortaa", cursive', import: 'Comfortaa:wght@300..700' },
    { id: 'font-hand', name: 'Summer Postcard', family: '"Caveat", cursive', import: 'Caveat:wght@400..700' },
    { id: 'font-quicksand', name: 'Quicksand', family: '"Quicksand", sans-serif', import: 'Quicksand:wght@300..700' },
    { id: 'font-righteous', name: 'Righteous', family: '"Righteous", sans-serif', import: 'Righteous' },
    { id: 'font-fredoka', name: 'Fredoka Bubble', family: '"Fredoka", sans-serif', import: 'Fredoka:wght@300..700' },
];

export const FOILS = {
    none: { id: 'none', name: 'Ink Print', gradient: null },
    gold: { id: 'gold', name: '24K Gold', gradient: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)' },
    silver: { id: 'silver', name: 'Sterling', gradient: 'linear-gradient(135deg, #a1a2a3, #e8e9ea, #7b7d7e, #f2f3f4, #949596)' },
    copper: { id: 'copper', name: 'Aged Copper', gradient: 'linear-gradient(135deg, #b87333, #f0c29a, #8b4513, #e9967a, #a0522d)' }
} as const;

export const TEMPLATES = [
    { id: "modern-minimal", name: "Studio Minimal", description: "Clean grid with asymmetric white space", layout: "grid" },
    { id: "classic-heritage", name: "Heritage", description: "Classic framed focus with balanced serif typography", layout: "framed" },
    { id: "adventure", name: "Adventure", description: "Layered scattered arrangement for dynamic depth", layout: "scattered" },
    { id: "panorama", name: "Grand Horizon", description: "Expansive cinematic focus for landscapes", layout: "panorama" },
    { id: "editorial", name: "Editorial Proof", description: "High-contrast text focus with thumbnails", layout: "editorial" },
    { id: "symbolic", name: "Artisan Icon", description: "Zero images. Pure symbolic focus", layout: "symbolic" },
    { id: "destination", name: "Destination", description: "Bold destination name with illustrated icon", layout: "destination" },
    { id: "postcard", name: "Postcard", description: "Vintage postcard style with stamp motif", layout: "postcard" },
];

export const SIZES = [
    { id: "small", name: "Pocket", dimensions: "6×8 in", price_multiplier: 1 },
    { id: "medium", name: "Standard", dimensions: "8×10 in", price_multiplier: 1.25 },
    { id: "large", name: "Gallery", dimensions: "11×14 in", price_multiplier: 1.6 },
];

export const PALETTES = [
    { name: "Aegean", colors: ["#0369a1", "#f0f9ff", "#ffffff"], label: "Deep Sea" },
    { name: "Forest", colors: ["#166534", "#f0fdf4", "#ffffff"], label: "Nature" },
    { name: "Sunset", colors: ["#ff9a3d", "#fef9c3", "#ffffff"], label: "Golden Hour" },
    { name: "Studio", colors: ["#0f172a", "#f8fafc", "#ffffff"], label: "Minimal" },
    { name: "Rose", colors: ["#be123c", "#fff1f2", "#ffffff"], label: "Romance" },
    { name: "Indigo", colors: ["#4338ca", "#eef2ff", "#ffffff"], label: "Deep Night" },
    { name: "Baby Blue", colors: ["#2d4a7a", "#b8d4e8", "#dce9f3"], label: "Greece" },
    { name: "Blush Pink", colors: ["#c2185b", "#f8c8d8", "#fce4ec"], label: "Paris" },
    { name: "Lavender", colors: ["#6a3d8f", "#d4b8e8", "#ede0f5"], label: "Ibiza" },
    { name: "Mint", colors: ["#1a6b5a", "#b2e0d6", "#e0f5f0"], label: "Bali" },
    { name: "Peach", colors: ["#d45a2a", "#f8d0b8", "#fde8d8"], label: "Marrakech" },
    { name: "Butter", colors: ["#9a7b2a", "#f5e6a8", "#fdf6e0"], label: "Amalfi" },
];

export const BG_COLORS = [
    "#ffffff", "#f8fafc", "#0f172a",
    "#b8d4e8", "#f8c8d8", "#d4b8e8", "#b2e0d6", "#f8d0b8", "#f5e6a8",
    "#8eb6d9", "#f5b8c8", "#c8a8e0", "#a8d8c8", "#f0c8a8", "#e8dca0",
];

export const ICON_MAP: Record<string, any> = {
    Heart, Camera, Sun, Mountain, Globe, Compass, Plane, MapPin,
    Flower, Butterfly, Bird, Anchor, London: Buildings, Coastal: Lighthouse,
    Europe: CastleTurret, Travel: SuitcaseRolling, SF: Bridge, Modern: Cube,
};

export const EMBELLISHMENTS = [
    { id: "Globe", icon: Globe },
    { id: "Heart", icon: Heart },
    { id: "Camera", icon: Camera },
    { id: "Compass", icon: Compass },
    { id: "Mountain", icon: Mountain },
    { id: "Plane", icon: Plane },
    { id: "Flower", icon: Flower },
    { id: "Butterfly", icon: Butterfly },
    { id: "Anchor", icon: Anchor },
    { id: "Sun", icon: Sun },
];

// Destination-style SVG illustrations for the illustrated cover templates
export const DESTINATION_ILLUSTRATIONS: Record<string, { svg: string; name: string; tags: string[] }> = {
    "evil-eye": {
        name: "Evil Eye",
        tags: ["greece", "mediterranean", "turkey"],
        svg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="90" fill="#1a4a8a"/><circle cx="100" cy="100" r="68" fill="#4fa8d4"/><circle cx="100" cy="100" r="46" fill="white"/><circle cx="100" cy="100" r="28" fill="#1a2a4a"/><circle cx="92" cy="92" r="8" fill="white" opacity="0.8"/></svg>`,
    },
    "palm-tree": {
        name: "Palm Tree",
        tags: ["miami", "tropical", "beach", "bali"],
        svg: `<svg viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 260V120" stroke="#8B6914" stroke-width="12" stroke-linecap="round"/><path d="M100 120C100 120 60 80 20 90C40 70 80 60 100 80C100 60 80 20 60 10C90 20 110 60 100 80C120 60 140 20 160 10C140 30 120 60 100 80C130 60 170 70 180 90C140 80 100 120 100 120Z" fill="#2d8a4e"/></svg>`,
    },
    "frangipani": {
        name: "Frangipani",
        tags: ["bali", "tropical", "hawaii", "cannes"],
        svg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><g transform="translate(100,100)"><path d="M0,-80 C20,-60 20,-20 0,0 C-20,-20 -20,-60 0,-80Z" fill="#fce4ec" stroke="#f8c8d8" stroke-width="1"/><path d="M0,-80 C20,-60 20,-20 0,0 C-20,-20 -20,-60 0,-80Z" fill="#fff5f5" stroke="#f0b8c8" stroke-width="1" transform="rotate(72)"/><path d="M0,-80 C20,-60 20,-20 0,0 C-20,-20 -20,-60 0,-80Z" fill="#fce4ec" stroke="#f8c8d8" stroke-width="1" transform="rotate(144)"/><path d="M0,-80 C20,-60 20,-20 0,0 C-20,-20 -20,-60 0,-80Z" fill="#fff5f5" stroke="#f0b8c8" stroke-width="1" transform="rotate(216)"/><path d="M0,-80 C20,-60 20,-20 0,0 C-20,-20 -20,-60 0,-80Z" fill="#fce4ec" stroke="#f8c8d8" stroke-width="1" transform="rotate(288)"/><circle r="15" fill="#f9e080"/></g></svg>`,
    },
    "coral": {
        name: "Coral Branch",
        tags: ["ibiza", "ocean", "beach", "mediterranean"],
        svg: `<svg viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M90 200V140" stroke="#e85a8a" stroke-width="10" stroke-linecap="round"/><path d="M90 140V80" stroke="#e85a8a" stroke-width="8" stroke-linecap="round"/><path d="M90 120L60 80" stroke="#e85a8a" stroke-width="7" stroke-linecap="round"/><path d="M60 80L40 50" stroke="#e85a8a" stroke-width="5" stroke-linecap="round"/><path d="M60 80L70 45" stroke="#e85a8a" stroke-width="5" stroke-linecap="round"/><path d="M90 100L120 65" stroke="#e85a8a" stroke-width="6" stroke-linecap="round"/><path d="M120 65L140 35" stroke="#e85a8a" stroke-width="4" stroke-linecap="round"/><path d="M120 65L110 30" stroke="#e85a8a" stroke-width="4" stroke-linecap="round"/><path d="M90 80L75 50" stroke="#e85a8a" stroke-width="5" stroke-linecap="round"/><circle cx="40" cy="48" r="5" fill="#e85a8a"/><circle cx="70" cy="43" r="4" fill="#e85a8a"/><circle cx="140" cy="33" r="5" fill="#e85a8a"/><circle cx="110" cy="28" r="4" fill="#e85a8a"/><circle cx="75" cy="48" r="4" fill="#e85a8a"/></svg>`,
    },
    "coconut": {
        name: "Coconut",
        tags: ["miami", "tropical", "beach", "caribbean"],
        svg: `<svg viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="90" cy="120" rx="70" ry="65" fill="#6B3A1F"/><ellipse cx="90" cy="115" rx="62" ry="58" fill="#8B5A2B"/><path d="M28 110C28 110 50 60 90 55C130 60 152 110 152 110" fill="#D2B48C"/><ellipse cx="90" cy="95" rx="45" ry="38" fill="white" opacity="0.9"/><ellipse cx="65" cy="90" rx="6" ry="7" fill="#5C3310"/><ellipse cx="115" cy="90" rx="6" ry="7" fill="#5C3310"/><ellipse cx="90" cy="105" rx="5" ry="6" fill="#5C3310"/></svg>`,
    },
    "watermelon": {
        name: "Watermelon",
        tags: ["summer", "bali", "tropical", "fun"],
        svg: `<svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 130 A90 90 0 0 1 190 130Z" fill="#2d8a4e"/><path d="M18 130 A82 82 0 0 1 182 130Z" fill="white"/><path d="M25 130 A75 75 0 0 1 175 130Z" fill="#e8385a"/><ellipse cx="70" cy="105" rx="5" ry="7" fill="#2a1a0a" transform="rotate(-15 70 105)"/><ellipse cx="100" cy="95" rx="5" ry="7" fill="#2a1a0a"/><ellipse cx="130" cy="105" rx="5" ry="7" fill="#2a1a0a" transform="rotate(15 130 105)"/><ellipse cx="85" cy="115" rx="4" ry="6" fill="#2a1a0a" transform="rotate(-8 85 115)"/><ellipse cx="115" cy="115" rx="4" ry="6" fill="#2a1a0a" transform="rotate(8 115 115)"/></svg>`,
    },
    "seashell": {
        name: "Seashell",
        tags: ["beach", "coastal", "ocean", "cannes"],
        svg: `<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 20C60 20 30 60 30 110C30 150 60 180 100 180C140 180 170 150 170 110C170 60 140 20 100 20Z" fill="#f8d0b8"/><path d="M100 30C100 30 100 180 100 180" stroke="#e8b090" stroke-width="2"/><path d="M100 40C80 60 60 100 50 140" stroke="#e8b090" stroke-width="1.5" fill="none"/><path d="M100 40C120 60 140 100 150 140" stroke="#e8b090" stroke-width="1.5" fill="none"/><path d="M100 50C75 75 55 120 50 160" stroke="#e8b090" stroke-width="1" fill="none" opacity="0.5"/><path d="M100 50C125 75 145 120 150 160" stroke="#e8b090" stroke-width="1" fill="none" opacity="0.5"/></svg>`,
    },
    "hot-air-balloon": {
        name: "Hot Air Balloon",
        tags: ["cappadocia", "turkey", "adventure", "travel"],
        svg: `<svg viewBox="0 0 160 220" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M80 10C35 10 10 55 10 95C10 130 40 155 80 160C120 155 150 130 150 95C150 55 125 10 80 10Z" fill="#e85a5a"/><path d="M80 10C65 10 55 55 55 95C55 130 65 155 80 160C95 155 105 130 105 95C105 55 95 10 80 10Z" fill="#f08080" opacity="0.6"/><path d="M80 10C50 10 32 55 32 95C32 130 52 155 80 160" fill="#d44a4a" opacity="0.4"/><line x1="60" y1="160" x2="55" y2="185" stroke="#6B3A1F" stroke-width="2"/><line x1="100" y1="160" x2="105" y2="185" stroke="#6B3A1F" stroke-width="2"/><rect x="50" y="185" width="60" height="25" rx="4" fill="#d4a574" stroke="#b8875a" stroke-width="2"/></svg>`,
    },
};

export type StudioImage = {
    id: string;
    preview_url: string;
    file?: File;
    role: "cover" | "internal";
};

export type DesignState = {
    templateId: string;
    coverBgColor: string;
    coverTextColor: string;
    coverIconName: string | null;
    coverSymbol: string;
    title: string;
    subtitle: string;
    sizeId: string;
    isRounded: boolean;
    coverMaterial: keyof typeof MATERIALS;
    coverFont: string;
    coverFoil: keyof typeof FOILS;
    spineText: string;
    illustrationId: string | null;
};
