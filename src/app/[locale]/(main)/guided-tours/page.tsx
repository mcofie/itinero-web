"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, User, Clock, Compass, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function GuidedToursPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Hero Section - Split Layout */}
            <section className="relative px-6 pt-12 pb-24 lg:pt-32 lg:pb-32 overflow-hidden">
                <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Left Col: Content */}
                        <motion.div
                            className="relative z-10 flex flex-col items-start text-left"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block py-1.5 px-4 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-bold uppercase tracking-widest mb-8 border border-amber-200 dark:border-amber-800">
                                Coming Q1 2026
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight mb-8 leading-[1.1]">
                                See the world through <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">local eyes.</span>
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mb-10">
                                Ditch the tour bus. Hire a friendly local expert to navigate the streets, share hidden stories, and keep you safe.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-xl shadow-blue-600/20 h-14 text-base w-full sm:w-auto">
                                    <Link href="/trip-maker">Notify Me When Live</Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="rounded-full border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 h-14 text-base w-full sm:w-auto">
                                    <Link href="#how-it-works">How it works</Link>
                                </Button>
                            </div>
                        </motion.div>

                        {/* Right Col: Image */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="relative aspect-[4/5] md:aspect-square rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-slate-900/5 rotate-2 hover:rotate-0 transition-transform duration-700">
                                <Image
                                    src="/images/guided-tours-hero.png"
                                    alt="Local guide pointing out landmarks"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Gradient Overlay for text readability if needed, but keeping it clean for now */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent mix-blend-overlay" />
                            </div>

                            {/* Floating Card Decorative Element */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="absolute -bottom-8 -left-8 md:bottom-12 md:-left-12 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-xs border border-slate-100 dark:border-slate-700"
                            >
                                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">Verified Local Guides</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Background checked & trained</p>
                                </div>
                            </motion.div>
                        </motion.div>

                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
            </section>

            {/* Concept Section */}
            <section className="py-32 px-6 bg-white dark:bg-slate-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />
                <div className="mx-auto max-w-6xl relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Not a tour. <span className="text-blue-600 dark:text-blue-400">A companion.</span></h2>
                            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                                Traditional tours are rigid and impersonal. Our Guided Tours connect you with verified locals who join you for a part of your trip—helping you navigate, translate, and discover authentic culture.
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        <BenefitCard
                            icon={<Compass className="h-8 w-8 text-blue-600" />}
                            title="Navigate with Confidence"
                            desc="Get lost only when you want to. Your guide knows the shortcuts, the safe streets, and the best way to get from A to B."
                            delay={0.1}
                        />
                        <BenefitCard
                            icon={<User className="h-8 w-8 text-emerald-600" />}
                            title="Inside Access"
                            desc="Skip the tourist traps. Eat where the locals eat, shop at hidden markets, and hear stories you won't find in a guidebook."
                            delay={0.2}
                        />
                        <BenefitCard
                            icon={<Shield className="h-8 w-8 text-purple-600" />}
                            title="Safety First"
                            desc="Traveling solo or in a new region? A local guide offers peace of mind, acting as your translator and advocate."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-32 px-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                <div className="mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            className="relative aspect-[4/5] lg:aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-900/5"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <Image
                                src="/images/how-it-works.png"
                                alt="Two people exploring a city map"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-8 dark:bg-amber-900/30 dark:text-amber-300">
                                <Clock className="h-3.5 w-3.5" />
                                Flexible Booking
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-12 tracking-tight">
                                How it works
                            </h2>
                            <div className="space-y-12">
                                <Step
                                    number="01"
                                    title="Choose your destination"
                                    desc="Start building your trip in the Trip Maker. We'll recommend guides based on your stops."
                                />
                                <Step
                                    number="02"
                                    title="Select your guide"
                                    desc="Browse profiles, read reviews, and check languages spoken. Find someone who matches your vibe."
                                />
                                <Step
                                    number="03"
                                    title="Customize availability"
                                    desc="Book them for a few hours, a full day, or just a specific activity. It's totally up to you."
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 bg-blue-600 text-white text-center px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 to-blue-700" />
                <motion.div
                    className="mx-auto max-w-2xl relative z-10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Heart className="h-16 w-16 mx-auto mb-8 text-blue-200 fill-blue-200 opacity-50" />
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Never feel like a stranger.</h2>
                    <p className="text-blue-100 mb-12 text-xl leading-relaxed max-w-lg mx-auto">
                        Make a friend in your next destination and experience travel on a deeper level.
                    </p>
                    <Button asChild size="lg" className="rounded-full bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 h-14 text-lg shadow-2xl hover:scale-105 transition-all">
                        <Link href="/trip-maker">Book a Guide Now</Link>
                    </Button>
                </motion.div>
            </section>
        </div>
    );
}

function BenefitCard({ icon, title, desc, delay = 0 }: { icon: React.ReactNode, title: string, desc: string, delay?: number }) {
    return (
        <motion.div
            className="flex flex-col items-center text-center p-8 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-300"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm ring-1 ring-slate-900/5">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                {desc}
            </p>
        </motion.div>
    );
}

function Step({ number, title, desc }: { number: string, title: string, desc: string }) {
    return (
        <div className="flex gap-8 group">
            <div className="font-mono text-5xl font-black text-slate-200 dark:text-slate-800 leading-none select-none group-hover:text-blue-100 dark:group-hover:text-slate-700 transition-colors">
                {number}
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {desc}
                </p>
            </div>
        </div>
    )
}
