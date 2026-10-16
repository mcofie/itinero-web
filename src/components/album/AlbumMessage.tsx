import Link from "next/link";
import type { ReactNode } from "react";
import { albumFontVariables } from "@/components/album/album-fonts";
import ui from "@/components/album/album-ui.module.css";
import { cn } from "@/lib/utils";

/** A simple full-page message in the landing page's style: logo mark, handwritten note, heading, text and actions. */
export default function AlbumMessage({ note, title, children, actions }: { note: string; title: string; children?: ReactNode; actions?: ReactNode }) {
    return <main className={cn(albumFontVariables, ui.page, "flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center")}>
        <Link href="/" aria-label="Itinero home" className="mb-12 transition hover:-rotate-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/itinero-mark-animated.svg" alt="" width={76} height={46} className="drop-shadow-[0_2px_1px_#2b1a071b]" />
        </Link>
        <p className={cn(ui.hand, "-rotate-2")}>{note}<br />⌄</p>
        <h1 className="mt-2 max-w-xl text-[40px] leading-[1.15] tracking-[-.025em] sm:text-[48px]">{title}</h1>
        {children && <div className="mt-4 max-w-md font-sans text-[15px] leading-7 text-[#6d5c4b]">{children}</div>}
        {actions && <div className="mt-9 flex flex-wrap items-center justify-center gap-6">{actions}</div>}
    </main>;
}
