"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    Coins,
    Map as MapIcon,
    WifiOff,
    Calendar,
    Share2,
    ShieldCheck,
    Zap
} from "lucide-react";

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Hero Section */}
            <section className="relative pt-24 pb-16 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />
                <div className="mx-auto max-w-4xl text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 text-sm font-bold tracking-wide mb-6 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
                        <Zap className="h-4 w-4 fill-current" />
                        Everything you need
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
                        Travel smarter, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">not harder.</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
                        Itinero brings together all the tools you need to plan, organize, and enjoy your perfect trip in one beautiful place.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-600/20 h-12">
                            <Link href="/trip-maker">Start Planning Free</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full border-slate-300 text-slate-700 hover:bg-white hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 h-12">
                            <Link href="/pricing">View Pricing</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* AI Planning */}
                        <FeatureCard
                            icon={<Sparkles className="h-6 w-6 text-amber-500" />}
                            title="AI-Powered Planning"
                            desc="Tell us your vibe, budget, and dates. Our AI crafts a day-by-day itinerary tailored just for you in seconds."
                            className="lg:col-span-2 lg:flex-row lg:items-start"
                        />
                        {/* Budgeting */}
                        <FeatureCard
                            icon={<Coins className="h-6 w-6 text-emerald-500" />}
                            title="Smart Budgeting"
                            desc="Real-time currency conversion and cost estimates for every activity. Know exactly what you'll spend before you go."
                        />

                        {/* Maps */}
                        <FeatureCard
                            icon={<MapIcon className="h-6 w-6 text-blue-500" />}
                            title="Interactive Maps"
                            desc="Visualize your trip with pins for every stop. See efficient routes between attractions to save travel time."
                        />
                        {/* Offline */}
                        <FeatureCard
                            icon={<WifiOff className="h-6 w-6 text-slate-500" />}
                            title="Offline Access"
                            desc="Download your complete itinerary as a beautiful PDF. Access your plans even when you're off the grid."
                        />
                        {/* Calendar */}
                        <FeatureCard
                            icon={<Calendar className="h-6 w-6 text-purple-500" />}
                            title="Calendar Sync"
                            desc="One-click sync to Google Calendar, Outlook, or Apple Calendar. Keep your schedule organized seamlessly."
                        />
                    </div>
                </div>
            </section>

            {/* Deep Dive Section - Alternating */}
            <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
                <div className="mx-auto max-w-6xl px-6 space-y-24">

                    {/* Feature 1 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-blue-100 text-blue-600 mb-6 dark:bg-blue-900/30 dark:text-blue-400">
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                Itineraries that feel human.
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                We don't just dump a list of places. We curate logical flows, ensuring you're not criss-crossing the city. We account for opening hours, ideal visit durations, and even local meal times.
                            </p>
                            <ul className="space-y-3">
                                <CheckItem>Personalized to your travel style</CheckItem>
                                <CheckItem>Optimized for logistics & travel time</CheckItem>
                                <CheckItem>Includes hidden gems & local favorites</CheckItem>
                            </ul>
                        </div>
                        <div className="order-1 md:order-2 bg-slate-100 dark:bg-slate-800 rounded-3xl aspect-square md:aspect-[4/3] relative overflow-hidden">
                            {/* Placeholder for feature visual */}
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600 font-bold text-xl border-dashed border-2 border-slate-300 dark:border-slate-700 m-8 rounded-2xl">
                                AI Visual Placeholder
                            </div>
                        </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl aspect-square md:aspect-[4/3] relative overflow-hidden">
                            {/* Placeholder for feature visual */}
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600 font-bold text-xl border-dashed border-2 border-slate-300 dark:border-slate-700 m-8 rounded-2xl">
                                Currency Visual Placeholder
                            </div>
                        </div>
                        <div>
                            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-emerald-100 text-emerald-600 mb-6 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <Coins className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                Master your travel budget.
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                Stop doing mental math at every conversion shop. Set your home currency, and we'll show you estimated costs in both local and home currencies.
                            </p>
                            <ul className="space-y-3">
                                <CheckItem>Live exchange rates</CheckItem>
                                <CheckItem>Total trip cost estimation</CheckItem>
                                <CheckItem>Track spending (coming soon)</CheckItem>
                            </ul>
                        </div>
                    </div>

                </div>
            </section>

            {/* More Features Grid */}
            <section className="py-24 px-6 bg-slate-50 dark:bg-slate-950">
                <div className="mx-auto max-w-4xl text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">And so much more</h2>
                </div>
                <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SmallFeatureCard title="Share with Friends" icon={<Share2 className="h-5 w-5" />} />
                    <SmallFeatureCard title="Secure Data" icon={<ShieldCheck className="h-5 w-5" />} />
                    <SmallFeatureCard title="Mobile Friendly" icon={<Zap className="h-5 w-5" />} />
                    <SmallFeatureCard title="PDF Export" icon={<WifiOff className="h-5 w-5" />} />
                    <SmallFeatureCard title="Google Maps Sync" icon={<MapIcon className="h-5 w-5" />} />
                    <SmallFeatureCard title="24/7 Support" icon={<Sparkles className="h-5 w-5" />} />
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 bg-slate-900 text-white text-center px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 pointer-events-none" />
                <div className="mx-auto max-w-2xl relative z-10">
                    <h2 className="text-4xl font-bold mb-6 tracking-tight">Ready to upgrade your travel?</h2>
                    <p className="text-slate-300 mb-10 text-xl leading-relaxed">
                        Join thousands of travelers who are exploring the world smarter, cheaper, and better.
                    </p>
                    <Button asChild size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-200 font-bold px-10 h-14 text-lg shadow-xl shadow-white/5">
                        <Link href="/trip-maker">Get Started for Free</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc, className }: { icon: React.ReactNode, title: string, desc: string, className?: string }) {
    return (
        <div className={`bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group ${className}`}>
            <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {desc}
                </p>
            </div>
        </div>
    );
}

function SmallFeatureCard({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="text-blue-600 dark:text-blue-400">{icon}</div>
            <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
        </div>
    )
}

function CheckItem({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            {children}
        </li>
    )
}
