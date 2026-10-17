import { ImageResponse } from "next/og";
import sharp from "sharp";
import { normalizeCoverBackground, normalizeCoverTextColor, normalizeCoverTypeface, resolveCoverBackground, resolveCoverTextColor } from "@/lib/album-cover-style";
import { coverTitleLayout } from "@/lib/cover-title-layout";
import { coverArtPath, TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";

export const runtime = "nodejs";

const WIDTH = 400;
const HEIGHT = 500;
const FONTS = { bold: "/fonts/landing/lilita-one.ttf", serif: "/fonts/email/gelica-regular.ttf", handwritten: "/fonts/email/handwritten.ttf" } as const;

/**
 * The customer's album cover as a PNG, for emails (email apps can't draw the layered cover the site uses).
 * Everything comes from the query string, so the image holds nothing private. Same drawing rules as AlbumCoverThumb.
 */
export async function GET(request: Request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    const rawId = params.get("c") ?? "";
    const id = (Object.hasOwn(TRAVEL_COVERS_BY_ID, rawId) ? rawId : "italy") as TravelCoverId;
    const title = (params.get("t") ?? TRAVEL_COVERS_BY_ID[id].country).slice(0, 40);
    const year = (params.get("y") ?? "").slice(0, 8);
    const typeface = normalizeCoverTypeface(params.get("f"));
    const background = normalizeCoverBackground(params.get("bg"));
    const coverColor = resolveCoverBackground(background, TRAVEL_COVERS_BY_ID[id].color);
    const ink = resolveCoverTextColor(normalizeCoverTextColor(params.get("tc")), coverColor);

    // Static files are fetched from this site, so the route works on serverless hosts too.
    const [art, font] = await Promise.all([
        fetch(new URL(coverArtPath(id, background), url.origin)).then(response => response.ok ? response.arrayBuffer() : null).catch(() => null),
        fetch(new URL(FONTS[typeface], url.origin)).then(response => response.arrayBuffer()),
    ]);
    const artPng = art ? await sharp(Buffer.from(art)).resize(WIDTH, HEIGHT, { fit: "cover" }).png().toBuffer() : null;

    const layout = coverTitleLayout(title);
    const oneLine = layout.lines.length === 1;
    const sizeCap = oneLine ? (typeface === "handwritten" ? 22 : typeface === "serif" ? 24 : 25.5) : typeface === "handwritten" ? 11.5 : 12.5;
    const displaySize = Math.min(layout.size, sizeCap);
    const fontSize = displaySize * WIDTH / 100;

    return new ImageResponse(
        <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: coverColor, color: ink, fontFamily: "Cover" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {artPng && <img src={`data:image/png;base64,${artPng.toString("base64")}`} width={WIDTH} height={HEIGHT} alt="" style={{ position: "absolute", left: 0, top: 0 }} />}
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", flexDirection: "column", padding: `${WIDTH * .05}px ${WIDTH * .07}px 0` }}>
                <div style={{ display: "flex", flexDirection: "column", fontSize, lineHeight: typeface === "handwritten" ? 1.08 : .94, letterSpacing: "-.045em", textTransform: typeface === "bold" ? "uppercase" : "none", transform: `scaleX(${Math.min(1.35, layout.size / displaySize)})`, transformOrigin: "left top", whiteSpace: "nowrap" }}>
                    {layout.lines.map((line, index) => <span key={index}>{line}</span>)}
                </div>
                {year && <span style={{ alignSelf: "flex-end", fontSize: WIDTH * (oneLine ? .07 : .06), lineHeight: 1, marginTop: WIDTH * .01 }}>{year}</span>}
            </div>
        </div>,
        {
            width: WIDTH, height: HEIGHT,
            fonts: [{ name: "Cover", data: font, weight: 400, style: "normal" }],
            headers: { "Cache-Control": "public, max-age=31536000, immutable" },
        },
    );
}
