// app/page.tsx
"use client";

import Link from "next/link";
import {motion, MotionProps, Transition} from "framer-motion";
import { Button } from "@/components/ui/button";
import TripWizard from "@/components/landing/TripWizard";
import {
    Users2, FileText, Wallet, Share2, CalendarPlus, Plane, Sparkles,
    Globe2, Compass, MapPin, Clock
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

/* ---------- motion helpers ---------- */
// A nice "easeOut" curve
const easeOutCurve: NonNullable<Transition["ease"]> = [0.16, 1, 0.3, 1];

const fadeUp = (delay = 0): MotionProps => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.6, ease: easeOutCurve, delay },
});

const staggerParent = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, amount: 0.25 },
    transition: { staggerChildren: 0.08 }
};
const staggerChild = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: .5 } };

/* ---------- data ---------- */
const SUPPORTED = [
    { flag: "🇬🇭", name: "Ghana" },
    { flag: "🇰🇪", name: "Kenya" },
    { flag: "🇿🇦", name: "South Africa" },
    { flag: "🇹🇿", name: "Tanzania" },
    { flag: "🇲🇦", name: "Morocco" },
    { flag: "🇷🇼", name: "Rwanda" },
    { flag: "🇹🇭", name: "Thailand" },
    { flag: "🇦🇪", name: "Dubai" },
    { flag: "🇹🇷", name: "Istanbul" },
    { flag: "🇫🇷", name: "France" },
    { flag: "🇸🇬", name: "Singapore" },
    { flag: "🇮🇹", name: "Italy" },
];

const WHY = [
    {
        icon: Users2,
        title: "Crowdsourced, rewarded info",
        desc: "Local tips and place details are contributed by travellers. Share quality updates and earn rewards."
    },
    {
        icon: FileText,
        title: "Visa-ready PDFs in seconds",
        desc: "Generate a beautiful offline PDF itinerary for visa applications, hotel check-ins, and offline use."
    },
    {
        icon: Wallet,
        title: "Plan within your budget",
        desc: "Real-world prices for attractions and experiences, with per-day estimates so you never overspend."
    },
    {
        icon: Share2,
        title: "Edit, remix, and share",
        desc: "Quickly modify plans and share with family and friends. Collaboration without chaos."
    },
    {
        icon: CalendarPlus,
        title: "1-click calendar export",
        desc: "Send your day-by-day plan to your calendar so times, places, and notes are always with you."
    },
];

