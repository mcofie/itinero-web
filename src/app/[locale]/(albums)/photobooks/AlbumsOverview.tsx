import type { ReactNode } from "react";
import { ArrowRight, CircleAlert, Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatOrderNumber, FULFILMENT_PATH, isOrderStatus, STATUS_INFO, type OrderStatus } from "@/lib/album-fulfilment";
import { EXTRA_PAGES } from "@/lib/album-page-text";
import { formatGhs } from "@/lib/album-pricing";
import { resolveCoverBackground } from "@/lib/album-cover-style";
import { TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import AlbumCoverThumb from "@/components/album/AlbumCoverThumb";
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
const card = "rounded-[24px] border border-[#e6dbcd] bg-[#fdfbf8]";
const day = (value: string | null) => value ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null;
const photoCount = (album: AlbumSummary) => album.images?.[0]?.count ?? 0;
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** A soft tint of the album's cover colour, as the backdrop its book sits on. */
function backdrop(album: AlbumSummary) {
    const id = Object.hasOwn(TRAVEL_COVERS_BY_ID, album.cover_template_id) ? album.cover_template_id as TravelCoverId : "italy";
    return `color-mix(in srgb, ${resolveCoverBackground(album.cover_color ?? "auto", TRAVEL_COVERS_BY_ID[id].color)} 32%, #f1e9de)`;
}

function Cover({ album, height, className }: { album: AlbumSummary; height: number; className?: string }) {
    return <AlbumCoverThumb coverId={album.cover_template_id} title={album.title} year={album.album_year} typeface={album.cover_typeface}
        textColor={album.cover_text_color} background={album.cover_color} height={height} className={cn("shadow-[6px_10px_18px_#2b1a0733] transition duration-300", className)} />;
}

/** Six steps from paid to delivered; a change request counts as review, a pause shows where it stopped. */
function Progress({ album }: { album: AlbumSummary }) {
    const status = album.status === "on_hold" && isOrderStatus(album.held_from_status) ? album.held_from_status : album.status;
    const current = Math.max(0, FULFILMENT_PATH.indexOf(status === "changes_requested" ? "in_review" : status as OrderStatus));
    return <div className="flex gap-1" role="img" aria-label={`Step ${current + 1} of ${FULFILMENT_PATH.length}`}>
        {FULFILMENT_PATH.map((step, index) => <span key={step} className={cn("h-1.5 flex-1 rounded-full", index < current ? "bg-[#c16b36]" : index === current ? "bg-[#e9a676]" : "bg-[#ebe1d4]")} />)}
    </div>;
}

function OrderCard({ album }: { album: AlbumSummary }) {
    const status = isOrderStatus(album.status) ? album.status : "paid";
    const needsCustomer = status === "changes_requested";
    const note = status === "out_for_delivery" && album.delivery_date ? `Expected ${day(album.delivery_date)}` : status === "on_hold" ? "We’ll be in touch" : null;
    return <article className={cn(card, "group grid overflow-hidden sm:grid-cols-[200px_minmax(0,1fr)]", needsCustomer && "border-[#efc29c]")}>
        <Link href={`/photobooks/${album.id}`} className="flex items-center justify-center p-6" style={{ background: backdrop(album) }} tabIndex={-1} aria-hidden>
            <Cover album={album} height={160} className="group-hover:-rotate-2 group-hover:scale-[1.03]" />
        </Link>
        <div className="flex min-w-0 flex-col p-6">
            <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#b76839]">Order {formatOrderNumber(album.order_number)}</p>
            <h3 className="mt-1 truncate font-[Georgia] text-2xl">{album.title}</h3>
            <p className="mt-3 text-sm"><span className="font-semibold">{STATUS_INFO[status].customerLabel}</span>{note && <span className="text-[#8a7d70]"> · {note}</span>}</p>
            <div className="mt-2.5 max-w-xs"><Progress album={album} /></div>
            {needsCustomer && <p className="mt-4 flex items-start gap-2 text-sm leading-5 text-[#9a4a17]"><CircleAlert size={16} className="mt-0.5 shrink-0" />We need a quick change before printing.</p>}
            <div className="mt-auto flex flex-wrap items-center gap-4 pt-5">
                {needsCustomer && <Link href={`/make-album?id=${album.id}`} className="rounded-xl bg-[#2b1a07] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#53330e]">Update album</Link>}
                <Link href={`/photobooks/${album.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#a2602f] hover:underline">View order <ArrowRight size={15} /></Link>
            </div>
        </div>
    </article>;
}

function DraftCard({ album }: { album: AlbumSummary }) {
    const pending = album.status === "pending_payment";
    return <Link href={`/make-album?id=${album.id}`} className={cn(card, "group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_#2b1a0714]")}>
        <div className="flex h-[220px] items-center justify-center" style={{ background: backdrop(album) }}>
            <Cover album={album} height={170} className="group-hover:-rotate-2 group-hover:scale-[1.03]" />
        </div>
        <div className="flex flex-1 flex-col p-5">
            <span className={cn("mb-2 w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em]", pending ? "bg-[#2b1a07] text-white" : "bg-[#efe4d6] text-[#785236]")}>{pending ? "Payment pending" : "Draft"}</span>
            <h3 className="truncate font-[Georgia] text-xl">{album.title}</h3>
            <p className="mt-1 text-xs text-[#8a7d70]">{plural(photoCount(album), "photo")} · {Math.max(album.page_count ?? 0, EXTRA_PAGES)} pages{day(album.updated_at) && ` · Edited ${day(album.updated_at)}`}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-[#a2602f]">{pending ? `Finish payment · ${formatGhs(Number(album.total_cost ?? 0))}` : "Continue album"}<ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></span>
        </div>
    </Link>;
}

function ShelfCard({ album }: { album: AlbumSummary }) {
    const cancelled = album.status === "cancelled";
    return <Link href={`/photobooks/${album.id}`} className={cn(card, "group flex items-center gap-4 p-4 transition hover:bg-white", cancelled && "opacity-70")}>
        <Cover album={album} height={80} className="shadow-[3px_5px_10px_#2b1a0726]" />
        <div className="min-w-0">
            <h3 className="truncate font-[Georgia] text-lg">{album.title}</h3>
            <p className="text-xs text-[#8a7d70]">{cancelled ? "Cancelled" : `Delivered${day(album.delivered_at) ? ` ${day(album.delivered_at)}` : ""}`} · {formatOrderNumber(album.order_number)}</p>
        </div>
        <ArrowRight size={16} className="ml-auto shrink-0 text-[#c4ab92] transition group-hover:translate-x-0.5 group-hover:text-[#a2602f]" />
    </Link>;
}

function Section({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
    return <section className="mt-12">
        <h2 className="mb-5 flex items-baseline gap-2 font-[Georgia] text-2xl">{title}{count ? <span className="font-sans text-sm font-semibold text-[#a89a8a]">{count}</span> : null}</h2>
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

    if (!albums.length) return <main className="mx-auto max-w-6xl px-5 pb-6 pt-10 sm:px-8 sm:pt-14">
        <div className={cn(card, "flex flex-col items-center px-6 py-16 text-center sm:py-20")}>
            <div className="relative mb-10 h-[180px] w-[290px]" aria-hidden>
                {(["morocco", "italy", "japan"] as const).map((id, index) => <div key={id} className="absolute left-1/2 top-0" style={{ transform: `translateX(-50%) translateX(${(index - 1) * 88}px) rotate(${(index - 1) * 8}deg)`, zIndex: index === 1 ? 2 : 1 }}>
                    <AlbumCoverThumb coverId={id} title={TRAVEL_COVERS_BY_ID[id].country} year={String(new Date().getFullYear())} typeface="bold" textColor="auto" height={index === 1 ? 172 : 152} className="shadow-[6px_10px_20px_#2b1a0733]" />
                </div>)}
            </div>
            <h1 className="max-w-lg font-[family-name:var(--font-album-round)] text-[40px] leading-[1.02] tracking-[-.03em] sm:text-5xl">Turn a trip into a book you can hold.</h1>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[#6d5c4b]">Pick a cover for where you went, add your favourite photos, and we’ll print and deliver an 8 × 10 in hardcover in Accra.</p>
            <Link href="/make-album" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#2b1a07] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#53330e]">Make my first album <ArrowRight size={16} /></Link>
        </div>
    </main>;

    return <main className="mx-auto max-w-6xl px-5 pb-6 pt-10 sm:px-8 sm:pt-14">
        <header>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#b76839]">My albums</p>
            <h1 className="mt-3 font-[family-name:var(--font-album-round)] text-[40px] leading-none tracking-[-.03em] sm:text-[52px]">{firstName ? `Welcome back, ${firstName}` : "Welcome back"}</h1>
            {summary && <p className="mt-3 text-[15px] text-[#6d5c4b]">{summary}</p>}
        </header>

        {orders.length > 0 && <Section title="In the works" count={orders.length}>
            <div className="grid gap-5 lg:grid-cols-2">{orders.map(album => <OrderCard key={album.id} album={album} />)}</div>
        </Section>}

        <Section title={drafts.length ? "Ready to order" : "Start something new"} count={drafts.length}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {drafts.map(album => <DraftCard key={album.id} album={album} />)}
                <Link href="/make-album" className="group flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#ddcdb9] p-8 text-center transition hover:border-[#e87836] hover:bg-[#fdfbf8]">
                    <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#f0dfcc] text-[#b66b3d] transition group-hover:scale-110"><Plus size={22} strokeWidth={1.8} /></span>
                    <strong className="font-[Georgia] text-xl font-normal">Another trip to keep?</strong>
                    <span className="mt-1.5 text-xs text-[#8c7f70]">Start a new album</span>
                </Link>
            </div>
        </Section>

        {shelf.length > 0 && <Section title="On your shelf" count={shelf.length}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{shelf.map(album => <ShelfCard key={album.id} album={album} />)}</div>
        </Section>}
    </main>;
}
