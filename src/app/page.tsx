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
    Twitter, Instagram, Linkedin, Github, Mail, Lock, ArrowRight
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
// UPDATED: Cinematic Images for Supported Countries
// app/page.tsx (Snippet of the updated SUPPORTED array)

/* ---------- data ---------- */
// UPDATED: Fixed broken images for Ghana, Tanzania, Dubai, and Rwanda
// app/page.tsx

/* ---------- data ---------- */
// UPDATED: Fixed Rwanda image link
const SUPPORTED = [
    {
        name: "Ghana",
        image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop",
        itineraries: "120+"
    },
    {
        name: "Kenya",
        image: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?q=80&w=1000&auto=format&fit=crop",
        itineraries: "85+"
    },
    {
        name: "South Africa",
        image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=1000&auto=format&fit=crop",
        itineraries: "200+"
    },
    {
        name: "Tanzania",
        image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop",
        itineraries: "90+"
    },
    {
        name: "Morocco",
        image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1000&auto=format&fit=crop",
        itineraries: "150+"
    },
    {
        name: "Rwanda",
        // Replaced with reliable Tea Plantation/Hillside shot
        image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop",
        itineraries: "40+"
    },
    {
        name: "Thailand",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000&auto=format&fit=crop",
        itineraries: "300+"
    },
    {
        name: "Dubai",
        image: "https://images.unsplash.com/photo-1546412414-8035e1776c9a?q=80&w=1000&auto=format&fit=crop",
        itineraries: "180+"
    },
    {
        name: "Turkey",
        image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1000&auto=format&fit=crop",
        itineraries: "110+"
    },
    {
        name: "France",
        image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=1000&auto=format&fit=crop",
        itineraries: "400+"
    },
    {
        name: "Singapore",
        image: "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=1000&auto=format&fit=crop",
        itineraries: "95+"
    },
    {
        name: "Italy",
        image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1000&auto=format&fit=crop",
        itineraries: "320+"
    },
];

