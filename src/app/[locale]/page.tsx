"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TripWizard from "@/components/landing/TripWizard";
import {
    ShieldCheck, FileCheck, Coins, BookOpen, Users2, FileText, Wallet, CalendarPlus, Plane,
    Ticket, Mail, ArrowRight, Twitter, Instagram, Github, Menu, Shirt, PhoneCall, Lightbulb, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import Globe from "@/components/landing/Globe";
import { Navbar } from "@/components/layout/Navbar";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";

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
    transition: { duration: 0.5 }
};

/* ---------- Page Component ---------- */
export default function LandingPage() {
    const heroRef = useRef(null);
    const tNav = useTranslations("Navigation");
    const tFooter = useTranslations("Footer");
    const tLanding = useTranslations("Landing");

    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const sb = getSupabaseBrowser();
        const fetchUser = async () => {
            try {
                const { data: { user: u } } = await sb.auth.getUser();
                if (u) {
                    setUser(u);
                    const { data: prof } = await sb
                        .schema("itinero")
                        .from("profiles")
                        .select("full_name, avatar_url")
                        .eq("id", u.id)
                        .maybeSingle();
                    setProfile(prof);
                }
            } catch (err) {
                console.error("Auth fetch error:", err);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        const sb = getSupabaseBrowser();
        await sb.auth.signOut();
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-white">
            <Navbar
                userEmail={user?.email}
                avatarUrl={profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                fullName={profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name}
                onLogout={handleLogout}
            />

            <main>
                {/* Hero Section */}
                <section ref={heroRef} className="relative pt-6 pb-12 lg:pt-10 lg:pb-24 overflow-hidden">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
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

                            <div className="relative hidden lg:block h-[800px] w-full">
                                <PortalVisual />
                            </div>
                        </div>
                    </div>
                </section>

                <BentoFeatures />
                <StatsSection />
                <ParallaxDestinations />

                {/* CTA */}
                <section className="py-24 lg:py-32 bg-blue-600 text-white dark:bg-blue-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
                    <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
                        <motion.div
                            {...fadeUp}
                            className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/10 backdrop-blur-md mb-8 ring-1 ring-white/20 shadow-2xl"
                        >
                            <Sparkles className="h-10 w-10 text-blue-200" />
                        </motion.div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
                            {tLanding("CTA.title1")} <br className="hidden sm:block" />
                            <span className="text-blue-200 opacity-90">{tLanding("CTA.title2")}</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-blue-100/80 mb-12 max-w-2xl mx-auto font-medium">
                            {tLanding("CTA.desc")}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Button asChild size="lg" className="h-16 px-10 rounded-full bg-white text-blue-600 hover:bg-white/90 font-bold text-lg shadow-2xl shadow-blue-900/40 transition-all hover:scale-105 active:scale-95">
                                <Link href="/trip-maker">{tLanding("CTA.startFree")}</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-full border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 font-bold text-lg transition-all hover:border-white/50">
                                <Link href="/pricing">{tLanding("CTA.viewPricing")}</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t border-slate-200 pt-20 pb-12 dark:bg-slate-950 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
                            <div className="lg:col-span-4">
                                <Link href="/" className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900 mb-6 dark:text-white">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                                        <Plane className="h-5 w-5" />
                                    </span>
                                    Itinero
                                </Link>
                                <p className="text-slate-500 text-base leading-relaxed max-w-xs mb-8 dark:text-slate-400">
                                    {tLanding("Footer.desc")}
                                </p>
                                <div className="flex gap-4">
                                    <SocialLink href="#" icon={Twitter} />
                                    <SocialLink href="#" icon={Instagram} />
                                    <SocialLink href="#" icon={Github} />
                                </div>
                            </div>

                            <div className="lg:col-span-2 lg:col-start-6">
                                <FooterHeading>{tLanding("Footer.product")}</FooterHeading>
                                <ul className="space-y-4">
                                    <FooterLink href="/features">Features</FooterLink>
                                    <FooterLink href="/pricing">{tNav("pricing")}</FooterLink>
                                    <FooterLink href="/destinations">Destinations</FooterLink>
                                </ul>
                            </div>

                            <div className="lg:col-span-2">
                                <FooterHeading>{tLanding("Footer.company")}</FooterHeading>
                                <ul className="space-y-4">
                                    <FooterLink href="/about-us">About Us</FooterLink>
                                    <FooterLink href="/blog">Blog</FooterLink>
                                </ul>
                            </div>

                            <div className="lg:col-span-4">
                                <FooterHeading>{tLanding("Footer.stayUpdated")}</FooterHeading>
                                <p className="text-sm text-slate-500 mb-6 dark:text-slate-400">Join our newsletter for travel tips and updates.</p>
                                <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                                    <Input placeholder={tLanding("Footer.emailPlaceholder")} className="bg-transparent border-none focus-visible:ring-0 placeholder:text-slate-400 text-sm h-11" />
                                    <Button size="icon" className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-lg shadow-blue-600/20">
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 dark:border-slate-800">
                            <div className="text-sm font-medium text-slate-400 dark:text-slate-500">
                                © {new Date().getFullYear()} Itinero Inc. {tFooter("rights")}
                            </div>
                            <div className="flex gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
                                <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}

function StatsSection() {
    const tLanding = useTranslations("Landing");
    const stats = { countries: 120, itineraries: 50000, travelers: 1000000, rating: 4.9 };

    const formatNum = (num: number) => {
        if (num === 0) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M+";
        if (num >= 1000) return (num / 1000).toFixed(0) + "k+";
        return num + "+";
    };

    return (
        <section className="py-24 lg:py-32 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900 to-slate-900 pointer-events-none" />
            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <motion.h2 {...fadeUp} className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-tight">
                            {tLanding("GlobalScale.title1")} <br />
                            <span className="text-blue-400">{tLanding("GlobalScale.title2")}</span>
                        </motion.h2>
                        <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="text-xl text-slate-400 mb-12 leading-relaxed font-medium">
                            {tLanding("GlobalScale.desc")}
                        </motion.p>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                            <StatItem value={formatNum(stats.countries)} label={tLanding("GlobalScale.countries")} />
                            <StatItem value={formatNum(stats.itineraries)} label={tLanding("GlobalScale.itineraries")} />
                            <StatItem value={formatNum(stats.travelers)} label={tLanding("GlobalScale.travelers")} />
                            <StatItem value={stats.rating.toFixed(1) + "/5"} label={tLanding("GlobalScale.rating")} />
                        </div>
                    </div>
                    <div className="h-[600px] w-full flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-blue-500/10 blur-[120px] rounded-full animate-pulse" />
                        <Globe />
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatItem({ value, label }: { value: string; label: string }) {
    return (
        <motion.div {...fadeUp}>
            <div className="text-4xl font-black text-white mb-2 tracking-tighter">{value}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</div>
        </motion.div>
    );
}

function BentoFeatures() {
    const tLanding = useTranslations("Landing");
    const WHY = [
        { id: "intelligence", icon: ShieldCheck, title: tLanding("Features.intelligenceTitle"), desc: tLanding("Features.intelligenceDesc"), image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2535&auto=format&fit=crop", color: "blue" },
        { id: "export", icon: FileCheck, title: tLanding("Features.exportTitle"), desc: tLanding("Features.exportDesc"), image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2670&auto=format&fit=crop", color: "emerald" },
        { id: "budget", icon: Coins, title: tLanding("Features.budgetTitle"), desc: tLanding("Features.budgetDesc"), image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=2671&auto=format&fit=crop", color: "amber" },
        { id: "knowledge", icon: BookOpen, title: tLanding("Features.knowledgeTitle"), desc: tLanding("Features.knowledgeDesc"), image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop", color: "purple" },
    ];

    return (
        <section className="bg-slate-50 py-24 lg:py-32 dark:bg-slate-950">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter dark:text-white mb-6">
                        {tLanding("Features.title1")} <span className="text-blue-600">{tLanding("Features.title2")}</span>
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">Unlocking a new way to explore the world with artificial intelligence.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[350px]">
                    {WHY.map((item, index) => (
                        <motion.div
                            key={item.id}
                            {...fadeUp}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "relative rounded-[2.5rem] overflow-hidden group border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500",
                                index === 0 || index === 3 ? "md:col-span-12 lg:col-span-7" : "md:col-span-12 lg:col-span-5"
                            )}
                        >
                            <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-10 flex flex-col justify-end text-white">
                                <item.icon className="h-10 w-10 mb-6 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0" />
                                <h3 className="text-3xl font-black tracking-tight mb-3 transform transition-transform duration-500 group-hover:-translate-y-2">{item.title}</h3>
                                <p className="text-base text-slate-200/90 font-medium max-w-sm opacity-90">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ParallaxDestinations() {
    const tLanding = useTranslations("Landing");
    return (
        <section className="py-24 lg:py-32 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter dark:text-white mb-6 underline decoration-blue-500 decoration-8 underline-offset-8">{tLanding("Destinations.title")}</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 font-medium">{tLanding("Destinations.desc")}</p>
                    </div>
                    <Button variant="outline" className="h-14 px-8 rounded-full border-2 border-slate-200 font-bold hover:bg-slate-50 transition-all dark:border-slate-800 dark:hover:bg-slate-800">
                        Explore All <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {SUPPORTED.map((c, index) => (
                        <motion.div
                            key={c.name}
                            {...fadeUp}
                            transition={{ delay: index * 0.1 }}
                            className="relative aspect-[4/5] overflow-hidden rounded-[2rem] group cursor-pointer shadow-lg"
                        >
                            <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end text-white">
                                <div className="flex items-center gap-3 mb-4 scale-90 origin-left transform group-hover:scale-100 transition-transform duration-500">
                                    <span className="text-3xl shadow-xl">{getFlagEmoji(c.countryCode)}</span>
                                    <div className="h-px w-8 bg-white/50" />
                                </div>
                                <h3 className="text-3xl font-black tracking-tight mb-2">{c.name}</h3>
                                <p className="text-sm text-blue-300 font-black uppercase tracking-widest">{c.itineraries} {tLanding("Destinations.itinerariesSuffix")}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PortalVisual() {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setIndex((prev) => (prev + 1) % SUPPORTED.length), 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-full w-full">
            <motion.div
                className="absolute top-0 right-0 w-[95%] h-[95%] rounded-t-[20rem] rounded-b-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rotate-3 border-[12px] border-white dark:border-slate-800 isolate"
                animate={{ rotate: index % 2 === 0 ? 3 : 2 }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 2 }}
                        className="absolute inset-0 rounded-t-[20rem] rounded-b-[4rem] overflow-hidden"
                    >
                        <Image src={SUPPORTED[index].image} alt={SUPPORTED[index].name} fill className="object-cover" priority />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
                    </motion.div>
                </AnimatePresence>

                {/* Floating Badge */}
                <div className="absolute bottom-12 left-12 bg-white/90 backdrop-blur-xl px-8 py-5 rounded-3xl shadow-2xl z-10 dark:bg-slate-900/90 border border-white/20">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Featured Destination</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{SUPPORTED[index].name}</p>
                </div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-600/20 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-600/20 blur-[120px] rounded-full -z-10" />
        </div>
    );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
    return (
        <Link href={href} className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all dark:bg-slate-900 dark:hover:bg-slate-800">
            <Icon className="h-5 w-5" />
        </Link>
    );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
    return <h3 className="font-black text-slate-900 text-sm uppercase tracking-[0.2em] mb-8 dark:text-white">{children}</h3>;
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-slate-500 hover:text-blue-600 transition-colors font-medium dark:text-slate-400">
                {children}
            </Link>
        </li>
    );
}