import type { ReactNode } from "react";
import { albumFontVariables } from "@/components/album/album-fonts";
import ui from "@/components/album/album-ui.module.css";
import { cn } from "@/lib/utils";

/** The admin's share of the landing page look: ink-outlined cards, outlined buttons, serif headings. */
export const card = cn(ui.card, "p-5");
export const primaryButton = cn(ui.button, ui.buttonSmall, "disabled:pointer-events-none disabled:opacity-50");
export const quietButton = "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[12px] border-2 border-[#d9cbbb] bg-[#fffcf9] px-3 py-1.5 font-[family-name:var(--font-album-serif)] text-[15px] text-[#2b1a07] transition hover:border-[#423824] hover:bg-[#fff2d8] disabled:pointer-events-none disabled:opacity-50";
export const dangerButton = "!border-[#a33a1a] !text-[#a33a1a] hover:!bg-[#fff4ef]";
export const field = "mt-1.5 block w-full rounded-[12px] border-2 border-[#d9cbbb] bg-white px-3 py-2 text-sm normal-case tracking-normal text-[#2b1a07] outline-none transition placeholder:text-[#b3a594] focus:border-[#423824] disabled:bg-[#f3ede5]";
export const fieldLabel = "block text-[11px] font-semibold uppercase tracking-[.12em] text-[#6d5c4b]";
export const sectionLabel = "text-[11px] font-bold uppercase tracking-[.14em] text-[#8a7d70]";
export const serifHeading = "font-[family-name:var(--font-album-serif)] tracking-[-.02em]";
// Dialogs render in a portal outside the admin layout, so they load the album fonts themselves.
export const dialog = albumFontVariables + " rounded-[14px] border-2 border-[#493b2a] bg-[#fffcf9] text-[#2b1a07] shadow-[0_20px_60px_#2b1a0726]";
export const emptyState = "rounded-[12px] border-2 border-dashed border-[#dfd6ce] bg-[#fffcf9] px-6 py-16 text-center font-[family-name:var(--font-album-serif)] text-[17px] text-[#8a7d70]";
export const errorBox = "rounded-[10px] border-2 border-[#b4441c] bg-[#fff4ef] p-4 text-sm text-[#7a2e12]";
export const link = ui.link;

export function PageHeading({ note, title, children, action }: { note: string; title: string; children?: ReactNode; action?: ReactNode }) {
    return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
            <p className={cn(ui.hand, "-rotate-2 !text-[22px]")}>{note} ⌄</p>
            <h1 className={cn(serifHeading, "mt-1 text-[40px] leading-tight")}>{title}</h1>
            {children && <p className="mt-1 max-w-3xl text-sm leading-6 text-[#776b60]">{children}</p>}
        </div>
        {action}
    </div>;
}
