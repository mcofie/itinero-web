// src/app/trip-maker/page.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { createClientBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TripWizard from "@/components/landing/TripWizard";
import AuthGateDialog from "@/components/auth/AuthGateDialog";
import { Loader2, Sparkles } from "lucide-react";

export default function TripMakerPage() {
    const sb = createClientBrowser();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [authed, setAuthed] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    // Initial auth check
    useEffect(() => {
        (async () => {
            try {
                const { data } = await sb.auth.getUser();
                setAuthed(!!data.user);
            } finally {
                setLoading(false);
            }
        })();
        // Optional: keep page reactive to auth changes
        const { data: sub } = sb.auth.onAuthStateChange((_evt, sess) => {
            setAuthed(!!sess?.user);
            if (sess?.user) setAuthOpen(false);
        });
        return () => sub?.subscription?.unsubscribe();
    }, [sb]);

    if (loading) {
        return (
            <div className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking session…
                </div>
            </div>
        );
    }

    // If logged in, show the TripWizard directly
    if (authed) {
        return (
            <section className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    Build a smart itinerary from your preferences
                </div>
                <TripWizard />
            </section>
        );
    }

    // Not logged in → gentle gate
    return (
        <section className="mx-auto mt-8 w-full max-w-lg px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Sign in to create a trip</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>You’ll be able to generate and save itineraries, then view them on your Trips page.</p>
                    <div className="flex gap-2">
                        <Button onClick={() => setAuthOpen(true)}>Sign in</Button>
                        <Button variant="secondary" onClick={() => router.push("/")}>
                            Back to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Auth modal */}
            <AuthGateDialog
                open={authOpen}
                onOpenChange={setAuthOpen}
                title="Sign in to build your trip"
                postLogin={() => {
                    // After successful login, stay here and render the wizard.
                    // If you prefer to jump to preview after generation, leave as-is.
                }}
            />
        </section>
    );
}