// app/page.tsx
"use client";

import Link from "next/link";
import {motion, MotionProps, Transition, useScroll, useTransform, MotionValue} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import TripWizard from "@/components/landing/TripWizard";
import {
    Users2, FileText, Wallet, Share2, CalendarPlus, Plane, Sparkles,
    Globe2, Compass, MapPin, Clock, Luggage, Ticket, Camera,
    Twitter, Instagram, Linkedin, Github, Mail, Lock
} from "lucide-react";
import {ThemeToggle} from "@/components/ThemeToggle";
import {useRef} from "react";

export const dynamic = "force-dynamic";

/* ---------- motion helpers ---------- */
const easeOutCurve: NonNullable<Transition["ease"]> = [0.16, 1, 0.3, 1];

const fadeUp = (delay = 0): MotionProps => ({
    initial: {opacity: 0, y: 24},
    whileInView: {opacity: 1, y: 0},
    viewport: {once: true, amount: 0.3},
    transition: {duration: 0.6, ease: easeOutCurve, delay},
});

const staggerParent = {
    initial: {opacity: 0},
    whileInView: {opacity: 1},
    viewport: {once: true, amount: 0.25},
    transition: {staggerChildren: 0.08}
};
const staggerChild = {initial: {opacity: 0, y: 16}, whileInView: {opacity: 1, y: 0}, transition: {duration: .5}};

/* ---------- data ---------- */
const SUPPORTED = [
    {flag: "🇬🇭", name: "Ghana"},
    {flag: "🇰🇪", name: "Kenya"},
    {flag: "🇿🇦", name: "South Africa"},
    {flag: "🇹🇿", name: "Tanzania"},
    {flag: "🇲🇦", name: "Morocco"},
    {flag: "🇷🇼", name: "Rwanda"},
    {flag: "🇹🇭", name: "Thailand"},
    {flag: "🇦🇪", name: "Dubai"},
    {flag: "🇹🇷", name: "Turkey"},
    {flag: "🇫🇷", name: "France"},
    {flag: "🇸🇬", name: "Singapore"},
    {flag: "🇮🇹", name: "Italy"},
];

// Sticky Stack Data (Opaque Colors)
const WHY = [
    {
        icon: Users2,
        title: "Crowdsourced, rewarded info",
        desc: "Local tips and place details are contributed by travellers. Share quality updates and earn rewards.",
        bgClass: "bg-indigo-50 dark:bg-slate-900",
        borderClass: "border-indigo-200 dark:border-indigo-800",
        textClass: "text-indigo-900 dark:text-indigo-300",
        iconClass: "text-indigo-600",
    },
    {
        icon: FileText,
        title: "Visa-ready PDFs in seconds",
        desc: "Generate a beautiful offline PDF itinerary for visa applications, hotel check-ins, and offline use.",
        bgClass: "bg-rose-50 dark:bg-slate-900",
        borderClass: "border-rose-200 dark:border-rose-800",
        textClass: "text-rose-900 dark:text-rose-300",
        iconClass: "text-rose-600",
    },
    {
        icon: Wallet,
        title: "Plan within your budget",
        desc: "Real-world prices for attractions and experiences, with per-day estimates so you never overspend.",
        bgClass: "bg-amber-50 dark:bg-slate-900",
        borderClass: "border-amber-200 dark:border-amber-800",
        textClass: "text-amber-900 dark:text-amber-300",
        iconClass: "text-amber-600",
    },
    {
        icon: Share2,
        title: "Edit, remix, and share",
        desc: "Quickly modify plans and share with family and friends. Collaboration without chaos.",
        bgClass: "bg-teal-50 dark:bg-slate-900",
        borderClass: "border-teal-200 dark:border-teal-800",
        textClass: "text-teal-900 dark:text-teal-300",
        iconClass: "text-teal-600",
    },
    {
        icon: CalendarPlus,
        title: "1-click calendar export",
        desc: "Send your day-by-day plan to your calendar so times, places, and notes are always with you.",
        bgClass: "bg-cyan-50 dark:bg-slate-900",
        borderClass: "border-cyan-200 dark:border-cyan-800",
        textClass: "text-cyan-900 dark:text-cyan-300",
        iconClass: "text-cyan-600",
    },
];

