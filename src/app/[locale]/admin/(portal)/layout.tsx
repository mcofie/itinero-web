import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { isAlbumAdmin } from "@/lib/album-server";
import { createClientServerRSC } from "@/lib/supabase/server";
import { albumFontVariables } from "@/components/album/album-fonts";
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

    return <div className={`${albumFontVariables} min-h-screen bg-[#f6f2ec] text-[#2b1a07]`}>
        <header className="sticky top-0 z-30 border-b border-[#e2d6c7] bg-[#fdfbf8]/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3 sm:gap-6">
                    <Link href="/admin" className="flex shrink-0 items-center gap-2.5" aria-label="Admin overview">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/brand/itinero-mark-animated.svg" alt="" width={30} height={22} />
                        <span className="hidden font-[Georgia] text-xl tracking-[-.02em] md:inline">Itinero</span>
                    </Link>
                    <PortalNav />
                </div>
                <div className="flex items-center gap-4 text-xs text-[#8a7d70]">
                    <span className="hidden lg:inline">{user.email}</span>
                    <SignOutButton />
                </div>
            </div>
        </header>
        {children}
    </div>;
}
