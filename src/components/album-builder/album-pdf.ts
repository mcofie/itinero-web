import type { AlbumLayout, AlbumPhoto } from "./album-draft";
import { groupAlbumPhotos } from "./album-layout";
import { resolveCoverBackground, resolveCoverTextColor, type CoverTypeface } from "@/lib/album-cover-style";
import { coverArtPath, type TravelCoverId } from "@/lib/travel-covers";
import { coverTitleLayout } from "@/lib/cover-title-layout";
import type { AlbumPageText } from "@/lib/album-page-text";

// The 8 × 10 inch print file at 300 pixels per inch. Built in the orders admin after payment,
// never in the customer’s browser.
export const PRINT_WIDTH = 2400;
export const PRINT_HEIGHT = 3000;
const DESIGN_WIDTH = 1800;
const DESIGN_HEIGHT = 2250;


type ExportOptions = {
    title: string;
    destination: string;
    year: string;
    coverId: TravelCoverId;
    coverColor: string;
    coverFontFamily: string;
    coverTypeface: CoverTypeface;
    coverTextColor: string;
    /** The customer's cover colour, or "auto" for the illustration's own background. */
    coverBackground: string;
    layout: AlbumLayout;
    photos: AlbumPhoto[];
    pageText: AlbumPageText;
    /** Resolved font families for the album serif, handwritten and rounded faces. */
    fonts: AlbumFonts;
    onProgress?: (page: number, total: number) => void;
};

export type AlbumFonts = { serif: string; hand: string; round: string };

/** Draws an image to fill a box, cropping the overflow around a focus point (0–1; centre by default). */
function drawCropped(ctx: CanvasRenderingContext2D, image: ImageBitmap, x: number, y: number, width: number, height: number, focusX = 0.5, focusY = 0.5) {
    const scale = Math.max(width / image.width, height / image.height);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    ctx.drawImage(image, (image.width - sourceWidth) * focusX, (image.height - sourceHeight) * focusY, sourceWidth, sourceHeight, x, y, width, height);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.clip();
}

function paintCoverTitle(ctx: CanvasRenderingContext2D, title: string, year: string, color: string, fontFamily: string, typeface: CoverTypeface, textColor: string) {
    ctx.fillStyle = resolveCoverTextColor(textColor, color);
    const headline = (typeface === "bold" ? title.trim().toUpperCase() : title.trim()) || "My trip";
    const layout = coverTitleLayout(headline);
    const availableWidth = DESIGN_WIDTH * .86;
    const top = DESIGN_WIDTH * .05;
    const oneLine = layout.lines.length === 1;
    const sizeCap = oneLine ? (typeface === "handwritten" ? 22 : typeface === "serif" ? 24 : 25.5)
        : typeface === "handwritten" ? 11.5 : 12.5;
    let fontSize = DESIGN_WIDTH * Math.min(layout.size, sizeCap) / 100;
    ctx.font = `400 ${fontSize}px ${fontFamily}`;
    const widestLine = () => Math.max(...layout.lines.map(line => ctx.measureText(line).width));
    if (widestLine() > availableWidth) {
        fontSize *= availableWidth / widestLine();
        ctx.font = `400 ${fontSize}px ${fontFamily}`;
    }
    const stretch = Math.min(1.35, availableWidth / widestLine());
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    const lineHeight = fontSize * (typeface === "handwritten" ? 1.08 : typeface === "serif" ? 1 : .94);
    ctx.save();
    ctx.translate(DESIGN_WIDTH * .07, top);
    ctx.scale(stretch, 1);
    layout.lines.forEach((line, index) => ctx.fillText(line, 0, index * lineHeight));
    ctx.restore();
    ctx.font = `400 ${DESIGN_WIDTH * (oneLine ? .07 : .06)}px ${fontFamily}`;
    ctx.textAlign = "right";
    ctx.fillText(year, DESIGN_WIDTH * .93, top + layout.lines.length * lineHeight + DESIGN_WIDTH * .01);
    ctx.textAlign = "left";
}

async function paintPhoto(ctx: CanvasRenderingContext2D, photo: AlbumPhoto, x: number, y: number, width: number, height: number) {
    const bitmap = await createImageBitmap(photo.blob);
    try {
        ctx.save();
        roundRect(ctx, x, y, width, height, 12);
        drawCropped(ctx, bitmap, x, y, width, height, photo.focusX ?? 0.5, photo.focusY ?? 0.5);
        ctx.restore();
    } finally {
        bitmap.close();
    }
}

