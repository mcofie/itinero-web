import PhotoAlbumLanding from "@/components/landing/PhotoAlbumLanding";
import { connection } from "next/server";
import { selectFeaturedTravelCovers, selectOverheadAlbum } from "@/lib/featured-travel-covers";
import type { Metadata } from "next";
import { SITE_TITLE, SITE_DESCRIPTION, SOCIAL_IMAGE } from "@/lib/site-metadata";
import { routing } from "@/i18n/routing";
import { albumFontVariables } from "@/components/album/album-fonts";
import { getAlbumSettings } from "@/lib/album-settings-server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const locales: Record<string, string> = { en: "en_US", es: "es_ES", fr: "fr_FR" };
    return {
        alternates: {
            canonical: `/${locale}`,
            languages: { ...Object.fromEntries(routing.locales.map(language => [language, `/${language}`])), "x-default": "/en" },
        },
        openGraph: {
            title: SITE_TITLE,
            description: SITE_DESCRIPTION,
            url: `/${locale}`,
            siteName: "Itinero",
            type: "website",
            locale: locales[locale] || "en_US",
            alternateLocale: Object.entries(locales).filter(([language]) => language !== locale).map(([, value]) => value),
            images: [SOCIAL_IMAGE],
        },
    };
}

export default async function LandingPage() {
    await connection();
    // Show the price customers will actually pay, as set in the admin.
    const { pricing } = await getAlbumSettings(createAdminClient());
    return <div className={albumFontVariables}>
        <PhotoAlbumLanding featuredCovers={selectFeaturedTravelCovers()} overheadAlbum={selectOverheadAlbum()} albumPrice={pricing.albumPrice} />
    </div>;
}
