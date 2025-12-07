import { redirect } from "next/navigation";
import { createClientServerRSC } from "@/lib/supabase/server";
import { ReactNode } from "react";

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
        redirect("/login");
    }

    const adminEmail = process.env.ADMIN_EMAIL;

    // Strict check: fails if ADMIN_EMAIL is not set or if user email doesn't match
    if (!adminEmail || user.email !== adminEmail) {
        // Redirect to home page if not authorized
        redirect("/");
    }

    return <>{children}</>;
}
