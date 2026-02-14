"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    LogOut,
    User,
    Calendar,
    Star,
    Plus,
    Menu,
    Sparkles,
    Plane,
    CreditCard,
    Bell,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

type Props = {
    userEmail?: string | null;
    avatarUrl?: string | null;
    fullName?: string | null;
    hasPreview?: boolean;
    onLogout?: () => void;
};

export function Navbar({ userEmail, avatarUrl, fullName, hasPreview, onLogout }: Props) {
    const pathname = usePathname();
    const tNav = useTranslations("Navigation");
    const tActions = useTranslations("Actions");

    const initials = (email?: string | null, name?: string | null) => {
        if (name) {
            const parts = name.split(" ");
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return parts[0][0].toUpperCase();
        }
        return (email?.[0] ?? "U").toUpperCase() +
            (email?.split("@")?.[0]?.[1]?.toUpperCase() ?? "");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 dark:bg-slate-950 dark:border-slate-800">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* Left: Brand & Mobile Menu */}
                <div className="flex items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden h-9 w-9 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] p-0 border-r-slate-200 dark:border-slate-800 dark:bg-slate-950">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Navigation Menu</SheetTitle>
                                <SheetDescription>
                                    Access your trips, rewards, and profile.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <Link href={userEmail ? "/trips" : "/"} className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                                        <Plane className="h-4 w-4" />
                                    </span>
                                    Itinero
                                </Link>
                            </div>
                            <div className="p-4 flex flex-col gap-1">
                                {userEmail ? (
                                    <>
                                        <MobileNavItem href="/trips" active={pathname?.startsWith("/trips")}>
                                            <Calendar className="mr-3 h-4 w-4" /> {tNav("trips")}
                                        </MobileNavItem>
                                        <MobileNavItem href="/preview" active={pathname === "/preview"}>
                                            <Sparkles className="mr-3 h-4 w-4" /> {tNav("preview")}
                                            {hasPreview && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
                                        </MobileNavItem>
                                        <MobileNavItem href="/rewards" active={pathname === "/rewards"}>
                                            <Star className="mr-3 h-4 w-4" /> {tNav("rewards")}
                                        </MobileNavItem>
                                        <MobileNavItem href="/photobooks" active={pathname?.startsWith("/photobooks")}>
                                            <Sparkles className="mr-3 h-4 w-4" />
                                            <div className="flex items-center gap-2">
                                                {tNav("photobook")}
                                                <span className="bg-rose-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full tracking-widest leading-none">NEW</span>
                                            </div>
                                        </MobileNavItem>
                                        <MobileNavItem href="/profile" active={pathname === "/profile"}>
                                            <User className="mr-3 h-4 w-4" /> {tNav("profile")}
                                        </MobileNavItem>
                                        <div className="mt-4 p-2">
                                            <Button className="w-full rounded-full bg-blue-600 font-semibold" asChild>
                                                <Link href="/trip-maker">
                                                    <Plus className="mr-2 h-4 w-4" /> {tActions("newTrip")}
                                                </Link>
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mt-4 flex flex-col gap-2 p-2">
                                            <Button className="w-full rounded-full bg-blue-600 font-semibold text-white" asChild>
                                                <Link href="/login">{tNav("getStarted")}</Link>
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href={userEmail ? "/trips" : "/"} className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600 dark:text-blue-400">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                            <Plane className="h-4 w-4" />
                        </span>
                        Itinero
                    </Link>
                </div>

                {/* Center: Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {userEmail ? (
                        <>
                            <NavItem href="/preview" active={pathname === "/preview"}>
                                {tNav("preview")}
                                {hasPreview && <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                            </NavItem>
                            <NavItem href="/trips" active={pathname?.startsWith("/trips")}>
                                {tNav("trips")}
                            </NavItem>
                            <NavItem href="/rewards" active={pathname === "/rewards"}>
                                {tNav("rewards")}
                            </NavItem>
                            <NavItem href="/photobooks" active={pathname?.startsWith("/photobooks")}>
                                <div className="flex items-center gap-2">
                                    {tNav("photobook")}
                                    <span className="bg-rose-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full tracking-widest leading-none">NEW</span>
                                </div>
                            </NavItem>
                        </>
                    ) : (
                        <>
                        </>
                    )}
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                    {userEmail ? (
                        <>
                            <div className="hidden sm:flex">
                                <Button size="sm" asChild className="h-9 items-center gap-2 rounded-full bg-blue-600 px-4 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md dark:bg-blue-500 dark:hover:bg-blue-400">
                                    <Link href="/trip-maker">
                                        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                                        {tActions("newTrip")}
                                    </Link>
                                </Button>
                            </div>
                            <div className="hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-800" />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                                        <Bell className="h-5 w-5" />
                                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl border-slate-100 shadow-xl dark:bg-slate-900 dark:border-slate-800">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                        <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                    </div>
                                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 dark:bg-slate-800">
                                            <Bell className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm">No new notifications</p>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full p-0 ml-1 ring-2 ring-transparent hover:ring-slate-100 dark:hover:ring-slate-800">
                                        <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <AvatarImage src={avatarUrl ?? ""} alt={fullName || "User avatar"} />
                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs dark:bg-slate-800 dark:text-slate-300">
                                                {initials(userEmail, fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 border-slate-100 shadow-lg dark:bg-slate-900 dark:border-slate-800">
                                    <div className="px-3 py-3 mb-1 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                                            {fullName || userEmail?.split('@')[0]}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate uppercase tracking-widest">
                                            {userEmail}
                                        </p>
                                    </div>
                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                    <div className="p-1 space-y-0.5">
                                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer px-3 py-2 text-slate-600 hover:text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:text-slate-300 dark:focus:bg-blue-900/20 dark:focus:text-blue-400 transition-all">
                                            <Link href="/profile" className="flex items-center w-full">
                                                <User className="mr-3 h-4 w-4" />
                                                <span className="font-medium text-sm">{tNav("profile")}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer px-3 py-2 text-slate-600 hover:text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:text-slate-300 dark:focus:bg-blue-900/20 dark:focus:text-blue-400 transition-all">
                                            <Link href="/pricing" className="flex items-center w-full">
                                                <CreditCard className="mr-3 h-4 w-4" />
                                                <span className="font-medium text-sm">{tNav("billing")}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <div className="flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center">
                                                <Sparkles className="mr-3 h-4 w-4 text-amber-500" />
                                                <span className="text-sm font-medium">{tNav("theme")}</span>
                                            </div>
                                            <ThemeToggle />
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                    <div className="p-1">
                                        <DropdownMenuItem
                                            onClick={onLogout}
                                            className="rounded-lg cursor-pointer px-3 py-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:text-rose-400 dark:focus:bg-rose-900/20 transition-all"
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            <span className="font-semibold text-sm">{tNav("logout")}</span>
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <div className="hidden md:flex items-center gap-2">
                                <Button asChild className="rounded-full bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 dark:bg-blue-500 dark:hover:bg-blue-600">
                                    <Link href="/login">{tNav("getStarted")}</Link>
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <LocaleSwitcher />
                                <ThemeToggle />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

function NavItem({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors rounded-full",
                active
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            )}
        >
            {active && (
                <motion.span
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-800"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className="relative z-10">{children}</span>
        </Link>
    );
}

function MobileNavItem({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            )}
        >
            {children}
        </Link>
    );
}
