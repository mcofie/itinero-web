import type { ReactNode } from "react";
import { ArrowRight, CircleAlert, Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatOrderNumber, FULFILMENT_PATH, isOrderStatus, STATUS_INFO, type OrderStatus } from "@/lib/album-fulfilment";
import { EXTRA_PAGES } from "@/lib/album-page-text";
import { formatGhs } from "@/lib/album-pricing";
import { resolveCoverBackground } from "@/lib/album-cover-style";
import { TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import AlbumCoverThumb from "@/components/album/AlbumCoverThumb";
import ui from "@/components/album/album-ui.module.css";
import { cn } from "@/lib/utils";

export type AlbumSummary = {
    id: string;
    title: string;
    order_number: number | null;
    cover_template_id: string;
    album_year: string | null;
    cover_typeface: string | null;
    cover_text_color: string | null;
    cover_color: string | null;
    status: string;
    held_from_status: string | null;
    page_count: number | null;
    total_cost: number | null;
    updated_at: string | null;
    created_at: string;
    delivery_date: string | null;
    delivered_at: string | null;
    images: { count: number }[];
};

const IN_PROGRESS: readonly OrderStatus[] = ["paid", "in_review", "changes_requested", "printing", "ready", "out_for_delivery", "on_hold"];
const day = (value: string | null) => value ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null;
const photoCount = (album: AlbumSummary) => album.images?.[0]?.count ?? 0;
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** A soft tint of the album's cover colour, as the backdrop its book sits on. */
function backdrop(album: AlbumSummary) {
    const id = Object.hasOwn(TRAVEL_COVERS_BY_ID, album.cover_template_id) ? album.cover_template_id as TravelCoverId : "italy";
    return `color-mix(in srgb, ${resolveCoverBackground(album.cover_color ?? "auto", TRAVEL_COVERS_BY_ID[id].color)} 34%, #fdfbf9)`;
}

function Cover({ album, height, className, eager }: { album: AlbumSummary; height: number; className?: string; eager?: boolean }) {
    return <AlbumCoverThumb coverId={album.cover_template_id} title={album.title} year={album.album_year} typeface={album.cover_typeface}
        textColor={album.cover_text_color} background={album.cover_color} height={height} eager={eager} className={cn("shadow-[6px_10px_18px_#2b1a0733] transition duration-300", className)} />;
}

/** Six steps from paid to delivered; a change request counts as review, a pause shows where it stopped. */
function Progress({ album }: { album: AlbumSummary }) {
    const status = album.status === "on_hold" && isOrderStatus(album.held_from_status) ? album.held_from_status : album.status;
    const current = Math.max(0, FULFILMENT_PATH.indexOf(status === "changes_requested" ? "in_review" : status as OrderStatus));
    return <div className="flex gap-1" role="img" aria-label={`Step ${current + 1} of ${FULFILMENT_PATH.length}`}>
        {FULFILMENT_PATH.map((step, index) => <span key={step} className={cn("h-1.5 flex-1 rounded-full", index < current ? "bg-[#ed7936]" : index === current ? "bg-[#f3b285]" : "bg-[#ebe3d9]")} />)}
    </div>;
}

function OrderCard({ album, eager }: { album: AlbumSummary; eager?: boolean }) {
    const status = isOrderStatus(album.status) ? album.status : "paid";
    const needsCustomer = status === "changes_requested";
    const note = status === "out_for_delivery" && album.delivery_date ? `Expected ${day(album.delivery_date)}` : status === "on_hold" ? "We’ll be in touch" : null;
    return <article className={cn(ui.card, "group grid overflow-hidden sm:grid-cols-[200px_minmax(0,1fr)]")}>
        <Link href={`/photobooks/${album.id}`} className="flex items-center justify-center border-b-2 border-[#493b2a] p-6 sm:border-b-0 sm:border-r-2" style={{ background: backdrop(album) }} tabIndex={-1} aria-hidden>
            <Cover album={album} height={160} eager={eager} className="group-hover:-rotate-2 group-hover:scale-[1.03]" />
        </Link>
        <div className="flex min-w-0 flex-col p-6">
            <p className={ui.label}>Order {formatOrderNumber(album.order_number)}</p>
            <h3 className="mt-2 truncate text-[26px] leading-tight tracking-[-.02em]">{album.title}</h3>
            <p className="mt-3 text-[16px]">{STATUS_INFO[status].customerLabel}{note && <span className="text-[#8a7d70]"> · {note}</span>}</p>
            <div className="mt-2.5 max-w-xs"><Progress album={album} /></div>
            {needsCustomer && <p className="mt-4 flex items-start gap-2 text-[15px] leading-6 text-[#9a4a17]"><CircleAlert size={17} className="mt-1 shrink-0" />We need a quick change before printing.</p>}
            <div className="mt-auto flex flex-wrap items-center gap-5 pt-6">
                {needsCustomer && <Link href={`/make-album?id=${album.id}`} className={cn(ui.button, ui.buttonSmall)}>Update album</Link>}
                <Link href={`/photobooks/${album.id}`} className={ui.link}>View order <ArrowRight size={15} /></Link>
            </div>
        </div>
    </article>;
}

function DraftCard({ album, eager }: { album: AlbumSummary; eager?: boolean }) {
    const pending = album.status === "pending_payment";
    return <Link href={`/make-album?id=${album.id}`} className={cn(ui.card, "group flex flex-col overflow-hidden transition hover:-translate-y-1")}>
        <div className="flex h-[220px] items-center justify-center border-b-2 border-[#493b2a]" style={{ background: backdrop(album) }}>
            <Cover album={album} height={170} eager={eager} className="group-hover:-rotate-2 group-hover:scale-[1.03]" />
        </div>
        <div className="flex flex-1 flex-col p-5">
            <span className={cn(ui.label, pending ? "text-[#c45a1c]" : "text-[#8a7d70]")}>{pending ? "Payment pending" : "Draft"}</span>
            <h3 className="mt-2 truncate text-[22px] leading-tight">{album.title}</h3>
            <p className="mt-1 font-sans text-xs text-[#8a7d70]">{plural(photoCount(album), "photo")} · {Math.max(album.page_count ?? 0, EXTRA_PAGES)} pages{day(album.updated_at) && ` · Edited ${day(album.updated_at)}`}</p>
            <span className={cn(ui.link, "mt-auto w-fit pt-5")}>{pending ? `Finish payment · ${formatGhs(Number(album.total_cost ?? 0))}` : "Continue album"}<ArrowRight size={15} /></span>
        </div>
    </Link>;
}

function ShelfCard({ album }: { album: AlbumSummary }) {
    const cancelled = album.status === "cancelled";
    return <Link href={`/photobooks/${album.id}`} className={cn(ui.card, "group flex items-center gap-4 p-4", cancelled && "opacity-70")}>
        <Cover album={album} height={80} className="shadow-[3px_5px_10px_#2b1a0726]" />
        <div className="min-w-0">
            <h3 className="truncate text-xl">{album.title}</h3>
            <p className="font-sans text-xs text-[#8a7d70]">{cancelled ? "Cancelled" : `Delivered${day(album.delivered_at) ? ` ${day(album.delivered_at)}` : ""}`} · {formatOrderNumber(album.order_number)}</p>
        </div>
        <ArrowRight size={16} className="ml-auto shrink-0 text-[#b9a38c] transition group-hover:translate-x-0.5 group-hover:text-[#ed7936]" />
    </Link>;
}

function Section({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
    return <section className="mt-16">
        <h2 className="mb-6 flex items-baseline gap-3 text-[32px] leading-tight tracking-[-.025em] sm:text-[36px]">{title}{count ? <span className="font-[family-name:var(--font-album-hand)] text-2xl text-[#ed7936]">{count}</span> : null}</h2>
        {children}
    </section>;
}

export default function AlbumsOverview({ albums, firstName }: { albums: AlbumSummary[]; firstName: string | null }) {
    const orders = albums.filter(album => IN_PROGRESS.includes(album.status as OrderStatus))
        .sort((a, b) => Number(b.status === "changes_requested") - Number(a.status === "changes_requested"));
    const drafts = albums.filter(album => album.status === "draft" || album.status === "pending_payment");
    const shelf = albums.filter(album => album.status === "delivered" || album.status === "cancelled");
    const delivered = shelf.filter(album => album.status === "delivered").length;
    const summary = [orders.length && `${orders.length} on the way`, drafts.length && plural(drafts.length, "draft"), delivered && `${delivered} delivered`].filter(Boolean).join(" · ");

    if (!albums.length) return <main className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-8 sm:pt-14">
        <div className="flex flex-col items-center px-2 py-10 text-center sm:py-14">
            <div className="relative mb-12 h-[180px] w-[290px]" aria-hidden>
                {(["morocco", "italy", "japan"] as const).map((id, index) => <div key={id} className="absolute left-1/2 top-0" style={{ transform: `translateX(-50%) translateX(${(index - 1) * 88}px) rotate(${(index - 1) * 8}deg)`, zIndex: index === 1 ? 2 : 1 }}>
                    <AlbumCoverThumb coverId={id} title={TRAVEL_COVERS_BY_ID[id].country} year={String(new Date().getFullYear())} typeface="bold" textColor="auto" height={index === 1 ? 172 : 152} className="shadow-[6px_10px_20px_#2b1a0733]" />
                </div>)}
            </div>
            <p className={ui.hand}>your shelf is waiting<br />⌄</p>
            <h1 className="mt-2 max-w-xl text-[40px] leading-[1.25] tracking-[-.025em] sm:text-[44px]">Turn a trip into a book<br />you can hold</h1>
            <p className="mt-4 max-w-md font-sans text-[15px] leading-7 text-[#6d5c4b]">Pick a cover for where you went, add your favourite photos, and we’ll print and deliver an 8 × 10 in hardcover in Accra.</p>
            <Link href="/make-album" className={cn(ui.button, "mt-9")}>Make my first album</Link>
        </div>
    </main>;

    return <main className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
        <header>
            <p className={cn(ui.hand, "-rotate-2")}>{firstName ? `hello, ${firstName}!` : "hello!"}</p>
            <h1 className="mt-2 text-[44px] leading-[1.15] tracking-[-.03em] sm:text-[56px]">Your albums</h1>
            {summary && <p className="mt-2 font-sans text-[15px] text-[#6d5c4b]">{summary}</p>}
        </header>

        {orders.length > 0 && <Section title="In the works" count={orders.length}>
            <div className="grid gap-6 lg:grid-cols-2">{orders.map((album, index) => <OrderCard key={album.id} album={album} eager={index < 2} />)}</div>
        </Section>}

        <Section title={drafts.length ? "Ready to order" : "Start something new"} count={drafts.length}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {drafts.map((album, index) => <DraftCard key={album.id} album={album} eager={!orders.length && index < 3} />)}
                <Link href="/make-album" className={cn(ui.cardQuiet, "group flex min-h-[300px] flex-col items-center justify-center p-8 text-center transition hover:border-[#ed7936]")}>
                    <span className="mb-4 grid h-12 w-12 place-items-center rounded-full border-2 border-[#423824] bg-[#fff2d8] transition group-hover:-rotate-6"><Plus size={20} /></span>
                    <strong className="text-[22px] font-normal">Another trip to keep?</strong>
                    <span className="mt-1.5 font-[family-name:var(--font-album-hand)] text-lg text-[#ed7936]">start a new album</span>
                </Link>
            </div>
        </Section>

        {shelf.length > 0 && <Section title="On your shelf" count={shelf.length}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shelf.map(album => <ShelfCard key={album.id} album={album} />)}</div>
        </Section>}
    </main>;
}
