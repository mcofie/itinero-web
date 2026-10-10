import LandingImage from "./LandingImage";
import type { CSSProperties } from "react";
import { TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import styles from "./PhotoAlbumLanding.module.css";

export default function TravelAlbumCover({ design = "italy", eager = false, media, prominent = false }: { design?: TravelCoverId; eager?: boolean; media?: "mobile" | "desktop"; prominent?: boolean }) {
    const cover = TRAVEL_COVERS_BY_ID[design];
    return <div className={styles.albumCover} style={{ "--cover-color": cover.color } as CSSProperties}>
        <LandingImage
            src={`/images/landing/covers/${cover.id}.png`}
            alt=""
            width={1024}
            height={1536}
            className={styles.coverArtwork}
            sizes={media === "mobile" ? "(max-width: 540px) 48vw, 280px" : media === "desktop" ? "(max-width: 1050px) 53vw, (min-width: 1750px) 760px, 44vw" : "(max-width: 540px) 65vw, (max-width: 900px) 49vw, (max-height: 760px) 33vh, 42vw"}
            eager={eager}
            media={media}
            prominent={prominent}
        />
    </div>;
}
