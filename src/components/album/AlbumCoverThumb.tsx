import Image from "next/image";
import { coverPrintImagePath, TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import { normalizeCoverTextColor, normalizeCoverTypeface, resolveCoverTextColor } from "@/lib/album-cover-style";
import { cn } from "@/lib/utils";

type AlbumCoverThumbProps = {
    coverId: string | null | undefined;
    title: string;
    year: string | null | undefined;
    typeface: string | null | undefined;
    textColor: string | null | undefined;
    /** Rendered height in pixels; the cover keeps a 4:5 ratio. Needs `albumFontVariables` on an ancestor. */
    height: number;
    className?: string;
};

/** Small 4:5 album cover with the customer's title, as on the printed proof. */
export default function AlbumCoverThumb({ coverId, title, year, typeface: rawTypeface, textColor: rawTextColor, height, className }: AlbumCoverThumbProps) {
    const id = coverId && Object.hasOwn(TRAVEL_COVERS_BY_ID, coverId) ? coverId as TravelCoverId : "italy";
    const cover = TRAVEL_COVERS_BY_ID[id];
    const typeface = normalizeCoverTypeface(rawTypeface);
    const textColor = normalizeCoverTextColor(rawTextColor);
    const scale = height / 245;
    const titleFont = typeface === "serif" ? "var(--font-album-serif), Georgia, serif"
        : typeface === "handwritten" ? "var(--font-album-hand), cursive" : "var(--font-album-round), Arial, sans-serif";
    const titleSize = title.length > 22 ? 15 : title.length > 9 ? 19 : 27;
    return <div className={cn("relative aspect-[4/5] shrink-0 overflow-hidden rounded-[3px_7px_7px_3px]", className)} style={{ background: cover.color, height }}>
        <Image src={coverPrintImagePath(id)} fill sizes={`${Math.ceil(height * 0.8)}px`} alt="" className="object-cover" />
        <div className="absolute inset-x-0 top-0 flex h-[27%] flex-col justify-between leading-[.9] tracking-[-.05em]" style={{ color: resolveCoverTextColor(textColor, cover.color), padding: `${8 * scale}px ${12 * scale}px` }}>
            <span className="flex justify-between gap-1 font-sans font-bold tracking-[.08em] opacity-80" style={{ fontSize: Math.max(6 * scale, 3) }}><span>Itinero · travel album</span><span>{year}</span></span>
            <strong className="line-clamp-2 break-words" style={{ fontFamily: titleFont, fontWeight: 400, textTransform: typeface === "bold" ? "uppercase" : "none", lineHeight: typeface === "handwritten" ? 1.08 : .92, fontSize: titleSize * scale }}>{title}</strong>
        </div>
    </div>;
}
