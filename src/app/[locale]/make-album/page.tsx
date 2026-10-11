import type { Metadata } from "next";
import localFont from "next/font/local";
import AlbumBuilder from "@/components/album-builder/AlbumBuilder";

const albumSerif = localFont({ src: "../../../../public/fonts/landing/gelica-regular.woff2", variable: "--font-album-serif", display: "swap", fallback: ["Georgia", "serif"] });
const albumHand = localFont({ src: "../../../../public/fonts/landing/handwritten.woff2", variable: "--font-album-hand", display: "swap", fallback: ["cursive"] });
const albumRound = localFont({ src: "../../../../public/fonts/landing/lilita-one.ttf", variable: "--font-album-round", display: "swap", fallback: ["Arial", "sans-serif"] });

export const metadata: Metadata = {
    title: "Make your album",
    description: "Make a photo album from your favorite trip. Choose a destination cover, add your photos, and download a PDF proof.",
    robots: { index: false, follow: false },
};

export default function MakeAlbumPage() {
    return <div className={`${albumSerif.variable} ${albumHand.variable} ${albumRound.variable}`}><AlbumBuilder /></div>;
}
