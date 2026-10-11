import "server-only";
import { randomInt } from "node:crypto";
import { TRAVEL_COVERS, type FeaturedTravelCovers } from "./travel-covers";
import { OVERHEAD_ALBUMS, type OverheadAlbum } from "./overhead-albums";

/** Choose once on the server so the photograph stays stable after hydration. */
export function selectOverheadAlbum(): OverheadAlbum {
    return OVERHEAD_ALBUMS[randomInt(OVERHEAD_ALBUMS.length)];
}

/** Sample without replacement once per page request, before server rendering. */
export function selectFeaturedTravelCovers(): FeaturedTravelCovers {
    const pool = TRAVEL_COVERS.filter(cover => !("artOnly" in cover)).map(cover => cover.id);
    for (let i = 0; i < 6; i++) {
        const j = randomInt(i, pool.length);
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return [pool[0], pool[1], pool[2], pool[3], pool[4], pool[5]];
}
