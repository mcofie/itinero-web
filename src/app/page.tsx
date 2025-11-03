import Link from "next/link";
import {Button} from "@/components/ui/button";
import TripWizard from "@/components/landing/TripWizard";
import {Plane} from "lucide-react";
import HeroDatePickerClient from "@/components/landing/DatePickerClient";

export const dynamic = "force-dynamic";

export default function LandingPage() {
    return (
        <main className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
            {/* Header */}
            <header
                className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-white">
              <Plane className="h-4 w-4"/>
            </span>
                        Itinero
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Link href="/pricing" className="hidden sm:block">
                            <Button variant="ghost">Pricing</Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="ghost">Log in</Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Sign up</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-blue-50 dark:bg-slate-900 border-y border-blue-100 dark:border-slate-800">
                <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-blue-600 dark:text-white">
                            Plan smarter trips in minutes.
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-slate-700 dark:text-slate-300">
                            Build your entire itinerary — activities, routes, and budget — all in one place.
                        </p>
                    </div>

                    {/* Wizard + date picker */}
                    <div className="mt-8 md:mt-10 space-y-6">
                        <div
                            className="mx-auto p-4 w-full max-w-2xl rounded-2xl ring-4 ring-blue-100 ring-offset-2 ring-offset-blue-50 dark:ring-offset-slate-900">
                            <TripWizard/>
                        </div>

                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            No account needed to preview. Save when you’re happy.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA strip */}
            <section className="bg-white dark:bg-slate-950">
                <div className="mx-auto w-full max-w-6xl px-6 py-10">
                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Link href="/#">Start new itinerary</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="border-slate-300 dark:border-slate-700">
                            <Link href="/pricing">See pricing</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div
                    className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <div>© {new Date().getFullYear()} Itinero</div>
                    <div className="flex gap-4">
                        <Link href="/pricing">Pricing</Link>
                        <Link href="/rewards">Rewards</Link>
                        <Link href="/about">About</Link>
                        <Link href="/terms">Terms</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}