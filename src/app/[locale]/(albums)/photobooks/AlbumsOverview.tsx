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
const day = (value: string | null) => value ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : null;

/** A soft tint of the album's cover colour, as the backdrop its book sits on. */
function backdrop(album: AlbumSummary) {
    const id = Object.hasOwn(TRAVEL_COVERS_BY_ID, album.cover_template_id) ? album.cover_template_id as TravelCoverId : "italy";
    return `color-mix(in srgb, ${resolveCoverBackground(album.cover_color ?? "auto", TRAVEL_COVERS_BY_ID[id].color)} 32%, #f3ece2)`;
}

function Cover({ album, height, className }: { album: AlbumSummary; height: number; className?: string }) {
    return <AlbumCoverThumb coverId={album.cover_template_id} title={album.title} year={album.album_year} typeface={album.cover_typeface}
        textColor={album.cover_text_color} background={album.cover_color} height={height} className={cn("shadow-[6px_10px_18px_#2b1a0733] transition duration-300", className)} />;
}

/** Six steps from paid to delivered; a change request counts as review, a pause shows where it stopped. */
function Progress({ album }: { album: AlbumSummary }) {
    const status = album.status === "on_hold" && isOrderStatus(album.held_from_status) ? album.held_from_status : album.status;
    const current = FULFILMENT_PATH.indexOf(status === "changes_requested" ? "in_review" : status as OrderStatus);
    return <div className="flex gap-1.5" aria-hidden>
        {FULFILMENT_PATH.map((step, index) => <span key={step} className={cn("h-1.5 flex-1 rounded-full", index < current ? "bg-[#c16b36]" : index === current ? "bg-[#e9a676]" : "bg-[#e6dbcd]")} />)}
    </div>;
}

