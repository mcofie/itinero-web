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
    children?: React.ReactNode;
};

export function ParallaxHero({
    title,
    heroUrl,
    startDate,
    estCost,
    currency = "USD",
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
            className="relative h-[60vh] min-h-[400px] w-full overflow-hidden border-b border-slate-200 dark:border-slate-800"
        >
            {/* Background Image with Parallax */}
            <motion.div
                className="absolute inset-0 bg-slate-900"
                style={{ y, scale }}
            >
                <Image
                    src={heroUrl}
                    alt={title}
                    fill
                    className="object-cover opacity-80"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </motion.div>

            {/* Content Container */}
            <motion.div
                className="absolute inset-0 mx-auto flex max-w-6xl w-full flex-col justify-between p-6 md:p-10"
                style={{ opacity }}
            >
                {/* Top Bar */}
                <div className="flex justify-between items-start">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 transition-all"
                    >
                        <Link href="/trips">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Trips
                        </Link>
                    </Button>

                    {timeLeft && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
                            <Badge
                                variant="secondary"
                                className="rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest shadow-lg"
                            >
                                <Clock className="mr-2 h-3.5 w-3.5 text-blue-400" />
                                {timeLeft}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Bottom Content */}
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        {startDate && (
                            <Badge
                                variant="outline"
                                className="rounded-full border-white/30 bg-white/10 px-3 py-1 text-white backdrop-blur-md font-medium"
                            >
                                <CalendarDays className="mr-2 h-3.5 w-3.5" />
                                {formatDateRange(startDate, undefined)}
                            </Badge>
                        )}
                        {typeof estCost === "number" && (
                            <Badge
                                variant="outline"
                                className="rounded-full border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-emerald-100 backdrop-blur-md font-medium"
                            >
                                <DollarSign className="mr-1 h-3.5 w-3.5" />
                                Est. {currency} {estCost}
                            </Badge>
                        )}
                    </div>

                    <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-white drop-shadow-xl leading-[1.1] md:text-7xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {title}
                    </h1>

                    {children && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                            {children}
                        </div>
                    )}
                </div>
            </motion.div>
        </section>
    );
}