const FOOTER_LINKS = {
    product: [
        {label: "Features", href: "/features"},
        {label: "Pricing", href: "/pricing"},
        {label: "Trip Wizard", href: "/trip-maker"},
        {label: "Destinations", href: "/destinations"},
    ],
    company: [
        {label: "About Us", href: "/about"},
        {label: "Careers", href: "/careers"},
        {label: "Blog", href: "/blog"},
        {label: "Contact", href: "/contact"},
    ],
    legal: [
        {label: "Privacy Policy", href: "/privacy"},
        {label: "Terms of Service", href: "/terms"},
        {label: "Cookie Policy", href: "/cookies"},
    ]
};

/* ---------- Sticky Card Component ---------- */
const StickyCard = ({
                        item,
                        index,
                        progress,
                        range,
                        targetScale
                    }: {
    item: typeof WHY[0];
    index: number;
    progress: MotionValue<number>;
    range: number[];
    targetScale: number;
}) => {
    const container = useRef(null);
    const {scrollYProgress} = useScroll({
        target: container,
        offset: ['start end', 'start start']
    });

    const scale = useTransform(progress, range, [1, targetScale]);

    return (
        <div ref={container} className="h-screen flex items-center justify-center sticky top-0 py-10">
            <motion.div
                style={{
                    scale,
                    top: `calc(10vh + ${index * 25}px)`
                }}
                className={`relative flex flex-col h-[450px] md:h-[500px] w-full max-w-4xl rounded-3xl border p-8 md:p-12 shadow-xl origin-top
                ${item.bgClass} ${item.borderClass}`}
            >
                <div className="flex items-center justify-between mb-8">
                    <div
                        className={`p-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm ring-1 ring-black/5 ${item.iconClass}`}>
                        <item.icon className="h-8 w-8"/>
                    </div>
                    <span className={`text-6xl font-bold opacity-20 ${item.textClass}`}>
                        0{index + 1}
                    </span>
                </div>
                <div className="mt-auto">
                    <h3 className={`text-3xl md:text-4xl font-bold mb-4 tracking-tight ${item.textClass}`}>
                        {item.title}
                    </h3>
                    <p className="text-lg md:text-xl text-muted-foreground dark:text-gray-400 max-w-2xl leading-relaxed">
                        {item.desc}
                    </p>
                </div>
            </motion.div>
        </div>
    )
};

