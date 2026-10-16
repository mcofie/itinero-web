"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type DragEvent, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, ImagePlus, LoaderCircle, Maximize2, Plus, Search, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { Link } from "@/i18n/routing";
import { COVER_BACKGROUND_SWATCHES, COVER_COLOR_SWATCHES, COVER_TYPEFACES, DEFAULT_COVER_BACKGROUND, DEFAULT_COVER_TEXT_COLOR, normalizeCoverBackground, resolveCoverBackground, DEFAULT_COVER_TYPEFACE, normalizeCoverTextColor, normalizeCoverTypeface, resolveCoverTextColor, type CoverTypeface } from "@/lib/album-cover-style";
import { coverArtPath, coverPrintImagePath, coverThumbnailPath, TRAVEL_COVERS, TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import { coverTitleLayout } from "@/lib/cover-title-layout";
import { ALBUM_BUCKET, ALBUM_FORMAT } from "@/lib/album-order";
import { formatGhs, priceBreakdown, type AlbumPricing, type PriceBreakdown } from "@/lib/album-pricing";
import { EDITABLE_STATUSES, isOrderStatus, STATUS_INFO, type OrderStatus } from "@/lib/album-fulfilment";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { clearAlbumDraft, deleteAlbumPhoto, loadAlbumDraft, saveAlbumDraft, saveAlbumPhoto, type AlbumDraftMeta, type AlbumLayout, type AlbumPhoto } from "./album-draft";
import { groupAlbumPhotos } from "./album-layout";
import StoryList from "./StoryList";
import { EMPTY_PAGE_TEXT, EXTRA_PAGES, normalizePageText, PAGE_TEXT_LIMITS, type AlbumPageText } from "@/lib/album-page-text";
import { AlbumWorkspaceSkeleton } from "./AlbumBuilderSkeleton";
import styles from "./AlbumBuilder.module.css";

const YEAR = String(new Date().getFullYear());
const DEFAULT_DESTINATION: TravelCoverId = "italy";
const defaultTitle = (id: TravelCoverId) => TRAVEL_COVERS_BY_ID[id].country.toUpperCase();
const MAX_PHOTOS = 40;
const MAX_FILE_BYTES = 35 * 1024 * 1024;
const layouts: { id: AlbumLayout; name: string; description: string; count: string }[] = [
    { id: "editorial", name: "Editorial", description: "Two moments on every page", count: "02" },
    { id: "gallery", name: "Gallery", description: "One photo, room to breathe", count: "01" },
    { id: "collage", name: "Collage", description: "A lively three-photo rhythm", count: "03" },
];
const steps = ["Cover", "Photos", "Pages", "Review"] as const;
const typefaceClasses = { bold: styles.typefaceBold, serif: styles.typefaceSerif, handwritten: styles.typefaceHandwritten };
const searchAliases: Record<string, string> = { "cote-divoire": "ivory coast", usa: "america", uk: "britain england" };
const searchKey = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f’']/g, "").replace(/-/g, " ").toLowerCase();

function CoverPreview({ destinationId, title, year, typeface, textColor, background, className = "" }: { destinationId: TravelCoverId; title: string; year: string; typeface: CoverTypeface; textColor: string; background: string; className?: string }) {
    const cover = TRAVEL_COVERS_BY_ID[destinationId];
    const heading = title.trim() || cover.country;
    const titleLayout = coverTitleLayout(heading);
    const oneLine = titleLayout.lines.length === 1;
    const sizeCap = oneLine ? (typeface === "handwritten" ? 22 : typeface === "serif" ? 24 : 25.5)
        : typeface === "handwritten" ? 11.5 : 12.5;
    const displaySize = Math.min(titleLayout.size, sizeCap);
    return <div className={`${styles.coverPreview} ${typefaceClasses[typeface]} ${className}`} style={{
        "--cover-color": resolveCoverBackground(background, cover.color),
        "--cover-ink": resolveCoverTextColor(textColor, resolveCoverBackground(background, cover.color)),
        "--cover-title-size": `${displaySize}cqw`,
        "--cover-title-stretch": Math.min(1.35, titleLayout.size / displaySize),
        "--cover-year-size": oneLine ? "7cqw" : "6cqw",
    } as CSSProperties}>
        {/* The country illustration, on its own background or cut out over the customer's cover colour. */}
        <img src={coverArtPath(destinationId, background)} alt="" draggable={false} />
        <div className={styles.coverTitleArea}>
            <strong data-album-cover-title>{titleLayout.lines.map((line, index) => <span key={index}>{index > 0 && <br />}{line}</span>)}</strong>
            <span className={styles.coverYear}>{year}</span>
        </div>
    </div>;
}

const LOW_RESOLUTION_PX = 2400;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Lets a photo be dragged inside its frame; the overflow beyond the frame sets how far the anchor moves. */
function startFocusDrag(event: ReactPointerEvent<HTMLImageElement>, photo: AlbumPhoto, onFocusChange: (id: string, x: number, y: number) => void) {
    event.preventDefault();
    event.stopPropagation();
    const image = event.currentTarget;
    const frame = image.getBoundingClientRect();
    const scale = Math.max(frame.width / photo.width, frame.height / photo.height);
    const overflowX = photo.width * scale - frame.width;
    const overflowY = photo.height * scale - frame.height;
    const start = { x: event.clientX, y: event.clientY, focusX: photo.focusX ?? 0.5, focusY: photo.focusY ?? 0.5 };
    image.setPointerCapture(event.pointerId);
    const move = (moveEvent: PointerEvent) => onFocusChange(photo.id,
        overflowX > 1 ? clamp01(start.focusX - (moveEvent.clientX - start.x) / overflowX) : start.focusX,
        overflowY > 1 ? clamp01(start.focusY - (moveEvent.clientY - start.y) / overflowY) : start.focusY);
    const end = () => { image.removeEventListener("pointermove", move); image.removeEventListener("pointerup", end); image.removeEventListener("pointercancel", end); };
    image.addEventListener("pointermove", move);
    image.addEventListener("pointerup", end);
    image.addEventListener("pointercancel", end);
}

function AlbumPagePreview({ photos, layout, pageNumber, destination, onFocusChange }: { photos: AlbumPhoto[]; layout: AlbumLayout; pageNumber: number; destination: string; onFocusChange?: (id: string, x: number, y: number) => void }) {
    const look = photos.length === 1 ? "gallery" : photos.length === 2 ? "editorial" : layout;
    return <div className={styles.albumPage}>
        <div className={styles.pageFolio}><span>{destination}</span><span>{String(pageNumber).padStart(2, "0")}</span></div>
        <div className={`${styles.pagePhotos} ${styles[`pagePhotos_${look}`]}`}>
            {photos.map(photo => <figure key={photo.id} className={styles.pagePhoto}>
                <img src={photo.url} alt={photo.caption || photo.name} draggable={false}
                    className={onFocusChange ? styles.repositionable : undefined}
                    style={{ objectPosition: `${(photo.focusX ?? 0.5) * 100}% ${(photo.focusY ?? 0.5) * 100}%` }}
                    onPointerDown={onFocusChange ? event => startFocusDrag(event, photo, onFocusChange) : undefined}
                    onClick={onFocusChange ? event => event.stopPropagation() : undefined} />
                <figcaption>{photo.caption || "Add a little note…"}</figcaption>
            </figure>)}
            <span className={styles.previewMark} aria-hidden>itinero · preview</span>
        </div>
    </div>;
}

function OpeningPagePreview({ heading, subtitle, note, count }: { heading: string; subtitle: string; note: string; count: number }) {
    const headingSize = heading.length <= 14 ? "8.33cqw" : heading.length <= 24 ? "6.6cqw" : "5cqw";
    return <div className={styles.printPage}>
        <span className={styles.printFrame} aria-hidden />
        <span className={styles.openingGreeting}>the good kind of souvenir</span>
        <div className={styles.openingBody}>
            <strong className={`${styles.printClamp} ${styles.openingHeading}`} style={{ "--heading-size": headingSize } as CSSProperties}>{heading}</strong>
            <span className={styles.openingSubtitle}>{subtitle}</span>
            {note.trim() && <><span className={styles.openingRule} aria-hidden /><p className={`${styles.printClamp} ${styles.openingNote}`}>{note.trim()}</p></>}
        </div>
        <small className={styles.openingCount}>{count} {count === 1 ? "moment" : "moments"} worth keeping</small>
    </div>;
}

function ClosingPagePreview({ destination, year, note }: { destination: string; year: string; note: string }) {
    return <div className={styles.printPage}>
        <span className={styles.printFrame} aria-hidden />
        <div className={styles.closingCopy}>
            <span className={styles.closingHand}>until next time,</span>
            <strong className={styles.closingEnd}>The end.</strong>
            <em className={styles.closingNow}>for now.</em>
            {note.trim() && <p className={`${styles.printClamp} ${styles.closingNote}`}>{note.trim()}</p>}
        </div>
        <div className={styles.closingStamp} aria-hidden><span>{destination}</span><strong>{year}</strong></div>
        <small className={styles.closingMade}>Made with Itinero</small>
    </div>;
}

function BackCoverPreview({ destinationId, year, note, textColor, background }: { destinationId: TravelCoverId; year: string; note: string; textColor: string; background: string }) {
    const cover = TRAVEL_COVERS_BY_ID[destinationId];
    const color = resolveCoverBackground(background, cover.color);
    return <div className={`${styles.printPage} ${styles.backCover}`} style={{ "--cover-color": color, "--back-ink": resolveCoverTextColor(textColor, color) } as CSSProperties}>
        <div className={styles.backArt}><img src={coverArtPath(destinationId, background)} alt="" draggable={false} /></div>
        <span className={styles.backPlace}>{cover.country}</span>
        <span className={styles.backYear}>{year}</span>
        {note.trim() && <p className={`${styles.printClamp} ${styles.backNote}`}>{note.trim()}</p>}
        <strong className={styles.backMark}>itinero</strong>
        <small className={styles.backTagline}>For the trips that stay with you.</small>
    </div>;
}

type PreviewSpread = { kind: "opening" } | { kind: "photos"; photos: AlbumPhoto[]; number: number } | { kind: "closing" } | { kind: "back" };

function photoExtension(blob: Blob) {
    return blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : blob.type === "image/avif" ? "avif" : "jpg";
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new window.Image();
        image.onload = () => { resolve({ width: image.naturalWidth, height: image.naturalHeight }); URL.revokeObjectURL(url); };
        image.onerror = () => { reject(new Error(`${file.name} could not be read as a photo.`)); URL.revokeObjectURL(url); };
        image.src = url;
    });
}

