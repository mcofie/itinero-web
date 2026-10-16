import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { isAlbumAdmin } from "@/lib/album-server";
import { createClientServerRSC } from "@/lib/supabase/server";
import { albumFontVariables } from "@/components/album/album-fonts";
import ui from "@/components/album/album-ui.module.css";
import PortalNav from "./PortalNav";
import SignOutButton from "./SignOutButton";

export const metadata: Metadata = { title: { absolute: "Admin · Itinero" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPortalLayout({ children }: { children: ReactNode }) {
    const sb = await createClientServerRSC();
    const { data: { user } } = await sb.auth.getUser();
    // Same sign-in as the earlier admin portal: email and password, limited to ADMIN_EMAIL.
    if (!user) redirect(`/admin/login?next=${encodeURIComponent("/admin")}`);
    if (!isAlbumAdmin(user.email)) redirect(`/admin/login?next=${encodeURIComponent("/admin")}&denied=1`);

    return <div className={`${albumFontVariables} min-h-screen bg-[#fdfbf9] text-[#2b1a07]`}>
        <header className="sticky top-0 z-30 border-b-2 border-dashed border-[#dfd6ce] bg-[#fdfbf9]/95 backdrop-blur">
            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3 sm:gap-6">
                    <Link href="/admin" className="flex shrink-0 items-end gap-2 transition hover:-rotate-3" aria-label="Admin overview">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/brand/itinero-mark-animated.svg" alt="" width={52} height={32} className="drop-shadow-[0_2px_1px_#2b1a071b]" />
                        <span className={`${ui.hand} hidden -rotate-6 !text-[19px] md:inline`}>admin</span>
                    </Link>
                    <div className="hidden md:block"><PortalNav /></div>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#8a7d70]">
                    <span className="hidden font-[family-name:var(--font-album-serif)] text-sm text-[#8a7d70] lg:inline">{user.email}</span>
                    <SignOutButton />
                </div>
            </div>
            {/* Phones get the section links on their own row so none are cut off. */}
            <div className="flex justify-center px-4 pb-3 md:hidden"><PortalNav /></div>
        </header>
        {children}
    </div>;
}