// Sticky Stack Data with Images & Tints
const WHY = [
    {
        icon: Users2,
        title: "Crowdsourced, rewarded info",
        desc: "Local tips and place details are contributed by travellers. Share quality updates and earn rewards.",
        // Indigo Tint
        image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2670&auto=format&fit=crop",
        tintClass: "bg-indigo-900/80",
        iconClass: "text-indigo-300",
    },
    {
        icon: FileText,
        title: "Visa-ready PDFs in seconds",
        desc: "Generate a beautiful offline PDF itinerary for visa applications, hotel check-ins, and offline use.",
        // Rose Tint
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2674&auto=format&fit=crop",
        tintClass: "bg-rose-900/80",
        iconClass: "text-rose-300",
    },
    {
        icon: Wallet,
        title: "Plan within your budget",
        desc: "Real-world prices for attractions and experiences, with per-day estimates so you never overspend.",
        // Amber Tint
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2574&auto=format&fit=crop",
        tintClass: "bg-amber-900/80",
        iconClass: "text-amber-300",
    },
    {
        icon: Share2,
        title: "Edit, remix, and share",
        desc: "Quickly modify plans and share with family and friends. Collaboration without chaos.",
        // Teal Tint
        image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2670&auto=format&fit=crop",
        tintClass: "bg-teal-900/80",
        iconClass: "text-teal-300",
    },
    {
        icon: CalendarPlus,
        title: "1-click calendar export",
        desc: "Send your day-by-day plan to your calendar so times, places, and notes are always with you.",
        // Cyan Tint
        image: "https://images.unsplash.com/photo-1512453979798-5ea9ba6a80f6?q=80&w=2574&auto=format&fit=crop",
        tintClass: "bg-cyan-900/80",
        iconClass: "text-cyan-300",
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
                className="relative flex flex-col h-[450px] md:h-[500px] w-full max-w-4xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl origin-top overflow-hidden"
            >
                {/* Background Image */}
                <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Color Tint Overlay */}
                <div className={`absolute inset-0 ${item.tintClass} backdrop-brightness-75`}/>

                {/* Content Layer */}
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div
                            className={`p-4 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg ring-1 ring-white/20 ${item.iconClass}`}>
                            <item.icon className="h-8 w-8 text-white"/>
                        </div>
                        <span className="text-6xl font-bold text-white/10">
                            0{index + 1}
                        </span>
                    </div>

                    <div className="mt-auto">
                        <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white drop-shadow-sm">
                            {item.title}
                        </h3>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed font-medium">
                            {item.desc}
                        </p>
                    </div>
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

            {/* Supported Countries - CINEMATIC PORTAL */}
            <section className="bg-background border-y border-border py-24">
                <div className="mx-auto w-full max-w-6xl px-6">
                    {/* Section Header */}
                    <motion.div {...fadeUp(0)}
                                className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 text-primary font-medium mb-2">
                                <Globe2 className="h-5 w-5"/>
                                <span>Global Coverage</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold">Destinations ready for you</h2>
                            <p className="mt-4 text-muted-foreground text-lg">
                                Deep local data, pricing, and routing available for these regions.
                            </p>
                        </div>
                        <Button variant="outline" className="hidden md:flex group">
                            View all destinations
                            <Plane className="ml-2 h-4 w-4 transition-transform group-hover:-rotate-45"/>
                        </Button>
                    </motion.div>

                    {/* Cinematic Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {SUPPORTED.map((c, i) => (
                            <motion.div
                                key={c.name}
                                initial={{opacity: 0, scale: 0.9}}
                                whileInView={{opacity: 1, scale: 1}}
                                viewport={{once: true}}
                                transition={{delay: i * 0.05}}
                                whileHover={{y: -5}}
                                className="group relative aspect-[4/5] md:aspect-square overflow-hidden rounded-2xl cursor-pointer border border-border bg-muted"
                            >
                                {/* Background Image */}
                                <img
                                    src={c.image}
                                    alt={c.name}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Gradient Overlay (Visibility Improved) */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"/>

                                {/* Content */}
                                <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                                    <div className="flex justify-end">
                                         <span
                                             className="px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-medium uppercase tracking-wider border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            {c.itineraries} Plans
                                         </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight group-hover:translate-x-1 transition-transform drop-shadow-md">
                                            {c.name}
                                        </h3>
                                        <div
                                            className="h-0.5 w-0 bg-primary mt-2 group-hover:w-12 transition-all duration-300"/>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer Note */}
                    <motion.div {...fadeUp(0.2)}
                                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 p-4 rounded-full border border-border w-fit mx-auto">
                        <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary"/>
                            <strong>Coming soon:</strong> Japan, Uganda, and Malaysia.
                        </span>
                        <span className="hidden sm:inline text-border">|</span>
                        <Link href="/request"
                              className="hover:text-primary underline decoration-primary/30 underline-offset-4 transition-colors">
                            Request a country
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Sticky Stack "Why Itinero" Section */}
            <section ref={stickyContainer} className="relative bg-primary/5 pt-24 pb-24 border-y border-border">
                {/* Section Header */}
                <div className="sticky top-0 z-10 px-6 py-8 mb-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        Why travellers love <span className="text-primary">Itinero</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Scroll to see what makes us different.
                    </p>
                </div>

                {/* Cards Container */}
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

            {/* Guided & Curated Tours */}
            <section className="relative py-24 overflow-hidden bg-background border-y border-border">
                <div
                    className="absolute inset-0 opacity-[0.03] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]">
                    <div
                        className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)]"/>
                </div>

                <div className="mx-auto w-full max-w-6xl px-6 relative z-10">
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
                                        <div className="flex gap-2 opacity-50">
                                            {card.mockData.map(tag => (
                                                <span key={tag}
                                                      className="h-6 px-2 bg-muted rounded text-[10px] flex items-center">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

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

            {/* CTA Section */}
            {/* CTA Section - Bold & High Contrast */}
            <section className="relative overflow-hidden py-24 lg:py-32 bg-primary text-primary-foreground">
                {/* Background Texture - Inverted for contrast on dark bg */}
                <div className="absolute inset-0 -z-10 bg-[url('/grid-pattern.svg')] opacity-10 invert mix-blend-overlay" />

                {/* Decorative Glow - Lighter for contrast */}
                <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[120px] pointer-events-none" />

                <motion.div
                    {...fadeUp(0)}
                    className="relative z-10 mx-auto w-full max-w-4xl px-6 text-center"
                >
                    {/* Floating Icon - Inverted colors */}
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10 text-primary-foreground ring-1 ring-primary-foreground/20 shadow-lg shadow-black/10 backdrop-blur-sm">
                            <Ticket className="h-8 w-8" />
                        </div>
                    </div>

                    {/* Headline - Text color inherited from section, span made brighter white */}
                    <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        Start planning your next <br className="hidden sm:block" />
                        <span className="text-white drop-shadow-sm">adventure today</span>
                    </h2>

                    {/* Subtext - Lighter opacity */}
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/90 md:text-xl">
                        Join thousands of travellers who have stopped stressing over spreadsheets
                        and started enjoying the journey.
                    </p>

                    {/* Buttons - Inverted styles for dark background */}
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        {/* Main button uses reversed colors (white bg, primary text) */}
                        <Button asChild size="lg" className={`h-12 px-8 text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-xl shadow-black/20 transition-all hover:scale-105`}>
                            <Link href="/trip-maker">
                                Start free itinerary <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        {/* Outline button adjusted for dark bg */}
                        <Button asChild variant="outline" size="lg" className={`h-12 px-8 text-base border-primary-foreground/30 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm`}>
                            <Link href="/pricing">View pricing</Link>
                        </Button>
                    </div>

                    {/* Small print - Lighter opacity */}
                    <p className="mt-6 text-sm text-primary-foreground/70">
                        No credit card required • Free 14-day trial on Pro plans
                    </p>
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