/* ---------- page ---------- */
export default function LandingPage() {
    const primaryBtn = "bg-primary hover:bg-primary/90 text-primary-foreground";
    const outlineBtn = "border-border";

    // Hero Refs
    const heroRef = useRef<HTMLElement>(null);
    const {scrollYProgress: heroProgress} = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(heroProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(heroProgress, [0, 0.8], [1, 0]);

    // Sticky Section Refs
    const stickyContainer = useRef(null);
    const {scrollYProgress: stickyProgress} = useScroll({
        target: stickyContainer,
        offset: ['start start', 'end end']
    });

    // Define travel tokens for the background
    const travelTokens = [
        {Icon: Plane, top: "10%", left: "5%", delay: 0},
        {Icon: MapPin, top: "25%", right: "10%", delay: 1},
        {Icon: Compass, bottom: "20%", left: "15%", delay: 2},
        {Icon: Luggage, top: "60%", right: "5%", delay: 0.5},
        {Icon: Ticket, bottom: "10%", left: "40%", delay: 1.5},
        {Icon: Camera, top: "15%", right: "35%", delay: 2.5},
        {Icon: Globe2, bottom: "40%", right: "25%", delay: 1},
    ];

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur-md">
                <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Plane className="h-4 w-4"/>
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
                        <ThemeToggle/>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section
                ref={heroRef}
                className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-primary/5 border-y border-border/60"
            >
                <motion.div
                    style={{y, opacity}}
                    className="pointer-events-none absolute inset-0 z-0"
                >
                    {travelTokens.map(({Icon, top, left, right, bottom, delay}, index) => (
                        <motion.div
                            key={index}
                            className="absolute text-primary/20"
                            style={{top, left, right, bottom}}
                            initial={{opacity: 0, scale: 0.5, y: 20}}
                            animate={{
                                opacity: [0.4, 0.7, 0.4],
                                scale: [1, 1.1, 1],
                                y: [0, -15, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 5 + delay,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: delay
                            }}
                        >
                            <Icon className="h-12 w-12 md:h-16 md:w-16"/>
                        </motion.div>
                    ))}
                    <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl"/>
                    <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl"/>
                </motion.div>

                <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 md:py-24 text-center">
                    <motion.div {...fadeUp(0)}>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
                            <span className="text-primary">Plan smarter trips</span> in minutes
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                            Build your entire itinerary — activities, routes, and budget — all in one place.
                        </p>
                    </motion.div>

                    <motion.div {...fadeUp(.15)} className="mt-8 md:mt-10 space-y-6">
                        <div className="relative mx-auto w-full max-w-2xl">
                            <motion.div
                                aria-hidden
                                initial={{opacity: 0}} animate={{opacity: 1}}
                                className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 blur"
                            />
                            <div
                                className="relative rounded-2xl border border-border bg-card/80 p-4 ring-4 ring-primary/15 ring-offset-2 ring-offset-background"
                            >
                                <TripWizard/>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            No account needed to preview. Save when you’re happy.
                        </p>
                    </motion.div>

                    <motion.div
                        {...fadeUp(.25)}
                        className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
                    >
                        <span className="inline-flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary"/> AI-assisted planning
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary"/> Live map routes
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary"/> PDF export in seconds
                        </span>
                    </motion.div>
                </div>
            </section>

            {/* Supported Countries */}
            <section className="bg-background border-y border-border">
                <div className="mx-auto w-full max-w-6xl px-6 py-14 text-center">
                    <motion.div {...fadeUp(0)} className="flex flex-col items-center gap-3">
                        <Globe2 className="h-8 w-8 text-primary"/>
                        <h2 className="text-2xl md:text-3xl font-bold">Currently Supported Countries</h2>
                        <p className="text-muted-foreground max-w-xl">
                            We’re growing fast! You can plan and explore trips in these destinations today:
                        </p>
                    </motion.div>

                    <motion.div
                        variants={staggerParent}
                        initial="initial"
                        whileInView="whileInView"
                        viewport={{once: true, amount: 0.2}}
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
                                    <span
                                        className="text-sm font-medium text-muted-foreground mt-2 group-hover:text-primary transition-colors">
                                        {c.name}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.p {...fadeUp(0.1)} className="mt-10 text-sm text-muted-foreground">
                        🌍 More destinations coming soon — including <strong>Japan</strong>, <strong>Uganda</strong>,
                        and <strong>Malaysia</strong>.
                    </motion.p>
                </div>
            </section>

            {/* Sticky Stack "Why Itinero" Section */}
            <section ref={stickyContainer} className="relative bg-primary/5 pt-24 pb-24 border-y border-border">
                <div className="sticky top-0 z-10 px-6 py-8 mb-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        Why travellers love <span className="text-primary">Itinero</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Scroll to see what makes us different.
                    </p>
                </div>

                <div className="mx-auto max-w-6xl px-6">
                    {WHY.map((item, i) => {
                        const targetScale = 1 - ((WHY.length - i) * 0.05);
                        return (
                            <StickyCard
                                key={i}
                                index={i}
                                item={item}
                                progress={stickyProgress}
                                range={[i * 0.25, 1]}
                                targetScale={targetScale}
                            />
                        );
                    })}
                </div>
            </section>

            {/* Guided & Curated Tours (Blurred Reveal, No Email, Q1 2026) */}
            <section className="relative py-24 overflow-hidden bg-background border-y border-border">
                {/* Decorative Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]">
                    <div
                        className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)]"/>
                </div>

                <div className="mx-auto w-full max-w-6xl px-6 relative z-10">
                    {/* Centered Header */}
                    <motion.div {...fadeUp(0)} className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 text-primary font-semibold mb-3">
                            <Sparkles className="h-4 w-4"/>
                            <span>Coming 1st Quarter 2026</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Unlock the full experience
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            We are currently vetting the best local guides and curators to bring you exclusive, verified
                            experiences.
                        </p>
                    </motion.div>

                    {/* Blurred Cards Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                title: "Hire a Local Expert",
                                subtitle: "Live Guided Tours",
                                icon: Users2,
                                mockData: ["Verified Guides", "Hourly Rates", "Instant Chat"],
                                color: "bg-blue-500"
                            },
                            {
                                title: "Curated Itineraries",
                                subtitle: "Pre-planned Trips",
                                icon: Compass,
                                mockData: ["Hidden Gems", "Food Trails", "Multi-day Plans"],
                                color: "bg-purple-500"
                            }
                        ].map((card, i) => (
                            <motion.div
                                key={card.title}
                                initial={{opacity: 0, y: 20}}
                                whileInView={{opacity: 1, y: 0}}
                                viewport={{once: true}}
                                transition={{delay: i * 0.2}}
                                className="group relative h-64 overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                            >
                                {/* Card Content (The "Tease") */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div
                                            className={`h-12 w-12 rounded-2xl ${card.color} bg-opacity-10 flex items-center justify-center text-foreground`}>
                                            <card.icon className="h-6 w-6"/>
                                        </div>
                                        <div
                                            className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                            <Lock className="h-3 w-3"/> Locked
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-2xl font-bold">{card.title}</h3>
                                            <p className="text-muted-foreground">{card.subtitle}</p>
                                        </div>
                                        {/* Mock UI Elements that get blurred */}
                                        <div className="flex gap-2 opacity-50">
                                            {card.mockData.map(tag => (
                                                <span key={tag}
                                                      className="h-6 px-2 bg-muted rounded text-[10px] flex items-center">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* The Blur Overlay */}
                                <div
                                    className="absolute inset-0 bg-background/10 backdrop-blur-[6px] flex items-center justify-center opacity-100 transition-all duration-500 group-hover:backdrop-blur-[3px]">
                                    <div
                                        className="bg-background/80 backdrop-blur-md border border-border px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transform group-hover:scale-105 transition-transform">
                                        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"/>
                                        <span className="text-sm font-semibold">In Development</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
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
            <footer className="border-t border-border bg-background pt-16 pb-8">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
                        {/* Brand Column */}
                        <div className="lg:col-span-2">
                            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight mb-4">
                                <span
                                    className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
                                    <Plane className="h-4 w-4"/>
                                </span>
                                Itinero
                            </Link>
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
                                The all-in-one workspace for modern travellers. Plan, budget, and explore the world with
                                confidence.
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i}
                                             className="h-8 w-8 rounded-full border-2 border-background bg-muted/50"/>
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">
                                    Trusted by 10k+ travellers
                                </span>
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div>
                            <h3 className="font-semibold mb-4 text-sm">Product</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {FOOTER_LINKS.product.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="hover:text-primary transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4 text-sm">Company</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {FOOTER_LINKS.company.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="hover:text-primary transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4 text-sm">Stay Updated</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Travel tips and new features, straight to your inbox.
                            </p>
                            <div className="flex gap-2">
                                <Input placeholder="Email" className="h-9 bg-background"/>
                                <Button size="sm" className="h-9 px-3">
                                    <Mail className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div
                        className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Itinero Inc. All rights reserved.
                        </div>

                        <div className="flex items-center gap-6">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5"/>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5"/>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5"/>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="h-5 w-5"/>
                            </Link>
                        </div>

                        <div className="flex gap-6 text-sm text-muted-foreground">
                            {FOOTER_LINKS.legal.map((link) => (
                                <Link key={link.label} href={link.href}
                                      className="hover:text-foreground transition-colors">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}