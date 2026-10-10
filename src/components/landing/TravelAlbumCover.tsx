import Image from "next/image";
import type { CSSProperties } from "react";
import { TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import styles from "./PhotoAlbumLanding.module.css";

export default function TravelAlbumCover({ design = "italy", eager = false }: { design?: TravelCoverId; eager?: boolean }) {
    const cover = TRAVEL_COVERS_BY_ID[design];
    return <div className={styles.albumCover} style={{ "--cover-color": cover.color } as CSSProperties}>
        <Image
            src={`/images/landing/covers/${cover.id}.png`}
            alt=""
            width={1024}
            height={1536}
            className={styles.coverArtwork}
            loading={eager ? "eager" : "lazy"}
            unoptimized
            draggable={false}
        />
    </div>;
}
