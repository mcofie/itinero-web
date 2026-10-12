import type { Metadata } from "next";
import localFont from "next/font/local";
import AlbumBuilder from "@/components/album-builder/AlbumBuilder";
import { getAlbumSettings } from "@/lib/album-settings-server";
import { createAdminClient } from "@/lib/supabase/admin";

const albumSerif = localFont({ src: "../../../../public/fonts/landing/gelica-regular.woff2", variable: "--font-album-serif", display: "swap", fallback: ["Georgia", "serif"] });
const albumHand = localFont({ src: "../../../../public/fonts/landing/handwritten.woff2", variable: "--font-album-hand", display: "swap", fallback: ["cursive"] });
const albumRound = localFont({ src: "../../../../public/fonts/landing/lilita-one.ttf", variable: "--font-album-round", display: "swap", fallback: ["Arial", "sans-serif"] });

export const metadata: Metadata = {
    title: "Make your album",
    description: "Create an 8 × 10 in hardcover travel album. Choose a destination cover, add your photos, save with Google, and order delivery in Accra.",
    robots: { index: false, follow: false },
};

// Prices are set in the admin, so read them on every request.
export const dynamic = "force-dynamic";

export default async function MakeAlbumPage() {
    const { pricing } = await getAlbumSettings(createAdminClient());
    return <div className={`${albumSerif.variable} ${albumHand.variable} ${albumRound.variable}`}><AlbumBuilder pricing={pricing} /></div>;
}
