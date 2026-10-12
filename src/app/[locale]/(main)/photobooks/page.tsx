import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ALBUM_FORMAT, ALBUM_PRICE_GHS } from "@/lib/album-order";
import { createClientServerRSC } from "@/lib/supabase/server";
import { isOrderStatus, PLACED_STATUSES, STATUS_INFO } from "@/lib/album-fulfilment";
import { albumFontVariables } from "@/components/album/album-fonts";
import AlbumCoverThumb from "@/components/album/AlbumCoverThumb";
import AlbumPaymentStatus from "./AlbumPaymentStatus";

export const metadata: Metadata = { title: "My albums" };
export const dynamic = "force-dynamic";

type AlbumRow = {
    id: string;
    title: string;
    cover_template_id: string;
    album_year: string | null;
    cover_typeface: string | null;
    cover_text_color: string | null;
    status: string;
    page_count: number | null;
    total_cost: number | null;
    currency: string | null;
    updated_at: string | null;
    created_at: string;
    images: { count: number }[];
};

export default async function PhotobooksPage() {
    const sb = await createClientServerRSC();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect("/album-login");

    const { data } = await sb.schema("itinero").from("photobooks")
        .select("id,title,cover_template_id,album_year,cover_typeface,cover_text_color,status,page_count,total_cost,currency,updated_at,created_at,images:photobook_images(count)")
        .eq("user_id", user.id).order("created_at", { ascending: false });
    const albums = (data ?? []) as AlbumRow[];

    return <main className={`${albumFontVariables} min-h-screen bg-[#f6f2ec] text-[#2b1a07]`}>
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
            <header className="flex flex-col gap-8 border-b border-[#dfd3c4] pb-11 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="mb-5 text-[11px] font-bold uppercase tracking-[.23em] text-[#c16b36]">Your collection</p>
                    <h1 className="max-w-2xl font-[Georgia] text-5xl leading-[1.05] tracking-[-.045em] sm:text-6xl">Every trip, close<br /><em>enough to hold.</em></h1>
                    <p className="mt-5 max-w-xl text-sm leading-6 text-[#776b60]">Your albums and orders live here. Revisit a draft, follow a delivery, or make room for another journey.</p>
                </div>
                <Link href="/make-album" className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#2b1a07] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#53330e]"><Plus size={17} /> Make an album</Link>
            </header>
        </div>
        <AlbumPaymentStatus />
        <section className="mx-auto -mt-10 max-w-6xl px-5 pb-28 sm:px-8" aria-label="Your albums">
            {albums.length === 0 ? <div className="rounded-[26px] border border-[#e2d6c7] bg-[#fdfbf8] px-7 py-20 text-center shadow-[0_14px_38px_#2b1a0709]">
                <BookOpen size={43} strokeWidth={1.3} className="mx-auto mb-5 text-[#b77950]" />
                <h2 className="font-[Georgia] text-3xl">Your first album starts here.</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#817366]">Choose a destination cover and bring your favourite trip photos. We’ll help with the pages.</p>
                <Link href="/make-album" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#e87836] px-5 py-3 text-sm font-bold text-white">Make my album <ArrowRight size={16} /></Link>
            </div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map(album => <AlbumCard key={album.id} album={album} />)}
                <Link href="/make-album" className="group flex min-h-[390px] flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-[#d9c8b5] bg-[#fbf8f3] p-8 text-center transition hover:border-[#e87836] hover:bg-white">
                    <span className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#f0dfcc] text-[#b66b3d] transition group-hover:scale-110"><Plus size={27} strokeWidth={1.7} /></span>
                    <strong className="font-[Georgia] text-2xl">Another place to keep.</strong>
                    <span className="mt-2 text-xs text-[#8c7f70]">Make a new album</span>
                </Link>
            </div>}
        </section>
    </main>;
}

function AlbumCard({ album }: { album: AlbumRow }) {
    const photoCount = album.images?.[0]?.count ?? 0;
    const status = isOrderStatus(album.status) ? album.status : null;
    const action = album.status === "draft" ? "Continue album" : album.status === "pending_payment" ? "Continue payment"
        : album.status === "changes_requested" ? "Update album" : "Follow order";
    const href = status && PLACED_STATUSES.includes(status) ? `/photobooks/${album.id}` : `/make-album?id=${album.id}`;
    return <Link href={href} className="group flex min-h-[390px] flex-col overflow-hidden rounded-[22px] border border-[#e4d9cb] bg-[#fdfbf8] shadow-[0_12px_32px_#2b1a070a] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_#2b1a071a]">
        <div className="relative flex min-h-[275px] items-center justify-center overflow-hidden bg-[#e9e0d3] p-5">
            <AlbumCoverThumb coverId={album.cover_template_id} title={album.title} year={album.album_year} typeface={album.cover_typeface} textColor={album.cover_text_color} height={245}
                className="shadow-[7px_10px_18px_#2b1a0730] transition duration-300 group-hover:rotate-[-2deg] group-hover:scale-[1.03]" />
            <span className="absolute right-4 top-4 rounded-full bg-[#fdfbf8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#785236] shadow-sm">{status ? STATUS_INFO[status].customerLabel : album.status.replaceAll("_", " ")}</span>
        </div>
        <div className="flex flex-1 flex-col p-5">
            <h2 className="truncate font-[Georgia] text-2xl">{album.title}</h2>
            <p className="mt-1 text-xs text-[#8a7d70]">{photoCount} photos · {album.page_count || "—"} proof pages · {ALBUM_FORMAT}</p>
            <div className="mt-auto flex items-center justify-between pt-5 text-xs font-bold"><span>GHS {album.total_cost || ALBUM_PRICE_GHS}</span><span className="inline-flex items-center gap-1 text-[#ba6737]">{action} <ArrowRight size={15} /></span></div>
        </div>
    </Link>;
}
