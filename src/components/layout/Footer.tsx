"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Plane, Heart } from "lucide-react";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
    const tFooter = useTranslations("Footer");
    const year = new Date().getFullYear();

    return (
        <footer className={cn("border-t border-slate-200 bg-white py-16 dark:bg-slate-950 dark:border-slate-800 mt-20", className)}>
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 dark:text-white group">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                                <Plane className="h-4 w-4" />
                            </div>
                            Itinero
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center md:text-left leading-relaxed">
                            Plan smarter trips with AI. Build complete itineraries in minutes.
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-6">
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]">
                                {tFooter("terms")}
                            </Link>
                            <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]">
                                {tFooter("privacy")}
                            </Link>
                            <Link href="/destinations" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]">
                                {tFooter("destinations")}
                            </Link>
                            <Link href="/rewards" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]">
                                {tFooter("rewards")}
                            </Link>
                            <Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]">
                                {tFooter("pricing")}
                            </Link>
                            <Link href="/resources" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest text-[10px]">
                                Resources
                            </Link>
                            <div className="flex items-center gap-1.5 text-slate-400 cursor-default uppercase tracking-widest text-[10px]">
                                {tFooter("madeWith")}{" "}
                                <Heart className="h-3 w-3 text-rose-500 fill-rose-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <LocaleSwitcher />
                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                © {year} Itinero Inc.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
