"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    Card, CardHeader, CardTitle, CardContent, CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Award, ShieldCheck, MapPin, Camera, Edit3, Trash2, Users, Info, Check
} from "lucide-react";

/* ================= Types & Data ================= */

type Activity = {
    id: string;
    label: string;
    desc: string;
    points: number;
    capPerDay?: number | null;
    note?: string;
    category: "Places" | "Verification" | "Media" | "Edits" | "Cleanup" | "Community";
};

const ACTIVITIES: Activity[] = [
    // PLACES
    {
        id: "add_place_basic",
        label: "Add a new place (basic details)",
        desc: "Name + category + location pin that matches the real-world spot.",
        points: 30,
        category: "Places",
        note: "Duplicates or low-quality entries are removed with no points.",
    },
    {
        id: "add_place_rich",
        label: "Add a new place (rich profile)",
        desc: "All basic details plus website/phone, opening hours, price range, accessibility tags.",
        points: 60,
        category: "Places",
        note: "Extra points for complete, accurate profiles.",
    },

    // VERIFICATION
    {
        id: "verify_place",
        label: "Verify an existing place",
        desc: "Confirm location, category, hours & contact are correct.",
        points: 15,
        category: "Verification",
        capPerDay: 20,
        note: "Multiple independent verifications boost trust.",
    },
    {
        id: "first_verified",
        label: "First verified source",
        desc: "Be the first to verify a place after another user adds it.",
        points: 20,
        category: "Verification",
        note: "Awarded once per place to the first valid verifier.",
    },

    // MEDIA
    {
        id: "upload_photos",
        label: "Upload original photos (1–5)",
        desc: "Clear, recent images you shot yourself. No watermarks.",
        points: 8,
        capPerDay: 40,
        category: "Media",
        note: "Auto-rejected if AI/stock/duplicates are detected.",
    },
    {
        id: "cover_photo",
        label: "Photo chosen as cover image",
        desc: "Your photo is selected as the place’s main image.",
        points: 20,
        category: "Media",
    },

    // EDITS
    {
        id: "update_hours",
        label: "Update opening hours",
        desc: "Provide reliable, current hours with proof (photo/website).",
        points: 12,
        category: "Edits",
    },
    {
        id: "update_prices",
        label: "Update prices / fees",
        desc: "Ticket price, menu ranges, activity fees with date observed.",
        points: 12,
        category: "Edits",
    },
    {
        id: "add_tips",
        label: "Add helpful tips",
        desc: "Short, practical tips (best times, local etiquette, transport).",
        points: 10,
        category: "Edits",
        capPerDay: 15,
    },

    // CLEANUP
    {
        id: "report_closed",
        label: "Report permanent closure",
        desc: "Submit evidence for a permanently closed place.",
        points: 25,
        category: "Cleanup",
        note: "Points awarded on moderator confirmation.",
    },
    {
        id: "flag_inaccurate",
        label: "Flag inaccurate info",
        desc: "Point out wrong data (category, pin, contacts, hours, etc.).",
        points: 10,
        category: "Cleanup",
    },

    // COMMUNITY
    {
        id: "answer_qna",
        label: "Answer traveler questions",
        desc: "Accurate, first-hand responses that get upvotes.",
        points: 6,
        category: "Community",
        capPerDay: 30,
        note: "+2 bonus if marked ‘Most Helpful’.",
    },
    {
        id: "publish_itinerary",
        label: "Publish itinerary",
        desc: "Well-structured itinerary (2+ days) with costs & timings.",
        points: 50,
        category: "Community",
        note: "+20 if featured by editors.",
    },
    {
        id: "streak_bonus",
        label: "7-day contribution streak",
        desc: "Contribute at least once per day for 7 consecutive days.",
        points: 35,
        category: "Community",
    },
    {
        id: "referral",
        label: "Refer a contributor",
        desc: "Your referral submits 5 approved contributions in 14 days.",
        points: 80,
        category: "Community",
    },
];

const TIERS = [
    { key: "explorer", name: "Explorer", min: 0, perks: ["Starter badge", "Monthly challenges"] },
    { key: "guide", name: "Guide", min: 500, perks: ["Profile flair", "Early feature access"] },
    { key: "pathfinder", name: "Pathfinder", min: 2000, perks: ["Beta invites", "Priority reviews"] },
    { key: "ambassador", name: "Ambassador", min: 6000, perks: ["Itinero merch", "Invite-only programs"] },
];

// Demo points (wire this to user profile later)
const DEMO_POINTS = 780;