function paintCaption(ctx: CanvasRenderingContext2D, caption: string, x: number, y: number, maxWidth: number) {
    if (!caption.trim()) return;
    ctx.fillStyle = "#2b1a07";
    ctx.font = "italic 38px Georgia, serif";
    ctx.textBaseline = "top";
    let value = caption.trim();
    while (value.length > 1 && ctx.measureText(value).width > maxWidth) value = `${value.slice(0, -2).trimEnd()}…`;
    ctx.fillText(value, x, y);
}

async function paintInterior(ctx: CanvasRenderingContext2D, photos: AlbumPhoto[], layout: AlbumLayout, pageNumber: number, destination: string) {
    ctx.fillStyle = "#fdfbf8";
    ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    ctx.fillStyle = "#8e7d67";
    ctx.font = "700 30px Arial, sans-serif";
    ctx.letterSpacing = "4px";
    ctx.fillText(destination.toUpperCase(), 155, 128);
    ctx.textAlign = "right";
    ctx.fillText(String(pageNumber).padStart(2, "0"), DESIGN_WIDTH - 155, 128);
    ctx.textAlign = "left";
    ctx.letterSpacing = "0px";

    if (photos.length === 1 || layout === "gallery") {
        await paintPhoto(ctx, photos[0], 155, 235, 1490, 1690);
        paintCaption(ctx, photos[0].caption, 160, 1970, 1450);
        return;
    }

    if (photos.length === 2 || layout === "editorial") {
        await paintPhoto(ctx, photos[0], 155, 225, 1490, 760);
        paintCaption(ctx, photos[0].caption, 160, 1005, 1450);
        await paintPhoto(ctx, photos[1], 155, 1130, 1490, 760);
        paintCaption(ctx, photos[1].caption, 160, 1910, 1450);
        return;
    }

    await paintPhoto(ctx, photos[0], 155, 225, 1490, 920);
    paintCaption(ctx, photos[0].caption, 160, 1165, 1450);
    await paintPhoto(ctx, photos[1], 155, 1310, 715, 585);
    await paintPhoto(ctx, photos[2], 930, 1310, 715, 585);
    paintCaption(ctx, photos[1].caption, 160, 1915, 710);
    paintCaption(ctx, photos[2].caption, 935, 1915, 710);
}

/** Word-wraps text to a width, keeping line breaks; the last allowed line ends with an ellipsis when cut. */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
    const lines: string[] = [];
    for (const paragraph of text.trim().split("\n")) {
        let line = "";
        for (const word of paragraph.split(/\s+/).filter(Boolean)) {
            const candidate = line ? `${line} ${word}` : word;
            if (!line || ctx.measureText(candidate).width <= maxWidth) line = candidate;
            else { lines.push(line); line = word; }
        }
        lines.push(line);
    }
    if (lines.length <= maxLines) return lines;
    const kept = lines.slice(0, maxLines);
    let last = `${kept[maxLines - 1]}…`;
    while (last.length > 2 && ctx.measureText(last).width > maxWidth) last = `${last.slice(0, -2).trimEnd()}…`;
    kept[maxLines - 1] = last;
    return kept;
}

