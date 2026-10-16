import type { AlbumLayout, AlbumPhoto } from "./album-draft";

/** Splits photos into album pages for a layout: one, two or three photos a page. */
export function groupAlbumPhotos(photos: AlbumPhoto[], layout: AlbumLayout): AlbumPhoto[][] {
    const perPage = layout === "gallery" ? 1 : layout === "collage" ? 3 : 2;
    return Array.from({ length: Math.ceil(photos.length / perPage) }, (_, index) => photos.slice(index * perPage, (index + 1) * perPage));
}