/* ================= Page ================= */

export default function RewardsPage() {
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

    const grouped = useMemo(() => {
        const order = ["Places", "Verification", "Media", "Edits", "Cleanup", "Community"] as const;
        const map = new Map<string, Activity[]>();
        for (const a of ACTIVITIES) map.set(a.category, [...(map.get(a.category) ?? []), a]);
        return order
            .filter((k) => map.has(k))
            .map((k) => ({ category: k as Activity["category"], items: map.get(k)! }));
    }, []);

    return (
        <div
            className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-white dark:selection:bg-blue-900 dark:selection:text-white transition-colors duration-300">

            <main>
                {/* ===== Hero Section ===== */}
                <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 text-center px-6">
                    {/* Background Blobs */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                        <div
                            className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-50/80 blur-3xl mix-blend-multiply opacity-70 animate-blob dark:bg-blue-900/20 dark:mix-blend-screen"></div>
                    </div>

                    <div className="relative mx-auto max-w-3xl">
                        <div
                            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-sm font-medium text-blue-700 mb-6 backdrop-blur-sm dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
                            <Award className="h-4 w-4" />
                            <span>Community Rewards</span>
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6 dark:text-white">
                            Earn points by improving <br className="hidden sm:block" />
                            <span
                                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">travel for everyone.</span>
                        </h1>

                        <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed dark:text-slate-400">
                            Help keep places trusted & up-to-date. Contribute verified data, photos, and fixes — unlock
                            perks as you go.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg"
                                className="rounded-full bg-blue-600 px-8 font-bold text-white shadow-lg hover:bg-blue-700 transition-all dark:bg-blue-500 dark:hover:bg-blue-600"
                                asChild>
                                <Link href="/signup">Start Contributing</Link>
                            </Button>
                            <Button size="lg" variant="outline"
                                className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                asChild>
                                <Link href="/about">Contributor Guide</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ===== Progress / Tier ===== */}
                <section className="mx-auto w-full max-w-6xl px-6 -mt-12 relative z-10 mb-20">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Progress Card */}
                        <Card
                            className="md:col-span-2 border-slate-200 shadow-xl shadow-blue-900/5 rounded-3xl overflow-hidden dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                            <CardHeader
                                className="pb-2 bg-slate-50/50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Your
                                    Current Progress</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <div
                                            className="text-4xl font-extrabold text-blue-600 tabular-nums dark:text-blue-400">{points.toLocaleString()}
                                            <span
                                                className="text-lg font-medium text-slate-400 dark:text-slate-500">pts</span>
                                        </div>
                                        <div
                                            className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Current
                                            Tier: <span className="text-slate-900 dark:text-white">{tier.name}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {nextTier ? (
                                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                Next: <span
                                                    className="text-blue-600 dark:text-blue-400">{nextTier.name}</span>
                                                <br />
                                                <span
                                                    className="text-xs text-slate-400 dark:text-slate-600">{nextTier.min - points} pts to go</span>
                                            </div>
                                        ) : (
                                            <div
                                                className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Top
                                                Tier Reached! 🎉</div>
                                        )}
                                    </div>
                                </div>
                                <Progress value={progressPct}
                                    className="h-3 rounded-full bg-slate-100 dark:bg-slate-800"
                                    indicatorClassName="bg-blue-600 dark:bg-blue-500" />

                                <div className="mt-6 flex flex-wrap gap-2">
                                    {TIERS.map((t) => (
                                        <Badge
                                            key={t.key}
                                            variant="secondary"
                                            className={`rounded-full px-3 py-1 border ${t.key === tier.key
                                                ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                                                : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                                                }`}
                                        >
                                            {t.name} {t.key === tier.key && "• Current"}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card
                            className="border-slate-200 shadow-xl shadow-blue-900/5 rounded-3xl flex flex-col dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                            <CardHeader
                                className="pb-2 bg-slate-50/50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                                <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Quick
                                    Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 flex-1 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div
                                        className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <MapPin className="h-4 w-4" /></div>
                                    <span>Add a new place</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div
                                        className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                        <ShieldCheck className="h-4 w-4" /></div>
                                    <span>Verify details</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <div
                                        className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                        <Award className="h-4 w-4" /></div>
                                    <span>Review edits</span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 pb-6 px-6 gap-3">
                                <Button
                                    className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold dark:bg-blue-500 dark:hover:bg-blue-600">Add
                                    Place</Button>
                                <Button variant="outline"
                                    className="flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Verify</Button>
                            </CardFooter>
                        </Card>
                    </div>
                </section>

                {/* ===== Ways to Earn List ===== */}
                <section className="mx-auto w-full max-w-4xl px-6 pb-24">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 dark:text-white">Ways to earn</h2>
                    <p className="text-slate-500 mb-8 max-w-2xl dark:text-slate-400">Points are awarded after automated
                        & human checks pass. High quality contributions earn more.</p>

                    <div className="space-y-8">
                        {grouped.map(({ category, items }) => (
                            <div key={category}
                                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
                                <div
                                    className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between dark:bg-slate-800/50 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        {categoryIcon(category)}
                                        <h3 className="font-bold text-slate-900 dark:text-white">{category}</h3>
                                    </div>
                                    <span
                                        className="text-xs font-semibold text-slate-400 uppercase tracking-wider dark:text-slate-500">Potential Earnings</span>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {items.map((item) => (
                                        <div key={item.id}
                                            className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/30">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="font-medium text-slate-900 dark:text-slate-200">{item.label}</span>
                                                    {item.capPerDay && (
                                                        <span
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">Max {item.capPerDay}/day</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                                                {item.note &&
                                                    <p className="text-xs text-slate-400 italic mt-0.5 dark:text-slate-500">{item.note}</p>}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span
                                                    className="text-lg font-bold text-slate-900 dark:text-white">{item.points}</span>
                                                <span
                                                    className="text-xs font-medium text-slate-400 dark:text-slate-500">pts</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== Tiers & Perks ===== */}
                <section
                    className="bg-slate-50 py-24 border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Tiers & Perks</h2>
                            <p className="text-slate-500 mt-4 dark:text-slate-400">Unlock more recognition, features,
                                and benefits as your impact on the community grows.</p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {TIERS.map((t) => (
                                <div key={t.key}
                                    className={`p-6 rounded-3xl border shadow-sm flex flex-col ${t.key === tier.key ? 'bg-white border-blue-500 ring-4 ring-blue-500/10 relative overflow-hidden dark:bg-slate-900 dark:ring-blue-500/20' : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'}`}>
                                    {t.key === tier.key &&
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>}

                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.name}</h3>
                                        <span
                                            className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{t.min.toLocaleString()}+ pts</span>
                                    </div>

                                    <ul className="space-y-3 flex-1 mb-6">
                                        {t.perks.map((p, i) => (
                                            <li key={i}
                                                className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                                <span>{p}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-slate-400 font-medium dark:text-slate-500">
                                            {t.key === 'explorer' ? 'Start here' : `Reach ${t.min} points`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== Trust ===== */}
                <section className="mx-auto w-full max-w-4xl px-6 py-24 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 dark:text-white">Trust & Fair Play</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div className="space-y-3">
                            <div
                                className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-2 dark:bg-blue-900/20 dark:text-blue-400">
                                <ShieldCheck className="h-5 w-5" /></div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Verification</h3>
                            <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">We use duplicate
                                detection, EXIF checks, and peer review. Points may be revoked for inaccuracies.</p>
                        </div>
                        <div className="space-y-3">
                            <div
                                className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2 dark:bg-emerald-900/20 dark:text-emerald-400">
                                <Camera className="h-5 w-5" /></div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Original Content</h3>
                            <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">Only original
                                photos and text. No AI-generated content, stock photos, or borrowed reviews.</p>
                        </div>
                        <div className="space-y-3">
                            <div
                                className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-2 dark:bg-amber-900/20 dark:text-amber-400">
                                <Info className="h-5 w-5" /></div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Appeals</h3>
                            <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">Think a
                                contribution was misjudged? You can appeal any rejection within 7 days.</p>
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}

/* ============== Small helpers ============== */

function categoryIcon(cat: Activity["category"]) {
    const cls = "h-5 w-5 text-blue-600 dark:text-blue-400";
    const wrap = "h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/50";

    let icon;
    switch (cat) {
        case "Places":
            icon = <MapPin className={cls} />;
            break;
        case "Verification":
            icon = <ShieldCheck className={cls} />;
            break;
        case "Media":
            icon = <Camera className={cls} />;
            break;
        case "Edits":
            icon = <Edit3 className={cls} />;
            break;
        case "Cleanup":
            icon = <Trash2 className={cls} />;
            break;
        case "Community":
            icon = <Users className={cls} />;
            break;
        default:
            icon = <Award className={cls} />;
    }

    return <div className={wrap}>{icon}</div>;
}