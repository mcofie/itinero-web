"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {Plane, Calendar, Check, Download, Info, Map, Share2, Sparkles, Coins} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Accordion, AccordionItem, AccordionContent, AccordionTrigger} from "@/components/ui/accordion";
import {Separator} from "@/components/ui/separator";
import {ThemeToggle} from "@/components/ThemeToggle";

type Pack = { id: string; credits: number; usd: number; best?: boolean; note?: string };

const CREDIT_USD = 2.99; // price for 100 credits
const CREDITS_PER_BUNDLE = 100;

const PACKS: Pack[] = [
    {id: "starter", credits: 100, usd: 2.99, note: "1 trip"},
    {id: "value", credits: 300, usd: 8.49, best: true, note: "3 trips • save ~5%"},
    {id: "power", credits: 1000, usd: 27.99, note: "10 trips • save ~6%"},
];

function usd(n: number) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2,
        }).format(n);
    } catch {
        return `$${n.toFixed(2)}`;
    }
}

// Display-only approximation
function approxGHS(n: number, rate = 15.4) {
    const v = n * rate;
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "GHS",
            maximumFractionDigits: 0,
        }).format(v);
    } catch {
        return `GHS ${Math.round(v)}`;
    }
}

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState<"usd" | "ghs">("usd");

    const baseBundle = useMemo(
        () => ({
            credits: CREDITS_PER_BUNDLE,
            usd: CREDIT_USD,
            perCreditUsd: CREDIT_USD / CREDITS_PER_BUNDLE,
        }),
        []
    );

    return (
        <main className="min-h-screen flex flex-col bg-background text-foreground">
            {/* ===== Header ===== */}
            <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur">
                <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Plane className="h-4 w-4"/>
            </span>
                        Itinero
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Link href="/pricing" className="hidden sm:block">
                            <Button variant="ghost" className="font-semibold">Pricing</Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="ghost">Log in</Button>
                        </Link>
                        <Link href="/signup">
                            <Button>Sign up</Button>
                        </Link>
                        <ThemeToggle/>
                    </nav>
                </div>
            </header>

            {/* ===== Hero band ===== */}
            <section className="border-y border-border bg-gradient-to-b from-primary/10 via-background to-background">
                <div className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
                    <div className="mx-auto max-w-3xl text-center">
                        <Badge variant="secondary" className="mb-3 gap-1">
                            <Coins className="h-3.5 w-3.5"/>
                            Credit-based pricing
                        </Badge>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-primary">
                            Pay as you go — simple & fair.
                        </h1>

                        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                            100 credits unlock a full itinerary: day-by-day schedule, local insights, transport mapping,
                            printable PDF, shareable link, and calendar export.
                        </p>

                        <div
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card text-card-foreground px-3 py-2 text-sm ring-4 ring-primary/10">
                            <Info className="h-4 w-4 text-muted-foreground"/>
                            <span>
                <strong>{baseBundle.credits} credits</strong> = {usd(baseBundle.usd)} (≈{approxGHS(baseBundle.usd)})
              </span>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <Button asChild size="lg">
                                <Link href="/signup">Get started</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/#">Try the wizard</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== What you get ===== */}
            <section className="mx-auto w-full max-w-6xl px-6 py-10">
                <Card className={"border-border border"}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">What’s included per itinerary</CardTitle>
                        <CardDescription>Everything you need for one great trip.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Feature icon={<Sparkles className="h-4 w-4"/>} label="Smart day-by-day schedule"/>
                        <Feature icon={<Map className="h-4 w-4"/>} label="Local insights & transport mapping"/>
                        <Feature icon={<Download className="h-4 w-4"/>} label="Printable PDF (offline-friendly)"/>
                        <Feature icon={<Share2 className="h-4 w-4"/>} label="Shareable trip link"/>
                        <Feature icon={<Calendar className="h-4 w-4"/>} label="Add events to your calendar"/>
                        <Feature icon={<Check className="h-4 w-4"/>} label="Edit free for 7 days"/>
                    </CardContent>
                </Card>
            </section>

            {/* ===== Pricing grid ===== */}
            <section className="mx-auto w-full max-w-6xl px-6 pb-10 md:pb-14">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight">Choose credits</h2>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "usd" | "ghs")}>
                        <TabsList>
                            <TabsTrigger value="usd">USD</TabsTrigger>
                            <TabsTrigger value="ghs">GHS (approx)</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {PACKS.map((pack) => (
                        <Card
                            key={pack.id}
                            className={`relative border-border border ${pack.best ? "ring-2 ring-primary/30" : ""}`}
                        >
                            {pack.best && (
                                <span
                                    className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Most popular
                </span>
                            )}

                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    {pack.credits} credits{" "}
                                    <span className="text-muted-foreground font-normal">
                    ({Math.round(pack.credits / 100)} trip{pack.credits >= 200 ? "s" : ""})
                  </span>
                                </CardTitle>
                                <CardDescription>
                                    {activeTab === "usd" ? usd(pack.usd) : approxGHS(pack.usd)}{" "}
                                    <span className="text-muted-foreground">per pack</span>
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div
                                    className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                                    ~ {usd(pack.usd / pack.credits)} per credit
                                </div>

                                {pack.note && <div className="text-xs text-muted-foreground">{pack.note}</div>}

                                <Separator/>

                                <ul className="space-y-2 text-sm">
                                    <Li>Full itinerary unlock</Li>
                                    <Li>PDF export & share link</Li>
                                    <Li>Calendar download</Li>
                                    <Li>7-day free edits</Li>
                                </ul>

                                <Button className="w-full" size="sm" asChild>
                                    <Link href={`/checkout?credits=${pack.credits}`}>Buy {pack.credits} credits</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Single-trip callout */}
                <Card className="mt-6 border-dashed border-border border">
                    <CardContent
                        className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
                        <div>
                            <div className="text-sm font-medium">Just want one trip?</div>
                            <div className="text-sm text-muted-foreground">
                                100 credits = {usd(CREDIT_USD)} (≈{approxGHS(CREDIT_USD)}) for a complete itinerary.
                            </div>
                        </div>
                        <Button asChild>
                            <Link href={`/checkout?credits=${CREDITS_PER_BUNDLE}`}>Get 100 credits</Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>

            {/* ===== How credits work / Earn credits ===== */}
            <section className="mx-auto w-full max-w-6xl px-6 pb-12 md:pb-16">
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className={"border-border border"}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">How credits work</CardTitle>
                            <CardDescription>Simple, flexible, transparent</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Row left="Create a new itinerary" right="-100 credits"/>
                            <Row left="Duplicate/edit an existing itinerary" right="-20 credits"/>
                            <Row left="Optional add-ons (offline maps, etc.)" right="-10 to -30 credits"/>
                            <Row left="Invite a collaborator" right="Free (beta)"/>
                        </CardContent>
                    </Card>

                    <Card className={"border-border border"}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Earn credits</CardTitle>
                            <CardDescription>With Itinero’s crowdsourcing program</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Row left="Refer a friend who completes a trip" right="+25 credits"/>
                            <Row left="Contribute verified local info" right="+15–50 credits"/>
                            <Row left="Report/place corrections (approved)" right="+10 credits"/>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* ===== FAQ & CTA ===== */}
            <section className="mx-auto w-full max-w-4xl px-6 pb-20">
                <h3 className="mb-3 text-2xl font-semibold tracking-tight">Frequently asked</h3>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="fx" className={"border-b border-border"}>
                        <AccordionTrigger>How do you handle Ghana Cedi pricing?</AccordionTrigger>
                        <AccordionContent>
                            We show an approximate GHS value for clarity. Your final price is auto-converted at checkout
                            using current FX.
                            Mobile money and local cards are supported.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="credit-expire" className={"border-b border-border"}>
                        <AccordionTrigger>Do credits expire?</AccordionTrigger>
                        <AccordionContent>
                            Credits don’t expire for 12 months. We’ll notify you well in advance if anything changes.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="refunds" className={"border-b border-border"}>
                        <AccordionTrigger>Refunds?</AccordionTrigger>
                        <AccordionContent>
                            If something breaks or your itinerary fails to generate, we’ll either regenerate it or
                            refund credits.
                            Just reach out via support in the app.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="collab" className={"border-b border-border"}>
                        <AccordionTrigger>Can I plan with friends?</AccordionTrigger>
                        <AccordionContent>
                            Collaborative editing is in beta and currently free. You can invite a friend to co-edit
                            shortly after creation.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div
                    className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between rounded-xl border border-border bg-card text-card-foreground px-4 py-3">
                    <p className="text-sm text-muted-foreground">Questions about teams or bulk credits?</p>
                    <Button variant="outline" asChild>
                        <Link href="/contact">Contact sales</Link>
                    </Button>
                </div>
            </section>

            {/* ===== Footer ===== */}
            <footer className="mt-auto border-t border-border bg-background">
                <div
                    className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-muted-foreground flex items-center justify-between">
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

/* ---------- Tiny UI helpers (theme-aware) ---------- */

function Feature({icon, label}: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                {icon}
            </div>
            <span>{label}</span>
        </div>
    );
}

function Li({children}: { children: React.ReactNode }) {
    return (
        <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary"/>
            <span>{children}</span>
        </li>
    );
}

function Row({left, right}: { left: string; right: string }) {
    return (
        <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2">
            <span>{left}</span>
            <span className="font-medium">{right}</span>
        </div>
    );
}