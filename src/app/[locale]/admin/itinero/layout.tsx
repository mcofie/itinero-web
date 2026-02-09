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

    let avatarUrl: string | null = null;
    let fullName: string | null = null;

    if (user) {
        // Fallback to user_metadata
        avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;

        const { data: profile } = await sb
            .schema("itinero")
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", user.id)
            .maybeSingle();

        if (profile) {
            if (profile.avatar_url) avatarUrl = profile.avatar_url;
            if (profile.full_name) fullName = profile.full_name;
        }
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
            <AdminMobileNav
                userEmail={user?.email}
                avatarUrl={avatarUrl}
                fullName={fullName}
            />
            <AdminSidebar
                userEmail={user?.email}
                avatarUrl={avatarUrl}
                fullName={fullName}
                className="hidden md:flex sticky top-0 h-screen"
            />
            <main className="flex-1 w-full min-w-0">
                {children}
            </main>
        </div>
    );
}
