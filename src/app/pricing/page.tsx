"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {
    Plane,
    Calendar,
    Check,
    Download,
    Info,
    Map,
    Share2,
    Sparkles,
    Coins,
    CreditCard,
    Globe,
    Moon,
    Sun
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {Accordion, AccordionItem, AccordionContent, AccordionTrigger} from "@/components/ui/accordion";
import {Separator} from "@/components/ui/separator";
import {ThemeToggle} from "@/components/ThemeToggle";
import {cn} from "@/lib/utils";

/* ---------------- Pricing model (LOCAL CURRENCY FIRST) ---------------- */
type Pack = { id: string; points: number; ghs: number; best?: boolean; note?: string };

const GHS_PER_POINT = 0.4;
const POINTS_PER_ITINERARY = 100;

const FX_GHS_PER_UNIT: Record<string, number> = {
    GHS: 1,
    USD: 15.4,
    EUR: 16.6,
    GBP: 19.5,
    NGN: 0.012,
    KES: 0.12,
    ZAR: 0.85,
};

const CURRENCIES: Array<{ code: string; label: string }> = [
    {code: "GHS", label: "GHS (charged)"},
    {code: "USD", label: "USD"},
    {code: "EUR", label: "EUR"},
    {code: "GBP", label: "GBP"},
    {code: "NGN", label: "NGN"},
    {code: "KES", label: "KES"},
    {code: "ZAR", label: "ZAR"},
];

const PACKS: Pack[] = [
    {id: "starter", points: 100, ghs: 100 * GHS_PER_POINT, note: "Perfect for one trip"},
    {id: "value", points: 300, ghs: 300 * GHS_PER_POINT, best: true, note: "Most popular • 3 trips"},
    {id: "power", points: 1000, ghs: 1000 * GHS_PER_POINT, note: "Best value • 10 trips"},
];

/* ---------------- Format + conversion helpers ---------------- */