export default function AlbumBuilder({ pricing }: { pricing: AlbumPricing }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photosRef = useRef<AlbumPhoto[]>([]);
    const [ready, setReady] = useState(false);
    const [step, setStep] = useState(0);
    const [destinationId, setDestinationId] = useState<TravelCoverId>(DEFAULT_DESTINATION);
    const [title, setTitle] = useState(() => defaultTitle(DEFAULT_DESTINATION));
    const [year, setYear] = useState(YEAR);
    const [coverTypeface, setCoverTypeface] = useState<CoverTypeface>(DEFAULT_COVER_TYPEFACE);
    const [coverTextColor, setCoverTextColor] = useState(DEFAULT_COVER_TEXT_COLOR);
    const [coverBackground, setCoverBackground] = useState(DEFAULT_COVER_BACKGROUND);
    const [layout, setLayout] = useState<AlbumLayout>("editorial");
    const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
    const [search, setSearch] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageText, setPageText] = useState<AlbumPageText>(EMPTY_PAGE_TEXT);
    const [previewExpanded, setPreviewExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState("");
    const [saveState, setSaveState] = useState<"saved" | "saving" | "unavailable">("saved");
    const [userEmail, setUserEmail] = useState<string | null>(null);
    // Folder for this album's uploads. Becomes the album id on first save, and is kept with the draft.
    const [cloudId, setCloudId] = useState<string | null>(null);
    const [backgroundUpload, setBackgroundUpload] = useState<{ done: number; total: number } | null>(null);
    const uploadingRef = useRef(false);
    const failedUploadsRef = useRef(new Set<string>());
    const [albumId, setAlbumId] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState("draft");
    const [changeRequest, setChangeRequest] = useState("");
    const [isResubmitting, setIsResubmitting] = useState(false);
    const [discountInput, setDiscountInput] = useState("");
    const [discount, setDiscount] = useState<{ code: string; label: string; amount: number } | null>(null);
    // A placed or pending order keeps the prices it was checked out with.
    const [orderPrice, setOrderPrice] = useState<PriceBreakdown | null>(null);
    const [discountError, setDiscountError] = useState("");
    const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);
    const editable = EDITABLE_STATUSES.includes(orderStatus as OrderStatus);
    const [isSavingCloud, setIsSavingCloud] = useState(false);
    const [cloudProgress, setCloudProgress] = useState(0);
    const [isOrdering, setIsOrdering] = useState(false);
    const [shipping, setShipping] = useState({ fullName: "", phone: "", street: "", area: "", landmark: "" });
    const [approved, setApproved] = useState(false);

    photosRef.current = photos;
    const destination = TRAVEL_COVERS_BY_ID[destinationId];
    const pages = useMemo(() => groupAlbumPhotos(photos, layout), [photos, layout]);
    const filteredCovers = useMemo(() => {
        const query = searchKey(search.trim());
        return TRAVEL_COVERS.filter(cover => searchKey(`${cover.country} ${cover.id} ${searchAliases[cover.id] || ""}`).includes(query));
    }, [search]);
    const lowResolution = photos.filter(photo => Math.min(photo.width, photo.height) < 2400);
    const saveUnavailable = saveState === "unavailable";

    useEffect(() => {
        let mounted = true;
        const open = async () => {
            let restoredPhotos: AlbumPhoto[] = [];
            try {
                const local = await loadAlbumDraft();
                restoredPhotos = local.photos;
                if (local.meta) {
                    if (local.meta.destinationId in TRAVEL_COVERS_BY_ID) setDestinationId(local.meta.destinationId as TravelCoverId);
                    setTitle(local.meta.title); setYear(local.meta.year); setLayout(local.meta.layout);
                    setCoverTypeface(normalizeCoverTypeface(local.meta.coverTypeface));
                    setCoverTextColor(normalizeCoverTextColor(local.meta.coverTextColor));
                    setCoverBackground(normalizeCoverBackground(local.meta.coverBackground));
                    setStep(Math.min(3, Math.max(0, local.meta.step)));
                    setPageText(normalizePageText(local.meta.pageText));
                    if (local.meta.cloudId) setCloudId(local.meta.cloudId);
                }
                const sb = getSupabaseBrowser();
                const { data: { user } } = await sb.auth.getUser();
                if (mounted) setUserEmail(user?.email ?? null);
                const id = new URLSearchParams(window.location.search).get("id");
                if (id && user) {
                    const response = await fetch(`/api/albums/${encodeURIComponent(id)}`, { cache: "no-store" });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error || "Could not open your saved album.");
                    const downloaded: AlbumPhoto[] = [];
                    try {
                        for (const item of result.photos as { id: string; storage_path: string; original_name: string | null; width: number; height: number; caption: string | null; focus_x: number | null; focus_y: number | null }[]) {
                            const { data, error } = await sb.storage.from(ALBUM_BUCKET).download(item.storage_path);
                            if (error || !data) throw new Error("One of your saved photos could not be opened.");
                            downloaded.push({ id: item.id, name: item.original_name || "Photo", blob: data,
                                url: URL.createObjectURL(data), width: item.width, height: item.height,
                                caption: item.caption || "", storagePath: item.storage_path, focusX: Number(item.focus_x ?? 0.5), focusY: Number(item.focus_y ?? 0.5) });
                        }
                    } catch (error) { downloaded.forEach(photo => URL.revokeObjectURL(photo.url)); throw error; }
                    restoredPhotos.forEach(photo => URL.revokeObjectURL(photo.url));
                    restoredPhotos = downloaded;
                    await clearAlbumDraft();
                    await Promise.all(downloaded.map(photo => saveAlbumPhoto(photo)));
                    const book = result.album;
                    setAlbumId(book.id); setOrderStatus(book.status); setChangeRequest(book.customer_message || "");
                    if (book.destination_id in TRAVEL_COVERS_BY_ID) setDestinationId(book.destination_id as TravelCoverId);
                    setTitle(book.title); setYear(book.album_year || YEAR); setPageText(normalizePageText(book.page_text));
                    setCoverTypeface(normalizeCoverTypeface(book.cover_typeface));
                    setCoverTextColor(normalizeCoverTextColor(book.cover_text_color));
                    setCoverBackground(normalizeCoverBackground(book.cover_color));
                    if (["gallery", "editorial", "collage"].includes(book.layout)) setLayout(book.layout);
                    if (book.shipping_address) setShipping(previous => ({ ...previous, ...book.shipping_address }));
                    if (book.status !== "draft" && book.discount_code) {
                        setDiscount({ code: book.discount_code, label: book.discount_code, amount: Number(book.discount_amount) });
                    }
                    if (book.status !== "draft" && book.subtotal !== null) {
                        setOrderPrice({ subtotal: Number(book.subtotal), discountAmount: Number(book.discount_amount ?? 0), deliveryFee: Number(book.delivery_fee ?? 0),
                            taxRate: Number(book.tax_rate ?? 0), taxLabel: pricing.taxLabel, tax: Number(book.tax_amount ?? 0), total: Number(book.total_cost) });
                    }
                    setStep(book.status === "draft" ? 2 : 3);
                }
                if (!mounted) { restoredPhotos.forEach(photo => URL.revokeObjectURL(photo.url)); return; }
                setPhotos(restoredPhotos);
            } catch (cause) {
                if (mounted) setError(cause instanceof Error ? cause.message : "Could not open this album.");
                if (mounted) setPhotos(restoredPhotos);
            } finally {
                if (mounted) setReady(true);
            }
        };
        void open();
        return () => { mounted = false; photosRef.current.forEach(photo => URL.revokeObjectURL(photo.url)); };
    }, []);

    useEffect(() => {
        if (!ready || saveUnavailable) return;
        setSaveState("saving");
        const timer = setTimeout(() => {
            const meta: AlbumDraftMeta = {
                destinationId, title, year, coverTypeface, coverTextColor, coverBackground, layout, step,
                photoIds: photos.map(photo => photo.id),
                captions: Object.fromEntries(photos.map(photo => [photo.id, photo.caption])),
                focus: Object.fromEntries(photos.map(photo => [photo.id, [photo.focusX ?? 0.5, photo.focusY ?? 0.5]])),
                pageText, cloudId: cloudId ?? undefined, updatedAt: Date.now(),
            };
            saveAlbumDraft(meta).then(() => setSaveState("saved")).catch(() => setSaveState("unavailable"));
        }, 450);
        return () => clearTimeout(timer);
    }, [ready, destinationId, title, year, coverTypeface, coverTextColor, coverBackground, layout, step, photos, pageText, cloudId, saveUnavailable]);

    // While signed in, upload new photos in the background so saving and ordering later is quick.
    useEffect(() => {
        if (!ready || !userEmail || !editable || isSavingCloud || uploadingRef.current) return;
        const pending = () => photosRef.current.filter(photo => !photo.storagePath && !failedUploadsRef.current.has(photo.id));
        if (!pending().length) return;
        uploadingRef.current = true;
        void (async () => {
            try {
                const sb = getSupabaseBrowser();
                const { data: { user } } = await sb.auth.getUser();
                if (!user) return;
                const folderId = albumId ?? cloudId ?? crypto.randomUUID();
                if (!albumId && !cloudId) setCloudId(folderId);
                let done = 0;
                for (let next = pending()[0]; next; next = pending()[0]) {
                    setBackgroundUpload({ done, total: done + pending().length });
                    const path = `${user.id}/${folderId}/${next.id}.${photoExtension(next.blob)}`;
                    const { error: uploadError } = await sb.storage.from(ALBUM_BUCKET).upload(path, next.blob, { contentType: next.blob.type || "image/jpeg", upsert: true });
                    if (uploadError) { failedUploadsRef.current.add(next.id); continue; }
                    done++;
                    const uploaded = photosRef.current.find(photo => photo.id === next.id);
                    if (uploaded) {
                        photosRef.current = photosRef.current.map(photo => photo.id === next.id ? { ...photo, storagePath: path } : photo);
                        setPhotos(current => current.map(photo => photo.id === next.id ? { ...photo, storagePath: path } : photo));
                        await saveAlbumPhoto({ ...uploaded, storagePath: path }).catch(() => setSaveState("unavailable"));
                    }
                }
            } finally {
                uploadingRef.current = false;
                setBackgroundUpload(null);
            }
        })();
    }, [ready, userEmail, editable, isSavingCloud, photos, albumId, cloudId]);

    // The page preview runs opening page → photo pages → closing page → back cover.
    const spreads = useMemo<PreviewSpread[]>(() => [{ kind: "opening" }, ...pages.map((group, index) => ({ kind: "photos" as const, photos: group, number: index + 1 })), { kind: "closing" }, { kind: "back" }], [pages]);
    useEffect(() => { setPageIndex(index => Math.min(index, spreads.length - 1)); }, [spreads.length]);
    const showSpread = (kind: PreviewSpread["kind"]) => setPageIndex(spreads.findIndex(spread => spread.kind === kind));
    const changePageText = (key: keyof AlbumPageText, value: string) => setPageText(current => ({ ...current, [key]: value.slice(0, PAGE_TEXT_LIMITS[key]) }));
    const renderSpread = (spread: PreviewSpread, interactive = false) => spread.kind === "opening"
        ? <OpeningPagePreview heading={pageText.openingTitle.trim() || title.trim() || destination.country} subtitle={`${destination.country} · ${year}`} note={pageText.openingNote} count={photos.length} />
        : spread.kind === "closing" ? <ClosingPagePreview destination={destination.country} year={year} note={pageText.closingNote} />
        : spread.kind === "back" ? <BackCoverPreview destinationId={destinationId} year={year} note={pageText.backNote} textColor={coverTextColor} background={coverBackground} />
        : <AlbumPagePreview photos={spread.photos} layout={layout} pageNumber={spread.number} destination={destination.country} onFocusChange={interactive ? setPhotoFocus : undefined} />;
    const spreadLabel = (spread: PreviewSpread) => spread.kind === "opening" ? "OPENING PAGE" : spread.kind === "closing" ? "CLOSING PAGE" : spread.kind === "back" ? "BACK COVER" : `PAGE ${spread.number} / ${pages.length}`;

    const addFiles = useCallback(async (incoming: FileList | File[]) => {
        const files = Array.from(incoming);
        const available = MAX_PHOTOS - photosRef.current.length;
        const supported = files.filter(file => ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) && file.size <= MAX_FILE_BYTES);
        if (available <= 0) { setError(`This album can hold up to ${MAX_PHOTOS} photos.`); return; }
        if (supported.length === 0) { setError("Choose JPG, PNG, WebP, or AVIF photos under 35 MB each."); return; }
        if (supported.length < files.length) setError("Some files were skipped. Use JPG, PNG, WebP, or AVIF photos under 35 MB each.");
        else setError("");
        setIsAdding(true);
        const additions: AlbumPhoto[] = [];
        try {
            for (const file of supported.slice(0, available)) {
                try {
                    const dimensions = await getImageDimensions(file);
                    const photo: AlbumPhoto = { id: crypto.randomUUID(), name: file.name, blob: file, url: URL.createObjectURL(file), caption: "", ...dimensions };
                    try { await saveAlbumPhoto(photo); } catch { setSaveState("unavailable"); }
                    additions.push(photo);
                } catch { setError(`One or more photos could not be opened. The others were added.`); }
            }
            if (additions.length) setPhotos(previous => [...previous, ...additions]);
            if (supported.length > available) setError(`Added the first ${available} photos. An album holds up to ${MAX_PHOTOS}.`);
        } finally { setIsAdding(false); }
    }, []);

    const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) void addFiles(event.target.files);
        event.target.value = "";
    };
    const handleDrop = (event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files.length) void addFiles(event.dataTransfer.files);
    };
    const removePhoto = (id: string) => {
        const photo = photosRef.current.find(item => item.id === id);
        setPhotos(previous => previous.filter(item => item.id !== id));
        if (photo) setTimeout(() => URL.revokeObjectURL(photo.url), 100);
        void deleteAlbumPhoto(id).catch(() => setSaveState("unavailable"));
        // A draft's uploads can be removed by their owner; a saved album also cleans up on its next save.
        if (photo?.storagePath && orderStatus === "draft") void getSupabaseBrowser().storage.from(ALBUM_BUCKET).remove([photo.storagePath]);
    };
    const movePhoto = (index: number, delta: number) => {
        const target = index + delta;
        if (target < 0 || target >= photos.length) return;
        setPhotos(previous => {
            const next = [...previous];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };
    const reorderPhoto = (fromId: string, toId: string) => setPhotos(previous => {
        const from = previous.findIndex(photo => photo.id === fromId);
        const to = previous.findIndex(photo => photo.id === toId);
        if (from < 0 || to < 0) return previous;
        const next = [...previous];
        next.splice(to, 0, ...next.splice(from, 1));
        return next;
    });
    const setPhotoFocus = (id: string, focusX: number, focusY: number) => setPhotos(previous => previous.map(photo => photo.id === id ? { ...photo, focusX, focusY } : photo));
    const showPhotoPage = (id: string) => {
        const index = spreads.findIndex(spread => spread.kind === "photos" && spread.photos.some(photo => photo.id === id));
        if (index >= 0) setPageIndex(index);
    };
    const changeCaption = (id: string, caption: string) => setPhotos(previous => previous.map(photo => photo.id === id ? { ...photo, caption } : photo));
    const chooseDestination = (id: TravelCoverId) => {
        const previousName = TRAVEL_COVERS_BY_ID[destinationId].country.toUpperCase();
        if (!title.trim() || title === previousName) setTitle(TRAVEL_COVERS_BY_ID[id].country.toUpperCase());
        setDestinationId(id);
    };
    const goToStep = (next: number) => {
        if (isSavingCloud || isOrdering) return;
        if (!editable && next < 3) return;
        setError("");
        const showStep = (index: number) => {
            setStep(index);
            setPreviewExpanded(false);
            window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        };
        if (next > 0 && (!title.trim() || !/^\d{4}$/.test(year))) { setError("Add a title and a four-digit year first."); showStep(0); return; }
        if (next > 1 && photos.length === 0) { setError("Add at least one photo to start your album."); showStep(1); return; }
        showStep(Math.max(0, Math.min(3, next)));
    };
    /** Clears the browser draft and returns the builder to a blank album. */
    const startOver = async () => {
        await clearAlbumDraft().catch(() => setSaveState("unavailable"));
        photos.forEach(photo => URL.revokeObjectURL(photo.url));
        setPhotos([]); setStep(0); setDestinationId(DEFAULT_DESTINATION); setTitle(defaultTitle(DEFAULT_DESTINATION)); setYear(YEAR);
        setCoverTypeface(DEFAULT_COVER_TYPEFACE); setCoverTextColor(DEFAULT_COVER_TEXT_COLOR); setCoverBackground(DEFAULT_COVER_BACKGROUND); setLayout("editorial");
        setAlbumId(null); setCloudId(null); setOrderStatus("draft"); setApproved(false); setPageText(EMPTY_PAGE_TEXT); setDiscount(null); setDiscountInput(""); setOrderPrice(null); setError("");
        window.history.replaceState({}, "", window.location.pathname);
    };
    const resetDraft = async () => {
        if (isSavingCloud || isOrdering) return;
        if (!window.confirm("Start a new album? This will remove the photos saved in this browser.")) return;
        await startOver();
    };
    const deleteSavedDraft = async () => {
        if (!albumId || orderStatus !== "draft" || isSavingCloud || isOrdering) return;
        if (!window.confirm("Delete this saved album and its photos from your account? This cannot be undone.")) return;
        const response = await fetch(`/api/albums/${albumId}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) { setError(result.error || "Could not delete this album."); return; }
        await startOver();
    };
    const signInGoogle = async () => {
        const currentId = albumId || new URLSearchParams(window.location.search).get("id");
        const next = `/make-album${currentId ? `?id=${encodeURIComponent(currentId)}` : ""}`;
        window.sessionStorage.setItem("itinero-auth-next", next);
        const { error: authError } = await getSupabaseBrowser().auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (authError) { window.sessionStorage.removeItem("itinero-auth-next"); setError(authError.message); }
    };

    const saveToAccount = async (): Promise<string | null> => {
        if (isSavingCloud || !photos.length || !editable) return null;
        const sb = getSupabaseBrowser();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) { await signInGoogle(); return null; }
        const id = albumId || cloudId || crypto.randomUUID();
        setAlbumId(id);
        setIsSavingCloud(true); setCloudProgress(0); setError("");
        try {
            const updated: AlbumPhoto[] = [];
            for (let index = 0; index < photos.length; index++) {
                const photo = photos[index];
                let path = photo.storagePath;
                if (!path || !path.startsWith(`${user.id}/${id}/`)) {
                    path = `${user.id}/${id}/${photo.id}.${photoExtension(photo.blob)}`;
                    const { error: uploadError } = await sb.storage.from(ALBUM_BUCKET).upload(path, photo.blob, {
                        contentType: photo.blob.type || "image/jpeg", upsert: true,
                    });
                    if (uploadError) throw uploadError;
                }
                const saved = { ...photo, storagePath: path };
                updated.push(saved);
                await saveAlbumPhoto(saved).catch(() => setSaveState("unavailable"));
                setCloudProgress(Math.round((index + 1) / photos.length * 100));
            }
            const response = await fetch("/api/albums", { method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, title, year, destinationId, coverTypeface, coverTextColor, coverBackground, layout, pageText,
                    photos: updated.map(photo => ({ id: photo.id, name: photo.name, storagePath: photo.storagePath,
                        width: photo.width, height: photo.height, caption: photo.caption, focusX: photo.focusX ?? 0.5, focusY: photo.focusY ?? 0.5 })) }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Could not save your album.");
            setAlbumId(id);
            setPhotos(current => current.map(photo => updated.find(saved => saved.id === photo.id) || photo));
            const url = new URL(window.location.href); url.searchParams.set("id", id);
            window.history.replaceState({}, "", url);
            return id;
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not save your album. Please try again.");
            return null;
        } finally { setIsSavingCloud(false); }
    };

    const resubmitAlbum = async () => {
        if (isResubmitting || orderStatus !== "changes_requested") return;
        if (!approved) { setError("Please confirm that you reviewed your updated album."); return; }
        setIsResubmitting(true); setError("");
        try {
            const id = await saveToAccount();
            if (!id) return;
            const response = await fetch(`/api/albums/${id}/resubmit`, { method: "POST" });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Could not send your updated album.");
            setOrderStatus(result.status); setChangeRequest(""); setApproved(false);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not send your updated album. Please try again.");
        } finally { setIsResubmitting(false); }
    };

    const applyDiscount = async () => {
        const code = discountInput.trim();
        if (!code || isCheckingDiscount) return;
        setIsCheckingDiscount(true); setDiscountError("");
        try {
            const response = await fetch(`/api/albums/${albumId ?? crypto.randomUUID()}/discount`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
            const result = await response.json();
            if (!response.ok || !result.discount) throw new Error(result.error || "That discount code isn’t valid.");
            setDiscount({ code: result.discount.code, label: result.discount.label, amount: result.discount.amount });
        } catch (cause) {
            setDiscount(null);
            setDiscountError(cause instanceof Error ? cause.message : "Could not check that code.");
        } finally { setIsCheckingDiscount(false); }
    };
    const price = orderPrice ?? priceBreakdown(pricing, discount?.amount ?? 0);
    const orderTotal = price.total;

    const orderAlbum = async () => {
        if (isOrdering || !["draft", "pending_payment"].includes(orderStatus)) return;
        if (!approved) { setError("Please confirm that you reviewed your album and that the address is in Accra."); return; }
        if (!shipping.fullName.trim() || !shipping.phone.trim() || !shipping.street.trim() || !shipping.area.trim()) {
            setError("Add your name, phone number, street and Accra area before ordering."); return;
        }
        setIsOrdering(true); setError("");
        try {
            const id = orderStatus === "pending_payment" ? albumId : await saveToAccount();
            if (!id) return;
            const response = await fetch(`/api/albums/${id}/checkout`, { method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shippingAddress: shipping, confirmedAccra: approved, discountCode: orderStatus === "draft" ? discount?.code : undefined }) });
            const result = await response.json();
            if (response.ok && result.free) { window.location.assign(`/photobooks/${id}`); return; }
            if (!response.ok || !result.authorizationUrl) throw new Error(result.error || "Could not start payment.");
            window.location.assign(result.authorizationUrl);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not place your order. Please try again.");
        } finally { setIsOrdering(false); }
    };

    return <div className={styles.builder}>
        <header className={styles.header}>
            <Link href="/" className={styles.brand} aria-label="Itinero home"><img src="/brand/itinero-mark-animated.svg" alt="" /><span>itinero</span></Link>
            <div className={styles.headerRight}><span className={styles.headerLabel}>{userEmail ? userEmail : "Your album studio"}</span><span className={styles.saveBadge}>{saveState === "saving" ? <span className={styles.savingDot} aria-hidden /> : saveState === "saved" ? <Check size={15} /> : null}{saveState === "saved" ? "Saved on this device" : saveState === "saving" ? "Saving" : "Device saving unavailable"}</span></div>
        </header>
        <input ref={fileInputRef} className={styles.hiddenInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={handleFileInput} />
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <span className={styles.eyebrow}>A place for your places</span>
                <h1>Make a little <em>room to remember.</em></h1>
                <p>Choose a cover, bring your photos, and we’ll shape the pages with you.</p>
                <nav className={styles.steps} aria-label="Album steps">
                    {steps.map((label, index) => <button key={label} type="button" onClick={() => goToStep(index)} disabled={!editable && index < 3} aria-current={step === index ? "step" : undefined} className={`${styles.step} ${step === index ? styles.stepActive : ""}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong>{index < step && <Check size={16} />}</button>)}
                </nav>
                <div className={styles.sidebarFoot}><BookOpen size={19} /><span>Designed by you.<br />Laid out with a little help.</span></div>
            </aside>

            <main className={styles.workspace}>
                <div className={styles.workspaceTop}><span>STEP {String(step + 1).padStart(2, "0")} / 04</span><span className={styles.workspaceSummary}>{photos.length ? `${photos.length} photos · ${pages.length + EXTRA_PAGES} pages` : "Your story starts here"}</span><strong className={styles.workspaceOffer}>{formatGhs(price.subtotal)} · {ALBUM_FORMAT} · {price.deliveryFee > 0 ? `Accra delivery ${formatGhs(price.deliveryFee)}` : "Accra delivery included"}</strong></div>
                {error && <div className={styles.error} role="alert">{error}</div>}
                {!ready ? <AlbumWorkspaceSkeleton /> : <div className={styles.workGrid} aria-busy={isSavingCloud || isOrdering}>
                    <section className={styles.controls}>
                        {step === 0 && <>
                            <div className={styles.sectionHead}><span className={styles.hand}>first things first</span><h2>Where did you go?</h2><p>Pick the place. We’ll start with a cover made for it.</p></div>
                            <label className={styles.searchField}><Search size={18} /><input type="search" aria-label="Find a destination" placeholder="Find a destination" value={search} onChange={event => setSearch(event.target.value)} /></label>
                            <div className={styles.destinationGrid}>
                                {filteredCovers.map(cover => <button key={cover.id} type="button" onClick={() => chooseDestination(cover.id)} className={`${styles.destinationCard} ${destinationId === cover.id ? styles.destinationSelected : ""}`} aria-pressed={destinationId === cover.id}>
                                    <span className={styles.destinationThumb} style={{ backgroundColor: cover.color }}><img src={coverThumbnailPath(cover.id)} alt="" loading="lazy" /></span><span>{cover.country}</span>{destinationId === cover.id && <Check size={15} />}
                                </button>)}
                                {filteredCovers.length === 0 && <p className={styles.emptyDestinations}>No destination found. Try another country name.</p>}
                            </div>
                            <div className={styles.formPair}><label>Album title<input maxLength={30} value={title} onChange={event => setTitle(event.target.value)} placeholder="Our favourite trip" /></label><label>Year<input inputMode="numeric" maxLength={4} value={year} onChange={event => setYear(event.target.value.replace(/[^\d]/g, ""))} placeholder="2026" /></label></div>
                            <p className={styles.fieldHint}>The title and year appear on your cover and opening page.</p>
                            <div className={styles.coverStyleControls}>
                                <div className={styles.styleHeading}><strong>Cover typeface</strong><span>Choose the mood of your title</span></div>
                                <div className={styles.typefaceOptions} role="group" aria-label="Cover typeface">
                                    {COVER_TYPEFACES.map(option => <button key={option.id} type="button" className={`${styles.typefaceOption} ${typefaceClasses[option.id]} ${coverTypeface === option.id ? styles.styleSelected : ""}`} aria-pressed={coverTypeface === option.id} onClick={() => setCoverTypeface(option.id)}>
                                        <span>{option.sample}</span><small>{option.label}</small>
                                    </button>)}
                                </div>
                                <div className={styles.styleHeading}><strong>Font color</strong><span>For the cover title and year</span></div>
                                <div className={styles.colorOptions} role="group" aria-label="Cover font color">
                                    {COVER_COLOR_SWATCHES.map(swatch => <button key={swatch.value} type="button" className={`${styles.colorOption} ${coverTextColor === swatch.value ? styles.colorSelected : ""}`} aria-label={swatch.label} aria-pressed={coverTextColor === swatch.value} onClick={() => setCoverTextColor(swatch.value)}>
                                        <span className={styles.colorDot} style={{ backgroundColor: swatch.value === "auto" ? resolveCoverTextColor("auto", resolveCoverBackground(coverBackground, destination.color)) : swatch.value }}>{swatch.value === "auto" ? "A" : null}</span><small>{swatch.value === "auto" ? "Matched" : swatch.label.replace("Warm ", "")}</small>
                                    </button>)}
                                    <label className={`${styles.customColor} ${coverTextColor !== "auto" && !COVER_COLOR_SWATCHES.some(swatch => swatch.value === coverTextColor) ? styles.colorSelected : ""}`}>
                                        <input type="color" aria-label="Custom cover font color" value={coverTextColor === "auto" ? resolveCoverTextColor("auto", resolveCoverBackground(coverBackground, destination.color)) : coverTextColor} onChange={event => setCoverTextColor(event.target.value)} />
                                        <small>Custom</small>
                                    </label>
                                </div>
                                <div className={styles.styleHeading}><strong>Cover color</strong><span>Behind the illustration, front and back</span></div>
                                <div className={styles.colorOptions} role="group" aria-label="Cover color">
                                    {COVER_BACKGROUND_SWATCHES.map(swatch => <button key={swatch.value} type="button" className={`${styles.colorOption} ${coverBackground === swatch.value ? styles.colorSelected : ""}`} aria-label={swatch.label} aria-pressed={coverBackground === swatch.value} onClick={() => setCoverBackground(swatch.value)}>
                                        <span className={styles.colorDot} style={{ backgroundColor: swatch.value === "auto" ? destination.color : swatch.value }} /><small>{swatch.label}</small>
                                    </button>)}
                                    <label className={`${styles.customColor} ${coverBackground !== "auto" && !COVER_BACKGROUND_SWATCHES.some(swatch => swatch.value === coverBackground) ? styles.colorSelected : ""}`}>
                                        <input type="color" aria-label="Custom cover color" value={resolveCoverBackground(coverBackground, destination.color)} onChange={event => setCoverBackground(event.target.value)} />
                                        <small>Custom</small>
                                    </label>
                                </div>
                            </div>
                        </>}

                        {step === 1 && <>
                            <div className={styles.sectionHead}><span className={styles.hand}>the good bits</span><h2>Bring your photos.</h2><p>We’ll put them in a first draft. You can change the order next.</p></div>
                            <div className={`${styles.dropZone} ${isDragging ? styles.dropActive : ""}`} onDragOver={event => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
                                <div className={styles.uploadIcon}><UploadCloud size={27} /></div><strong>Drop photos here</strong><span>or choose them from your device</span><button type="button" onClick={() => fileInputRef.current?.click()} disabled={isAdding}>{isAdding ? <><LoaderCircle size={17} className={styles.spin} /> Adding photos…</> : <><Plus size={17} /> Choose photos</>}</button><small>JPG, PNG, WebP, AVIF · up to {MAX_PHOTOS} photos</small>
                            </div>
                            {photos.length > 0 && <><div className={styles.photoSectionTitle}><h3>{photos.length} moments added</h3><button type="button" onClick={() => fileInputRef.current?.click()}><ImagePlus size={16} /> Add more</button></div><div className={styles.photoGrid}>{photos.map((photo, index) => <div key={photo.id} className={styles.photoTile}><img src={photo.url} alt={photo.name} loading="lazy" /><span>{String(index + 1).padStart(2, "0")}</span>{Math.min(photo.width, photo.height) < LOW_RESOLUTION_PX && <em className={styles.lowResBadge} title={`${photo.width} × ${photo.height} px. May print softly.`}>Low res</em>}<button type="button" onClick={() => removePhoto(photo.id)} aria-label={`Remove ${photo.name}`}><Trash2 size={15} /></button></div>)}</div></>}
                            {lowResolution.length > 0 && <p className={styles.uploadQualityWarning}><Sparkles size={16} /> {lowResolution.length} {lowResolution.length === 1 ? "photo may" : "photos may"} print softly. For the sharpest pages, replace {lowResolution.length === 1 ? "it" : "them"} with the original full-resolution file.</p>}
                            {backgroundUpload ? <p className={styles.fieldHint}>Saving photos to your account in the background · {backgroundUpload.done} of {backgroundUpload.total}</p>
                                : <p className={styles.fieldHint}>{userEmail ? "Your photos are saved to your account as you add them." : "Your photos stay on this device while you build. Sign in when you’re ready to save them and order."}</p>}
                        </>}

                        {step === 2 && <>
                            <div className={styles.sectionHead}><span className={styles.hand}>a little help from us</span><h2>Shape your story.</h2><p>Your pages are already arranged. Pick a rhythm, then put the moments in your order.</p></div>
                            <div className={styles.layoutOptions}>{layouts.map(option => <button key={option.id} type="button" onClick={() => { setLayout(option.id); setPageIndex(1); }} aria-pressed={layout === option.id} className={`${styles.layoutOption} ${layout === option.id ? styles.layoutSelected : ""}`}><span className={styles.layoutGlyph}>{option.count}</span><span><strong>{option.name}</strong><small>{option.description}</small></span>{layout === option.id && <Check size={17} />}</button>)}</div>
                            <div className={styles.photoSectionTitle}><h3>Photo order & captions</h3><span>{photos.length} photos</span></div>
                            <StoryList photos={photos} onReorder={reorderPhoto} onMove={movePhoto} onCaption={changeCaption} onSelect={showPhotoPage} />
                            <div className={styles.photoSectionTitle}><h3>Opening &amp; closing</h3><span>Optional</span></div>
                            <div className={styles.pageTextFields}>
                                <label>Opening page title<input value={pageText.openingTitle} maxLength={PAGE_TEXT_LIMITS.openingTitle} placeholder={title.trim() || destination.country} onFocus={() => showSpread("opening")} onChange={event => changePageText("openingTitle", event.target.value)} /><small>Leave empty to use your cover title.</small></label>
                                <label>A few words to open with<textarea rows={3} value={pageText.openingNote} maxLength={PAGE_TEXT_LIMITS.openingNote} placeholder="For Mum, who taught us to wander." onFocus={() => showSpread("opening")} onChange={event => changePageText("openingNote", event.target.value)} /><small>{pageText.openingNote.length}/{PAGE_TEXT_LIMITS.openingNote}</small></label>
                                <label>A note for the last page<textarea rows={3} value={pageText.closingNote} maxLength={PAGE_TEXT_LIMITS.closingNote} placeholder="Same time next year?" onFocus={() => showSpread("closing")} onChange={event => changePageText("closingNote", event.target.value)} /><small>{pageText.closingNote.length}/{PAGE_TEXT_LIMITS.closingNote}</small></label>
                                <label>Back cover line<input value={pageText.backNote} maxLength={PAGE_TEXT_LIMITS.backNote} placeholder="Accra to the Amalfi Coast, summer 2026" onFocus={() => showSpread("back")} onChange={event => changePageText("backNote", event.target.value)} /></label>
                            </div>
                        </>}

                        {step === 3 && <>
                            <div className={styles.sectionHead}><span className={styles.hand}>there it is</span><h2>A book of your trip.</h2><p>Take one last look, save your story, then order a printed hardcover.</p></div>
                            <div className={styles.reviewSummary}><div><span>Destination</span><strong>{destination.country}</strong></div><div><span>Cover title</span><strong>{title}</strong></div><div><span>Photos</span><strong>{photos.length} · {pages.length + EXTRA_PAGES} pages</strong></div><div><span>Format</span><strong>{ALBUM_FORMAT}</strong></div></div>
                            <div className={styles.qualityNote}><Sparkles size={20} /><div>
                                <strong>Check every page</strong>
                                <p>Flip through every page, captions included, before you order. After payment we build the print file, check it and add the printer’s bleed and spine.</p>
                                {lowResolution.length > 0 && <p className={styles.qualityWarning}>{lowResolution.length} {lowResolution.length === 1 ? "photo is" : "photos are"} under 2400 px on the short side and may print softly. Consider replacing {lowResolution.length === 1 ? "it" : "them"} with the original full-size file.</p>}
                                {editable && <button type="button" className={styles.exportButton} onClick={() => goToStep(2)}>Preview every page</button>}
                            </div></div>
                            {orderStatus === "draft" && !userEmail ? <div className={styles.shippingBox}>
                                <h3>Ready to order?</h3>
                                <p>Sign in with Google to save this album to your account, then add your Accra delivery details.</p>
                                <button type="button" className={styles.orderButton} onClick={() => void saveToAccount()} disabled={isSavingCloud}>Continue with Google</button>
                                <Link className={styles.emailSignIn} href={`/album-login?next=${encodeURIComponent(`/make-album${albumId ? `?id=${albumId}` : ""}`)}`}>No Google account? Sign in with email</Link>
                            </div> : ["draft", "pending_payment"].includes(orderStatus) ? <div className={styles.shippingBox}>
                                <h3>Deliver to Accra</h3><p>{price.deliveryFee > 0 ? `Delivery anywhere in Accra is ${formatGhs(price.deliveryFee)}.` : "Delivery anywhere in Accra is included."}</p>
                                <div className={styles.shippingFields}>
                                    <label>Full name<input autoComplete="name" value={shipping.fullName} onChange={event => setShipping({ ...shipping, fullName: event.target.value })} /></label>
                                    <label>Phone number<input autoComplete="tel" inputMode="tel" value={shipping.phone} onChange={event => setShipping({ ...shipping, phone: event.target.value })} placeholder="+233 …" /></label>
                                    <label className={styles.shippingWide}>Street address<input autoComplete="street-address" value={shipping.street} onChange={event => setShipping({ ...shipping, street: event.target.value })} /></label>
                                    <label>Area in Accra<input value={shipping.area} onChange={event => setShipping({ ...shipping, area: event.target.value })} placeholder="Osu, East Legon…" /></label>
                                    <label>Nearby landmark (optional)<input value={shipping.landmark} onChange={event => setShipping({ ...shipping, landmark: event.target.value })} /></label>
                                </div>
                                {orderStatus === "draft" && <>
                                    <div className={styles.discountRow}>
                                        <input value={discountInput} maxLength={24} aria-label="Discount code" placeholder="Discount code"
                                            onChange={event => { setDiscountInput(event.target.value); setDiscountError(""); if (discount) setDiscount(null); }}
                                            onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void applyDiscount(); } }} />
                                        <button type="button" onClick={() => void applyDiscount()} disabled={!discountInput.trim() || isCheckingDiscount}>{isCheckingDiscount ? <LoaderCircle size={15} className={styles.spin} /> : "Apply"}</button>
                                    </div>
                                    {discountError && <p className={styles.discountError} role="alert">{discountError}</p>}
                                </>}
                                <div className={styles.priceLines}>
                                    <div><span>Hardcover album · {ALBUM_FORMAT}</span><span>{formatGhs(price.subtotal)}</span></div>
                                    {discount && <div className={styles.priceDiscount}><span>{discount.code}{discount.label !== discount.code && ` · ${discount.label}`}{orderStatus === "draft" && <button type="button" onClick={() => { setDiscount(null); setDiscountInput(""); }}>Remove</button>}</span><span>− {formatGhs(price.discountAmount)}</span></div>}
                                    <div><span>Delivery in Accra</span><span>{price.deliveryFee > 0 ? formatGhs(price.deliveryFee) : "Included"}</span></div>
                                    {price.tax > 0 && <div><span>{price.taxLabel} ({price.taxRate}%)</span><span>{formatGhs(price.tax)}</span></div>}
                                    <div className={styles.priceTotal}><span>Total</span><span>{formatGhs(orderTotal)}</span></div>
                                </div>
                                <label className={styles.approval}><input type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} /> I’ve reviewed my photos and captions, and the delivery address is in Accra, Ghana.</label>
                                <button type="button" className={styles.orderButton} onClick={() => void orderAlbum()} disabled={isOrdering || isSavingCloud}>
                                    {isOrdering ? <><LoaderCircle size={18} className={styles.spin} /> Preparing your order…</> : orderStatus === "pending_payment" ? `Continue payment · ${formatGhs(orderTotal)}` : orderTotal <= 0 ? "Place free order" : `Order hardcover · ${formatGhs(orderTotal)}`}
                                </button>
                                <small>{orderTotal <= 0 ? "Your discount covers the full price. Printing begins after file review." : "Secure payment with Paystack. Printing begins after payment and file review."}</small>
                            </div> : orderStatus === "changes_requested" ? <div className={styles.shippingBox}>
                                <h3>A quick change before printing</h3>
                                <p>{changeRequest || "Please review your photos and pages."}</p>
                                <p>Update your photos, order or captions in the earlier steps, then send the album back to us. There’s nothing more to pay.</p>
                                <label className={styles.approval}><input type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} /> I’ve reviewed my updated album.</label>
                                <button type="button" className={styles.orderButton} onClick={() => void resubmitAlbum()} disabled={isResubmitting || isSavingCloud}>
                                    {isResubmitting ? <><LoaderCircle size={18} className={styles.spin} /> {isSavingCloud ? `Uploading photos · ${cloudProgress}%` : "Sending…"}</> : "Send updated album"}
                                </button>
                            </div> : <div className={styles.accountBox}><strong>Order status: {isOrderStatus(orderStatus) ? STATUS_INFO[orderStatus].customerLabel : orderStatus.replaceAll("_", " ")}</strong><p>Follow every step of your order, from printing to delivery.</p>{albumId ? <Link href={`/photobooks/${albumId}`}>Follow your order</Link> : <Link href="/photobooks">Go to My Albums</Link>}</div>}
                            {orderStatus === "draft" && userEmail && <button type="button" className={styles.resetButton} style={{ marginRight: 18 }} onClick={() => void saveToAccount()} disabled={isSavingCloud || isOrdering}>{isSavingCloud ? `Saving to My Albums · ${cloudProgress}%` : "Not ready? Save to My Albums"}</button>}
                            <button type="button" className={styles.resetButton} onClick={() => void resetDraft()}>Start a new album</button>
                            {albumId && orderStatus === "draft" && <button type="button" className={styles.resetButton} style={{ marginLeft: 18 }} onClick={() => void deleteSavedDraft()}>Delete saved draft</button>}
                        </>}
                    </section>

                    <aside className={`${styles.previewColumn} ${previewExpanded ? styles.previewExpanded : ""}`} aria-label="Album preview">
                        <div className={styles.previewHeading}><span>LIVE PREVIEW</span><span className={styles.previewDescriptor}>{step === 2 ? spreadLabel(spreads[pageIndex] ?? spreads[0]) : "YOUR KEEPSAKE"}</span><button type="button" className={styles.previewExpandButton} aria-expanded={previewExpanded} onClick={() => setPreviewExpanded(expanded => !expanded)}>{previewExpanded ? "Close preview" : "View larger"}</button></div>
                        <div className={styles.previewCanvas} role={previewExpanded ? undefined : "button"} tabIndex={previewExpanded ? -1 : 0} aria-label={previewExpanded ? undefined : "Open a larger album preview"} onClick={() => { if (!previewExpanded) setPreviewExpanded(true); }} onKeyDown={event => { if (!previewExpanded && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setPreviewExpanded(true); } }}>
                            {step === 2 ? renderSpread(spreads[pageIndex] ?? spreads[0], editable) : <CoverPreview destinationId={destinationId} title={title} year={year} typeface={coverTypeface} textColor={coverTextColor} background={coverBackground} />}
                            {!previewExpanded && <span className={styles.previewTapHint}><Maximize2 size={14} /> Tap to enlarge</span>}
                        </div>
                        {step === 2 ? <div className={styles.previewPager}><button type="button" disabled={pageIndex === 0} onClick={() => setPageIndex(pageIndex - 1)} aria-label="Previous page"><ChevronLeft size={18} /></button><span>{pageIndex + 1} of {spreads.length}</span><button type="button" disabled={pageIndex === spreads.length - 1} onClick={() => setPageIndex(pageIndex + 1)} aria-label="Next page"><ChevronRight size={18} /></button></div> : <p className={styles.previewCaption}>{step === 3 ? "Your cover, ready to print." : step === 2 ? "A page from your story." : "Your cover, as you make it."}</p>}
                        {step === 2 && editable && spreads[pageIndex]?.kind === "photos" && <p className={styles.previewCaption}>Drag a photo to reposition it.</p>}
                        {step === 3 && <div className={styles.previewMiniPages}>{[spreads[0], ...(pages.length ? [spreads[1]] : []), spreads[spreads.length - 1]].map(spread => <div className={styles.miniPage} key={spread.kind}>{renderSpread(spread)}</div>)}</div>}
                    </aside>
                </div>}
                <div className={`${styles.actionBar} ${step === 0 ? styles.actionBarFirst : ""}`}><div>{step > 0 && editable && <button type="button" className={styles.backButton} onClick={() => goToStep(step - 1)} disabled={isSavingCloud || isOrdering}><ArrowLeft size={17} /> Back</button>}</div>{step < 3 ? <button type="button" className={styles.nextButton} onClick={() => goToStep(step + 1)} disabled={isSavingCloud || isOrdering}>{step === 0 ? "Add your photos" : step === 1 ? "Shape the pages" : "Review your album"}<ArrowRight size={18} /></button> : null}</div>
            </main>
        </div>
    </div>;
}
