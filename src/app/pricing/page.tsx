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

/* ---------------- Pricing model (LOCAL CURRENCY FIRST) ----------------
   Business rule:
   - 1 point = GHS 0.40
   - 100 points = GHS 40 unlocks one full itinerary
   - PSP will charge in GHS; other currencies are display-only equivalents
----------------------------------------------------------------------- */

type Pack = { id: string; points: number; ghs: number; best?: boolean; note?: string };

// Core constants
const GHS_PER_POINT = 0.4;          // 40 pesewas per point
const POINTS_PER_ITINERARY = 100;   // 100 points unlock one itinerary

// ===== Approximate FX (update these periodically or swap for live FX) =====
// Values are "GHS per 1 unit of currency"
const FX_GHS_PER_UNIT: Record<string, number> = {
    GHS: 1,
    USD: 15.4,
    EUR: 16.6,
    GBP: 19.5, // POU (Pound) alias
    NGN: 0.012, // NAR (Naira) alias; i.e., 1 NGN ≈ 0.012 GHS (example)
    KES: 0.12,  // 1 KES ≈ 0.12 GHS (example)
    ZAR: 0.85,  // 1 ZAR ≈ 0.85 GHS (example)
};

// Display labels (include aliases requested: POU→GBP, NAR→NGN)
const CURRENCIES: Array<{ code: string; label: string }> = [
    {code: "GHS", label: "GHS (charged)"},
    {code: "USD", label: "USD"},
    {code: "EUR", label: "EUR"},
    {code: "GBP", label: "GBP (POU)"},
    {code: "NGN", label: "NGN (NAR)"},
    {code: "KES", label: "KES"},
    {code: "ZAR", label: "ZAR"},
];

// Packs expressed in POINTS and priced in GHS using the rule above
const PACKS: Pack[] = [
    {id: "starter", points: 100, ghs: 100 * GHS_PER_POINT, note: "1 trip"},
    {id: "value", points: 300, ghs: 300 * GHS_PER_POINT, best: true, note: "3 trips"},
    {id: "power", points: 1000, ghs: 1000 * GHS_PER_POINT, note: "10 trips"},
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
        const sym =
            code === "GHS" ? "GHS" :
                code === "USD" ? "$" :
                    code === "EUR" ? "€" :
                        code === "GBP" ? "£" :
                            code === "NGN" ? "₦" :
                                code === "KES" ? "KES" :
                                    code === "ZAR" ? "R" : code;
        return `${sym} ${amount.toFixed(2)}`;
    }
}

/** Convert a GHS amount to target currency using FX_GHS_PER_UNIT */
function convertFromGhs(ghs: number, targetCode: string) {
    const ghsPerUnit = FX_GHS_PER_UNIT[targetCode] ?? 1;
    // If 1 unit = X GHS, then amount_in_unit = GHS / X
    return ghsPerUnit > 0 ? ghs / ghsPerUnit : ghs;
}

