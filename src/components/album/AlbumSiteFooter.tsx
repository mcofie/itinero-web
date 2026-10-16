import { Link } from "@/i18n/routing";

/** Warm footer for the album pages, in the landing page's style. */
export default function AlbumSiteFooter() {
    return <footer className="mt-16 rounded-t-[36px] bg-[#ed7936] px-6 pb-7 pt-12 text-[#fff6e8] sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/itinero-mark-white-animated.svg" alt="" width={72} height={36} />
                <p className="mt-5 max-w-xs font-[Georgia] text-3xl leading-tight">Making books that bring trips back.</p>
            </div>
            <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-[16px]">
                <Link href="/make-album" className="hover:underline">Make an album</Link>
                <Link href="/photobooks" className="hover:underline">My albums</Link>
                <Link href="/#how-it-works" className="hover:underline">How it works</Link>
                <Link href="/terms" className="hover:underline">Terms</Link>
                <Link href="/#your-way" className="hover:underline">Covers</Link>
                <Link href="/privacy" className="hover:underline">Privacy</Link>
            </nav>
        </div>
        <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-2 border-t border-[#ffffff40] pt-5 text-xs text-[#ffeddd] sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} Itinero</span>
            <span>For the trips that stay with you.</span>
        </div>
    </footer>;
}
