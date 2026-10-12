import type { Metadata } from "next";
import AlbumBuilder from "@/components/album-builder/AlbumBuilder";
import { albumFontVariables } from "@/components/album/album-fonts";
import { getAlbumSettings } from "@/lib/album-settings-server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
    title: "Make your album",
    description: "Create an 8 × 10 in hardcover travel album. Choose a destination cover, add your photos, save with Google, and order delivery in Accra.",
    robots: { index: false, follow: false },
};

// Prices are set in the admin, so read them on every request.
export const dynamic = "force-dynamic";

export default async function MakeAlbumPage() {
    const { pricing } = await getAlbumSettings(createAdminClient());
    return <div className={albumFontVariables}><AlbumBuilder pricing={pricing} /></div>;
}
