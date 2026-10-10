import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import ThemeProvider from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { AppProgressBar } from "@/components/layout/AppProgress";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from "@/components/ui/sonner";
import GlobalLoading from "./loading";
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, SOCIAL_IMAGE } from "@/lib/site-metadata";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: SITE_URL,
    applicationName: "Itinero",
    title: { template: "%s | Itinero", default: SITE_TITLE },
    description: SITE_DESCRIPTION,
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
            { url: "/brand/itinero-camera.svg", type: "image/svg+xml", sizes: "any" },
        ],
        apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        siteName: "Itinero",
        type: "website",
        images: [SOCIAL_IMAGE],
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        images: [SOCIAL_IMAGE],
    },
};

export default async function RootLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!(routing.locales as readonly string[]).includes(locale)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html
            lang={locale}
            suppressHydrationWarning
            // Put font vars on html so they’re present pre-hydration
            className={cn(geistSans.variable, geistMono.variable)}
        >
            <body className={cn("min-h-dvh bg-background text-foreground antialiased")}>
                {/* ThemeProvider adds .dark/.light to <html> because attribute="class" */}
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                    themes={["light", "dark"]}
                >
                    <NextIntlClientProvider messages={messages} locale={locale}>
                        <Suspense fallback={null}>
                            <AppProgressBar />
                        </Suspense>
                        <Suspense fallback={<GlobalLoading />}>
                            {children}
                        </Suspense>
                        <Toaster />
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