function OrderCard({ album }: { album: AlbumSummary }) {
    const status = album.status as OrderStatus;
    const info = STATUS_INFO[status];
    const needsCustomer = status === "changes_requested";
    const extra = status === "out_for_delivery" && album.delivery_date ? `Expected ${day(album.delivery_date)}` : status === "on_hold" ? "We’ll be in touch" : null;
    return <article className={cn("group grid overflow-hidden rounded-[24px] border bg-[#fdfbf8] shadow-[0_10px_30px_#2b1a070a] sm:grid-cols-[220px_1fr]", needsCustomer ? "border-[#f0c9a8]" : "border-[#e6dbcd]")}>
        <Link href={`/photobooks/${album.id}`} className="flex items-center justify-center p-6" style={{ background: backdrop(album) }} tabIndex={-1} aria-hidden>
            <Cover album={album} height={170} className="group-hover:-rotate-2 group-hover:scale-[1.03]" />
        </Link>
        <div className="flex flex-col p-6 sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#a2602f]">Order {formatOrderNumber(album.order_number)}</p>
            <h3 className="mt-1.5 truncate font-[Georgia] text-[26px] leading-tight">{album.title}</h3>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-2 text-sm"><strong className="font-semibold">{info.customerLabel}</strong>{extra && <span className="text-[#8a7d70]">· {extra}</span>}</p>
            <div className="mt-3 max-w-sm"><Progress album={album} /></div>
            {needsCustomer && <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#fff1e5] p-3 text-sm leading-5 text-[#8a4517]"><CircleAlert size={16} className="mt-0.5 shrink-0" />We need a quick change before we print.</p>}
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                {needsCustomer && <Link href={`/make-album?id=${album.id}`} className="rounded-xl bg-[#2b1a07] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#53330e]">Update album</Link>}
                <Link href={`/photobooks/${album.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-[#a2602f] hover:underline">Follow order <ArrowRight size={15} /></Link>
            </div>
        </div>
    </article>;
}

function DraftCard({ album }: { album: AlbumSummary }) {
    const photos = album.images?.[0]?.count ?? 0;
    const pending = album.status === "pending_payment";
    return <Link href={`/make-album?id=${album.id}`} className="group flex flex-col overflow-hidden rounded-[22px] border border-[#e6dbcd] bg-[#fdfbf8] shadow-[0_8px_24px_#2b1a0708] transition hover:-translate-y-1 hover:shadow-[0_16px_34px_#2b1a0716]">
        <div className="flex h-[230px] items-center justify-center" style={{ background: backdrop(album) }}>
            <Cover album={album} height={180} className="group-hover:-rotate-2 group-hover:scale-[1.03]" />
        </div>
        <div className="flex flex-1 flex-col p-5">
            <span className={cn("mb-2 w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em]", pending ? "bg-[#2b1a07] text-white" : "bg-[#efe4d6] text-[#785236]")}>{pending ? "Payment pending" : "Draft"}</span>
            <h3 className="truncate font-[Georgia] text-xl">{album.title}</h3>
            <p className="mt-1 text-xs text-[#8a7d70]">{photos} {photos === 1 ? "photo" : "photos"} · {Math.max(album.page_count ?? 0, EXTRA_PAGES)} pages{day(album.updated_at) && ` · Edited ${day(album.updated_at)}`}</p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-[#a2602f]">{pending ? `Finish payment · ${formatGhs(Number(album.total_cost ?? 0))}` : "Continue album"}<ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></span>
        </div>
    </Link>;
}

function ShelfCard({ album }: { album: AlbumSummary }) {
    const cancelled = album.status === "cancelled";
    return <Link href={`/photobooks/${album.id}`} className={cn("group flex items-center gap-4 rounded-2xl border border-[#e6dbcd] bg-[#fdfbf8] p-4 transition hover:bg-white", cancelled && "opacity-70")}>
        <Cover album={album} height={84} className="shadow-[3px_5px_10px_#2b1a0726]" />
        <div className="min-w-0">
            <h3 className="truncate font-[Georgia] text-lg">{album.title}</h3>
            <p className="text-xs text-[#8a7d70]">{cancelled ? "Cancelled" : `Delivered${day(album.delivered_at) ? ` ${day(album.delivered_at)}` : ""}`} · {formatOrderNumber(album.order_number)}</p>
        </div>
        <ArrowRight size={16} className="ml-auto shrink-0 text-[#c4ab92] transition group-hover:translate-x-0.5 group-hover:text-[#a2602f]" />
    </Link>;
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
    return <section className="mt-12">
        <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-[#e2d6c7] pb-3">
            <h2 className="font-[Georgia] text-2xl tracking-[-.01em]">{title}</h2>
            {note && <span className="hidden text-xs font-semibold text-[#8a7d70] sm:inline">{note}</span>}
        </div>
        {children}
    </section>;
}

export default function AlbumsOverview({ albums, firstName }: { albums: AlbumSummary[]; firstName: string | null }) {
    const orders = albums.filter(album => IN_PROGRESS.includes(album.status as OrderStatus))
        .sort((a, b) => Number(b.status === "changes_requested") - Number(a.status === "changes_requested"));
    const drafts = albums.filter(album => album.status === "draft" || album.status === "pending_payment");
    const shelf = albums.filter(album => album.status === "delivered" || album.status === "cancelled");
    const summary = [orders.length && `${orders.length} on the way`, drafts.length && `${drafts.length} ${drafts.length === 1 ? "draft" : "drafts"}`, shelf.filter(album => album.status === "delivered").length && `${shelf.filter(album => album.status === "delivered").length} delivered`].filter(Boolean).join(" · ");

    if (!albums.length) return <div className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-8">
        <div className="flex flex-col items-center rounded-[32px] border border-[#e6dbcd] bg-[#fdfbf8] px-6 py-16 text-center shadow-[0_14px_40px_#2b1a070a] sm:py-20">
            <div className="relative mb-10 h-[190px] w-[300px]" aria-hidden>
                {(["morocco", "italy", "japan"] as const).map((id, index) => <div key={id} className="absolute left-1/2 top-0" style={{ transform: `translateX(-50%) translateX(${(index - 1) * 92}px) rotate(${(index - 1) * 9}deg)`, zIndex: index === 1 ? 2 : 1 }}>
                    <AlbumCoverThumb coverId={id} title={TRAVEL_COVERS_BY_ID[id].country} year={String(new Date().getFullYear())} typeface="bold" textColor="auto" height={index === 1 ? 180 : 160} className="shadow-[6px_10px_20px_#2b1a0733]" />
                </div>)}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#c16b36]">Your shelf is waiting</p>
            <h1 className="mt-3 max-w-lg font-[Georgia] text-4xl leading-[1.08] tracking-[-.03em] sm:text-5xl">Turn a trip into a book you can hold.</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#776b60]">Pick a cover for where you went, add your favourite photos, and we’ll print and deliver an 8 × 10 in hardcover in Accra.</p>
            <Link href="/make-album" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#e87836] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#d4692b]">Make my first album <ArrowRight size={16} /></Link>
        </div>
    </div>;

    return <div className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
        <header>
            <p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#c16b36]">My albums</p>
            <h1 className="mt-3 font-[Georgia] text-4xl leading-[1.05] tracking-[-.035em] sm:text-[52px]">{firstName ? `Welcome back, ${firstName}.` : "Welcome back."}</h1>
            {summary && <p className="mt-3 text-sm text-[#776b60]">{summary}</p>}
        </header>

        {orders.length > 0 && <Section title="In the works" note="We’ll keep you posted at every step">
            <div className="grid gap-5 lg:grid-cols-2">{orders.map(album => <OrderCard key={album.id} album={album} />)}</div>
        </Section>}

        <Section title={drafts.length ? "Ready to order" : "Start something new"} note={drafts.length ? "Saved to your account" : undefined}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {drafts.map(album => <DraftCard key={album.id} album={album} />)}
                <Link href="/make-album" className="group flex min-h-[320px] flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-[#d9c8b5] bg-[#faf6f0] p-8 text-center transition hover:border-[#e87836] hover:bg-white">
                    <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#f0dfcc] text-[#b66b3d] transition group-hover:scale-110"><Plus size={24} strokeWidth={1.8} /></span>
                    <strong className="font-[Georgia] text-xl">Another trip to keep?</strong>
                    <span className="mt-1.5 text-xs text-[#8c7f70]">Start a new album</span>
                </Link>
            </div>
        </Section>

        {shelf.length > 0 && <Section title="On your shelf">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{shelf.map(album => <ShelfCard key={album.id} album={album} />)}</div>
        </Section>}
    </div>;
}