/** Shrinks a font size until the text fits a width. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, font: (size: number) => string, size: number, maxWidth: number, minSize: number) {
    ctx.font = font(size);
    while (size > minSize && ctx.measureText(text).width > maxWidth) ctx.font = font(--size);
    return size;
}

function paintPaper(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#fdfbf8";
    ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    ctx.strokeStyle = "#d6c6ae";
    ctx.lineWidth = 3;
    ctx.strokeRect(155, 155, DESIGN_WIDTH - 310, DESIGN_HEIGHT - 310);
    ctx.textBaseline = "top";
}

/** The page after the cover: heading, place and year, an optional dedication, and the photo count. */
function paintOpening(ctx: CanvasRenderingContext2D, heading: string, subtitle: string, note: string, photoCount: number, fonts: AlbumFonts) {
    paintPaper(ctx);
    ctx.textAlign = "left";
    ctx.fillStyle = "#e87836";
    ctx.font = `400 72px ${fonts.hand}`;
    ctx.fillText("the good kind of souvenir", 230, 300);

    // Same size steps as the builder preview (8.33 / 6.6 / 5 cqw), shrinking further only if three lines would be needed.
    let size = heading.length <= 14 ? 150 : heading.length <= 24 ? 119 : 90;
    let lines: string[];
    do {
        ctx.font = `400 ${size}px ${fonts.serif}`;
        lines = wrapLines(ctx, heading, 1340, 99);
        if (lines.length <= 2) break;
        size -= 6;
    } while (size > 72);
    lines = wrapLines(ctx, heading, 1340, 2);
    ctx.fillStyle = "#2b1a07";
    let y = 700;
    for (const line of lines) { ctx.fillText(line, 230, y); y += size * 1.02; }

    y += 40;
    ctx.fillStyle = "#6d5c4b";
    ctx.font = `400 54px ${fonts.serif}`;
    ctx.fillText(subtitle, 230, y);
    y += 54;
    if (note.trim()) {
        y += 90;
        ctx.fillStyle = "#e87836";
        ctx.fillRect(230, y, 120, 5);
        y += 75;
        ctx.fillStyle = "#3f2f1d";
        ctx.font = `italic 400 50px ${fonts.serif}`;
        for (const line of wrapLines(ctx, note, 1340, 6)) { ctx.fillText(line, 230, y); y += 72; }
    }
    ctx.fillStyle = "#8e7d67";
    ctx.font = "32px Arial, sans-serif";
    ctx.fillText(`${photoCount} ${photoCount === 1 ? "moment" : "moments"} worth keeping`, 230, 1990);
}

