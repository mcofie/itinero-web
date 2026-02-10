"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Award, ShieldCheck, MapPin, Camera, Edit3, Trash2, Globe, ArrowRight, Star, Trophy, Sparkles, Zap, Info, ExternalLink, HelpCircle, Laptop, Smartphone, Car
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

/* ================= Types & Data ================= */

type Activity = {
    id: string;
    label: string;
    desc: string;
    points: number;
    category: "Places" | "Verification" | "Media" | "Edits" | "Community";
    icon: any;
};

const ACTIVITIES: Activity[] = [
    { id: "add_place_basic", label: "Add a new place", desc: "Basic details & location pin.", points: 30, category: "Places", icon: MapPin },
    { id: "verify_place", label: "Verify info", desc: "Confirm existing place details.", points: 15, category: "Verification", icon: ShieldCheck },
    { id: "upload_photos", label: "Original photos", desc: "High quality, original shots.", points: 8, category: "Media", icon: Camera },
    { id: "update_hours", label: "Update hours", desc: "Reliable opening times proof.", points: 12, category: "Edits", icon: Edit3 },
    { id: "publish_itinerary", label: "Publish itinerary", desc: "Structured 2+ day guide.", points: 50, category: "Community", icon: Globe },
];

const TIERS = [
    { key: "explorer", name: "Explorer", min: 0, perks: ["Starter badge", "Monthly challenges"] },
    { key: "guide", name: "Guide", min: 500, perks: ["Profile flair", "Early access"] },
    { key: "pathfinder", name: "Pathfinder", min: 2000, perks: ["Beta invites", "Priority reviews"] },
    { key: "ambassador", name: "Ambassador", min: 6000, perks: ["Itinero merch", "Invite-only"] },
];

const DEMO_POINTS = 780;

/* ================= Page Client ================= */

export default function RewardsClient() {
    const [points] = useState<number>(DEMO_POINTS);

    const tier = useMemo(() => {
        const sorted = [...TIERS].sort((a, b) => b.min - a.min);
        return sorted.find((t) => points >= t.min) ?? TIERS[0];
    }, [points]);

    const nextTier = useMemo(() => {
        const idx = TIERS.findIndex((t) => t.key === tier.key);
        return TIERS[idx + 1] ?? null;
    }, [tier]);

    const progressPct = useMemo(() => {
        if (!nextTier) return 100;
        const span = nextTier.min - tier.min;
        const within = Math.max(0, Math.min(span, points - tier.min));
        return Math.round((within / span) * 100);
    }, [points, tier, nextTier]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">

            {/* --- Hero / Region Header Style --- */}
            <div className="bg-slate-900 pt-24 pb-32 text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop"
                        alt="Rewards background"
                        fill
                        className="object-cover opacity-20 blur-sm scale-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-900/80 to-slate-950" />
                </div>

                <div className="container mx-auto px-6 relative z-10 max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                        <div>
                            <div className="flex items-center gap-3 text-blue-400 font-bold tracking-widest uppercase text-xs mb-3">
                                <Trophy className="h-4 w-4" />
                                Rewards Intelligence
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                                Explorer Contribution
                            </h1>
                            <p className="text-slate-400 max-w-xl text-lg">
                                Earn points by contributing verified data and photos. Help the community while unlocking exclusive perks.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-20 relative z-20 max-w-6xl">

                {/* --- Progress Briefing Card (Resources Header Card Style) --- */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 mb-10 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="h-24 w-24 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 relative shadow-2xl">
                            <Star className="h-10 w-10" />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{tier.name} Tier</h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                                You have <span className="text-blue-600 font-bold">{points.toLocaleString()} points</span>.
                                {nextTier ? ` Only ${(nextTier.min - points).toLocaleString()} pts to ${nextTier.name}.` : " You've reached the top!"}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                            <div className="flex justify-between text-xs font-bold uppercase text-slate-400 tracking-wider">
                                <span>Progress</span>
                                <span>{progressPct}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPct}%` }}
                                    className="h-full bg-blue-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- Left Column: Missions --- */}
                    <div className="lg:col-span-2 space-y-8">

                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="h-5 w-5 text-blue-500" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Missions</h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {ACTIVITIES.map((act) => (
                                    <ActivityCard key={act.id} item={act} />
                                ))}
                            </div>
                        </section>

                        <section className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <Card className="border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 h-full p-6 bg-white dark:bg-slate-900 border border-slate-200 shadow-sm rounded-2xl">
                                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm uppercase mb-4">
                                        <Award className="h-4 w-4" />
                                        Unlock Status
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                        Each contribution goes through our verification system. Once approved, points are added to your balance instantly.
                                    </p>
                                    <div className="p-3 bg-white/60 dark:bg-black/20 rounded-lg text-xs text-slate-500 border border-indigo-100 italic">
                                        Pro Tip: Quality images earn 2x bonus points during peak seasons.
                                    </div>
                                </Card>
                            </div>

                            <div className="space-y-4">
                                <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase mb-4">
                                        <Info className="h-4 w-4" />
                                        Monthly Challenge
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Night Owl</h4>
                                    <p className="text-xs text-slate-500 mb-4">Verify hours for 10 nightlife venues this month.</p>
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">+200 Bonus PTS</Badge>
                                </Card>
                            </div>
                        </section>
                    </div>

                    {/* --- Right Column: Tiers --- */}
                    <div className="lg:col-span-1">
                        <section className="sticky top-24">
                            <div className="flex items-center gap-3 mb-4">
                                <Trophy className="h-5 w-5 text-blue-500" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tier Breakdown</h3>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg p-6 space-y-6">
                                {TIERS.map((t) => (
                                    <div key={t.key} className={cn(
                                        "relative pl-4 border-l-2 py-1",
                                        points >= t.min ? "border-blue-500" : "border-slate-100 dark:border-slate-800 opacity-50"
                                    )}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</h4>
                                            <span className="text-[10px] font-bold text-slate-400">{t.min}+ pts</span>
                                        </div>
                                        <ul className="space-y-1">
                                            {t.perks.map((p, i) => (
                                                <li key={i} className="flex items-center gap-2 text-[11px] text-slate-500">
                                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                    {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
}

/* --- Components --- */

function Card({ className, children }: any) {
    return <div className={cn("p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm", className)}>{children}</div>;
}

function ActivityCard({ item }: { item: Activity }) {
    return (
        <div className="group relative flex items-start gap-4 p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <item.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{item.label}</h4>
                    <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded tracking-wide">{item.points} PTS</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-2">{item.desc}</p>
            </div>
        </div>
    );
}
