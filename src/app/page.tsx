// src/app/page.tsx
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import TripWizard from "@/components/landing/TripWizard";

export const dynamic = "force-dynamic";

export default function LandingPage() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
                <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="font-semibold text-lg">Itinero</Link>
                    <div className="flex gap-3">
                        <Link href="/login"><Button variant="ghost">Log in</Button></Link>
                        <Link href="/signup"><Button>Sign up</Button></Link>
                    </div>
                </div>
            </header>

            {/* Hero + Wizard */}
            <section className="mx-auto w-full max-w-6xl px-6 py-12 md:py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                        Plan smarter trips in minutes — then share, tweak, and go.
                    </h1>
                    <p className="mt-4 text-muted-foreground text-lg">
                        Itinero turns travel ideas into a day-by-day plan with suggested
                        activities, lodging, transport, and a budget — personalized to your vibe.
                    </p>

                    {/* Pricing note */}
                    <div className="mt-6 inline-flex items-center gap-3 rounded-lg border bg-card px-4 py-2 text-sm">
                        <span className="font-medium">Simple pricing:</span>
                        <span className="text-muted-foreground">
              Pay per trip (about the cost of a coffee) — or $5–$10/mo for frequent travelers.
            </span>
                    </div>
                </div>

                {/* Wizard */}
                <div className="mt-10">
                    <div className="mx-auto max-w-2xl rounded-xl border bg-card p-4 md:p-6">
                        <TripWizard/>
                    </div>
                </div>
            </section>

            <Separator className="my-8"/>

            {/* Features */}
            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-lg border p-5">
                        <h3 className="font-medium text-lg">Personalized picks</h3>
                        <p className="text-muted-foreground mt-2">
                            Activities, food, and stays that match your budget, time, and travel vibe.
                        </p>
                    </div>
                    <div className="rounded-lg border p-5">
                        <h3 className="font-medium text-lg">Plan to share</h3>
                        <p className="text-muted-foreground mt-2">
                            One link for friends/family. Collaborate or keep it view-only.
                        </p>
                    </div>
                    <div className="rounded-lg border p-5">
                        <h3 className="font-medium text-lg">Flexible pricing</h3>
                        <p className="text-muted-foreground mt-2">
                            No subscription required. Pay per trip — or choose a monthly plan.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t">
                <div
                    className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-muted-foreground flex items-center justify-between">
                    <div>© {new Date().getFullYear()} Itinero</div>
                    <div className="flex gap-4">
                        <Link href="/pricing">Pricing</Link>
                        <Link href="/about">About</Link>
                        <Link href="/terms">Terms</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}