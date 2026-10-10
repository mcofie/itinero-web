export const OVERHEAD_ALBUMS = [
    { country: "Italy", src: "/images/landing/hand-held-italy-album-v3.png" },
    { country: "Japan", src: "/images/landing/hand-held-japan-album.png" },
    { country: "Morocco", src: "/images/landing/hand-held-morocco-album.png" },
    { country: "Portugal", src: "/images/landing/hand-held-portugal-album.png" },
] as const;

export type OverheadAlbum = (typeof OVERHEAD_ALBUMS)[number];
