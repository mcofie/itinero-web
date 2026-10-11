import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
    const [font, italy, japan, mark] = await Promise.all([
        readFile(path.join(process.cwd(), "public/fonts/landing/lilita-one.ttf")),
        readFile(path.join(process.cwd(), "public/images/landing/covers/italy.png")),
        readFile(path.join(process.cwd(), "public/images/landing/covers/japan.png")),
        readFile(path.join(process.cwd(), "public/brand/itinero-mark.svg")),
    ]);
    return new ImageResponse(
        <div style={{ width: "100%", height: "100%", display: "flex", background: "#fdfbf9", color: "#2b1a07", padding: "64px", overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", width: 570, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: "AlbumRound", fontSize: 42, color: "#ed7936", marginBottom: 34 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`data:image/svg+xml;base64,${mark.toString("base64")}`} width={76} height={44} alt="" />
                    <span>itinero.</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", fontFamily: "AlbumRound", fontSize: 90, lineHeight: 1 }}>
                    <span>Your trips.</span><span>In print.</span>
                </div>
                <div style={{ display: "flex", fontSize: 25, lineHeight: 1.4, marginTop: 32, maxWidth: 420 }}>Beautiful photo albums for the trips that stay with you.</div>
            </div>
            <div style={{ position: "absolute", display: "flex", right: 190, top: 65, transform: "rotate(-12deg)", boxShadow: "8px 14px 24px #2b1a0726" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`data:image/png;base64,${japan.toString("base64")}`} width={290} height={435} alt="Japan photo album" />
            </div>
            <div style={{ position: "absolute", display: "flex", right: 20, top: 165, transform: "rotate(9deg)", boxShadow: "8px 14px 24px #2b1a0733" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`data:image/png;base64,${italy.toString("base64")}`} width={290} height={435} alt="Italy photo album" />
            </div>
        </div>,
        { width: 1200, height: 630, fonts: [{ name: "AlbumRound", data: new Uint8Array(font).buffer, weight: 400, style: "normal" }] },
    );
}
