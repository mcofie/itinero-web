import * as React from "react";
import { createClientServerRSC } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminPhotobooksClient from "./AdminPhotobooksClient";

export default async function AdminPhotobooksPage() {
    const sb = await createClientServerRSC();

    // Verify admin status
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await sb
        .schema("itinero")
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        redirect("/");
    }

    const { data: photobooks } = await sb
        .schema("itinero")
        .from("photobooks")
        .select(`
            *,
            user:profiles(email, full_name),
            images: photobook_images(count)
        `)
        .order("created_at", { ascending: false });

    return <AdminPhotobooksClient initialPhotobooks={photobooks || []} />;
}
