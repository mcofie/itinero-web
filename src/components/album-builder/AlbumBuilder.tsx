"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type DragEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, ChevronLeft, ChevronRight, Download, ImagePlus, LoaderCircle, Plus, Search, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { Link } from "@/i18n/routing";
import { TRAVEL_COVERS, TRAVEL_COVERS_BY_ID, type TravelCoverId } from "@/lib/travel-covers";
import { clearAlbumDraft, deleteAlbumPhoto, loadAlbumDraft, saveAlbumDraft, saveAlbumPhoto, type AlbumDraftMeta, type AlbumLayout, type AlbumPhoto } from "./album-draft";
import { coverInk, downloadAlbumPdf, groupAlbumPhotos } from "./album-pdf";
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

function CoverPreview({ destinationId, title, year, className = "" }: { destinationId: TravelCoverId; title: string; year: string; className?: string }) {
    const cover = TRAVEL_COVERS_BY_ID[destinationId];
    return <div className={`${styles.coverPreview} ${className}`} style={{ "--cover-color": cover.color, "--cover-ink": coverInk(cover.color) } as CSSProperties}>
        {/* The illustration remains from the country set; the title area is personalized. */}
        <img src={`/images/landing/covers/${destinationId}.png`} alt="" draggable={false} />
        <div className={styles.coverTitleArea}><strong data-album-cover-title className={(title.trim() || cover.country).length > 16 ? styles.longTitle : undefined}>{title.trim() || cover.country}</strong><span>{year}</span></div>
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

    photosRef.current = photos;
    const destination = TRAVEL_COVERS_BY_ID[destinationId];
    const pages = useMemo(() => groupAlbumPhotos(photos, layout), [photos, layout]);
    const filteredCovers = useMemo(() => TRAVEL_COVERS.filter(cover => cover.country.toLowerCase().includes(search.trim().toLowerCase())), [search]);
    const lowResolution = photos.filter(photo => Math.min(photo.width, photo.height) < 1200);

    useEffect(() => {
        let mounted = true;
        loadAlbumDraft().then(({ meta, photos: restoredPhotos }) => {
            if (!mounted) { restoredPhotos.forEach(photo => URL.revokeObjectURL(photo.url)); return; }
            if (meta) {
                if (meta.destinationId in TRAVEL_COVERS_BY_ID) setDestinationId(meta.destinationId as TravelCoverId);
                setTitle(meta.title);
                setYear(meta.year);
                setLayout(meta.layout);
                setStep(Math.min(3, Math.max(0, meta.step)));
            }
            setPhotos(restoredPhotos);
            setReady(true);
        }).catch(() => { if (mounted) { setSaveState("unavailable"); setReady(true); } });
        return () => { mounted = false; photosRef.current.forEach(photo => URL.revokeObjectURL(photo.url)); };
    }, []);

    useEffect(() => {
        if (!ready || saveState === "unavailable") return;
        setSaveState("saving");
        const timer = setTimeout(() => {
            const meta: AlbumDraftMeta = {
                destinationId, title, year, layout, step,
                photoIds: photos.map(photo => photo.id),
                captions: Object.fromEntries(photos.map(photo => [photo.id, photo.caption])),
                updatedAt: Date.now(),
            };
            saveAlbumDraft(meta).then(() => setSaveState("saved")).catch(() => setSaveState("unavailable"));
        }, 450);
        return () => clearTimeout(timer);
    }, [ready, destinationId, title, year, layout, step, photos, saveState === "unavailable"]);

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
        setError("");
        if (next > 0 && (!title.trim() || !/^\d{4}$/.test(year))) { setError("Add a title and a four-digit year first."); setStep(0); return; }
        if (next > 1 && photos.length === 0) { setError("Add at least one photo to start your album."); setStep(1); return; }
        setStep(Math.max(0, Math.min(3, next)));
    };
    const resetDraft = async () => {
        if (!window.confirm("Start a new album? This will remove the photos saved in this browser.")) return;
        try { await clearAlbumDraft(); } catch { setSaveState("unavailable"); }
        photos.forEach(photo => URL.revokeObjectURL(photo.url));
        setPhotos([]); setStep(0); setDestinationId("italy"); setTitle("ITALY"); setYear(YEAR); setLayout("editorial"); setError("");
    };
    const exportPdf = async () => {
        if (!photos.length || isExporting) return;
        setError(""); setIsExporting(true); setExportProgress(0);
        try {
            await document.fonts.ready;
            const coverFontFamily = getComputedStyle(document.querySelector("[data-album-cover-title]") ?? document.body).fontFamily;
            await downloadAlbumPdf({ title, destination: destination.country, year, coverId: destinationId, coverColor: destination.color, coverFontFamily, layout, photos, onProgress: (current, total) => setExportProgress(Math.round(current / total * 100)) });
        } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not make the PDF. Please try again."); }
        finally { setIsExporting(false); }
    };

    return <div className={styles.builder}>
        <header className={styles.header}>
            <Link href="/" className={styles.brand} aria-label="Itinero home"><img src="/brand/itinero-mark-animated.svg" alt="" /><span>itinero</span></Link>
            <div className={styles.headerRight}><span className={styles.headerLabel}>Your album studio</span><span className={styles.saveBadge}>{saveState === "saving" ? <LoaderCircle size={15} className={styles.spin} /> : saveState === "saved" ? <Check size={15} /> : null}{saveState === "saved" ? "Saved in this browser" : saveState === "saving" ? "Saving" : "Browser saving unavailable"}</span></div>
        </header>
        <input ref={fileInputRef} className={styles.hiddenInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={handleFileInput} />
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <span className={styles.eyebrow}>A place for your places</span>
                <h1>Make a little<br /><em>room to remember.</em></h1>
                <p>Choose a cover, bring your photos, and we’ll shape the pages with you.</p>
                <nav className={styles.steps} aria-label="Album steps">
                    {steps.map((label, index) => <button key={label} type="button" onClick={() => goToStep(index)} aria-current={step === index ? "step" : undefined} className={`${styles.step} ${step === index ? styles.stepActive : ""}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong>{index < step && <Check size={16} />}</button>)}
                </nav>
                <div className={styles.sidebarFoot}><BookOpen size={19} /><span>Designed by you.<br />Laid out with a little help.</span></div>
            </aside>

            <main className={styles.workspace}>
                <div className={styles.workspaceTop}><span>STEP {String(step + 1).padStart(2, "0")} / 04</span><span>{photos.length ? `${photos.length} photos · ${pages.length + 3} pages` : "Your story starts here"}</span></div>
                {error && <div className={styles.error} role="alert">{error}</div>}
                {!ready ? <div className={styles.loading}><LoaderCircle className={styles.spin} /> Opening your album…</div> : <div className={styles.workGrid}>
                    <section className={styles.controls}>
                        {step === 0 && <>
                            <div className={styles.sectionHead}><span className={styles.hand}>first things first</span><h2>Where did you go?</h2><p>Pick the place. We’ll start with a cover made for it.</p></div>
                            <label className={styles.searchField}><Search size={18} /><input type="search" placeholder="Find a destination" value={search} onChange={event => setSearch(event.target.value)} /></label>
                            <div className={styles.destinationGrid}>
                                {filteredCovers.map(cover => <button key={cover.id} type="button" onClick={() => chooseDestination(cover.id)} className={`${styles.destinationCard} ${destinationId === cover.id ? styles.destinationSelected : ""}`} aria-pressed={destinationId === cover.id}>
                                    <span className={styles.destinationThumb} style={{ backgroundColor: cover.color }}><img src={`/images/landing/covers/${cover.id}.png`} alt="" loading="lazy" /></span><span>{cover.country}</span>{destinationId === cover.id && <Check size={15} />}
                                </button>)}
                            </div>
                            <div className={styles.formPair}><label>Album title<input maxLength={30} value={title} onChange={event => setTitle(event.target.value)} placeholder="Our favourite trip" /></label><label>Year<input inputMode="numeric" maxLength={4} value={year} onChange={event => setYear(event.target.value.replace(/[^\d]/g, ""))} placeholder="2026" /></label></div>
                            <p className={styles.fieldHint}>The title and year appear on your cover and opening page.</p>
                        </>}

                        {step === 1 && <>
                            <div className={styles.sectionHead}><span className={styles.hand}>the good bits</span><h2>Bring your photos.</h2><p>We’ll put them in a first draft. You can change the order next.</p></div>
                            <div className={`${styles.dropZone} ${isDragging ? styles.dropActive : ""}`} onDragOver={event => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}>
                                <div className={styles.uploadIcon}><UploadCloud size={27} /></div><strong>Drop photos here</strong><span>or choose them from your device</span><button type="button" onClick={() => fileInputRef.current?.click()} disabled={isAdding}>{isAdding ? <><LoaderCircle size={17} className={styles.spin} /> Adding photos…</> : <><Plus size={17} /> Choose photos</>}</button><small>JPG, PNG, WebP, AVIF · up to {MAX_PHOTOS} photos</small>
                            </div>
                            {photos.length > 0 && <><div className={styles.photoSectionTitle}><h3>{photos.length} moments added</h3><button type="button" onClick={() => fileInputRef.current?.click()}><ImagePlus size={16} /> Add more</button></div><div className={styles.photoGrid}>{photos.map((photo, index) => <div key={photo.id} className={styles.photoTile}><img src={photo.url} alt={photo.name} loading="lazy" /><span>{String(index + 1).padStart(2, "0")}</span><button type="button" onClick={() => removePhoto(photo.id)} aria-label={`Remove ${photo.name}`}><Trash2 size={15} /></button></div>)}</div></>}
                            <p className={styles.fieldHint}>Your originals stay on this device while you build. A browser draft lets you come back later on this device.</p>
                        </>}

                        {step === 2 && <>
                            <div className={styles.sectionHead}><span className={styles.hand}>a little help from us</span><h2>Shape your story.</h2><p>Your pages are already arranged. Pick a rhythm, then put the moments in your order.</p></div>
                            <div className={styles.layoutOptions}>{layouts.map(option => <button key={option.id} type="button" onClick={() => { setLayout(option.id); setPageIndex(0); }} aria-pressed={layout === option.id} className={`${styles.layoutOption} ${layout === option.id ? styles.layoutSelected : ""}`}><span className={styles.layoutGlyph}>{option.count}</span><span><strong>{option.name}</strong><small>{option.description}</small></span>{layout === option.id && <Check size={17} />}</button>)}</div>
                            <div className={styles.photoSectionTitle}><h3>Photo order & captions</h3><span>{photos.length} photos</span></div>
                            <div className={styles.storyList}>{photos.map((photo, index) => <div className={styles.storyRow} key={photo.id}><img src={photo.url} alt="" loading="lazy" /><div className={styles.storyFields}><span>Moment {String(index + 1).padStart(2, "0")}</span><input value={photo.caption} onChange={event => changeCaption(photo.id, event.target.value)} maxLength={90} placeholder="The story behind this photo…" aria-label={`Caption for photo ${index + 1}`} /></div><div className={styles.moveButtons}><button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0} aria-label={`Move photo ${index + 1} earlier`}><ArrowUp size={16} /></button><button type="button" onClick={() => movePhoto(index, 1)} disabled={index === photos.length - 1} aria-label={`Move photo ${index + 1} later`}><ArrowDown size={16} /></button></div></div>)}</div>
                        </>}

                        {step === 3 && <>
                            <div className={styles.sectionHead}><span className={styles.hand}>there it is</span><h2>A book of your trip.</h2><p>Take one last look. Every change you make updates the PDF you’ll download.</p></div>
                            <div className={styles.reviewSummary}><div><span>Destination</span><strong>{destination.country}</strong></div><div><span>Cover title</span><strong>{title}</strong></div><div><span>Photos</span><strong>{photos.length}</strong></div><div><span>Pages</span><strong>{pages.length + 3}</strong></div><div><span>Trim size</span><strong>6 × 9 in</strong></div><div><span>Layout</span><strong>{layouts.find(item => item.id === layout)?.name}</strong></div></div>
                            <div className={styles.qualityNote}><Sparkles size={20} /><div><strong>Ready for your first proof</strong><p>We’ll make a 6 × 9 in PDF with your cover, title page, photos, and closing page. Review the file before sending it to print.</p></div></div>
                            {lowResolution.length > 0 && <p className={styles.qualityWarning}>{lowResolution.length} {lowResolution.length === 1 ? "photo is" : "photos are"} under 1200 px on the short side and may print softly. Consider replacing {lowResolution.length === 1 ? "it" : "them"} with the original full-size file.</p>}
                            <button type="button" className={styles.exportButton} disabled={isExporting} onClick={() => void exportPdf()}>{isExporting ? <><LoaderCircle size={19} className={styles.spin} /> Making your PDF · {exportProgress}%</> : <><Download size={19} /> Download album PDF</>}</button>
                            <p className={styles.fieldHint}>For final production, confirm trim, bleed, paper, and binding with your printer. This first PDF uses a 6 × 9 in page without bleed.</p>
                            <button type="button" className={styles.resetButton} onClick={() => void resetDraft()}>Start a new album</button>
                        </>}
                    </section>

                    <aside className={styles.previewColumn} aria-label="Album preview">
                        <div className={styles.previewHeading}><span>LIVE PREVIEW</span><span>{step === 2 && pages.length ? `PAGE ${pageIndex + 1} / ${pages.length}` : "YOUR KEEPSAKE"}</span></div>
                        {step === 2 && pages.length ? <AlbumPagePreview photos={pages[pageIndex]} layout={layout} pageNumber={pageIndex + 1} destination={destination.country} /> : <CoverPreview destinationId={destinationId} title={title} year={year} />}
                        {step === 2 && pages.length > 1 ? <div className={styles.previewPager}><button type="button" disabled={pageIndex === 0} onClick={() => setPageIndex(pageIndex - 1)} aria-label="Previous page"><ChevronLeft size={18} /></button><span>{pageIndex + 1} of {pages.length}</span><button type="button" disabled={pageIndex === pages.length - 1} onClick={() => setPageIndex(pageIndex + 1)} aria-label="Next page"><ChevronRight size={18} /></button></div> : <p className={styles.previewCaption}>{step === 3 ? "Front cover · personalized for your trip" : "A little piece of somewhere wonderful"}</p>}
                        {step === 3 && <div className={styles.previewMiniPages}><div className={styles.miniPage}><IntroPreview title={title} destination={destination.country} year={year} count={photos.length} /></div>{pages.slice(0, 2).map((page, index) => <div className={styles.miniPage} key={index}><AlbumPagePreview photos={page} layout={layout} pageNumber={index + 1} destination={destination.country} /></div>)}</div>}
                    </aside>
                </div>}
                <div className={styles.actionBar}><div>{step > 0 && <button type="button" className={styles.backButton} onClick={() => goToStep(step - 1)}><ArrowLeft size={17} /> Back</button>}</div>{step < 3 ? <button type="button" className={styles.nextButton} onClick={() => goToStep(step + 1)}>{step === 0 ? "Add your photos" : step === 1 ? "Shape the pages" : "Review your album"}<ArrowRight size={18} /></button> : <button type="button" className={styles.nextButton} onClick={() => void exportPdf()} disabled={isExporting}><Download size={18} /> {isExporting ? `Making PDF ${exportProgress}%` : "Download PDF"}</button>}</div>
            </main>
        </div>
    </div>;
}
