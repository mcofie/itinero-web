import type { ReactNode } from "react";
import { albumFontVariables } from "@/components/album/album-fonts";
import AlbumSiteFooter from "@/components/album/AlbumSiteFooter";
import AlbumSiteHeader from "@/components/album/AlbumSiteHeader";
import { createClientServerRSC } from "@/lib/supabase/server";

/** Header and footer for the customer's album pages (My Albums, order tracking). */
export default async function AlbumsLayout({ children }: { children: ReactNode }) {
    const sb = await createClientServerRSC();
    const { data: { user } } = await sb.auth.getUser();
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || null;
    return <div className={`${albumFontVariables} flex min-h-screen flex-col bg-[#f6f2ec] text-[#2b1a07]`}>
        <AlbumSiteHeader email={user?.email ?? null} name={name} />
        <div className="flex-1">{children}</div>
        <AlbumSiteFooter />
    </div>;
}
