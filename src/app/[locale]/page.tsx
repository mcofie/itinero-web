"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TripWizard from "@/components/landing/TripWizard";
import {
    ShieldCheck, FileCheck, Coins, BookOpen, Users2, FileText, Wallet, CalendarPlus, Plane,
    Ticket, Mail, ArrowRight, Twitter, Instagram, Github, Menu, Shirt, PhoneCall, Lightbulb, Sparkles
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import Globe from "@/components/landing/Globe";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { getLandingStatsAction } from "@/app/actions/stats";

/* ---------- Data ---------- */
const SUPPORTED = [
    {
        name: "Ghana",
        countryCode: "GH",
        image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1000&auto=format&fit=crop",
        itineraries: "120+"
    },
    {
        name: "France",
        countryCode: "FR",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop",
        itineraries: "300+"
    },
    {
        name: "Kenya",
        countryCode: "KE",
        image: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?q=80&w=1000&auto=format&fit=crop",
        itineraries: "85+"
    },
    {
        name: "South Africa",
        countryCode: "ZA",
        image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=1000&auto=format&fit=crop",
        itineraries: "200+"
    },
    {
        name: "Tanzania",
        countryCode: "TZ",
        image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1000&auto=format&fit=crop",
        itineraries: "90+"
    },
    {
        name: "Morocco",
        countryCode: "MA",
        image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1000&auto=format&fit=crop",
        itineraries: "150+"
    },
    {
        name: "Rwanda",
        countryCode: "RW",
        image: "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=1000&auto=format&fit=crop",
        itineraries: "40+"
    },
    {
        name: "Thailand",
        countryCode: "TH",
        image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1000&auto=format&fit=crop",
        itineraries: "300+"
    },
    {
        name: "Dubai",
        countryCode: "AE",
        image: "https://images.unsplash.com/photo-1546412414-8035e1776c9a?q=80&w=1000&auto=format&fit=crop",
        itineraries: "180+"
    },
];

function getFlagEmoji(code?: string | null) {
    if (!code || code.length !== 2) return "";
    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    try {
        return String.fromCodePoint(...codePoints);
    } catch {
        return "";
    }
}





/* ---------- Animation Variants ---------- */
const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },

    transition: { duration: 0.5, ease: "easeOut" } as any
};

