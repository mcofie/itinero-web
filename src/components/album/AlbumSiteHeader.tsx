"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, Plus } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { cn } from "@/lib/utils";

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

    return <header className="sticky top-0 z-40 border-b border-[#e9e1d7] bg-[#fffefa]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[82px] sm:px-8">
            <Link href="/" aria-label="Itinero home" className="flex shrink-0 items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/itinero-mark-animated.svg" alt="" width={44} height={27} />
                <span className="hidden font-[family-name:var(--font-album-round)] text-[26px] leading-none tracking-[-.03em] sm:inline">itinero</span>
            </Link>
            <nav className="flex items-center gap-1.5 sm:gap-3" aria-label="Albums">
                {email && <Link href="/photobooks" aria-current={onAlbums ? "page" : undefined}
                    className={cn("px-2 py-2 text-sm font-semibold transition sm:px-3", onAlbums ? "text-[#2b1a07] underline decoration-[#e87836] decoration-2 underline-offset-4" : "text-[#6d5c4b] hover:text-[#2b1a07]")}>My albums</Link>}
                <Link href="/make-album" className="inline-flex items-center gap-1.5 rounded-xl bg-[#2b1a07] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#53330e] sm:px-4 sm:text-sm"><Plus size={15} strokeWidth={2.5} /><span className="hidden sm:inline">Make an album</span><span className="sm:hidden">Make one</span></Link>
                {email ? <div ref={menuRef} className="relative">
                    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label="Account"
                        className="grid h-9 w-9 place-items-center rounded-full bg-[#e87836] text-sm font-bold text-white ring-2 ring-[#fffefa] transition hover:bg-[#d4692b]">{initial}</button>
                    {open && <div className="absolute right-0 top-11 w-60 overflow-hidden rounded-2xl border border-[#e7dccd] bg-[#fdfbf8] text-sm shadow-[0_14px_40px_#2b1a0726]">
                        <div className="border-b border-[#efe6da] px-4 py-3">
                            {name && <p className="truncate font-semibold">{name}</p>}
                            <p className="truncate text-xs text-[#8a7d70]">{email}</p>
                        </div>
                        <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 px-4 py-3 text-left font-semibold text-[#6d5c4b] transition hover:bg-[#f6efe6]"><LogOut size={15} />Sign out</button>
                    </div>}
                </div> : <Link href="/album-login" className="rounded-full px-3 py-2 text-sm font-semibold text-[#6d5c4b] hover:text-[#2b1a07]">Sign in</Link>}
            </nav>
        </div>
    </header>;
}
