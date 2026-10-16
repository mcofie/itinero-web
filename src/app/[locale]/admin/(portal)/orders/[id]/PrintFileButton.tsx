"use client";

import { useRef, useState } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { ALBUM_BUCKET } from "@/lib/album-order";
import { normalizeCoverBackground, normalizeCoverTextColor, normalizeCoverTypeface } from "@/lib/album-cover-style";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import type { TravelCoverId } from "@/lib/travel-covers";
import type { AlbumLayout, AlbumPhoto } from "@/components/album-builder/album-draft";
import type { AlbumPageText } from "@/lib/album-page-text";
import type { PrintSpec } from "@/components/album-builder/album-pdf";
import { primaryButton, quietButton } from "../../admin-ui";

/**
 * Resolves a CSS font stack to the loaded family names canvas needs. The probe goes inside `host`,
 * which must sit under the element that defines the album font variables (the portal layout).
 */
async function resolveFont(stack: string, host: HTMLElement) {
    const probe = document.createElement("span");
    probe.style.fontFamily = stack;
    host.appendChild(probe);
    const family = getComputedStyle(probe).fontFamily;
    probe.remove();
    await Promise.all([document.fonts.load(`400 100px ${family}`), document.fonts.load(`italic 400 100px ${family}`)]);
    return family;
}

const TITLE_FONTS = {
    bold: "var(--font-album-round), 'Arial Rounded MT Bold', sans-serif",
    serif: "var(--font-album-serif), Georgia, serif",
    handwritten: "var(--font-album-hand), cursive",
} as const;

type Prepared = {
    album: { title: string; year: string; coverId: TravelCoverId; destination: string; coverColor: string; typeface: string | null; textColor: string | null; background: string; layout: AlbumLayout; pageText: AlbumPageText };
    photos: { id: string; name: string; width: number; height: number; caption: string; focusX: number; focusY: number; url: string }[];
    upload: { interior: { path: string; token: string }; cover: { path: string; token: string } };
    coverArtUrl: string | null;
    printSpec: PrintSpec;
};

async function post(orderId: string, body: unknown) {
    const response = await fetch(`/api/admin/orders/${orderId}/print-file`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Could not build the print files.");
    return result;
}

/** Builds the printer-ready interior and cover spread (300 dpi) in this browser from the original photos, and stores them privately. */
export default function PrintFileButton({ orderId, rebuild }: { orderId: string; rebuild: boolean }) {
    const router = useRouter();
    const [stage, setStage] = useState<string | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const build = async () => {
        if (stage) return;
        try {
            setStage("Preparing…");
            const prepared: Prepared = await post(orderId, { action: "prepare" });
            const photos: AlbumPhoto[] = [];
            for (const [index, photo] of prepared.photos.entries()) {
                setStage(`Fetching photo ${index + 1} of ${prepared.photos.length}`);
                const response = await fetch(photo.url);
                if (!response.ok) throw new Error(`Photo ${index + 1} could not be downloaded.`);
                photos.push({ id: photo.id, name: photo.name, blob: await response.blob(), url: "", width: photo.width, height: photo.height, caption: photo.caption, focusX: photo.focusX, focusY: photo.focusY });
            }

            // Resolve the cover title font the customer chose, as the builder does, and wait for it to load.
            const typeface = normalizeCoverTypeface(prepared.album.typeface);
            const host = buttonRef.current?.parentElement ?? document.body;
            const [coverFontFamily, serif, hand, round] = await Promise.all([
                resolveFont(TITLE_FONTS[typeface], host), resolveFont(TITLE_FONTS.serif, host), resolveFont(TITLE_FONTS.handwritten, host), resolveFont(TITLE_FONTS.bold, host),
            ]);
            if (!/album/i.test(round)) throw new Error("The album fonts didn’t load. Refresh the page and try again.");

            // Print-resolution cover art when it's been uploaded; otherwise the web image is used.
            const coverArt = prepared.coverArtUrl ? await fetch(prepared.coverArtUrl).then(response => response.ok ? response.blob() : null).catch(() => null) : null;
            const { createPrintFiles } = await import("@/components/album-builder/album-pdf");
            const files = await createPrintFiles({
                title: prepared.album.title, destination: prepared.album.destination, year: prepared.album.year, coverId: prepared.album.coverId,
                coverColor: prepared.album.coverColor, coverFontFamily, coverTypeface: typeface, coverTextColor: normalizeCoverTextColor(prepared.album.textColor), coverBackground: normalizeCoverBackground(prepared.album.background),
                layout: prepared.album.layout, photos, pageText: prepared.album.pageText, fonts: { serif, hand, round },
                spec: prepared.printSpec, coverArt,
                onProgress: (page, total) => setStage(page < total ? `Drawing page ${page} of ${total - 1}` : "Drawing cover spread"),
            });
            setStage("Uploading…");
            const storage = getSupabaseBrowser().storage.from(ALBUM_BUCKET);
            for (const [file, blob] of [["interior", files.interior], ["cover", files.cover]] as const) {
                const { error } = await storage.uploadToSignedUrl(prepared.upload[file].path, prepared.upload[file].token, blob, { contentType: "application/pdf" });
                if (error) throw error;
            }
            await post(orderId, { action: "complete", interiorPath: prepared.upload.interior.path, coverPath: prepared.upload.cover.path, spineMm: files.spineMm });
            toast.success(`Print files ready · spine ${files.spineMm} mm${coverArt ? "" : " · web-resolution cover art"}`);
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not build the print files.");
        } finally { setStage(null); }
    };

    return <button ref={buttonRef} type="button" onClick={() => void build()} disabled={!!stage}
        className={rebuild ? quietButton : primaryButton}>
        {stage ? <><LoaderCircle size={15} className="animate-spin" />{stage}</> : <><FileText size={15} />{rebuild ? "Rebuild print files" : "Build print files"}</>}
    </button>;
}
