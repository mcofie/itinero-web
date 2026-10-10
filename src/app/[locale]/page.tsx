import PhotoAlbumLanding from "@/components/landing/PhotoAlbumLanding";
import { connection } from "next/server";
import { selectFeaturedTravelCovers, selectOverheadAlbum } from "@/lib/featured-travel-covers";

export default async function LandingPage() {
    await connection();
    return <PhotoAlbumLanding featuredCovers={selectFeaturedTravelCovers()} overheadAlbum={selectOverheadAlbum()} />;
}
