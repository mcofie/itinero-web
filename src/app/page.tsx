"use client";

import Link from "next/link";
import {useRef, useState, useEffect} from "react";
import {motion, useScroll, useTransform, useInView, AnimatePresence} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import TripWizard from "@/components/landing/TripWizard";
import {
    Users2, FileText, Wallet, CalendarPlus, Plane, Sparkles,
    Compass, MapPin, Ticket, Mail, ArrowRight, CheckCircle2,
    Twitter, Instagram, Linkedin, Github, Globe2, Camera
} from "lucide-react";
import {ThemeToggle} from "@/components/ThemeToggle";
import {cn} from "@/lib/utils";

/* ---------- Data ---------- */
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
];

const WHY = [
    {
        id: "community",
        icon: Users2,
        title: "Community Powered",
        desc: "Local tips and hidden gems contributed by real travellers. Verify info to earn points.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2670&auto=format&fit=crop",
        color: "blue"
    },
    {
        id: "export",
        icon: FileText,
        title: "Visa-Ready Exports",
        desc: "Generate professional PDF itineraries instantly. Perfect for visa applications and offline use.",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop",
        color: "emerald"
    },
    {
        id: "budget",
        icon: Wallet,
        title: "Budget Control",
        desc: "Real-world price estimates for every activity. Plan confidently without breaking the bank.",
        image: "https://images.unsplash.com/photo-1554224154-260327c00c4b?q=80&w=2670&auto=format&fit=crop",
        color: "amber"
    },
    {
        id: "sync",
        icon: CalendarPlus,
        title: "Smart Sync",
        desc: "Push your entire trip to Google Calendar or Outlook with one click. Never miss a beat.",
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2668&auto=format&fit=crop",
        color: "purple"
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

/* ---------- Animation Variants ---------- */
const fadeUp = {
    initial: {opacity: 0, y: 20},
    whileInView: {opacity: 1, y: 0},
    viewport: {once: true, margin: "-100px"},
    transition: {duration: 0.5, ease: "easeOut"}
};

/* ---------- Page Component ---------- */
export default function LandingPage() {
    const heroRef = useRef(null);

    return (
        <div
            className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-white">

            {/* Header */}
            <header
                className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <Link href="/"
                          className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
            <span
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
              <Plane className="h-4 w-4"/>
            </span>
                        Itinero
                    </Link>
                    <nav className="flex items-center gap-1 md:gap-2">
                        <Link href="/pricing"
                              className="hidden sm:inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                            Pricing
                        </Link>
                        <Link href="/login"
                              className="h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 hidden sm:inline-flex dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                            Log in
                        </Link>
                        <Link href="/signup">
                            <Button
                                className="rounded-full bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 dark:bg-blue-500 dark:hover:bg-blue-600">
                                Sign up
                            </Button>
                        </Link>
                        <div className="ml-2">
                            <ThemeToggle/>
                        </div>
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section ref={heroRef} className="relative overflow-hidden pt-20 pb-32 lg:pt-32">
                    {/* Background Gradients */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                        <div
                            className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-blue-100/50 blur-[100px] dark:bg-blue-900/20 mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
                        <div
                            className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-100/50 blur-[100px] dark:bg-indigo-900/20 mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
                    </div>

                    <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
                        <motion.div {...fadeUp}
                                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/50 px-4 py-1.5 text-sm font-semibold text-blue-700 backdrop-blur-sm mb-8 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <Sparkles className="h-4 w-4"/>
                            <span>New: AI-Powered Trip Generation</span>
                        </motion.div>

                        <motion.h1
                            {...fadeUp}
                            transition={{delay: 0.1, duration: 0.5}}
                            className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1] dark:text-white"
                        >
                            Plan smarter trips <br/>
                            <span
                                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">in minutes.</span>
                        </motion.h1>

                        <motion.p
                            {...fadeUp}
                            transition={{delay: 0.2, duration: 0.5}}
                            className="mx-auto max-w-2xl text-xl text-slate-600 mb-12 leading-relaxed dark:text-slate-400"
                        >
                            Build complete itineraries with activities, routes, and budgets in one place.
                            Stop stressing over spreadsheets and start enjoying the journey.
                        </motion.p>

                        {/* Trip Wizard Preview */}
                        <motion.div
                            {...fadeUp}
                            transition={{delay: 0.3, duration: 0.6}}
                            className="relative mx-auto max-w-4xl"
                        >
                            {/* Glow behind wizard */}
                            <div
                                className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 blur-lg dark:opacity-30"></div>

                            <div
                                className="relative rounded-[2rem] border border-slate-200 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 overflow-hidden dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-none">
                                <div className="p-2 md:p-4">
                                    <TripWizard/>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* New Sticky Scroll Feature Section */}
                <StickyFeatures/>

                {/* Destinations Grid */}
                <section className="py-24 bg-white border-t border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 dark:text-white">Popular
                                    Destinations</h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400">Deep local data, pricing, and
                                    optimized routing available for these regions.</p>
                            </div>
                            <Link href={"/destinations"}>
                                <Button variant="outline"
                                        className="hidden md:flex gap-2 rounded-full border-slate-200 hover:border-blue-600 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-500 dark:hover:text-blue-500">
                                    View all destinations <ArrowRight className="h-4 w-4"/>
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {SUPPORTED.map((c, i) => (
                                <motion.div
                                    key={c.name}
                                    initial={{opacity: 0, scale: 0.95}}
                                    whileInView={{opacity: 1, scale: 1}}
                                    viewport={{once: true}}
                                    transition={{delay: i * 0.05}}
                                    className="group relative aspect-[3/4] overflow-hidden rounded-3xl cursor-pointer"
                                >
                                    <img src={c.image} alt={c.name}
                                         className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"/>
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                                        <h3 className="text-xl font-bold tracking-tight transform translate-y-2 group-hover:translate-y-0 transition-transform">{c.name}</h3>
                                        <p className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300 text-blue-200">{c.itineraries} Itineraries</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 bg-blue-600 text-white dark:bg-blue-700">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <div
                            className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/10 backdrop-blur-sm mb-8 ring-1 ring-white/20">
                            <Ticket className="h-8 w-8 text-white"/>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                            Start your next <br className="hidden sm:block"/>
                            <span className="text-blue-200">adventure today.</span>
                        </h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            Join thousands of travellers who have stopped stressing over spreadsheets and started
                            enjoying the journey.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button asChild size="lg"
                                    className="h-14 px-8 rounded-full bg-white text-blue-600 hover:bg-blue-50 font-bold text-base shadow-xl">
                                <Link href="/trip-maker">Start Free Itinerary</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg"
                                    className="h-14 px-8 rounded-full border-blue-400 bg-blue-700/50 text-white hover:bg-blue-700 hover:text-white font-bold text-base backdrop-blur-sm">
                                <Link href="/pricing">View Pricing</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer
                    className="bg-white border-t border-slate-200 pt-16 pb-8 dark:bg-slate-950 dark:border-slate-800">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                            <div className="lg:col-span-2">
                                <Link href="/"
                                      className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 mb-4 dark:text-blue-400">
                    <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                      <Plane className="h-4 w-4"/>
                    </span>
                                    Itinero
                                </Link>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6 dark:text-slate-400">
                                    The all-in-one workspace for modern travellers. Plan, budget, and explore the world
                                    with confidence.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-4 dark:text-white">Product</h3>
                                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                    {FOOTER_LINKS.product.map(link => (
                                        <li key={link.label}><Link href={link.href}
                                                                   className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-4 dark:text-white">Company</h3>
                                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                    {FOOTER_LINKS.company.map(link => (
                                        <li key={link.label}><Link href={link.href}
                                                                   className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 mb-4 dark:text-white">Stay Updated</h3>
                                <div className="flex gap-2">
                                    <Input placeholder="Email"
                                           className="bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800"/>
                                    <Button size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500"><Mail
                                        className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        </div>

                        <div
                            className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 dark:border-slate-800">
                            <div
                                className="text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Itinero
                                Inc. All rights reserved.
                            </div>
                            <div className="flex gap-6">
                                <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Twitter
                                    className="h-5 w-5"/></Link>
                                <Link href="#"
                                      className="text-slate-400 hover:text-blue-600 transition-colors"><Instagram
                                    className="h-5 w-5"/></Link>
                                <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Github
                                    className="h-5 w-5"/></Link>
                            </div>
                        </div>
                    </div>
                </footer>

            </main>
        </div>
    );
}

/* ---------- NEW STICKY COMPONENT (Revamped) ---------- */
function StickyFeatures() {
    const [activeFeature, setActiveFeature] = useState(0);

    // We'll use Framer Motion to control the scroll-triggered switching if desired,
    // but for simplicity and robustness, a manual click + auto-rotate or scroll-spy is best.
    // Here we stick to a manual click interaction with a sticky layout.

    return (
        <section className="bg-slate-50 py-24 dark:bg-slate-950 relative">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6 dark:text-white">
                        Why travellers choose <span className="text-blue-600 dark:text-blue-500">Itinero</span>
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400">
                        Everything you need to go from idea to departure in one seamless flow.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
                    {/* Left: Feature List (Sticky) */}
                    <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-32">
                        {WHY.map((item, index) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "group p-6 rounded-3xl transition-all duration-300 cursor-pointer border-2 relative overflow-hidden",
                                    activeFeature === index
                                        ? "bg-white border-blue-100 shadow-xl shadow-blue-900/5 dark:bg-slate-900 dark:border-blue-900/50"
                                        : "bg-transparent border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-900/30"
                                )}
                                onClick={() => setActiveFeature(index)}
                            >
                                {/* Progress Bar Background for Active Item (Optional Idea) */}
                                {activeFeature === index && (
                                    <motion.div
                                        layoutId="active-bg"
                                        className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 -z-10"
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                    />
                                )}

                                <div className="flex gap-5">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-sm",
                                        activeFeature === index
                                            ? `bg-${item.color}-100 text-${item.color}-600 dark:bg-${item.color}-900/30 dark:text-${item.color}-400`
                                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                                    )}>
                                        <item.icon className="h-6 w-6"/>
                                    </div>
                                    <div>
                                        <h3 className={cn(
                                            "text-lg font-bold mb-2 transition-colors",
                                            activeFeature === index ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                                        )}>
                                            {item.title}
                                        </h3>
                                        <p className={cn(
                                            "text-sm leading-relaxed transition-colors",
                                            activeFeature === index ? "text-slate-600 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"
                                        )}>
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Image Preview (Sticky/Fixed height) */}
                    <div className="lg:col-span-7 relative">
                        <div
                            className="relative aspect-[4/3] md:aspect-[16/10] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-900">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeFeature}
                                    initial={{opacity: 0, scale: 1.05}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0}}
                                    transition={{duration: 0.5, ease: "circOut"}}
                                    className="absolute inset-0 h-full w-full"
                                >
                                    <img
                                        src={WHY[activeFeature].image}
                                        alt={WHY[activeFeature].title}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Subtle Overlay */}
                                    <div className={cn(
                                        "absolute inset-0 mix-blend-multiply opacity-20",
                                        `bg-${WHY[activeFeature].color}-900`
                                    )}/>
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"/>

                                    {/* Floating Badge inside image */}
                                    <div
                                        className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3 dark:bg-slate-900/90 dark:border-slate-700">
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center text-white shadow-sm",
                                            `bg-${WHY[activeFeature].color}-500`
                                        )}>
                                            <CheckCircle2 className="h-5 w-5"/>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Feature
                                                Unlocked</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{WHY[activeFeature].title}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Decorative elements behind image */}
                        <div
                            className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -z-10 dark:bg-blue-900/20"></div>
                        <div
                            className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -z-10 dark:bg-indigo-900/20"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}