import { albumFontVariables } from "@/components/album/album-fonts";
import AlbumBuilderSkeleton from "@/components/album-builder/AlbumBuilderSkeleton";

/** Replaces the site-wide spinner while the album studio and its prices load. */
export default function MakeAlbumLoading() {
    return <div className={albumFontVariables}><AlbumBuilderSkeleton /></div>;
}
