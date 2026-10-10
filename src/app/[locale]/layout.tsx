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
    title: {
        template: "%s | Itinero",
        default: "Itinero — Turn Your Trip Photos Into a Book",
    },
    description: "Turn the photos from your favorite trips into beautiful printed photo books. Choose your photos, make it yours, and keep the memories close.",
    openGraph: {
        title: "Itinero — Turn Your Trip Photos Into a Book",
        description: "Turn your favorite travel photos into a beautiful printed photo book.",
        url: "https://itinero.app",
        siteName: "Itinero",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Itinero — Turn Your Trip Photos Into a Book",
        description: "Turn your favorite travel photos into a beautiful printed photo book.",
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