/** The last page: a sign-off, an optional note, and a travel stamp for the place and year. */
function paintClosing(ctx: CanvasRenderingContext2D, destination: string, year: string, note: string, fonts: AlbumFonts) {
    paintPaper(ctx);
    ctx.textAlign = "center";
    ctx.fillStyle = "#e87836";
    ctx.font = `400 78px ${fonts.hand}`;
    ctx.fillText("until next time,", 900, 560);
    ctx.fillStyle = "#2b1a07";
    ctx.font = `400 200px ${fonts.serif}`;
    ctx.fillText("The end.", 900, 700);
    ctx.fillStyle = "#6d5c4b";
    ctx.font = `italic 400 100px ${fonts.serif}`;
    ctx.fillText("for now.", 900, 930);
    if (note.trim()) {
        ctx.fillStyle = "#3f2f1d";
        ctx.font = `italic 400 50px ${fonts.serif}`;
        let y = 1150;
        for (const line of wrapLines(ctx, note, 1200, 5)) { ctx.fillText(line, 900, y); y += 72; }
    }

    ctx.strokeStyle = "#c08a5a";
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(900, 1800, 150, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(900, 1800, 132, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#a2602f";
    ctx.letterSpacing = "5px";
    fitFont(ctx, destination.toUpperCase(), size => `700 ${size}px Arial, sans-serif`, 30, 230, 16);
    ctx.fillText(destination.toUpperCase(), 900, 1752);
    ctx.letterSpacing = "0px";
    ctx.font = `400 46px ${fonts.serif}`;
    ctx.fillText(year, 900, 1800);
    ctx.fillStyle = "#a89a8a";
    ctx.font = "28px Arial, sans-serif";
    ctx.fillText("Made with Itinero", 900, 1990);
    ctx.textAlign = "left";
}

/** The back cover, in the cover's colour: a round crop of the illustration, the place and year, an optional line, and the Itinero mark. */
function paintBackCover(ctx: CanvasRenderingContext2D, cover: ImageBitmap, color: string, ink: string, destination: string, year: string, note: string, fonts: AlbumFonts) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    ctx.save();
    ctx.beginPath(); ctx.arc(900, 860, 360, 0, Math.PI * 2); ctx.clip();
    drawCropped(ctx, cover, 540, 500, 720, 720);
    ctx.restore();
    ctx.strokeStyle = ink;
    ctx.globalAlpha = .55;
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(900, 860, 385, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = ink;
    ctx.letterSpacing = "10px";
    fitFont(ctx, destination.toUpperCase(), size => `700 ${size}px Arial, sans-serif`, 38, 1300, 20);
    ctx.fillText(destination.toUpperCase(), 900, 1310);
    ctx.letterSpacing = "0px";
    ctx.font = `400 46px ${fonts.serif}`;
    ctx.fillText(year, 900, 1375);
    if (note.trim()) {
        ctx.font = `italic 400 54px ${fonts.serif}`;
        let y = 1520;
        for (const line of wrapLines(ctx, note, 1300, 3)) { ctx.fillText(line, 900, y); y += 76; }
    }
    ctx.font = `400 96px ${fonts.round}`;
    ctx.fillText("itinero", 900, 1930);
    ctx.globalAlpha = .8;
    ctx.font = "30px Arial, sans-serif";
    ctx.fillText("For the trips that stay with you.", 900, 2060);
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
}

type PdfPage = { jpeg: Uint8Array; width: number; height: number };

/** Writes JPEG pages into a PDF. Page sizes come from the pixel size at 300 pixels per inch. */
function makePdf(pages: PdfPage[]): Blob {
    const encoder = new TextEncoder();
    const parts: Uint8Array[] = [];
    const offsets: number[] = [];
    let position = 0;
    const append = (chunk: string | Uint8Array) => {
        const bytes = typeof chunk === "string" ? encoder.encode(chunk) : chunk;
        parts.push(bytes);
        position += bytes.byteLength;
    };
    const object = (id: number, body: string | Uint8Array) => {
        offsets[id] = position;
        append(`${id} 0 obj\n`);
        append(body);
        append("\nendobj\n");
    };
    const points = (pixels: number) => +(pixels * 72 / 300).toFixed(3);
    const pageIds = pages.map((_, index) => 3 + index * 3);
    append("%PDF-1.4\n");
    object(1, "<< /Type /Catalog /Pages 2 0 R >>");
    object(2, `<< /Type /Pages /Count ${pages.length} /Kids [ ${pageIds.map(id => `${id} 0 R`).join(" ")} ] >>`);
    pages.forEach((page, index) => {
        const pageId = pageIds[index];
        const contentId = pageId + 1;
        const imageId = pageId + 2;
        const width = points(page.width), height = points(page.height);
        object(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
        const content = `q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q`;
        object(contentId, `<< /Length ${encoder.encode(content).byteLength} >>\nstream\n${content}\nendstream`);
        offsets[imageId] = position;
        append(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.byteLength} >>\nstream\n`);
        append(page.jpeg);
        append("\nendstream\nendobj\n");
    });
    const xrefPosition = position;
    append(`xref\n0 ${3 + pages.length * 3}\n0000000000 65535 f \n`);
    for (let id = 1; id < 3 + pages.length * 3; id++) append(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
    append(`trailer\n<< /Size ${3 + pages.length * 3} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`);
    const output = new Uint8Array(position);
    let cursor = 0;
    for (const part of parts) {
        output.set(part, cursor);
        cursor += part.byteLength;
    }
    return new Blob([output.buffer], { type: "application/pdf" });
}

function jpegFromCanvas(canvas: HTMLCanvasElement): Promise<Uint8Array> {
    return new Promise((resolve, reject) => canvas.toBlob(async blob => {
        if (!blob) return reject(new Error("Could not render an album page."));
        resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/jpeg", 0.9));
}

export type PrintSpec = { interiorBleedMm: number; coverWrapMm: number; spineBaseMm: number; spinePerPageMm: number };

const mmToPx = (mm: number) => Math.round(mm / 25.4 * 300);

/** Spine width for a hardcover: board allowance plus paper for every interior page. */
export function spineWidthMm(spec: PrintSpec, interiorPages: number) {
    return Math.round((spec.spineBaseMm + interiorPages * spec.spinePerPageMm) * 10) / 10;
}

function canvas2d(width: number, height: number) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Your browser could not create the print file.");
    return { canvas, ctx };
}

/**
 * Builds the printer-ready files: the interior pages (opening, photos, closing) with bleed on every edge,
 * and the cover spread (back, spine, front) with a wrap margin for the hardcover case.
 * `coverArt` is the print-resolution cover illustration when available; otherwise the web image is used.
 */
export async function createPrintFiles(options: ExportOptions & { spec: PrintSpec; coverArt?: Blob | null }) {
    const groups = groupAlbumPhotos(options.photos, options.layout);
    const interiorCount = groups.length + 2;
    const total = interiorCount + 1;
    let progress = 0;
    const step = async () => {
        options.onProgress?.(++progress, total);
        await new Promise<void>(resolve => setTimeout(resolve, 0));
    };

    const { canvas, ctx } = canvas2d(PRINT_WIDTH, PRINT_HEIGHT);
    ctx.scale(PRINT_WIDTH / DESIGN_WIDTH, PRINT_HEIGHT / DESIGN_HEIGHT);
    const text = options.pageText;
    const coverColor = resolveCoverBackground(options.coverBackground, options.coverColor);
    const ink = resolveCoverTextColor(options.coverTextColor, coverColor);

    // Interior pages sit on paper-coloured bleed.
    const bleed = mmToPx(options.spec.interiorBleedMm);
    const interior: PdfPage[] = [];
    const bled = canvas2d(PRINT_WIDTH + bleed * 2, PRINT_HEIGHT + bleed * 2);
    const addInterior = async () => {
        bled.ctx.fillStyle = "#fdfbf8";
        bled.ctx.fillRect(0, 0, bled.canvas.width, bled.canvas.height);
        bled.ctx.drawImage(canvas, bleed, bleed);
        interior.push({ jpeg: await jpegFromCanvas(bled.canvas), width: bled.canvas.width, height: bled.canvas.height });
        await step();
    };
    paintOpening(ctx, text.openingTitle.trim() || options.title.trim() || options.destination, `${options.destination} · ${options.year}`, text.openingNote, options.photos.length, options.fonts);
    await addInterior();
    for (let index = 0; index < groups.length; index++) {
        await paintInterior(ctx, groups[index], options.layout, index + 1, options.destination);
        await addInterior();
    }
    paintClosing(ctx, options.destination, options.year, text.closingNote, options.fonts);
    await addInterior();

    // Cover spread: wrap | back | spine | front | wrap, all on the cover colour.
    const art: Blob = options.coverArt ?? await fetch(coverArtPath(options.coverId, options.coverBackground)).then(response => {
        if (!response.ok) throw new Error("The selected cover could not be loaded.");
        return response.blob();
    });
    const coverBitmap = await createImageBitmap(art);
    const wrap = mmToPx(options.spec.coverWrapMm);
    const spineMm = spineWidthMm(options.spec, interiorCount);
    const spine = mmToPx(spineMm);
    const spread = canvas2d(wrap * 2 + PRINT_WIDTH * 2 + spine, wrap * 2 + PRINT_HEIGHT);
    try {
        spread.ctx.fillStyle = coverColor;
        spread.ctx.fillRect(0, 0, spread.canvas.width, spread.canvas.height);
        paintBackCover(ctx, coverBitmap, coverColor, ink, options.destination, options.year, text.backNote, options.fonts);
        spread.ctx.drawImage(canvas, wrap, wrap);
        ctx.fillStyle = coverColor;
        ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
        drawCropped(ctx, coverBitmap, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
        paintCoverTitle(ctx, options.title, options.year, coverColor, options.coverFontFamily, options.coverTypeface, options.coverTextColor);
        spread.ctx.drawImage(canvas, wrap + PRINT_WIDTH + spine, wrap);
    } finally {
        coverBitmap.close();
    }
    paintSpine(spread.ctx, wrap + PRINT_WIDTH, wrap, spine, PRINT_HEIGHT, `${options.title.trim() || options.destination} · ${options.year}`, ink, options.coverFontFamily);
    const cover: PdfPage = { jpeg: await jpegFromCanvas(spread.canvas), width: spread.canvas.width, height: spread.canvas.height };
    await step();

    return { interior: makePdf(interior), cover: makePdf([cover]), spineMm, interiorPages: interiorCount };
}

/** Title and year along the spine, reading top to bottom, when the spine is wide enough to hold text. */
function paintSpine(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, label: string, ink: string, fontFamily: string) {
    if (width < mmToPx(5)) return;
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let size = Math.round(width * 0.5);
    ctx.font = `400 ${size}px ${fontFamily}`;
    while (size > 12 && ctx.measureText(label).width > height * 0.8) ctx.font = `400 ${--size}px ${fontFamily}`;
    ctx.fillText(label, 0, 0);
    ctx.restore();
}
