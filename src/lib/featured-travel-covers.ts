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
    const pool = TRAVEL_COVERS.map(cover => cover.id);
    const take = (options: typeof pool) => {
        const id = options[randomInt(options.length)];
        pool.splice(pool.indexOf(id), 1);
        return id;
    };
    const front = take(pool);
    // The two partly covered books need short names to keep their titles legible.
    const sideOptions = TRAVEL_COVERS.filter(cover => cover.country.length <= 7 && cover.id !== front).map(cover => cover.id);
    const left = take(sideOptions);
    sideOptions.splice(sideOptions.indexOf(left), 1);
    const right = take(sideOptions);
    return [front, left, right, take(pool), take(pool), take(pool)];
}
