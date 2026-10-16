import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClientServerRSC } from "@/lib/supabase/server";
import AlbumsOverview, { type AlbumSummary } from "./AlbumsOverview";
import AlbumPaymentStatus from "./AlbumPaymentStatus";

export const metadata: Metadata = { title: "My albums" };
export const dynamic = "force-dynamic";

export default async function PhotobooksPage() {
    const sb = await createClientServerRSC();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect("/album-login");

    const { data } = await sb.schema("itinero").from("photobooks")
        .select("id,title,order_number,cover_template_id,album_year,cover_typeface,cover_text_color,cover_color,status,held_from_status,page_count,total_cost,updated_at,created_at,delivery_date,delivered_at,images:photobook_images(count)")
        .eq("user_id", user.id).order("updated_at", { ascending: false, nullsFirst: false });
    const name = user.user_metadata?.full_name || user.user_metadata?.name || "";

    return <>
        {/* Orders started before payment returned to the order page come back here. */}
        <AlbumPaymentStatus />
        <AlbumsOverview albums={(data ?? []) as AlbumSummary[]} firstName={String(name).trim().split(/\s+/)[0] || null} />
    </>;
}
