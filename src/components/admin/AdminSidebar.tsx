"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import {
    LayoutDashboard,
    Globe,
    MapPin,
    History as HistoryIcon,
    ArrowLeft,
    LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AdminSidebar({
    userEmail,
    avatarUrl,
    fullName,
    className
}: {
    userEmail?: string,
    avatarUrl?: string | null,
    fullName?: string | null,
    className?: string
}) {
    const pathname = usePathname();
    const router = useRouter();

    const initials = (email?: string | null, name?: string | null) => {
        if (name) {
            const parts = name.split(" ");
            if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
            return parts[0][0].toUpperCase();
        }
        return (email?.[0] ?? "A").toUpperCase();
    };
    const handleLogout = async () => {
        const sb = getSupabaseBrowser();
        await sb.auth.signOut();
        window.location.href = "/admin/login";
    };

    // Helper to check if a link is active.
    const isActive = (path: string) => {
        if (path === "/admin/itinero" && pathname?.endsWith("/admin/itinero")) return true;
        return pathname?.includes(path) && path !== "/admin/itinero";
    };

    return (
        <aside className={cn("w-[280px] flex-col bg-[#0F172A] text-slate-400 border-r border-slate-800 transition-all relative z-20 shadow-xl h-screen sticky top-0 font-sans", className)}>
            <div className="flex h-20 items-center px-6 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-blue-500/20 shadow-lg ring-1 ring-white/10">
                        <LayoutDashboard className="h-5 w-5" />
                    </div>
                    Itinero
                </div>
            </div>

            <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
                <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest mt-4">
                    Overview
                </div>
                <Button
                    asChild
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 font-medium h-11 px-3 rounded-lg transition-all duration-200",
                        isActive("/admin/itinero")
                            ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    )}
                >
                    <Link href="/admin/itinero">
                        <LayoutDashboard className="h-[18px] w-[18px]" />
                        Dashboard
                    </Link>
                </Button>

                <div className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest mt-6">
                    Management
                </div>
                <Button
                    asChild
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 font-medium h-11 px-3 rounded-lg transition-all duration-200",
                        isActive("/admin/itinero/destinations")
                            ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    )}
                >
                    <Link href="/admin/itinero/destinations">
                        <Globe className="h-[18px] w-[18px]" />
                        Destinations
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 font-medium h-11 px-3 rounded-lg transition-all duration-200",
                        isActive("/admin/itinero/places")
                            ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    )}
                >
                    <Link href="/admin/itinero/places">
                        <MapPin className="h-[18px] w-[18px]" />
                        Places
                    </Link>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 font-medium h-11 px-3 rounded-lg transition-all duration-200",
                        isActive("/admin/itinero/history")
                            ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    )}
                >
                    <Link href="/admin/itinero/history">
                        <HistoryIcon className="h-[18px] w-[18px]" />
                        History & Content
                    </Link>
                </Button>
            </nav>

            <div className="p-4 border-t border-slate-800 bg-[#0b1120] shrink-0 space-y-4">
                {userEmail && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-800 overflow-hidden">
                        <Avatar className="h-8 w-8 rounded-lg shadow-lg ring-1 ring-white/10">
                            <AvatarImage src={avatarUrl ?? ""} />
                            <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">
                                {initials(userEmail, fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-200 truncate">
                                {fullName || "Admin"}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate" title={userEmail}>
                                {userEmail}
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <Link href="/" className="block">
                        <Button variant="ghost" className="w-full gap-3 justify-start text-slate-400 hover:text-white hover:bg-slate-800 h-9 px-3 text-sm">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full gap-3 justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 px-3 text-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </aside>
    );
}
