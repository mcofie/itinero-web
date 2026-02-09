import { redirect } from "next/navigation";
import { createClientServerRSC } from "@/lib/supabase/server";
import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default async function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    const sb = await createClientServerRSC();
    const {
        data: { user },
    } = await sb.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    const adminEmail = process.env.ADMIN_EMAIL;

    // Strict check: fails if ADMIN_EMAIL is not set or if user email doesn't match
    if (!adminEmail || user.email !== adminEmail) {
        // Redirect to home page if not authorized
        redirect("/");
    }

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 overflow-hidden">
            <AdminMobileNav userEmail={user?.email} />
            <AdminSidebar userEmail={user?.email} className="hidden md:flex" />
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {children}
            </div>
        </div>
    );
}
