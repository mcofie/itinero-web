"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
    Check,
    Globe,
    Zap,
    ChevronDown,
    ShieldCheck,
    Smartphone,
    CreditCard,
    ArrowRight,
    ExternalLink,
    HelpCircle,
    BadgeCheck,
    MessageCircle,
    FileText,
    Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";

/* ---------------- Pricing model ---------------- */
type Pack = {
    id: string;
    points: number;
    ghs: number;
    best?: boolean;
    tag: string;
};

const GHS_PER_POINT = 0.4;

const FX_GHS_PER_UNIT: Record<string, number> = {
    GHS: 1,
    USD: 15.4,
    EUR: 16.6,
    GBP: 19.5,
    NGN: 0.012,
    KES: 0.12,
    ZAR: 0.85,
};

const CURRENCIES: Array<{ code: string; label: string; symbol: string }> = [
    { code: "GHS", label: "Ghanaian Cedi", symbol: "GH₵" },
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "GBP", label: "British Pound", symbol: "£" },
    { code: "NGN", label: "Nigerian Naira", symbol: "₦" },
    { code: "KES", label: "Kenyan Shilling", symbol: "KSh" },
    { code: "ZAR", label: "South African Rand", symbol: "R" },
];

const PACKS: Pack[] = [
    { id: "starter", points: 100, ghs: 100 * GHS_PER_POINT, tag: "One-off" },
    { id: "value", points: 300, ghs: 300 * GHS_PER_POINT, best: true, tag: "Popular" },
    { id: "power", points: 1000, ghs: 1000 * GHS_PER_POINT, tag: "Pro" },
];

/* ---------------- Formatting ---------------- */

function formatMoney(code: string, amount: number) {
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: code,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${code} ${Math.round(amount)}`;
    }
}

function convertFromGhs(ghs: number, targetCode: string) {
    const ghsPerUnit = FX_GHS_PER_UNIT[targetCode] ?? 1;
    return ghsPerUnit > 0 ? ghs / ghsPerUnit : ghs;
}

export default function PricingClient() {
    const t = useTranslations("Pricing");
    const [displayCur, setDisplayCur] = useState<string>("GHS");

    const activeCurrency = CURRENCIES.find(c => c.code === displayCur) || CURRENCIES[0];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">

            {/* --- Hero / Header (Resources Style) --- */}
            <div className="bg-slate-900 pt-24 pb-32 text-white relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop"
                        alt="Pricing background"
                        fill
                        className="object-cover opacity-20 blur-sm scale-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-900/80 to-slate-950" />
                </div>

                <div className="container mx-auto px-6 relative z-10 max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 text-blue-400 font-bold tracking-widest uppercase text-xs mb-3">
                                <CreditCard className="h-4 w-4" />
                                Premium Access Hub
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                                Power Your Adventures
                            </h1>
                            <p className="text-slate-400 max-w-xl text-lg">
                                Purchase points to unlock AI-powered itineraries, professional PDF exports, and deep local intelligence.
                            </p>
                        </div>

                        <div className="w-full md:w-auto">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                                Billing Currency
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full md:w-[280px] h-12 bg-white/10 border-white/10 text-white backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors focus:ring-blue-500 font-medium justify-between">
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4" />
                                            {activeCurrency.label}
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 rounded-xl">
                                    {CURRENCIES.map((c) => (
                                        <DropdownMenuItem
                                            key={c.code}
                                            onClick={() => setDisplayCur(c.code)}
                                            className="cursor-pointer"
                                        >
                                            <span className="mr-2 font-mono text-slate-400">{c.symbol}</span>
                                            {c.label} ({c.code})
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Packs Grid --- */}
            <div className="container mx-auto px-6 -mt-20 relative z-20 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PACKS.map((pack) => {
                        const displayAmount = convertFromGhs(pack.ghs, displayCur);
                        return (
                            <div key={pack.id} className={cn(
                                "group relative flex flex-col p-8 rounded-3xl border bg-white dark:bg-slate-900 shadow-xl transition-all",
                                pack.best ? "border-blue-500 ring-4 ring-blue-500/5" : "border-slate-200 dark:border-slate-800"
                            )}>
                                {pack.best && (
                                    <div className="absolute -top-3 left-8">
                                        <Badge className="bg-blue-600 text-white border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}

                                <div className="flex flex-col mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <Zap className="h-6 w-6" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                            {pack.tag}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                        {pack.points} Points
                                    </h3>
                                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                                        {formatMoney(displayCur, displayAmount)}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8 flex-1">
                                    <FeatureItem desc={t("Features.intelligence.title")} />
                                    <FeatureItem desc={t("Features.budget.title")} />
                                    <FeatureItem desc={t("Features.exports.title")} />
                                    <FeatureItem desc={t("Features.networks.title")} />
                                    {pack.id === "power" && (
                                        <FeatureItem desc={t("Features.support.title")} />
                                    )}
                                </div>

                                <Button asChild className={cn(
                                    "w-full h-12 rounded-xl font-bold transition-all",
                                    pack.best ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                                )}>
                                    <Link href={`/checkout?points=${pack.points}`} className="flex items-center justify-center gap-2">
                                        Buy Now
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        );
                    })}
                </div>

                {/* --- Feature Intelligence Breakdown --- */}
                <div className="mt-20">
                    <div className="flex items-center gap-3 mb-8">
                        <BadgeCheck className="h-5 w-5 text-blue-500" />
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What's included?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AppCard
                            icon={Smartphone}
                            title="Interactive Maps"
                            desc="Real-time navigation and offline destination guides."
                            color="bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        />
                        <AppCard
                            icon={FileText}
                            title="PDF Exports"
                            desc="Embassy-ready itinerary documents for visa applications."
                            color="bg-blue-500 text-white"
                        />
                        <AppCard
                            icon={ShieldCheck}
                            title="Safe Lists"
                            desc="Vetted restaurants, local secret spots, and emergency info."
                            color="bg-emerald-500 text-white"
                        />
                        <AppCard
                            icon={Headphones}
                            title="Smart Support"
                            desc="Access to our community intelligence and expert advice."
                            color="bg-amber-500 text-white"
                        />
                    </div>
                </div>

                {/* --- FAQ Briefing --- */}
                <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <HelpCircle className="h-5 w-5 text-blue-500" />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Common Questions</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <InfoCard
                                icon={Globe}
                                title={t("FAQ.currency.q")}
                                desc={t("FAQ.currency.a")}
                            />
                            <InfoCard
                                icon={Zap}
                                title={t("FAQ.expiry.q")}
                                desc={t("FAQ.expiry.a")}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase mb-4">
                                <MessageCircle className="h-4 w-4" />
                                Expert Support
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Need a custom plan?</h3>
                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                For group bookings, corporate travel, or gift cards, contact our team for specialized assistance.
                            </p>
                            <Button variant="outline" className="w-full text-xs h-10 border-slate-200">
                                Contact Team <ExternalLink className="h-3 w-3 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* --- Components --- */

function FeatureItem({ desc }: { desc: string }) {
    return (
        <div className="flex items-start gap-3">
            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <span className="text-sm text-slate-600 dark:text-slate-400 leading-tight">{desc}</span>
        </div>
    );
}

function AppCard({ icon: Icon, title, desc, color }: any) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 transition-colors">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4 shadow-md", color)}>
                <Icon className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
        </div>
    );
}

function InfoCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4 mb-3">
                <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h4>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {desc}
            </p>
        </div>
    );
}
