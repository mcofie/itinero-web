// src/app/rewards/page.tsx
"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {
    Card, CardHeader, CardTitle, CardContent, CardFooter,
} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Separator} from "@/components/ui/separator";
import {
    Plane, Award, ShieldCheck, MapPin, Camera, Edit3, Trash2, Users, Info,
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
    {key: "explorer", name: "Explorer", min: 0, perks: ["Starter badge", "Monthly challenges"]},
    {key: "guide", name: "Guide", min: 500, perks: ["Profile flair", "Early feature access"]},
    {key: "pathfinder", name: "Pathfinder", min: 2000, perks: ["Beta invites", "Priority reviews"]},
    {key: "ambassador", name: "Ambassador", min: 6000, perks: ["Itinero merch", "Invite-only programs"]},
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
            .map((k) => ({category: k as Activity["category"], items: map.get(k)!}));
    }, []);

    return (
        <main className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
            {/* ===== Header (match landing) ===== */}
            <header
                className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-white">
              <Plane className="h-4 w-4"/>
            </span>
                        Itinero
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Link href="/pricing" className="hidden sm:block">
                            <Button variant="ghost">Pricing</Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="ghost">Log in</Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Sign up</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* ===== Hero band (landing look & feel) ===== */}
            <section className="bg-blue-50 dark:bg-slate-900 border-y border-blue-100 dark:border-slate-800">
                <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
                    <div className="mx-auto max-w-3xl text-center">
                        <Badge variant="secondary" className="mb-3 gap-1">
                            <Award className="h-3.5 w-3.5"/>
                            Itinero Rewards
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-blue-600 dark:text-white">
                            Earn points by improving travel for everyone.
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-slate-700 dark:text-slate-300">
                            Help keep places trusted & up-to-date. Contribute verified data, photos, and fixes — unlock
                            perks as you go.
                        </p>

                        <div
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border bg-white/70 dark:bg-slate-950/70 px-3 py-2 text-sm ring-4 ring-blue-100 dark:ring-slate-800">
                            <Info className="h-4 w-4 text-slate-500 dark:text-slate-400"/>
                            <span>Points are awarded after automated & human checks pass.</span>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Link href="/signup">Start contributing</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg"
                                    className="border-slate-300 dark:border-slate-700">
                                <Link href="/about">See contributor guide</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Tier summary ===== */}
            <section className="mx-auto w-full max-w-6xl px-6 py-10">
                <div className="mb-10 grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Your progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-semibold tabular-nums">{points.toLocaleString()} pts
                                    </div>
                                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        Tier: <span className="font-medium">{tier.name}</span>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-slate-600 dark:text-slate-400">
                                    {nextTier ? (
                                        <>
                                            Next: <span className="font-medium">{nextTier.name}</span>{" "}
                                            <span
                                                className="ml-1">({(nextTier.min - points).toLocaleString()} pts left)</span>
                                        </>
                                    ) : (
                                        <>Top tier reached 🎉</>
                                    )}
                                </div>
                            </div>
                            <Progress value={progressPct} className="mt-3"/>
                        </CardContent>
                        <CardFooter className="flex flex-wrap gap-2">
                            {TIERS.map((t) => (
                                <Badge
                                    key={t.key}
                                    variant={t.key === tier.key ? "default" : "secondary"}
                                    className="rounded-full"
                                >
                                    {t.name} {t.key === tier.key && "• current"}
                                </Badge>
                            ))}
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">How it works</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4"/> Contribute reliable
                                info.
                            </div>
                            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4"/> We verify
                                accuracy.
                            </div>
                            <div className="flex items-center gap-2"><Award className="h-4 w-4"/> Earn points & unlock
                                perks.
                            </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Add a place</Button>
                            <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-700">
                                Verify updates
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </section>

            {/* ===== Ways to earn ===== */}
            <section className="mx-auto w-full max-w-6xl px-6">
                <h2 className="text-2xl font-semibold tracking-tight">Ways to earn</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Points are credited when contributions pass automated and human checks. Some items have daily caps
                    to keep things fair.
                </p>

                <div className="mt-5 space-y-8">
                    {grouped.map(({category, items}) => (
                        <Card key={category} className="border-slate-200/70 dark:border-slate-800/70">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {categoryIcon(category)}
                                        <CardTitle className="text-base">{category}</CardTitle>
                                    </div>
                                    <Badge variant="outline">
                                        {items.reduce((a, b) => a + b.points, 0)} pts potential
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="divide-y">
                                {items.map((a) => (
                                    <div key={a.id} className="grid gap-2 py-4 md:grid-cols-[1fr_auto] md:items-center">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-medium">{a.label}</span>
                                                {a.capPerDay ? (
                                                    <Badge variant="secondary"
                                                           className="h-5 rounded-full px-2 text-[10px]">
                                                        max {a.capPerDay}/day
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{a.desc}</p>
                                            {a.note && (
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400/80">{a.note}</p>
                                            )}
                                        </div>
                                        <div className="text-right md:pl-6">
                                            <div className="text-lg font-semibold tabular-nums">{a.points} pts</div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ===== Rules / Trust ===== */}
            <section className="mx-auto w-full max-w-6xl px-6 mt-10">
                <Card className="border-slate-200/70 dark:border-slate-800/70">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Trust & fair use</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2 text-slate-600 dark:text-slate-400">
                        <div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">Verification: </span>
                            We use duplicate detection, EXIF checks, temporal signals, and peer review. Points may be
                            revoked for inaccurate or low-effort submissions.
                        </div>
                        <div>
                            <span
                                className="font-medium text-slate-900 dark:text-slate-100">Original media only: </span>
                            No AI/stock/borrowed content. We may request proof for edge cases.
                        </div>
                        <div>
                            <span className="font-medium text-slate-900 dark:text-slate-100">Appeals: </span>
                            If you think a contribution was misjudged, you can appeal within 7 days.
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-700">
                            Read full policy
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Appeal a decision
                        </Button>
                    </CardFooter>
                </Card>
            </section>

            {/* ===== Tiers & perks ===== */}
            <section className="mx-auto w-full max-w-6xl px-6 mt-10">
                <h2 className="text-2xl font-semibold tracking-tight">Tiers & perks</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Unlock more recognition and benefits as your impact grows.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {TIERS.map((t) => (
                        <Card key={t.key} className={t.key === tier.key ? "border-blue-500/50" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center justify-between">
                                    {t.name}
                                    <Badge variant={t.key === tier.key ? "default" : "secondary"}>
                                        {t.min.toLocaleString()}+
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                {t.perks.map((p, i) => (
                                    <div key={i}>• {p}</div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <Separator className="my-10 mx-6 max-w-6xl self-center"/>

            {/* ===== CTA strip ===== */}
            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Ready to contribute? Start with a nearby place, or verify a recent update.
                    </p>
                    <div className="flex gap-2">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add a place</Button>
                        <Button variant="outline" className="border-slate-300 dark:border-slate-700">
                            Verify updates
                        </Button>
                    </div>
                </div>
            </section>

            {/* ===== Footer (match landing) ===== */}
            <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div
                    className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-slate-600 dark:text-slate-400 flex items-center justify-between">
                    <div>© {new Date().getFullYear()} Itinero</div>
                    <div className="flex gap-4">
                        <Link href="/pricing">Pricing</Link>
                        <Link href="/rewards">Rewards</Link>
                        <Link href="/about">About</Link>
                        <Link href="/terms">Terms</Link>
                    </div>
                </div>
            </footer>
        </main>
    );
}

/* ============== Small helpers ============== */

function categoryIcon(cat: Activity["category"]) {
    const cls = "h-4 w-4 text-blue-600 dark:text-blue-400";
    switch (cat) {
        case "Places":
            return <MapPin className={cls}/>;
        case "Verification":
            return <ShieldCheck className={cls}/>;
        case "Media":
            return <Camera className={cls}/>;
        case "Edits":
            return <Edit3 className={cls}/>;
        case "Cleanup":
            return <Trash2 className={cls}/>;
        case "Community":
            return <Users className={cls}/>;
        default:
            return <Award className={cls}/>;
    }
}