/* ---------- Page Component ---------- */
export default function LandingPage() {
    const heroRef = useRef(null);
    const tNav = useTranslations("Navigation");
    const tFooter = useTranslations("Footer");
    const tLanding = useTranslations("Landing");

    return (
        <div
            className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-white">

            {/* Header */}
            <header
                className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 dark:bg-slate-950 dark:border-slate-800">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href="/"
                        className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
                        <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                            <Plane className="h-4 w-4" />
                        </span>
                        Itinero
                    </Link>
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1 md:gap-2">
                        <Link href="/pricing"
                            className="hidden sm:inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                            {tNav("pricing")}
                        </Link>
                        <Link href="/login">
                            <Button
                                className="rounded-full bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 dark:bg-blue-500 dark:hover:bg-blue-600">
                                {tNav("getStarted")}
                            </Button>
                        </Link>
                        <div className="ml-2 flex items-center gap-2">
                            <LocaleSwitcher />
                            <ThemeToggle />
                        </div>
                    </nav>

                    {/* Mobile Nav */}
                    <div className="flex md:hidden items-center gap-2">
                        <LocaleSwitcher />
                        <ThemeToggle />
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <div className="flex flex-col gap-6 mt-8">
                                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                                            <Plane className="h-4 w-4" />
                                        </span>
                                        Itinero
                                    </Link>
                                    <div className="flex flex-col gap-4">
                                        <Link href="/pricing" className="text-lg font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
                                            {tNav("pricing")}
                                        </Link>
                                        <Link href="/login">
                                            <Button className="w-full rounded-full bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                                                {tNav("getStarted")}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section - Split Portal Design */}
                <section ref={heroRef} className="relative pt-6 pb-12 lg:pt-10 lg:pb-24 overflow-hidden">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            {/* Left: Content */}
                            <div className="relative z-10">
                                <motion.h1
                                    {...fadeUp}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                    className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 mb-8 leading-[0.95] dark:text-white"
                                >
                                    {tLanding("Hero.title1")} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">{tLanding("Hero.title2")}</span>
                                </motion.h1>

                                <motion.p
                                    {...fadeUp}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-lg dark:text-slate-400"
                                >
                                    {tLanding("Hero.subtitle")}
                                </motion.p>

                                {/* Trip Wizard - Simplified/Integrated */}
                                <motion.div
                                    {...fadeUp}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                    className="relative w-full max-w-xl mx-auto lg:mx-0 mt-8 sm:mt-0"
                                >
                                    <div className="relative rounded-2xl sm:rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                                        <div className="p-0 sm:p-1">
                                            <TripWizard />
                                        </div>
                                    </div>
                                </motion.div>


                            </div>

                            {/* Right: The Portal Visual */}
                            <div className="relative hidden lg:block h-[800px] w-full">
                                <PortalVisual />
                            </div>
                        </div>
                    </div>
                </section>




                {/* New Sticky Scroll Feature Section */}
                <BentoFeatures />

                {/* Global Scale Section */}
                <StatsSection />

                {/* Destinations Grid (Parallax) */}
                <ParallaxDestinations />

                {/* CTA */}
                <section className="py-16 lg:py-20 bg-blue-600 text-white dark:bg-blue-700">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <div
                            className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/20 mb-8 ring-1 ring-white/30">
                            <Ticket className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                            {tLanding("CTA.title1")} <br className="hidden sm:block" />
                            <span className="text-blue-200">{tLanding("CTA.title2")}</span>
                        </h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            {tLanding("CTA.desc")}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button asChild size="lg"
                                className="h-14 px-8 rounded-full bg-white text-blue-600 hover:bg-blue-50 font-bold text-base shadow-xl">
                                <Link href="/trip-maker">{tLanding("CTA.startFree")}</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg"
                                className="h-14 px-8 rounded-full border-blue-400 bg-blue-700/80 text-white hover:bg-blue-800 hover:text-white font-bold text-base">
                                <Link href="/pricing">{tLanding("CTA.viewPricing")}</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer
                    className="bg-white border-t border-slate-200 pt-12 pb-8 dark:bg-slate-950 dark:border-slate-800">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                            <div className="lg:col-span-2">
                                <Link href="/"
                                    className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 mb-4 dark:text-blue-400">
                                    <span
                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                                        <Plane className="h-4 w-4" />
                                    </span>
                                    Itinero
                                </Link>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6 dark:text-slate-400">
                                    {tLanding("Footer.desc")}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-4 dark:text-white">{tLanding("Footer.product")}</h3>
                                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                    <li><Link href="/features" className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">Features</Link></li>
                                    <li><Link href="/pricing" className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">{tNav("pricing")}</Link></li>
                                    <li><Link href="/destinations" className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">Destinations</Link></li>
                                    <li><Link href="/guided-tours" className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">Guided Tours</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-4 dark:text-white">{tLanding("Footer.company")}</h3>
                                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                    <li><Link href="/about-us" className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">About Us</Link></li>
                                    <li><Link href="/blog" className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">Blog</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-4 dark:text-white">{tLanding("Footer.stayUpdated")}</h3>
                                <div className="flex gap-2">
                                    <Input placeholder={tLanding("Footer.emailPlaceholder")}
                                        className="bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800" />
                                    <Button size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500"><Mail
                                            className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>

                        <div
                            className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 dark:border-slate-800">
                            <div
                                className="text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Itinero
                                Inc. {tFooter("rights")}
                            </div>
                            <div className="flex gap-6">
                                <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Twitter
                                    className="h-5 w-5" /></Link>
                                <Link href="#"
                                    className="text-slate-400 hover:text-blue-600 transition-colors"><Instagram
                                        className="h-5 w-5" /></Link>
                                <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Github
                                    className="h-5 w-5" /></Link>
                            </div>
                        </div>
                    </div>
                </footer>

            </main>
        </div>
    );
}

