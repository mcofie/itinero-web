import Image from "next/image";
import { coverArtPath, TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import { normalizeCoverBackground, normalizeCoverTextColor, normalizeCoverTypeface, resolveCoverBackground, resolveCoverTextColor } from "@/lib/album-cover-style";
import { coverTitleLayout } from "@/lib/cover-title-layout";
import { cn } from "@/lib/utils";

type AlbumCoverThumbProps = {
    coverId: string | null | undefined;
    title: string;
    year: string | null | undefined;
    typeface: string | null | undefined;
    textColor: string | null | undefined;
    /** The customer's cover colour; "auto" or empty keeps the illustration's own. */
    background?: string | null;
    /** Rendered height in pixels; the cover keeps a 4:5 ratio. Needs `albumFontVariables` on an ancestor. */
    height: number;
    className?: string;
};

/** Small 4:5 album cover with the customer's title, as on the printed proof. */
export default function AlbumCoverThumb({ coverId, title, year, typeface: rawTypeface, textColor: rawTextColor, background: rawBackground, height, className }: AlbumCoverThumbProps) {
    const id = coverId && Object.hasOwn(TRAVEL_COVERS_BY_ID, coverId) ? coverId as TravelCoverId : "italy";
    const cover = TRAVEL_COVERS_BY_ID[id];
    const typeface = normalizeCoverTypeface(rawTypeface);
    const textColor = normalizeCoverTextColor(rawTextColor);
    const background = normalizeCoverBackground(rawBackground);
    const coverColor = resolveCoverBackground(background, cover.color);
    const coverWidth = height * .8;
    const titleFont = typeface === "serif" ? "var(--font-album-serif), Georgia, serif"
        : typeface === "handwritten" ? "var(--font-album-hand), cursive" : "var(--font-album-round), Arial, sans-serif";
    const titleLayout = coverTitleLayout(title);
    const oneLine = titleLayout.lines.length === 1;
    const sizeCap = oneLine ? (typeface === "handwritten" ? 22 : typeface === "serif" ? 24 : 25.5)
        : typeface === "handwritten" ? 11.5 : 12.5;
    const displaySize = Math.min(titleLayout.size, sizeCap);
    return <div className={cn("relative aspect-[4/5] shrink-0 overflow-hidden rounded-[3px_7px_7px_3px]", className)} style={{ background: coverColor, height }}>
        <Image src={coverArtPath(id, background)} fill sizes={`${Math.ceil(height * 0.8)}px`} alt="" className="object-cover" />
        <div className="absolute inset-x-0 top-0 flex flex-col" style={{ color: resolveCoverTextColor(textColor, coverColor), padding: `${coverWidth * .05}px ${coverWidth * .07}px 0` }}>
            <strong className="block w-full whitespace-nowrap" style={{ fontFamily: titleFont, fontWeight: 400, textTransform: typeface === "bold" ? "uppercase" : "none", lineHeight: typeface === "handwritten" ? 1.08 : .94, letterSpacing: "-.045em", fontSize: displaySize * coverWidth / 100, transform: `scaleX(${Math.min(1.35, titleLayout.size / displaySize)})`, transformOrigin: "left top" }}>{titleLayout.lines.map((line, index) => <span key={index}>{index > 0 && <br />}{line}</span>)}</strong>
            <span className="self-end" style={{ fontFamily: titleFont, fontSize: coverWidth * (oneLine ? .07 : .06), lineHeight: 1, marginTop: coverWidth * .01 }}>{year}</span>
        </div>
    </div>;
}
