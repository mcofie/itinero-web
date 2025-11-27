import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/providers/theme-provider";
import {cn} from "@/lib/utils";
import {AppProgressBar} from "@/components/layout/AppProgress";

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
    title: "Itinero",
    description: "Plan smarter trips in minutes.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html
            lang="en"
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
            <AppProgressBar/>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}