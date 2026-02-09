"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LayoutDashboard, LogOut } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";

export function AdminMobileNav({
    userEmail,
    avatarUrl,
    fullName
}: {
    userEmail?: string,
    avatarUrl?: string | null,
    fullName?: string | null
}) {
    const [open, setOpen] = React.useState(false);

    const handleLogout = async () => {
        const sb = getSupabaseBrowser();
        await sb.auth.signOut();
        window.location.href = "/admin/login";
    };

    return (
        <div className="md:hidden flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0 sticky top-0 z-30">
            <Link href="/admin/itinero" className="flex items-center gap-2 font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                    <LayoutDashboard className="h-4 w-4" />
                </div>
                Itinero
            </Link>

            <div className="flex items-center gap-2">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[280px] bg-[#0F172A] border-none">
                        <div className="h-full" onClick={() => setOpen(false)}>
                            <AdminSidebar
                                userEmail={userEmail}
                                avatarUrl={avatarUrl}
                                fullName={fullName}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
