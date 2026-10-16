"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { cn } from "@/lib/utils";
import ui from "./album-ui.module.css";

/** Slim header for the album pages, matching the landing page: logo, My albums, Make an album, account. */
export default function AlbumSiteHeader({ email, name }: { email: string | null; name: string | null }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const close = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) setOpen(false); };
        const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", close);
        document.addEventListener("keydown", escape);
        return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
    }, [open]);
    const signOut = async () => {
        await getSupabaseBrowser().auth.signOut();
        window.location.assign("/");
    };
    const initial = (name || email || "?").trim().charAt(0).toUpperCase();
    const onAlbums = pathname === "/photobooks";

    return <header className="sticky top-0 z-40 bg-[#fdfbf9]/95 backdrop-blur">
        <div className="mx-auto flex h-[80px] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[96px] sm:px-8">
            <Link href="/" aria-label="Itinero home" className="shrink-0 transition hover:-rotate-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/itinero-mark-animated.svg" alt="" width={64} height={39} className="drop-shadow-[0_2px_1px_#2b1a071b]" />
            </Link>
            <nav className="flex items-center gap-3 sm:gap-5" aria-label="Albums">
                {email && <Link href="/photobooks" aria-current={onAlbums ? "page" : undefined}
                    className={cn("text-[16px] transition", onAlbums ? "underline decoration-[#ed7936] decoration-2 underline-offset-[6px]" : "text-[#5e4a38] hover:text-[#2b1a07]")}>My albums</Link>}
                <Link href="/make-album" className={cn(ui.button, ui.buttonSmall)}><span className="hidden sm:inline">Make an album</span><span className="sm:hidden">Make one</span></Link>
                {email ? <div ref={menuRef} className="relative">
                    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label="Account"
                        className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#423824] bg-[#fff2d8] font-[family-name:var(--font-album-round)] text-base text-[#2b1a07] transition hover:-rotate-6">{initial}</button>
                    {open && <div className={cn(ui.card, "absolute right-0 top-12 w-64 overflow-hidden text-[15px]")}>
                        <div className="border-b-2 border-dashed border-[#dfd6ce] px-4 py-3">
                            {name && <p className="truncate">{name}</p>}
                            <p className="truncate font-sans text-xs text-[#8a7d70]">{email}</p>
                        </div>
                        <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 px-4 py-3 text-left text-[#5e4a38] transition hover:bg-[#fff2d8]"><LogOut size={15} />Sign out</button>
                    </div>}
                </div> : <Link href="/album-login" className="text-[16px] text-[#5e4a38] hover:text-[#2b1a07]">Sign in</Link>}
            </nav>
        </div>
    </header>;
}
