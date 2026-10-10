import PhotoAlbumLanding from "@/components/landing/PhotoAlbumLanding";
import { connection } from "next/server";
import { selectFeaturedTravelCovers, selectOverheadAlbum } from "@/lib/featured-travel-covers";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { SITE_TITLE, SITE_DESCRIPTION, SOCIAL_IMAGE } from "@/lib/site-metadata";
import { routing } from "@/i18n/routing";

const albumSerif = localFont({ src: "../../../public/fonts/landing/gelica-regular.woff2", variable: "--font-album-serif", display: "swap", fallback: ["Georgia", "serif"] });
const albumHand = localFont({ src: "../../../public/fonts/landing/handwritten.woff2", variable: "--font-album-hand", display: "swap", fallback: ["cursive"] });
const albumRound = localFont({ src: "../../../public/fonts/landing/lilita-one.ttf", variable: "--font-album-round", display: "swap", fallback: ["Arial", "sans-serif"] });

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
    return <div className={`${albumSerif.variable} ${albumHand.variable} ${albumRound.variable}`}>
        <PhotoAlbumLanding featuredCovers={selectFeaturedTravelCovers()} overheadAlbum={selectOverheadAlbum()} />
    </div>;
}