/* ---------- page ---------- */
export default function LandingPage() {
    const primaryBtn = "bg-primary hover:bg-primary/90 text-primary-foreground";
    const outlineBtn = "border-border";

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur-md">
                <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Plane className="h-4 w-4" />
            </span>
                        Itinero
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Link href="/pricing" className="hidden sm:block">
                            <Button variant="ghost">Pricing</Button>
                        </Link>
                        <Link href="/login"><Button variant="ghost">Log in</Button></Link>
                        <Link href="/signup">
                            <Button className={primaryBtn}>Sign up</Button>
                        </Link>
                        <ThemeToggle />
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section
                className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-primary/5 border-y border-border/60"
            >
                {/* floating sparkles */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: .6, duration: .8 }}
                    className="pointer-events-none absolute inset-0"
                >
                    <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                </motion.div>

                <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24 text-center">
                    <motion.div {...fadeUp(0)}>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                            <span className="text-primary">Plan smarter trips</span> in minutes
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                            Build your entire itinerary — activities, routes, and budget — all in one place.
                        </p>
                    </motion.div>

                    {/* Wizard */}
                    <motion.div {...fadeUp(.15)} className="mt-8 md:mt-10 space-y-6">
                        <div className="relative mx-auto w-full max-w-2xl">
                            {/* shimmer frame */}
                            <motion.div
                                aria-hidden
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 blur"
                            />
                            <div
                                className="relative rounded-2xl border border-border bg-card/80 p-4 ring-4 ring-primary/15 ring-offset-2 ring-offset-background"
                            >
                                <TripWizard />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            No account needed to preview. Save when you’re happy.
                        </p>
                    </motion.div>

                    {/* mini hero perks */}
                    <motion.div
                        {...fadeUp(.25)}
                        className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
                    >
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI-assisted planning
            </span>
                        <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Live map routes
            </span>
                        <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> PDF export in seconds
            </span>
                    </motion.div>
                </div>
            </section>

            {/* Supported Countries */}
            <section className="bg-background border-y border-border">
                <div className="mx-auto w-full max-w-6xl px-6 py-14 text-center">
                    <motion.div {...fadeUp(0)} className="flex flex-col items-center gap-3">
                        <Globe2 className="h-8 w-8 text-primary" />
                        <h2 className="text-2xl md:text-3xl font-bold">Currently Supported Countries</h2>
                        <p className="text-muted-foreground max-w-xl">
                            We’re growing fast! You can plan and explore trips in these destinations today:
                        </p>
                    </motion.div>

                    {/* Countries Grid */}
                    <motion.div
                        variants={staggerParent}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{ once: true, amount: 0.2 }}
                        className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 place-items-center"
                    >
                        {SUPPORTED.map((c) => (
                            <motion.div key={c.name} variants={staggerChild}>
                                <div className="group flex flex-col items-center justify-center space-y-2">
                                    <div
                                        className="flex items-center justify-center h-20 w-20 rounded-full border border-border bg-card text-4xl shadow-sm
                               transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-md group-hover:border-primary"
                                    >
                                        {c.flag}
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground mt-2 group-hover:text-primary transition-colors">
                    {c.name}
                  </span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.p {...fadeUp(0.1)} className="mt-10 text-sm text-muted-foreground">
                        🌍 More destinations coming soon — including <strong>Japan</strong>, <strong>Uganda</strong>, and <strong>Malaysia</strong>.
                    </motion.p>
                </div>
            </section>

            {/* Why Itinero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-primary/5 border-y border-border/60">
                <div className="mx-auto w-full max-w-6xl px-6 py-20 text-center relative z-10">
                    <motion.div {...fadeUp(0)} className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                            Why travellers love <span className="text-primary">Itinero</span>
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Every feature is designed to make planning, sharing, and experiencing your journey
                            effortless and fun.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerParent}
                        initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.25 }}
                        className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                    >
                        {WHY.map(({ icon: Icon, title, desc }) => (
                            <motion.div key={title} variants={staggerChild}>
                                <div
                                    className="flex h-full flex-col items-center text-center rounded-2xl border border-border bg-card p-6 shadow-sm
                             hover:shadow-md hover:border-primary/40 transition-all"
                                >
                                    <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* soft flourish */}
                <div className="pointer-events-none absolute top-0 left-0 w-full h-full
                        bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_70%)]" />
            </section>

            {/* Guided & Curated Tours (coming soon) */}
            <section className="bg-background border-y border-border">
                <div className="mx-auto w-full max-w-6xl px-6 py-16 text-center">
                    <motion.div {...fadeUp(0)} className="max-w-3xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Guided & Curated Tours <span className="text-primary">coming soon</span>
                        </h2>
                        <p className="mt-3 text-muted-foreground text-lg">
                            Explore with verified guides or follow handcrafted itineraries designed by trusted creators.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerParent}
                        initial="initial" whileInView="whileInView" viewport={{ once: true, amount: 0.25 }}
                        className="mt-10 grid sm:grid-cols-2 gap-6"
                    >
                        {[
                            {
                                icon: Users2, title: "Guided Tours by Local Experts",
                                desc: "Connect with verified local guides for hidden gems, culture, and authentic experiences.",
                                tag: "Coming soon"
                            },
                            {
                                icon: Compass, title: "Curated Multi-Day Tours",
                                desc: "Follow themed, ready-to-go plans — food trails, city samplers, and adventure escapes.",
                                tag: "Coming soon"
                            }
                        ].map((t) => (
                            <motion.div key={t.title} variants={staggerChild}>
                                <div className="rounded-xl border border-border bg-muted/40 p-6 text-left sm:text-center shadow-sm hover:shadow-md transition">
                                    <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                                        <t.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-semibold">{t.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
                                    <div className="mt-3 inline-flex items-center rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-medium">
                                        {t.tag}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-primary/5 border-t border-border">
                <motion.div {...fadeUp(0)} className="mx-auto w-full max-w-6xl px-6 py-14 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold">Start planning your next trip today</h2>
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className={primaryBtn}>
                            <Link href="/trip-maker">Start new itinerary</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className={`border ${outlineBtn}`}>
                            <Link href="/pricing">See pricing</Link>
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t border-border bg-background">
                <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>© {new Date().getFullYear()} Itinero — Plan better. Travel smarter.</div>
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