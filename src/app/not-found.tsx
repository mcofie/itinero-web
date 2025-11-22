// app/not-found.tsx
import Link from "next/link";
import {Map, Compass, ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";

export default function NotFoundPage() {
    const year = new Date().getFullYear();

    return (
        <div
            className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background/80 to-background text-foreground">
            {/* Header-ish brand strip */}
            <header className="border-b border-border/60 bg-background/80 backdrop-blur">
                <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/trips"
                        className="group flex items-center gap-2 text-sm font-semibold"
                    >
            <span
                className="grid h-8 w-8 place-items-center rounded-md bg-primary/90 text-primary-foreground shadow-sm group-hover:scale-[1.03] transition">
              <Map className="h-4 w-4"/>
            </span>
                        <span
                            className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-base text-transparent">
              Itinero
            </span>
                    </Link>

                    <span className="hidden text-xs text-muted-foreground sm:inline-flex items-center gap-1">
            <Compass className="h-3.5 w-3.5"/>
            <span>Smart trip planning</span>
          </span>
                </div>
            </header>

            {/* Main content */}
            <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                {/* Soft background glow */}
                <div
                    className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]"/>

                <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
                    <div
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
              404
            </span>
                        <span>Page not found</span>
                    </div>

                    <div
                        className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                        <Compass className="h-8 w-8"/>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Looks like this route doesn’t exist
                    </h1>

                    <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                        The page you’re looking for might have moved, been deleted, or
                        never existed. Let’s get you back to planning your next trip.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Button asChild>
                            <Link href="/trip-maker">
                                <Compass className="mr-2 h-4 w-4"/>
                                Start a new trip
                            </Link>
                        </Button>

                        <Button variant="outline" asChild>
                            <Link href="/trips">
                                <ArrowLeft className="mr-2 h-4 w-4"/>
                                Go to my trips
                            </Link>
                        </Button>

                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => {
                                if (typeof window !== "undefined") window.history.back();
                            }}
                            className="text-xs sm:text-sm"
                        >
                            Or go back to where I was
                        </Button>
                    </div>

                    <p className="mt-6 text-[11px] text-muted-foreground">
                        If you think this is a mistake, you can{" "}
                        <Link
                            href="/about"
                            className="font-medium text-primary underline-offset-2 hover:underline"
                        >
                            learn more about Itinero
                        </Link>{" "}
                        or return to the homepage.
                    </p>
                </div>
            </main>

            {/* Tiny footer */}
            <footer className="border-t border-border/60 bg-background/80">
                <div
                    className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 text-[11px] text-muted-foreground sm:px-6 lg:px-8">
                    <p>
                        © {year}{" "}
                        <span className="font-medium text-foreground">Itinero</span>. All
                        rights reserved.
                    </p>
                    <Link
                        href="/"
                        className="underline-offset-2 hover:text-foreground hover:underline"
                    >
                        Back to home
                    </Link>
                </div>
            </footer>
        </div>
    );
}