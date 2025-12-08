"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Heart, Shield, Users } from "lucide-react";

export default function AboutUsPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

            {/* Hero Section */}
            <section className="relative py-24 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-900/10 pointer-events-none" />
                <div className="mx-auto max-w-4xl text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
                        We make travel <br />
                        <span className="text-blue-600 dark:text-blue-400">simple and unforgettable.</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
                        Itinero was born from a simple frustration: planning a trip shouldn't be harder than the trip itself. We use technology to put the joy back into exploration.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-600/20">
                            <Link href="/trip-maker">Start Planning</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop"
                                alt="Team collaboration"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                                <Heart className="h-3 w-3" />
                                Our Mission
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                                Empowering every traveler to explore with confidence.
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                We believe that travel opens minds and bridges cultures. Too often, the logistics of flights, hotels, and obscure local transit get in the way of the experience.
                            </p>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                                Our platform combines real-world data with AI precision to craft itineraries that just work. Whether you're a solo backpacker or a family of five, Itinero is your co-pilot.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-24 px-6 bg-slate-50 dark:bg-slate-950">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">Why we exist</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            We're building more than just an itinerary tool. We're building a smarter way to see the world.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ValueCard
                            icon={<Globe className="h-6 w-6 text-blue-600" />}
                            title="Global First"
                            desc="We build for a global audience, starting with underserved currencies and regions often ignored by major travel apps."
                        />
                        <ValueCard
                            icon={<Shield className="h-6 w-6 text-emerald-600" />}
                            title="Trust & Safety"
                            desc="We verifying local guides and use reputable data sources so you never end up stranded."
                        />
                        <ValueCard
                            icon={<Users className="h-6 w-6 text-purple-600" />}
                            title="Community Driven"
                            desc="Our best tips come from our community. We reward travelers for sharing their hidden gems."
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-slate-900 text-white text-center px-6">
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-3xl font-bold mb-6">Ready to see the world?</h2>
                    <p className="text-slate-400 mb-10 text-lg">
                        Join thousands of travelers planning their next adventure with Itinero.
                    </p>
                    <Button asChild size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-200 font-bold px-8">
                        <Link href="/trip-maker">Build your first trip</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {desc}
            </p>
        </div>
    );
}