export default function PricingPage() {
    // Currency for display; charging remains in GHS
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
                            Point-based pricing (GHS)
                        </Badge>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-primary">
                            Pay in Ghana Cedis. Simple & fair.
                        </h1>

                        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                            {POINTS_PER_ITINERARY} points unlock a full itinerary: day-by-day schedule, local insights,
                            transport mapping, printable PDF, shareable link, and calendar export.
                        </p>

                        <div
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card text-card-foreground px-3 py-2 text-sm ring-4 ring-primary/10">
                            <Info className="h-4 w-4 text-muted-foreground"/>
                            <span className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <strong>{baseBundle.points} points</strong>
                <span>= {formatMoney("GHS", baseBundle.ghs)}</span>
                                {displayCur !== "GHS" && (
                                    <span className="text-muted-foreground">
                    (≈ {formatMoney(displayCur, baseDisplayAmount)})
                  </span>
                                )}
              </span>
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2">
                            <label htmlFor="currency" className="text-xs text-muted-foreground">
                                Show equivalents in:
                            </label>
                            <select
                                id="currency"
                                value={displayCur}
                                onChange={(e) => setDisplayCur(e.target.value)}
                                className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                            >
                                {CURRENCIES.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
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
                <Card className="border-border border">
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
                    <h2 className="text-2xl font-semibold tracking-tight">Choose points</h2>
                    <div className="flex items-center gap-2">
                        <label htmlFor="currency-2" className="text-xs text-muted-foreground">
                            Show equivalents in:
                        </label>
                        <select
                            id="currency-2"
                            value={displayCur}
                            onChange={(e) => setDisplayCur(e.target.value)}
                            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                        >
                            {CURRENCIES.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {PACKS.map((pack) => {
                        const perPointGhs = pack.ghs / pack.points;
                        const displayAmount = convertFromGhs(pack.ghs, displayCur);
                        const displayPerPoint = convertFromGhs(perPointGhs, displayCur);

                        return (
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
                                        {pack.points} points{" "}
                                        <span className="text-muted-foreground font-normal">
                      ({Math.round(pack.points / POINTS_PER_ITINERARY)} trip
                                            {pack.points >= POINTS_PER_ITINERARY * 2 ? "s" : ""})
                    </span>
                                    </CardTitle>
                                    <CardDescription className="flex flex-col">
                                        <span>{formatMoney("GHS", pack.ghs)} <span
                                            className="text-muted-foreground">charged</span></span>
                                        {displayCur !== "GHS" && (
                                            <span className="text-muted-foreground">
                        ≈ {formatMoney(displayCur, displayAmount)}
                      </span>
                                        )}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div
                                        className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                                        ~{" "}
                                        {displayCur === "GHS"
                                            ? `${formatMoney("GHS", perPointGhs)}`
                                            : `${formatMoney(displayCur, displayPerPoint)}`
                                        } per point
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
                                        <Link href={`/checkout?points=${pack.points}`}>Buy {pack.points} points</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Single-trip callout */}
                <Card className="mt-6 border-dashed border-border border">
                    <CardContent
                        className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
                        <div>
                            <div className="text-sm font-medium">Just want one trip?</div>
                            <div className="text-sm text-muted-foreground">
                                {POINTS_PER_ITINERARY} points = {formatMoney("GHS", baseBundle.ghs)}{" "}
                                {displayCur !== "GHS" && <> (≈{formatMoney(displayCur, baseDisplayAmount)})</>} for a
                                complete itinerary.
                            </div>
                        </div>
                        <Button asChild>
                            <Link
                                href={`/checkout?points=${POINTS_PER_ITINERARY}`}>Get {POINTS_PER_ITINERARY} points</Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>

            {/* ===== How points work / Earn points ===== */}
            <section className="mx-auto w-full max-w-6xl px-6 pb-12 md:pb-16">
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="border-border border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">How points work</CardTitle>
                            <CardDescription>Simple, flexible, transparent</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Row left="Create a new itinerary" right={`-${POINTS_PER_ITINERARY} points`}/>
                            <Row left="Duplicate/edit an existing itinerary" right="-20 points"/>
                            <Row left="Optional add-ons (offline maps, etc.)" right="-10 to -30 points"/>
                            <Row left="Invite a collaborator" right="Free (beta)"/>
                        </CardContent>
                    </Card>

                    <Card className="border-border border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Earn points</CardTitle>
                            <CardDescription>With Itinero’s crowdsourcing program</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Row left="Refer a friend who completes a trip" right="+25 points"/>
                            <Row left="Contribute verified local info" right="+15–50 points"/>
                            <Row left="Report/place corrections (approved)" right="+10 points"/>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* ===== FAQ & CTA ===== */}
            <section className="mx-auto w-full max-w-4xl px-6 pb-20">
                <h3 className="mb-3 text-2xl font-semibold tracking-tight">Frequently asked</h3>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="fx" className="border-b border-border">
                        <AccordionTrigger>How do you handle currency?</AccordionTrigger>
                        <AccordionContent>
                            We charge in Ghana Cedis (GHS). The currency switcher shows approximate equivalents
                            in KES, USD, EUR, GBP (POU), NGN (NAR), and ZAR for your convenience. Your card or
                            mobile money will be charged the GHS amount.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="topup" className="border-b border-border">
                        <AccordionTrigger>How do point top-ups work?</AccordionTrigger>
                        <AccordionContent>
                            Enter the number of points you want. We convert points to GHS at{" "}
                            <strong>GHS {GHS_PER_POINT.toFixed(2)} per point</strong> and charge that
                            amount. For example, {POINTS_PER_ITINERARY} points costs{" "}
                            <strong>{formatMoney("GHS", baseBundle.ghs)}</strong>.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="credit-expire" className="border-b border-border">
                        <AccordionTrigger>Do points expire?</AccordionTrigger>
                        <AccordionContent>
                            Points don’t expire for 12 months. We’ll notify you well in advance if anything
                            changes.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="refunds" className="border-b border-border">
                        <AccordionTrigger>Refunds?</AccordionTrigger>
                        <AccordionContent>
                            If something breaks or your itinerary fails to generate, we’ll either
                            regenerate it or refund points. Just reach out via support in the app.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="collab" className="border-b border-border">
                        <AccordionTrigger>Can I plan with friends?</AccordionTrigger>
                        <AccordionContent>
                            Collaborative editing is in beta and currently free. You can invite a friend to
                            co-edit shortly after creation.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div
                    className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between rounded-xl border border-border bg-card text-card-foreground px-4 py-3">
                    <p className="text-sm text-muted-foreground">Questions about teams or bulk points?</p>
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