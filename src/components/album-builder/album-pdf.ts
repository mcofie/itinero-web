import type { AlbumLayout, AlbumPhoto } from "./album-draft";
import { resolveCoverTextColor, type CoverTypeface } from "@/lib/album-cover-style";
import { coverPrintImagePath, type TravelCoverId } from "@/lib/travel-covers";

// A standard 8 × 10 inch portrait proof at 300 pixels per inch.
export const PRINT_WIDTH = 2400;
export const PRINT_HEIGHT = 3000;
const DESIGN_WIDTH = 1800;
const DESIGN_HEIGHT = 2250;

export function groupAlbumPhotos(photos: AlbumPhoto[], layout: AlbumLayout): AlbumPhoto[][] {
    const perPage = layout === "gallery" ? 1 : layout === "collage" ? 3 : 2;
    return Array.from({ length: Math.ceil(photos.length / perPage) }, (_, index) => photos.slice(index * perPage, (index + 1) * perPage));
}

type ExportOptions = {
    title: string;
    destination: string;
    year: string;
    coverId: TravelCoverId;
    coverColor: string;
    coverFontFamily: string;
    coverTypeface: CoverTypeface;
    coverTextColor: string;
    layout: AlbumLayout;
    photos: AlbumPhoto[];
    onProgress?: (page: number, total: number) => void;
};

function drawCropped(ctx: CanvasRenderingContext2D, image: ImageBitmap, x: number, y: number, width: number, height: number) {
    const scale = Math.max(width / image.width, height / image.height);
    const sourceWidth = width / scale;
    const sourceHeight = height / scale;
    ctx.drawImage(image, (image.width - sourceWidth) / 2, (image.height - sourceHeight) / 2, sourceWidth, sourceHeight, x, y, width, height);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.clip();
}

function paintCoverTitle(ctx: CanvasRenderingContext2D, title: string, year: string, color: string, fontFamily: string, typeface: CoverTypeface, textColor: string) {
    ctx.fillStyle = resolveCoverTextColor(textColor, color);
    const headline = (typeface === "bold" ? title.trim().toUpperCase() : title.trim()) || "My trip";
    ctx.font = "700 34px Arial, sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText("ITINERO · TRAVEL ALBUM", 125, 83);
    ctx.font = "700 52px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(year, DESIGN_WIDTH - 125, 75);
    ctx.textAlign = "left";
    let fontSize = headline.length > 22 ? 145 : headline.length > 9 ? 175 : 250;
    let lines: string[] = [];
    for (; fontSize >= 100; fontSize -= 5) {
        ctx.font = `400 ${fontSize}px ${fontFamily}`;
        lines = [];
        for (const word of headline.split(/\s+/)) {
            const last = lines.length - 1;
            const candidate = last < 0 ? word : `${lines[last]} ${word}`;
            if (last < 0 || ctx.measureText(candidate).width > DESIGN_WIDTH - 250) lines.push(word);
            else lines[last] = candidate;
        }
        if (lines.length <= 2 && lines.every(line => ctx.measureText(line).width <= DESIGN_WIDTH - 250)) break;
    }
    const lineHeight = fontSize * (typeface === "handwritten" ? 1.05 : typeface === "serif" ? .97 : .88);
    const firstY = lines.length === 1 ? 315 : 205;
    lines.slice(0, 2).forEach((line, index) => ctx.fillText(line, 125, firstY + index * lineHeight));
}