function formatMoney(code: string, amount: number) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: code,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${code} ${amount.toFixed(2)}`;
    }
}

function convertFromGhs(ghs: number, targetCode: string) {
    const ghsPerUnit = FX_GHS_PER_UNIT[targetCode] ?? 1;
    return ghsPerUnit > 0 ? ghs / ghsPerUnit : ghs;
}

export default function PricingPage() {
    const [displayCur, setDisplayCur] = useState<string>("GHS");

    const baseBundle = useMemo(
        () => ({
            points: POINTS_PER_ITINERARY,
            ghs: POINTS_PER_ITINERARY * GHS_PER_POINT,
            perPointGhs: GHS_PER_POINT,
        }),
        []
    );

    const baseDisplayAmount = convertFromGhs(baseBundle.ghs, displayCur);

    return (
        <div
            className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 dark:bg-slate-950 dark:text-white dark:selection:bg-blue-900 dark:selection:text-white transition-colors duration-300">

            {/* ===== Header ===== */}
            <header
                className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 dark:border-slate-800">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <Link href="/"
                          className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
            <span
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
              <Plane className="h-4 w-4"/>
            </span>
                        Itinero
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link href="/login"
                              className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors dark:text-slate-400 dark:hover:text-white">Log
                            in</Link>
                        <Link href="/signup">
                            <Button
                                className="rounded-full bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 dark:bg-blue-500 dark:hover:bg-blue-600">Sign
                                up</Button>
                        </Link>
                        <ThemeToggle/>
                    </nav>
                </div>
            </header>

            <main>
                {/* ===== Hero Section ===== */}
                <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
                    {/* Background Blobs */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                        <div
                            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-50/80 blur-3xl mix-blend-multiply opacity-70 animate-blob dark:bg-blue-900/20 dark:mix-blend-screen"></div>
                        <div
                            className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-50/80 blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000 dark:bg-indigo-900/20 dark:mix-blend-screen"></div>
                    </div>

                    <div className="relative mx-auto max-w-4xl px-6 text-center">
                        <div
                            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-sm font-medium text-blue-700 mb-6 backdrop-blur-sm dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
                            <Coins className="h-4 w-4"/>
                            <span>Point-based flexibility</span>
                        </div>

                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6 dark:text-white">
                            Simple pricing for <br className="hidden sm:block"/>
                            <span
                                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">smarter travel.</span>
                        </h1>

                        <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed dark:text-slate-400">
                            Pay only for what you plan. Unlock complete, AI-powered itineraries with points.
                            No monthly subscriptions, no hidden fees.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div
                                className="flex items-center gap-3 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                                <span className="pl-3 text-sm font-medium text-slate-500 dark:text-slate-400">Display currency:</span>
                                <select
                                    id="currency"
                                    value={displayCur}
                                    onChange={(e) => setDisplayCur(e.target.value)}
                                    className="h-9 rounded-xl bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer border-transparent hover:bg-slate-100 transition-colors dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== Pricing Cards ===== */}
                <section className="relative z-10 -mt-12 px-6 pb-24">
                    <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-3 items-start">
                        {PACKS.map((pack) => {
                            const displayAmount = convertFromGhs(pack.ghs, displayCur);
                            return (
                                <div
                                    key={pack.id}
                                    className={cn(
                                        "relative flex flex-col rounded-3xl border bg-white p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900 dark:border-slate-800",
                                        pack.best
                                            ? "border-blue-600 ring-4 ring-blue-600/10 z-10 scale-105 md:scale-110 shadow-blue-900/10 dark:ring-blue-500/20 dark:border-blue-500"
                                            : "border-slate-200 shadow-slate-200/50 dark:shadow-none"
                                    )}
                                >
                                    {pack.best && (
                                        <div
                                            className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-blue-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md dark:bg-blue-500">
                                            Best Value
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pack.points} Points</h3>
                                        <p className="text-sm font-medium text-slate-500 mt-1 dark:text-slate-400">{pack.note}</p>
                                    </div>

                                    <div className="mb-8 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                          {formatMoney(displayCur, displayAmount)}
                        </span>
                                        {displayCur !== 'GHS' && (
                                            <span
                                                className="text-xs text-slate-400 font-medium dark:text-slate-500">approx.</span>
                                        )}
                                    </div>

                                    <ul className="mb-8 space-y-4 flex-1">
                                        <Li>Full itinerary unlock</Li>
                                        <Li>PDF export & sharing</Li>
                                        <Li>Calendar sync</Li>
                                        {pack.best || pack.id === 'power' ? (
                                            <Li>Priority support</Li>
                                        ) : (
                                            <Li faded>Standard support</Li>
                                        )}
                                    </ul>

                                    <Button
                                        asChild
                                        className={cn(
                                            "w-full rounded-xl h-12 font-bold text-base shadow-lg transition-all dark:shadow-none",
                                            pack.best
                                                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25 dark:bg-blue-500 dark:hover:bg-blue-600"
                                                : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/10 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                                        )}
                                    >
                                        <Link href={`/checkout?points=${pack.points}`}>
                                            Buy Points
                                        </Link>
                                    </Button>

                                    {displayCur !== "GHS" && (
                                        <p className="mt-4 text-center text-[10px] text-slate-400 dark:text-slate-500">
                                            Charged as {formatMoney("GHS", pack.ghs)}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ===== Features Grid ===== */}
                <section className="mx-auto max-w-6xl px-6 py-24 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">What you get with
                            points</h2>
                        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                            Every itinerary you unlock is yours forever. Use your points to access premium planning
                            features.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard
                            icon={<Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400"/>}
                            title="AI-Optimized Routes"
                            desc="Day-by-day plans that make sense logistically, saving you time on the road."
                        />
                        <FeatureCard
                            icon={<Map className="h-6 w-6 text-indigo-600 dark:text-indigo-400"/>}
                            title="Interactive Maps"
                            desc="Visualise your trip with pins for every stop, hotel, and activity."
                        />
                        <FeatureCard
                            icon={<Download className="h-6 w-6 text-emerald-600 dark:text-emerald-400"/>}
                            title="Offline PDF"
                            desc="Download a beautiful, print-ready version of your trip for when signal drops."
                        />
                        <FeatureCard
                            icon={<Share2 className="h-6 w-6 text-purple-600 dark:text-purple-400"/>}
                            title="Easy Sharing"
                            desc="Send a read-only link to friends or family so they can follow along."
                        />
                        <FeatureCard
                            icon={<Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400"/>}
                            title="Calendar Sync"
                            desc="Push your itinerary directly to Google Calendar, Outlook, or Apple Calendar."
                        />
                        <FeatureCard
                            icon={<Check className="h-6 w-6 text-slate-600 dark:text-slate-400"/>}
                            title="7-Day Free Edits"
                            desc="Make tweaks to your unlocked itinerary for a week without spending extra points."
                        />
                    </div>
                </section>

                {/* ===== FAQ ===== */}
                <section className="bg-slate-50 py-24 dark:bg-slate-900/50">
                    <div className="mx-auto max-w-3xl px-6">
                        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center dark:text-white">Frequently
                            Asked Questions</h2>

                        <Accordion type="single" collapsible className="w-full space-y-4">
                            <FAQItem value="currency" question="How does the currency conversion work?">
                                We process all payments in <strong>Ghana Cedis (GHS)</strong>. The currency dropdown
                                lets you see estimated prices in USD, EUR, etc., based on current rates, but your card
                                will be charged the GHS amount.
                            </FAQItem>
                            <FAQItem value="expiry" question="Do my points expire?">
                                Points are valid for <strong>12 months</strong> from the date of purchase. We'll send
                                you a reminder before they expire so you can use them up!
                            </FAQItem>
                            <FAQItem value="refunds" question="Can I get a refund if I'm not happy?">
                                If an itinerary fails to generate or has major issues, please contact support. We handle
                                refunds and point restorations on a case-by-case basis to ensure you're satisfied.
                            </FAQItem>
                            <FAQItem value="topup" question="Can I top up just a few points?">
                                Currently, we offer the fixed point bundles shown above. This helps us keep transaction
                                fees low and pass the savings on to you.
                            </FAQItem>
                        </Accordion>

                        <div className="mt-16 text-center">
                            <p className="text-slate-600 mb-4 dark:text-slate-400">Still have questions?</p>
                            <Button variant="outline"
                                    className="rounded-full border-slate-300 text-slate-700 hover:bg-white hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                                    asChild>
                                <Link href="/contact">Contact Support</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* ===== Footer ===== */}
                <footer className="border-t border-slate-200 bg-white py-12 dark:bg-slate-950 dark:border-slate-800">
                    <div
                        className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                            <div className="h-6 w-6 rounded bg-slate-900 dark:bg-white"></div>
                            Itinero
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            © {new Date().getFullYear()} Itinero Inc. All rights reserved.
                        </div>
                        <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">Terms</Link>
                            <Link href="/privacy"
                                  className="hover:text-blue-600 dark:hover:text-blue-400">Privacy</Link>
                        </div>
                    </div>
                </footer>

            </main>
        </div>
    );
}

/* ---------- UI Helpers ---------- */

function Li({children, faded = false}: { children: React.ReactNode; faded?: boolean }) {
    return (
        <li className={cn("flex items-center gap-3 text-sm font-medium", faded ? "text-slate-400 dark:text-slate-600" : "text-slate-700 dark:text-slate-200")}>
            <div
                className={cn("flex h-5 w-5 items-center justify-center rounded-full", faded ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600" : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400")}>
                <Check className="h-3 w-3"/>
            </div>
            {children}
        </li>
    );
}

function FeatureCard({icon, title, desc}: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div
            className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-slate-900 mb-2 dark:text-white">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">{desc}</p>
            </div>
        </div>
    )
}

function FAQItem({value, question, children}: { value: string, question: string, children: React.ReactNode }) {
    return (
        <AccordionItem value={value}
                       className="border border-slate-200 rounded-2xl px-6 bg-white data-[state=open]:border-blue-200 data-[state=open]:bg-blue-50/30 transition-all dark:bg-slate-900 dark:border-slate-800 dark:data-[state=open]:border-blue-900 dark:data-[state=open]:bg-blue-900/10">
            <AccordionTrigger
                className="text-base font-semibold text-slate-800 hover:no-underline py-5 dark:text-slate-200">
                {question}
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 leading-relaxed pb-6 dark:text-slate-400">
                {children}
            </AccordionContent>
        </AccordionItem>
    )
}