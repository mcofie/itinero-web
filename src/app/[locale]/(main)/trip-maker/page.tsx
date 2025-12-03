// src/app/trip-maker/page.tsx
import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { createClientServerRSC } from "@/lib/supabase/server";
import TripWizard from "@/components/landing/TripWizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
    title: "Trip Maker • Itinero",
    description: "Build a smart itinerary from your preferences.",
};

export default async function TripMakerPage() {
    const sb = await createClientServerRSC();
    const {
        data: { user },
    } = await sb.auth.getUser();

    return (
        <div className="relative isolate min-h-[100svh] bg-background">
            {/* Soft gradient background */}

            {/* Hero */}
            <header className="mx-auto w-full max-w-4xl px-4 pt-10 sm:pt-12">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>Trip Maker</span>
                </div>
                <h1 className="mt-2 text-center text-pretty text-2xl font-semibold tracking-tight sm:text-3xl">
                    Build a smart itinerary from your preferences
                </h1>
                <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
                    Answer a few quick questions and we’ll shape your trip day by day.
                </p>
            </header>

            {/* Main — lifted slightly higher */}
            <main className="mx-auto grid min-h-[65svh] w-full max-w-4xl place-items-start px-4 pt-6 sm:pt-10">
                <div className="w-full flex flex-col items-center justify-start">
                    {user ? (
                        <div className="w-full max-w-3xl rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm sm:p-6 md:p-8">
                            <TripWizard />
                        </div>
                    ) : (
                        <div className="w-full max-w-lg">
                            <Card className="rounded-2xl border-border/60 shadow-sm">
                                <CardHeader className="text-center">
                                    <CardTitle className="text-xl">
                                        Sign in to create a trip
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-center text-sm text-muted-foreground">
                                        You’ll be able to generate and save itineraries, then view
                                        them on your Trips page.
                                    </p>
                                    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                                        <Button asChild className="w-full sm:w-auto">
                                            <Link href="/login?redirect=/trip-maker">Sign in</Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="secondary"
                                            className="w-full sm:w-auto"
                                        >
                                            <Link href="/">Back to Home</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer breathing space */}
            <div className="h-10 sm:h-12" />
        </div>
    );
}