/* ---------- STATS SECTION ---------- */
function StatsSection() {
    const tLanding = useTranslations("Landing");
    const [stats, setStats] = useState({
        countries: 120,
        itineraries: 50000,
        travelers: 1000000,
        rating: 4.9,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLandingStatsAction().then((data) => {
            setStats(data);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch stats:", err);
            setLoading(false);
        });
    }, []);

    const formatNum = (num: number, placeholder: string) => {
        if (loading) return placeholder;
        if (num === 0) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M+";
        if (num >= 1000) return (num / 1000).toFixed(0) + "k+";
        return num + "+";
    };

    return (
        <section className="py-16 lg:py-20 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none" />
            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <motion.h2
                            {...fadeUp}
                            className="text-3xl md:text-5xl font-bold tracking-tight mb-6"
                        >
                            {tLanding("GlobalScale.title1")} <br />
                            <span className="text-blue-400">{tLanding("GlobalScale.title2")}</span>
                        </motion.h2>
                        <motion.p
                            {...fadeUp}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-slate-400 mb-8 leading-relaxed"
                        >
                            {tLanding("GlobalScale.desc")}
                        </motion.p>
                        <div className="grid grid-cols-2 gap-6">
                            <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
                                <div className="text-3xl font-bold text-white mb-1">
                                    {formatNum(stats.countries, "120+")}
                                </div>
                                <div className="text-sm text-slate-500 uppercase tracking-wider">{tLanding("GlobalScale.countries")}</div>
                            </motion.div>
                            <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
                                <div className="text-3xl font-bold text-white mb-1">
                                    {formatNum(stats.itineraries, "50k+")}
                                </div>
                                <div className="text-sm text-slate-500 uppercase tracking-wider">{tLanding("GlobalScale.itineraries")}</div>
                            </motion.div>
                            <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
                                <div className="text-3xl font-bold text-white mb-1">
                                    {formatNum(stats.travelers, "1M+")}
                                </div>
                                <div className="text-sm text-slate-500 uppercase tracking-wider">{tLanding("GlobalScale.travelers")}</div>
                            </motion.div>
                            <motion.div {...fadeUp} transition={{ delay: 0.5 }}>
                                <div className="text-3xl font-bold text-white mb-1">
                                    {loading ? "4.9/5" : stats.rating.toFixed(1) + "/5"}
                                </div>
                                <div className="text-sm text-slate-500 uppercase tracking-wider">{tLanding("GlobalScale.rating")}</div>
                            </motion.div>
                        </div>
                    </div>
                    <div className="h-[500px] w-full flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                        <Globe />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ---------- NEW BENTO GRID COMPONENT ---------- */
function BentoFeatures() {
    const tLanding = useTranslations("Landing");
    const WHY = [
        {
            id: "intelligence",
            icon: ShieldCheck,
            title: tLanding("Features.intelligenceTitle"),
            desc: tLanding("Features.intelligenceDesc"),
            image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2535&auto=format&fit=crop",
            color: "blue"
        },
        {
            id: "export",
            icon: FileCheck,
            title: tLanding("Features.exportTitle"),
            desc: tLanding("Features.exportDesc"),
            image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2670&auto=format&fit=crop",
            color: "emerald"
        },
        {
            id: "budget",
            icon: Coins,
            title: tLanding("Features.budgetTitle"),
            desc: tLanding("Features.budgetDesc"),
            image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=2671&auto=format&fit=crop",
            color: "amber"
        },
        {
            id: "knowledge",
            icon: BookOpen,
            title: tLanding("Features.knowledgeTitle"),
            desc: tLanding("Features.knowledgeDesc"),
            image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop",
            color: "purple"
        },
    ];

    return (
        <section className="bg-slate-50 py-16 lg:py-20 dark:bg-slate-950 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="mb-12 lg:mb-16 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 dark:text-white">
                        {tLanding("Features.title1")} <span className="text-blue-600 dark:text-blue-500">{tLanding("Features.title2")}</span>
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400">
                        {tLanding("Features.subtitle")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[300px]">
                    {WHY.map((item, index) => {
                        const isFeature = index === 0 || index === 3;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    delay: index * 0.1,
                                    duration: 0.8,
                                    ease: [0.16, 1, 0.3, 1]
                                }}
                                className={cn(
                                    "group relative rounded-[2rem] overflow-hidden border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 transition-all duration-700",
                                    isFeature ? "md:col-span-4" : "md:col-span-2",
                                    index === 0 && "md:row-span-1",
                                    index === 3 && "md:row-span-1"
                                )}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                                    />
                                    {/* Gradient Accents (Color-coded) */}
                                    <div className={cn(
                                        "absolute inset-0 opacity-40 transition-opacity duration-700 group-hover:opacity-60",
                                        item.color === "blue" && "bg-gradient-to-tr from-blue-900 via-transparent to-transparent",
                                        item.color === "emerald" && "bg-gradient-to-tr from-emerald-900 via-transparent to-transparent",
                                        item.color === "amber" && "bg-gradient-to-tr from-amber-900 via-transparent to-transparent",
                                        item.color === "purple" && "bg-gradient-to-tr from-purple-900 via-transparent to-transparent"
                                    )} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                </div>

                                {/* Content Layer */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white z-20">
                                    <div className="flex flex-col gap-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center transform -translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500",
                                            item.color === "blue" && "bg-blue-600 text-white",
                                            item.color === "emerald" && "bg-emerald-600 text-white",
                                            item.color === "amber" && "bg-amber-600 text-white",
                                            item.color === "purple" && "bg-purple-600 text-white"
                                        )}>
                                            <item.icon className="h-6 w-6" />
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className={cn(
                                                "font-black tracking-tighter leading-none transform transition-all duration-700",
                                                isFeature ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"
                                            )}>
                                                {item.title}
                                            </h3>
                                            <p className={cn(
                                                "text-slate-200 leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 transform translate-y-4 group-hover:translate-y-0",
                                                isFeature ? "text-lg max-w-md" : "text-sm max-w-xs"
                                            )}>
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Signature Line */}
                                <div className={cn(
                                    "absolute bottom-0 left-0 h-1 transition-all duration-700 w-0 group-hover:w-full",
                                    item.color === "blue" && "bg-blue-500",
                                    item.color === "emerald" && "bg-emerald-500",
                                    item.color === "amber" && "bg-amber-500",
                                    item.color === "purple" && "bg-purple-500"
                                )} />
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}

/* ---------- NEW PARALLAX DESTINATIONS COMPONENT ---------- */
function ParallaxDestinations() {
    const tLanding = useTranslations("Landing");
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);

    // Split destinations into 3 columns
    const col1 = SUPPORTED.filter((_, i) => i % 3 === 0);
    const col2 = SUPPORTED.filter((_, i) => i % 3 === 1);
    const col3 = SUPPORTED.filter((_, i) => i % 3 === 2);

    return (
        <section ref={containerRef} className="py-16 lg:py-20 bg-white border-t border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 dark:text-white">{tLanding("Destinations.title")}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">{tLanding("Destinations.desc")}</p>
                    </div>
                    <Link href={"/destinations"}>
                        <Button variant="outline"
                            className="hidden md:flex gap-2 rounded-full border-slate-200 hover:border-blue-600 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-500">
                            {tLanding("Destinations.viewAll")} <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[800px] overflow-hidden">
                    <Column destinations={col1} y={y1} />
                    <Column destinations={col2} y={y2} className="hidden md:flex" />
                    <Column destinations={col3} y={y3} className="hidden lg:flex" />
                </div>
            </div>
        </section>
    );
}

function Column({ destinations, y, className }: {

    destinations: any[],

    y: any,
    className?: string
}) {
    const tLanding = useTranslations("Landing");
    return (
        <motion.div style={{ y }} className={cn("flex flex-col gap-6", className)}>
            {destinations.map((c) => (
                <div
                    key={c.name}
                    className="group relative aspect-[3/4] overflow-hidden rounded-3xl cursor-pointer shrink-0"
                >
                    <Image src={c.image} alt={c.name} fill
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                        <div className="flex items-center gap-2 mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <span className="text-2xl">{getFlagEmoji(c.countryCode)}</span>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight transform translate-y-2 group-hover:translate-y-0 transition-transform">{c.name}</h3>
                        <p className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 text-blue-300 uppercase tracking-widest mt-1">
                            {c.itineraries} {tLanding("Destinations.itinerariesSuffix")}
                        </p>
                    </div>
                </div>
            ))}
        </motion.div>
    );
}

function PortalVisual() {
    const tLanding = useTranslations("Landing");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % SUPPORTED.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-full w-full">
            {/* The Portal Shape */}
            <div
                className="absolute top-0 right-0 w-[90%] h-[90%] rounded-t-[15rem] rounded-b-[3rem] overflow-hidden shadow-2xl rotate-3 border-[8px] border-white dark:border-slate-800 isolate transform-gpu"
                style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
            >
                <AnimatePresence>
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={SUPPORTED[index].image}
                            alt="Travel"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-black/10" />
                    </motion.div>
                </AnimatePresence>

                {/* Floating Badge */}
                <div className="absolute bottom-10 left-10 bg-white px-6 py-4 rounded-2xl shadow-xl z-10 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{tLanding("Destinations.featured")}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{SUPPORTED[index].name}</p>
                </div>
            </div>

            {/* Decorative Circle */}
            <div className="absolute bottom-20 left-0 w-32 h-32 rounded-full bg-orange-400/20 blur-2xl -z-10" />
            <div className="absolute top-20 right-10 w-40 h-40 rounded-full bg-blue-400/20 blur-2xl -z-10" />
        </div>
    );
}