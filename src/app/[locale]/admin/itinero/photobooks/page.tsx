import * as React from "react";
import { createClientServerRSC } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminPhotobooksClient from "./AdminPhotobooksClient";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAlbumAdmin } from "@/lib/album-server";

export default async function AdminPhotobooksPage() {
    const sb = await createClientServerRSC();

    // Verify admin status
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect("/login");

    if (!(await isAlbumAdmin(user.id, user.email))) {
        redirect("/");
    }

    const admin = createAdminClient();
    if (!admin) return <AdminPhotobooksClient initialPhotobooks={[]} />;
    const { data: photobooks } = await admin
        .schema("itinero")
        .from("photobooks")
        .select(`
            *,
            images: photobook_images(id, original_name, order_index, width, height)
        `)
        .order("created_at", { ascending: false });
    const userIds = [...new Set((photobooks ?? []).map(book => book.user_id))];
    const userEntries = await Promise.all(userIds.map(async id => {
        const { data } = await admin.auth.admin.getUserById(id);
        return [id, { email: data.user?.email ?? "", full_name: data.user?.user_metadata?.full_name ?? "" }] as const;
    }));
    const users = new Map(userEntries);
    return <AdminPhotobooksClient initialPhotobooks={(photobooks ?? []).map(book => ({ ...book, user: users.get(book.user_id) ?? { email: "", full_name: "" } }))} />;
}
