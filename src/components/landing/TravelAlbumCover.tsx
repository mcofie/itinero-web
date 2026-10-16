import LandingImage from "./LandingImage";
import type { CSSProperties } from "react";
import { coverImagePath, TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import { coverInk } from "@/lib/album-cover-style";
import { coverTitleLayout } from "@/lib/cover-title-layout";
import styles from "./PhotoAlbumLanding.module.css";

export default function TravelAlbumCover({ design = "italy", eager = false, media, prominent = false }: { design?: TravelCoverId; eager?: boolean; media?: "mobile" | "desktop"; prominent?: boolean }) {
    const cover = TRAVEL_COVERS_BY_ID[design];
    const title = coverTitleLayout(cover.country);
    const oneLine = title.lines.length === 1;
    return <div className={styles.albumCover} style={{
        "--cover-color": cover.color,
        "--cover-ink": coverInk(cover.color),
        "--cover-title-size": `${oneLine ? title.size / .8 : title.size}cqw`,
        "--cover-title-width": oneLine ? "125%" : "100%",
        "--cover-title-squeeze": oneLine ? "scaleX(.8)" : "none",
        "--cover-year-size": oneLine ? "8.5cqw" : "7cqw",
    } as CSSProperties}>
        <LandingImage
            src={coverImagePath(design)}
            alt=""
            width={1024}
            height={1536}
            className={styles.coverArtwork}
            sizes={media === "mobile" ? "(max-width: 540px) 48vw, 280px" : media === "desktop" ? "(max-width: 1050px) 53vw, (min-width: 1750px) 760px, 44vw" : "(max-width: 540px) 65vw, (max-width: 900px) 49vw, (max-height: 760px) 33vh, 42vw"}
            eager={eager}
            media={media}
            prominent={prominent}
        />
        <div className={styles.coverLettering} aria-hidden="true">
            <strong>{title.lines.map((line, index) => <span key={line} className={styles.coverTitleLine}>{index > 0 && <br />}{line}</span>)}</strong>
            <span>{new Date().getFullYear()}</span>
        </div>
    </div>;
}
