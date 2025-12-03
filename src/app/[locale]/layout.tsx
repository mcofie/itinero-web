import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { AppProgressBar } from "@/components/layout/AppProgress";
import "../../../instrumentation-client"; // Initialize client-side instrumentation
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

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
        default: "Itinero - Plan Smarter Trips",
    },
    description: "Plan smarter trips in minutes. Build complete itineraries with activities, routes, and budgets in one place.",
    openGraph: {
        title: "Itinero - Plan Smarter Trips",
        description: "Build complete itineraries with activities, routes, and budgets in one place.",
        url: "https://itinero.app",
        siteName: "Itinero",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Itinero - Plan Smarter Trips",
        description: "Build complete itineraries with activities, routes, and budgets in one place.",
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
                    <NextIntlClientProvider messages={messages}>
                        <AppProgressBar />
                        {children}
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}