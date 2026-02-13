import * as React from "react";
import { redirect } from "next/navigation";
import { createClientServerRSC } from "@/lib/supabase/server";
import PhotobookEditor from "./PhotobookEditor";

export const dynamic = "force-dynamic";

export default async function CreatePhotobookPage({
    searchParams
}: {
    searchParams: Promise<{ id?: string }>;
}) {
    const sb = await createClientServerRSC();
    const { id } = await searchParams;

    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect("/login");

    let initialData = null;
    if (id) {
        const { data } = await sb
            .schema("itinero")
            .from("photobooks")
            .select(`
                *,
                images: photobook_images(*)
            `)
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (data) initialData = data;
    }

    return <PhotobookEditor user={user} initialData={initialData} />;
}
