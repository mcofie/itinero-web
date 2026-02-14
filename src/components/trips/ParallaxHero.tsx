"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, CalendarDays, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/trip-dates";

type Props = {
    title: string;
    heroUrl: string;
    startDate?: string;
    estCost?: number;
    currency?: string;
    interests?: string[];
    children?: React.ReactNode;
};

const getInterestEmoji = (interest: string) => {
    const lower = interest.toLowerCase();
    if (lower.includes("hiking")) return "🥾";
    if (lower.includes("food") || lower.includes("dining")) return "🍽️";
    if (lower.includes("shopping")) return "🛍️";
    if (lower.includes("art")) return "🎨";
    if (lower.includes("wildlife") || lower.includes("nature")) return "🐾";
    if (lower.includes("culture")) return "🏛️";
    if (lower.includes("history")) return "📜";
    if (lower.includes("beach")) return "🏖️";
    if (lower.includes("nightlife")) return "🌙";
    if (lower.includes("photography")) return "📸";
    if (lower.includes("adventure")) return "🧗";
    if (lower.includes("wellness") || lower.includes("relaxation")) return "🧘";
    return "✨";
};

export function ParallaxHero({
    title,
    heroUrl,
    startDate,
    estCost,
    currency = "USD",
    interests,
    children,
}: Props) {
    const ref = React.useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Parallax effect: Move image slower than scroll
    const y = useTransform(scrollY, [0, 500], [0, 250]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

    // Countdown logic
    const [timeLeft, setTimeLeft] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!startDate) return;

        const target = new Date(startDate).getTime();

        const update = () => {
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft(null); // Trip started or passed
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h to go`);
            } else {
                setTimeLeft(`${hours}h to go`);
            }
        };

        update();
        const timer = setInterval(update, 1000 * 60); // Update every minute
        return () => clearInterval(timer);
    }, [startDate]);

    return (
        <section
            ref={ref}
            className="relative h-[60vh] md:h-[65vh] min-h-[450px] md:min-h-[500px] w-full overflow-hidden"
        >
            {/* Background Image with Parallax */}
            <motion.div
                className="absolute inset-0 bg-slate-950"
                style={{ y, scale }}
            >
                <Image
                    src={heroUrl}
                    alt={title}
                    fill
                    className="object-cover opacity-80 scale-105"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
            </motion.div>

            {/* Content Container */}
            <motion.div
                className="absolute inset-0 mx-auto flex max-w-6xl w-full flex-col justify-between p-6 md:p-12 pb-24 md:pb-40"
                style={{ opacity }}
            >
                {/* Top Bar */}
                <div className="flex justify-between items-center relative z-10 gap-3">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/20 transition-all font-medium py-5 md:py-6 px-4 md:px-6 h-auto"
                    >
                        <Link href="/trips">
                            <ArrowLeft className="mr-2 md:mr-3 h-4 w-4" /> <span className="text-xs md:text-sm">Back to Trips</span>
                        </Link>
                    </Button>

                    {timeLeft && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
                            <Badge
                                variant="secondary"
                                className="rounded-full bg-blue-500/20 text-blue-400 backdrop-blur-xl border border-blue-500/30 px-3 md:px-5 py-1.5 md:py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-2xl"
                            >
                                <Clock className="mr-1.5 md:mr-2 h-3 w-3 md:h-3.5 md:w-3.5" />
                                {timeLeft}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Bottom Content */}
                <div className="space-y-4 md:space-y-6 relative z-10">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="max-w-4xl text-4xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl leading-[1.1] md:leading-[1.05] transition-all">
                            {title}
                        </h1>

                        {interests && interests.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 md:gap-2 mt-4 md:mt-6">
                                {interests.map((interest, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className="border-white/20 bg-white/10 text-white backdrop-blur-sm px-2.5 md:px-4 py-1.5 text-[9px] md:text-[11px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-1.5 md:gap-2"
                                    >
                                        <span className="text-sm md:text-base">{getInterestEmoji(interest)}</span>
                                        {interest}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        {startDate && (
                            <div className="flex items-center gap-1.5 md:gap-2 rounded-full border border-white/10 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 text-slate-300 backdrop-blur-md font-bold text-[10px] md:text-xs uppercase tracking-widest">
                                <CalendarDays className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-400" />
                                {formatDateRange(startDate, undefined)}
                            </div>
                        )}
                        {typeof estCost === "number" && (
                            <div className="flex items-center gap-1.5 md:gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 md:px-4 py-1.5 md:py-2 text-emerald-400 backdrop-blur-md font-bold text-[10px] md:text-xs uppercase tracking-widest">
                                <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                Est. {currency} {estCost}
                            </div>
                        )}
                        {children && (
                            <div className="w-full md:w-auto md:ml-2">
                                {children}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
