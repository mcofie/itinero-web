"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type DragEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, ChevronLeft, ChevronRight, Download, ImagePlus, LoaderCircle, Plus, Search, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { Link } from "@/i18n/routing";
import { COVER_COLOR_SWATCHES, COVER_TYPEFACES, DEFAULT_COVER_TEXT_COLOR, DEFAULT_COVER_TYPEFACE, normalizeCoverTextColor, normalizeCoverTypeface, resolveCoverTextColor, type CoverTypeface } from "@/lib/album-cover-style";
import { coverImagePath, coverThumbnailPath, TRAVEL_COVERS, TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import { ALBUM_BUCKET, ALBUM_FORMAT, ALBUM_PRICE_GHS } from "@/lib/album-order";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { clearAlbumDraft, deleteAlbumPhoto, loadAlbumDraft, saveAlbumDraft, saveAlbumPhoto, type AlbumDraftMeta, type AlbumLayout, type AlbumPhoto } from "./album-draft";
import { createAlbumPdf, downloadAlbumPdf, groupAlbumPhotos } from "./album-pdf";
import styles from "./AlbumBuilder.module.css";

const YEAR = String(new Date().getFullYear());
const MAX_PHOTOS = 40;
const MAX_FILE_BYTES = 35 * 1024 * 1024;
const layouts: { id: AlbumLayout; name: string; description: string; count: string }[] = [
    { id: "editorial", name: "Editorial", description: "Two moments on every page", count: "02" },
    { id: "gallery", name: "Gallery", description: "One photo, room to breathe", count: "01" },
    { id: "collage", name: "Collage", description: "A lively three-photo rhythm", count: "03" },
];
const steps = ["Cover", "Photos", "Pages", "Review"] as const;
const typefaceClasses = { bold: styles.typefaceBold, serif: styles.typefaceSerif, handwritten: styles.typefaceHandwritten };

function CoverPreview({ destinationId, title, year, typeface, textColor, className = "" }: { destinationId: TravelCoverId; title: string; year: string; typeface: CoverTypeface; textColor: string; className?: string }) {
    const cover = TRAVEL_COVERS_BY_ID[destinationId];
    const heading = title.trim() || cover.country;
    return <div className={`${styles.coverPreview} ${"artOnly" in cover ? styles.artOnly : ""} ${typefaceClasses[typeface]} ${className}`} style={{ "--cover-color": cover.color, "--cover-ink": resolveCoverTextColor(textColor, cover.color) } as CSSProperties}>
        {/* The illustration remains from the country set; the title area is personalized. */}
        <img src={coverImagePath(destinationId)} alt="" draggable={false} />
        <div className={styles.coverTitleArea}>
            <div className={styles.coverMeta}><span>Itinero · travel album</span><span>{year}</span></div>
            <strong data-album-cover-title className={heading.length > 22 ? styles.extraLongTitle : heading.length > 9 ? styles.longTitle : undefined}>{heading}</strong>
        </div>
    </div>;
}

function AlbumPagePreview({ photos, layout, pageNumber, destination }: { photos: AlbumPhoto[]; layout: AlbumLayout; pageNumber: number; destination: string }) {
    const look = photos.length === 1 ? "gallery" : photos.length === 2 ? "editorial" : layout;
    return <div className={styles.albumPage}>
        <div className={styles.pageFolio}><span>{destination}</span><span>{String(pageNumber).padStart(2, "0")}</span></div>
        <div className={`${styles.pagePhotos} ${styles[`pagePhotos_${look}`]}`}>
            {photos.map(photo => <figure key={photo.id} className={styles.pagePhoto}>
                <img src={photo.url} alt={photo.caption || photo.name} />
                <figcaption>{photo.caption || "Add a little note…"}</figcaption>
            </figure>)}
        </div>
    </div>;
}

function IntroPreview({ title, destination, year, count }: { title: string; destination: string; year: string; count: number }) {
    return <div className={styles.introPage}>
        <span className={styles.introNote}>the good kind of souvenir</span>
        <div><strong>{title || destination}</strong><span>{destination} · {year}</span></div>
        <small>{count} moments worth keeping</small>
    </div>;
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

export default function AlbumBuilder() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photosRef = useRef<AlbumPhoto[]>([]);
    const [ready, setReady] = useState(false);
    const [step, setStep] = useState(0);
    const [destinationId, setDestinationId] = useState<TravelCoverId>("italy");
    const [title, setTitle] = useState("ITALY");
    const [year, setYear] = useState(YEAR);
    const [coverTypeface, setCoverTypeface] = useState<CoverTypeface>(DEFAULT_COVER_TYPEFACE);
    const [coverTextColor, setCoverTextColor] = useState(DEFAULT_COVER_TEXT_COLOR);
    const [layout, setLayout] = useState<AlbumLayout>("editorial");
    const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
    const [search, setSearch] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [error, setError] = useState("");
    const [saveState, setSaveState] = useState<"saved" | "saving" | "unavailable">("saved");
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [albumId, setAlbumId] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState("draft");
    const [isSavingCloud, setIsSavingCloud] = useState(false);
    const [cloudProgress, setCloudProgress] = useState(0);
    const [isOrdering, setIsOrdering] = useState(false);
    const [shipping, setShipping] = useState({ fullName: "", phone: "", street: "", area: "", landmark: "" });
    const [approved, setApproved] = useState(false);
    const [confirmedAccra, setConfirmedAccra] = useState(false);

    photosRef.current = photos;
    const destination = TRAVEL_COVERS_BY_ID[destinationId];
    const pages = useMemo(() => groupAlbumPhotos(photos, layout), [photos, layout]);
    const filteredCovers = useMemo(() => TRAVEL_COVERS.filter(cover => cover.country.toLowerCase().includes(search.trim().toLowerCase())), [search]);
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
                    setStep(Math.min(3, Math.max(0, local.meta.step)));
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
                        for (const item of result.photos as { id: string; storage_path: string; original_name: string | null; width: number; height: number; caption: string | null }[]) {
                            const { data, error } = await sb.storage.from(ALBUM_BUCKET).download(item.storage_path);
                            if (error || !data) throw new Error("One of your saved photos could not be opened.");
                            downloaded.push({ id: item.id, name: item.original_name || "Photo", blob: data,
                                url: URL.createObjectURL(data), width: item.width, height: item.height,
                                caption: item.caption || "", storagePath: item.storage_path });
                        }
                    } catch (error) { downloaded.forEach(photo => URL.revokeObjectURL(photo.url)); throw error; }
                    restoredPhotos.forEach(photo => URL.revokeObjectURL(photo.url));
                    restoredPhotos = downloaded;
                    await clearAlbumDraft();
                    await Promise.all(downloaded.map(photo => saveAlbumPhoto(photo)));
                    const book = result.album;
                    setAlbumId(book.id); setOrderStatus(book.status);
                    if (book.destination_id in TRAVEL_COVERS_BY_ID) setDestinationId(book.destination_id as TravelCoverId);
                    setTitle(book.title); setYear(book.album_year || YEAR);
                    setCoverTypeface(normalizeCoverTypeface(book.cover_typeface));
                    setCoverTextColor(normalizeCoverTextColor(book.cover_text_color));
                    if (["gallery", "editorial", "collage"].includes(book.layout)) setLayout(book.layout);
                    if (book.shipping_address) setShipping(previous => ({ ...previous, ...book.shipping_address }));
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
                destinationId, title, year, coverTypeface, coverTextColor, layout, step,
                photoIds: photos.map(photo => photo.id),
                captions: Object.fromEntries(photos.map(photo => [photo.id, photo.caption])),
                updatedAt: Date.now(),
            };
            saveAlbumDraft(meta).then(() => setSaveState("saved")).catch(() => setSaveState("unavailable"));
        }, 450);
        return () => clearTimeout(timer);
    }, [ready, destinationId, title, year, coverTypeface, coverTextColor, layout, step, photos, saveUnavailable]);

    useEffect(() => { setPageIndex(index => Math.min(index, Math.max(0, pages.length - 1))); }, [pages.length]);

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
    const changeCaption = (id: string, caption: string) => setPhotos(previous => previous.map(photo => photo.id === id ? { ...photo, caption } : photo));
    const chooseDestination = (id: TravelCoverId) => {
        const previousName = TRAVEL_COVERS_BY_ID[destinationId].country.toUpperCase();
        if (!title.trim() || title === previousName) setTitle(TRAVEL_COVERS_BY_ID[id].country.toUpperCase());
        setDestinationId(id);
    };
    const goToStep = (next: number) => {
        if (isSavingCloud || isOrdering || isExporting) return;
        if (orderStatus !== "draft" && next < 3) return;
        setError("");
        if (next > 0 && (!title.trim() || !/^\d{4}$/.test(year))) { setError("Add a title and a four-digit year first."); setStep(0); return; }
        if (next > 1 && photos.length === 0) { setError("Add at least one photo to start your album."); setStep(1); return; }
        setStep(Math.max(0, Math.min(3, next)));
    };
    const resetDraft = async () => {
        if (isSavingCloud || isOrdering || isExporting) return;
        if (!window.confirm("Start a new album? This will remove the photos saved in this browser.")) return;
        try { await clearAlbumDraft(); } catch { setSaveState("unavailable"); }
        photos.forEach(photo => URL.revokeObjectURL(photo.url));
        setPhotos([]); setStep(0); setDestinationId("italy"); setTitle("ITALY"); setYear(YEAR); setCoverTypeface(DEFAULT_COVER_TYPEFACE); setCoverTextColor(DEFAULT_COVER_TEXT_COLOR); setLayout("editorial"); setError("");
        setAlbumId(null); setOrderStatus("draft"); setApproved(false); setConfirmedAccra(false);
        window.history.replaceState({}, "", window.location.pathname);
    };
    const deleteSavedDraft = async () => {
        if (!albumId || orderStatus !== "draft" || isSavingCloud || isOrdering) return;
        if (!window.confirm("Delete this saved album and its photos from your account? This cannot be undone.")) return;
        const response = await fetch(`/api/albums/${albumId}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) { setError(result.error || "Could not delete this album."); return; }
        await clearAlbumDraft().catch(() => setSaveState("unavailable"));
        photos.forEach(photo => URL.revokeObjectURL(photo.url));
        setPhotos([]); setStep(0); setDestinationId("italy"); setTitle("ITALY"); setYear(YEAR);
        setCoverTypeface(DEFAULT_COVER_TYPEFACE); setCoverTextColor(DEFAULT_COVER_TEXT_COLOR);
        setLayout("editorial"); setAlbumId(null); setApproved(false); setConfirmedAccra(false); setError("");
        window.history.replaceState({}, "", window.location.pathname);
    };
    const exportPdf = async () => {
        if (!photos.length || isExporting) return;
        setError(""); setIsExporting(true); setExportProgress(0);
        try {
            await document.fonts.ready;
            const coverFontFamily = getComputedStyle(document.querySelector("[data-album-cover-title]") ?? document.body).fontFamily;
            await downloadAlbumPdf({ title, destination: destination.country, year, coverId: destinationId, coverColor: destination.color, coverFontFamily, coverTypeface, coverTextColor, layout, photos, onProgress: (current, total) => setExportProgress(Math.round(current / total * 100)) });
        } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not make the PDF. Please try again."); }
        finally { setIsExporting(false); }
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
        if (isSavingCloud || !photos.length || orderStatus !== "draft") return null;
        const sb = getSupabaseBrowser();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) { await signInGoogle(); return null; }
        const id = albumId || crypto.randomUUID();
        setAlbumId(id);
        setIsSavingCloud(true); setCloudProgress(0); setError("");
        try {
            const updated: AlbumPhoto[] = [];
            for (let index = 0; index < photos.length; index++) {
                const photo = photos[index];
                let path = photo.storagePath;
                if (!path || !path.startsWith(`${user.id}/${id}/`)) {
                    const ext = photo.blob.type === "image/png" ? "png" : photo.blob.type === "image/webp" ? "webp" : photo.blob.type === "image/avif" ? "avif" : "jpg";
                    path = `${user.id}/${id}/${photo.id}.${ext}`;
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
                body: JSON.stringify({ id, title, year, destinationId, coverTypeface, coverTextColor, layout,
                    photos: updated.map(photo => ({ id: photo.id, name: photo.name, storagePath: photo.storagePath,
                        width: photo.width, height: photo.height, caption: photo.caption })) }) });
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

    const orderAlbum = async () => {
        if (isOrdering || !["draft", "pending_payment"].includes(orderStatus)) return;
        if (!approved) { setError("Please confirm that you reviewed your album before ordering."); return; }
        if (!confirmedAccra) { setError("Please confirm that your delivery address is within Accra."); return; }
        if (!shipping.fullName.trim() || !shipping.phone.trim() || !shipping.street.trim() || !shipping.area.trim()) {
            setError("Add your name, phone number, street and Accra area before ordering."); return;
        }
        setIsOrdering(true); setError("");
        try {
            const id = orderStatus === "pending_payment" ? albumId : await saveToAccount();
            if (!id) return;
            if (orderStatus === "draft") {
                await document.fonts.ready;
                const coverFontFamily = getComputedStyle(document.querySelector("[data-album-cover-title]") ?? document.body).fontFamily;
                setIsExporting(true); setExportProgress(0);
                const pdf = await createAlbumPdf({ title, destination: destination.country, year, coverId: destinationId,
                    coverColor: destination.color, coverFontFamily, coverTypeface, coverTextColor, layout, photos,
                    onProgress: (current, total) => setExportProgress(Math.round(current / total * 100)) });
                setIsExporting(false);
                const { data: { user } } = await getSupabaseBrowser().auth.getUser();
                if (!user) throw new Error("Your sign-in expired. Please sign in again.");
                const path = `${user.id}/${id}/proof.pdf`;
                const { error: pdfError } = await getSupabaseBrowser().storage.from(ALBUM_BUCKET).upload(path, pdf, {
                    contentType: "application/pdf", upsert: true,
                });
                if (pdfError) throw pdfError;
            }
            const response = await fetch(`/api/albums/${id}/checkout`, { method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shippingAddress: shipping, confirmedAccra }) });
            const result = await response.json();
            if (!response.ok || !result.authorizationUrl) throw new Error(result.error || "Could not start payment.");
            window.location.assign(result.authorizationUrl);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not place your order. Please try again.");
        } finally { setIsOrdering(false); setIsExporting(false); }
    };

    return <div className={styles.builder}>
        <header className={styles.header}>
            <Link href="/" className={styles.brand} aria-label="Itinero home"><img src="/brand/itinero-mark-animated.svg" alt="" /><span>itinero</span></Link>
            <div className={styles.headerRight}><span className={styles.headerLabel}>{userEmail ? userEmail : "Your album studio"}</span><span className={styles.saveBadge}>{saveState === "saving" ? <LoaderCircle size={15} className={styles.spin} /> : saveState === "saved" ? <Check size={15} /> : null}{saveState === "saved" ? "Saved on this device" : saveState === "saving" ? "Saving" : "Device saving unavailable"}</span></div>
        </header>
        <input ref={fileInputRef} className={styles.hiddenInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={handleFileInput} />
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <span className={styles.eyebrow}>A place for your places</span>
                <h1>Make a little<br /><em>room to remember.</em></h1>
                <p>Choose a cover, bring your photos, and we’ll shape the pages with you.</p>
                <nav className={styles.steps} aria-label="Album steps">
                    {steps.map((label, index) => <button key={label} type="button" onClick={() => goToStep(index)} disabled={orderStatus !== "draft" && index < 3} aria-current={step === index ? "step" : undefined} className={`${styles.step} ${step === index ? styles.stepActive : ""}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong>{index < step && <Check size={16} />}</button>)}
                </nav>
                <div className={styles.sidebarFoot}><BookOpen size={19} /><span>Designed by you.<br />Laid out with a little help.</span></div>
            </aside>

            <main className={styles.workspace}>
                <div className={styles.workspaceTop}><span>STEP {String(step + 1).padStart(2, "0")} / 04</span><span>{photos.length ? `${photos.length} photos · ${pages.length + 3} pages` : "Your story starts here"}</span></div>
                {error && <div className={styles.error} role="alert">{error}</div>}
                {!ready ? <div className={styles.loading}><LoaderCircle className={styles.spin} /> Opening your album…</div> : <div className={styles.workGrid} aria-busy={isSavingCloud || isOrdering || isExporting}>
                    <section className={styles.controls}>
                        {step === 0 && <>
                            <div className={styles.sectionHead}><span className={styles.hand}>first things first</span><h2>Where did you go?</h2><p>Pick the place. We’ll start with a cover made for it.</p></div>
                            <label className={styles.searchField}><Search size={18} /><input type="search" placeholder="Find a destination" value={search} onChange={event => setSearch(event.target.value)} /></label>
                            <div className={styles.destinationGrid}>
                                {filteredCovers.map(cover => <button key={cover.id} type="button" onClick={() => chooseDestination(cover.id)} className={`${styles.destinationCard} ${destinationId === cover.id ? styles.destinationSelected : ""}`} aria-pressed={destinationId === cover.id}>
                                    <span className={styles.destinationThumb} style={{ backgroundColor: cover.color }}><img src={coverThumbnailPath(cover.id)} alt="" loading="lazy" /></span><span>{cover.country}</span>{destinationId === cover.id && <Check size={15} />}
                                </button>)}
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
                                        <span className={styles.colorDot} style={{ backgroundColor: swatch.value === "auto" ? resolveCoverTextColor("auto", destination.color) : swatch.value }}>{swatch.value === "auto" ? "A" : null}</span><small>{swatch.value === "auto" ? "Auto" : swatch.label.replace("Warm ", "")}</small>
                                    </button>)}
                                    <label className={`${styles.customColor} ${coverTextColor !== "auto" && !COVER_COLOR_SWATCHES.some(swatch => swatch.value === coverTextColor) ? styles.colorSelected : ""}`}>
                                        <input type="color" aria-label="Custom cover font color" value={coverTextColor === "auto" ? resolveCoverTextColor("auto", destination.color) : coverTextColor} onChange={event => setCoverTextColor(event.target.value)} />
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
                            {photos.length > 0 && <><div className={styles.photoSectionTitle}><h3>{photos.length} moments added</h3><button type="button" onClick={() => fileInputRef.current?.click()}><ImagePlus size={16} /> Add more</button></div><div className={styles.photoGrid}>{photos.map((photo, index) => <div key={photo.id} className={styles.photoTile}><img src={photo.url} alt={photo.name} loading="lazy" /><span>{String(index + 1).padStart(2, "0")}</span><button type="button" onClick={() => removePhoto(photo.id)} aria-label={`Remove ${photo.name}`}><Trash2 size={15} /></button></div>)}</div></>}
                            <p className={styles.fieldHint}>Your photos stay on this device while you build. Save to your Google account when you are ready to continue on another device.</p>
                        </>}

                        {step === 2 && <>
                            <div className={styles.sectionHead}><span className={styles.hand}>a little help from us</span><h2>Shape your story.</h2><p>Your pages are already arranged. Pick a rhythm, then put the moments in your order.</p></div>
                            <div className={styles.layoutOptions}>{layouts.map(option => <button key={option.id} type="button" onClick={() => { setLayout(option.id); setPageIndex(0); }} aria-pressed={layout === option.id} className={`${styles.layoutOption} ${layout === option.id ? styles.layoutSelected : ""}`}><span className={styles.layoutGlyph}>{option.count}</span><span><strong>{option.name}</strong><small>{option.description}</small></span>{layout === option.id && <Check size={17} />}</button>)}</div>
                            <div className={styles.photoSectionTitle}><h3>Photo order & captions</h3><span>{photos.length} photos</span></div>
                            <div className={styles.storyList}>{photos.map((photo, index) => <div className={styles.storyRow} key={photo.id}><img src={photo.url} alt="" loading="lazy" /><div className={styles.storyFields}><span>Moment {String(index + 1).padStart(2, "0")}</span><input value={photo.caption} onChange={event => changeCaption(photo.id, event.target.value)} maxLength={90} placeholder="The story behind this photo…" aria-label={`Caption for photo ${index + 1}`} /></div><div className={styles.moveButtons}><button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0} aria-label={`Move photo ${index + 1} earlier`}><ArrowUp size={16} /></button><button type="button" onClick={() => movePhoto(index, 1)} disabled={index === photos.length - 1} aria-label={`Move photo ${index + 1} later`}><ArrowDown size={16} /></button></div></div>)}</div>
                        </>}

                        {step === 3 && <>
                            <div className={styles.sectionHead}><span className={styles.hand}>there it is</span><h2>A book of your trip.</h2><p>Take one last look, save your story, then order a printed hardcover.</p></div>
                            <div className={styles.reviewSummary}><div><span>Destination</span><strong>{destination.country}</strong></div><div><span>Cover title</span><strong>{title}</strong></div><div><span>Photos</span><strong>{photos.length}</strong></div><div><span>Proof pages</span><strong>{pages.length + 3}</strong></div><div><span>Format</span><strong>{ALBUM_FORMAT}</strong></div><div><span>Price</span><strong>GHS {ALBUM_PRICE_GHS}</strong></div></div>
                            <div className={styles.qualityNote}><Sparkles size={20} /><div><strong>Review your album</strong><p>Your 8 × 10 in PDF shows the cover, title page, photos and closing page. We’ll check the final print files before production.</p></div></div>
                            {lowResolution.length > 0 && <p className={styles.qualityWarning}>{lowResolution.length} {lowResolution.length === 1 ? "photo is" : "photos are"} under 2400 px on the short side and may print softly. Consider replacing {lowResolution.length === 1 ? "it" : "them"} with the original full-size file.</p>}
                            <button type="button" className={styles.exportButton} disabled={isExporting} onClick={() => void exportPdf()}>{isExporting ? <><LoaderCircle size={19} className={styles.spin} /> Making your PDF · {exportProgress}%</> : <><Download size={19} /> Download album PDF</>}</button>
                            <p className={styles.fieldHint}>This is an 8 × 10 in proof. Our print preparation adds the printer’s required bleed and hardcover spine.</p>
                            <div className={styles.accountBox}>
                                <strong>{userEmail ? "Save to your account" : "Keep this album with Google"}</strong>
                                <p>{userEmail ? `Signed in as ${userEmail}. Your saved album will appear in My Albums.` : "Sign in with Google to save your album across devices and place an order."}</p>
                                <button type="button" onClick={() => void saveToAccount()} disabled={isSavingCloud || isOrdering || orderStatus !== "draft"}>
                                    {isSavingCloud ? <><LoaderCircle size={16} className={styles.spin} /> Uploading photos · {cloudProgress}%</> : userEmail ? "Save to my account" : "Continue with Google"}
                                </button>
                            </div>
                            {["draft", "pending_payment"].includes(orderStatus) ? <div className={styles.shippingBox}>
                                <h3>Deliver to Accra</h3><p>GHS {ALBUM_PRICE_GHS} includes delivery within Accra, Ghana.</p>
                                <div className={styles.shippingFields}>
                                    <label>Full name<input autoComplete="name" value={shipping.fullName} onChange={event => setShipping({ ...shipping, fullName: event.target.value })} /></label>
                                    <label>Phone number<input autoComplete="tel" inputMode="tel" value={shipping.phone} onChange={event => setShipping({ ...shipping, phone: event.target.value })} placeholder="+233 …" /></label>
                                    <label className={styles.shippingWide}>Street address<input autoComplete="street-address" value={shipping.street} onChange={event => setShipping({ ...shipping, street: event.target.value })} /></label>
                                    <label>Area in Accra<input value={shipping.area} onChange={event => setShipping({ ...shipping, area: event.target.value })} placeholder="Osu, East Legon…" /></label>
                                    <label>Nearby landmark (optional)<input value={shipping.landmark} onChange={event => setShipping({ ...shipping, landmark: event.target.value })} /></label>
                                </div>
                                <label className={styles.approval}><input type="checkbox" checked={approved} onChange={event => setApproved(event.target.checked)} /> I’ve reviewed the photos, captions, and delivery details.</label>
                                <label className={styles.approval}><input type="checkbox" checked={confirmedAccra} onChange={event => setConfirmedAccra(event.target.checked)} /> I confirm this delivery address is within Accra, Ghana.</label>
                                <button type="button" className={styles.orderButton} onClick={() => void orderAlbum()} disabled={isOrdering || isSavingCloud}>
                                    {isOrdering ? <><LoaderCircle size={18} className={styles.spin} /> {isExporting ? `Making PDF · ${exportProgress}%` : "Preparing your order…"}</> : orderStatus === "pending_payment" ? `Continue payment · GHS ${ALBUM_PRICE_GHS}` : `Order hardcover · GHS ${ALBUM_PRICE_GHS}`}
                                </button>
                                <small>Secure payment with Paystack. Printing begins after payment and file review.</small>
                            </div> : <div className={styles.accountBox}><strong>Order status: {orderStatus.replaceAll("_", " ")}</strong><p>Track your album in My Albums.</p><Link href="/photobooks">Go to My Albums</Link></div>}
                            <button type="button" className={styles.resetButton} onClick={() => void resetDraft()}>Start a new album</button>
                            {albumId && orderStatus === "draft" && <button type="button" className={styles.resetButton} style={{ marginLeft: 18 }} onClick={() => void deleteSavedDraft()}>Delete saved draft</button>}
                        </>}
                    </section>

                    <aside className={styles.previewColumn} aria-label="Album preview">
                        <div className={styles.previewHeading}><span>LIVE PREVIEW</span><span>{step === 2 && pages.length ? `PAGE ${pageIndex + 1} / ${pages.length}` : "YOUR KEEPSAKE"}</span></div>
                        {step === 2 && pages.length ? <AlbumPagePreview photos={pages[pageIndex]} layout={layout} pageNumber={pageIndex + 1} destination={destination.country} /> : <CoverPreview destinationId={destinationId} title={title} year={year} typeface={coverTypeface} textColor={coverTextColor} />}
                        {step === 2 && pages.length > 1 ? <div className={styles.previewPager}><button type="button" disabled={pageIndex === 0} onClick={() => setPageIndex(pageIndex - 1)} aria-label="Previous page"><ChevronLeft size={18} /></button><span>{pageIndex + 1} of {pages.length}</span><button type="button" disabled={pageIndex === pages.length - 1} onClick={() => setPageIndex(pageIndex + 1)} aria-label="Next page"><ChevronRight size={18} /></button></div> : <p className={styles.previewCaption}>{step === 3 ? "Front cover · personalized for your trip" : "A little piece of somewhere wonderful"}</p>}
                        {step === 3 && <div className={styles.previewMiniPages}><div className={styles.miniPage}><IntroPreview title={title} destination={destination.country} year={year} count={photos.length} /></div>{pages.slice(0, 2).map((page, index) => <div className={styles.miniPage} key={index}><AlbumPagePreview photos={page} layout={layout} pageNumber={index + 1} destination={destination.country} /></div>)}</div>}
                    </aside>
                </div>}
                <div className={styles.actionBar}><div>{step > 0 && orderStatus === "draft" && <button type="button" className={styles.backButton} onClick={() => goToStep(step - 1)} disabled={isSavingCloud || isOrdering || isExporting}><ArrowLeft size={17} /> Back</button>}</div>{step < 3 ? <button type="button" className={styles.nextButton} onClick={() => goToStep(step + 1)} disabled={isSavingCloud || isOrdering || isExporting}>{step === 0 ? "Add your photos" : step === 1 ? "Shape the pages" : "Review your album"}<ArrowRight size={18} /></button> : <button type="button" className={styles.nextButton} onClick={() => document.querySelector(`.${styles.shippingBox}`)?.scrollIntoView({ behavior: "smooth" })} disabled={isSavingCloud || isOrdering || isExporting || !['draft', 'pending_payment'].includes(orderStatus)}>Order this album <ArrowRight size={18} /></button>}</div>
            </main>
        </div>
    </div>;
}