async function paintPhoto(ctx: CanvasRenderingContext2D, photo: AlbumPhoto, x: number, y: number, width: number, height: number) {
    const bitmap = await createImageBitmap(photo.blob);
    try {
        ctx.save();
        roundRect(ctx, x, y, width, height, 12);
        drawCropped(ctx, bitmap, x, y, width, height);
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

function paintIntro(ctx: CanvasRenderingContext2D, title: string, destination: string, year: string, photoCount: number) {
    ctx.fillStyle = "#fdfbf8";
    ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    ctx.strokeStyle = "#d6c6ae";
    ctx.lineWidth = 3;
    ctx.strokeRect(155, 155, DESIGN_WIDTH - 310, DESIGN_HEIGHT - 310);
    ctx.fillStyle = "#e87836";
    ctx.font = "italic 65px Georgia, serif";
    ctx.fillText("the good kind of souvenir", 230, 350);
    ctx.fillStyle = "#2b1a07";
    const headline = title.trim() || destination;
    let fontSize = 155;
    do {
        ctx.font = `bold ${fontSize}px Georgia, serif`;
        if (ctx.measureText(headline).width <= DESIGN_WIDTH - 460) break;
        fontSize -= 5;
    } while (fontSize > 70);
    ctx.fillText(headline, 230, 900);
    ctx.font = "52px Georgia, serif";
    ctx.fillText(`${destination} · ${year}`, 230, 1160);
    ctx.fillStyle = "#8e7d67";
    ctx.font = "32px Arial, sans-serif";
    ctx.fillText(`${photoCount} moments worth keeping`, 230, 1900);
}

function paintEnding(ctx: CanvasRenderingContext2D, destination: string) {
    ctx.fillStyle = "#ed7936";
    ctx.fillRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
    ctx.fillStyle = "#fff7e9";
    ctx.font = "bold 170px Georgia, serif";
    ctx.fillText("The end.", 160, 980);
    ctx.font = "italic 94px Georgia, serif";
    ctx.fillText("For now.", 160, 1220);
    ctx.font = "42px Arial, sans-serif";
    ctx.fillText(`Made from memories of ${destination}.`, 165, 2030);
}

function makePdf(jpegs: Uint8Array[]): Blob {
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
    const pageIds = jpegs.map((_, index) => 3 + index * 3);
    append("%PDF-1.4\n");
    object(1, "<< /Type /Catalog /Pages 2 0 R >>");
    object(2, `<< /Type /Pages /Count ${jpegs.length} /Kids [ ${pageIds.map(id => `${id} 0 R`).join(" ")} ] >>`);
    jpegs.forEach((jpeg, index) => {
        const pageId = pageIds[index];
        const contentId = pageId + 1;
        const imageId = pageId + 2;
        object(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 576 720] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
        const content = "q 576 0 0 720 0 0 cm /Im0 Do Q";
        object(contentId, `<< /Length ${encoder.encode(content).byteLength} >>\nstream\n${content}\nendstream`);
        offsets[imageId] = position;
        append(`${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${PRINT_WIDTH} /Height ${PRINT_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.byteLength} >>\nstream\n`);
        append(jpeg);
        append("\nendstream\nendobj\n");
    });
    const xrefPosition = position;
    append(`xref\n0 ${3 + jpegs.length * 3}\n0000000000 65535 f \n`);
    for (let id = 1; id < 3 + jpegs.length * 3; id++) append(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
    append(`trailer\n<< /Size ${3 + jpegs.length * 3} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`);
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

export async function createAlbumPdf(options: ExportOptions): Promise<Blob> {
    const groups = groupAlbumPhotos(options.photos, options.layout);
    const total = groups.length + 3;
    const canvas = document.createElement("canvas");
    canvas.width = PRINT_WIDTH;
    canvas.height = PRINT_HEIGHT;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Your browser could not create the PDF preview.");
    ctx.scale(PRINT_WIDTH / DESIGN_WIDTH, PRINT_HEIGHT / DESIGN_HEIGHT);
    const jpegs: Uint8Array[] = [];
    const addPage = async () => {
        jpegs.push(await jpegFromCanvas(canvas));
        options.onProgress?.(jpegs.length, total);
        await new Promise<void>(resolve => setTimeout(resolve, 0));
    };

    const coverResponse = await fetch(coverPrintImagePath(options.coverId));
    if (!coverResponse.ok) throw new Error("The selected cover could not be loaded.");
    const coverBitmap = await createImageBitmap(await coverResponse.blob());
    try {
        drawCropped(ctx, coverBitmap, 0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);
        paintCoverTitle(ctx, options.title, options.year, options.coverColor, options.coverFontFamily, options.coverTypeface, options.coverTextColor);
        await addPage();
    } finally {
        coverBitmap.close();
    }

    paintIntro(ctx, options.title, options.destination, options.year, options.photos.length);
    await addPage();
    for (let index = 0; index < groups.length; index++) {
        await paintInterior(ctx, groups[index], options.layout, index + 1, options.destination);
        await addPage();
    }
    paintEnding(ctx, options.destination);
    await addPage();

    return makePdf(jpegs);
}

export async function downloadAlbumPdf(options: ExportOptions): Promise<void> {
    const pdf = await createAlbumPdf(options);
    const url = URL.createObjectURL(pdf);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${options.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "itinero"}-${options.year}-album.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
