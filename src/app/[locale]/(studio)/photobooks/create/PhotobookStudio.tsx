"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft, Upload, Image as ImageIcon, Trash2, Plus, Star,
    BookOpen, X, Move, Maximize2, ShoppingBag, ShieldCheck, Trophy, FileText, Check, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    TEMPLATES, FONTS, MATERIALS, FOILS, SIZES,
    type StudioImage, type DesignState,
} from "./studio-config";
import { CoverLayoutRenderer, BackCoverRenderer } from "./CoverRenderers";
import DesignPanel from "./DesignPanel";

export default function PhotobookStudio({ user, initialData }: { user: any; initialData?: any }) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Mode: "upload" shows the canvas with drop zone, "design" shows design panel, "proof" shows proof view ───
    const [mode, setMode] = useState<"upload" | "design" | "proof">("upload");
    const [images, setImages] = useState<StudioImage[]>(initialData?.images || []);
    const [isDragging, setIsDragging] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isCinemaMode, setIsCinemaMode] = useState(false);

    const [design, setDesign] = useState<DesignState>({
        templateId: initialData?.template_id || TEMPLATES[0].id,
        coverBgColor: "#ffffff",
        coverTextColor: "#0f172a",
        coverIconName: "Heart",
        coverSymbol: "",
        title: initialData?.title || "OUR SUMMER",
        subtitle: initialData?.subtitle || "GREECE 2025",
        sizeId: "small",
        isRounded: true,
        coverMaterial: "linen",
        coverFont: FONTS[0].id,
        coverFoil: "none",
        spineText: "OUR SUMMER 2025",
        illustrationId: null,
    });

    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

    const updateDesign = useCallback((updates: Partial<DesignState>) => {
        setDesign(prev => ({ ...prev, ...updates }));
    }, []);

    // Load fonts
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${FONTS.map(f => f.import).join('&family=')}&display=swap`;
        document.head.appendChild(link);
        const style = document.createElement('style');
        style.innerHTML = `@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }`;
        document.head.appendChild(style);
        return () => { document.head.removeChild(link); document.head.removeChild(style); };
    }, []);

    // ─── Keyboard shortcuts ───
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;

            if (e.metaKey || e.ctrlKey) {
                if (e.key === "1") { e.preventDefault(); setMode("upload"); }
                if (e.key === "2") { e.preventDefault(); setMode("design"); }
                if (e.key === "3") { e.preventDefault(); setMode("proof"); }
            }
            if (e.key === " " && mode === "design" && !isCinemaMode) { e.preventDefault(); setIsFlipped(f => !f); }
            if (e.key === "f" && mode === "design" && !isCinemaMode) { e.preventDefault(); setIsCinemaMode(true); }
            if (e.key === "Escape") { if (isCinemaMode) setIsCinemaMode(false); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [mode, isCinemaMode]);

    // ─── Auto-save ───
    useEffect(() => {
        if (images.length === 0 && design.title === "OUR SUMMER") return;
        setSaveStatus("saving");
        const timer = setTimeout(() => {
            // Simulate save - in production this would write to Supabase
            try {
                localStorage.setItem("photobook-studio-draft", JSON.stringify({ design, imageCount: images.length }));
                setSaveStatus("saved");
            } catch { setSaveStatus("idle"); }
        }, 1500);
        return () => clearTimeout(timer);
    }, [design, images.length]);

    // ─── Image handling ───
    const coverImages = images.filter(img => img.role === "cover");
    const internalImages = images.filter(img => img.role === "internal");
    const totalPages = 12 + Math.ceil(internalImages.length / 2) * 2;
    const cost = Math.round(150 * (SIZES.find(s => s.id === design.sizeId)?.price_multiplier || 1));

    const handleFiles = useCallback((files: FileList | File[]) => {
        const newImages: StudioImage[] = Array.from(files).map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            preview_url: URL.createObjectURL(file),
            file,
            role: "internal",
        }));
        setImages(prev => [...prev, ...newImages]);
        if (mode === "upload" && images.length === 0) {
            // Auto-switch to design after first upload
            setTimeout(() => setMode("design"), 600);
        }
    }, [mode, images.length]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFiles(e.target.files);
    };

    const toggleRole = (id: string) => setImages(prev => prev.map(img => img.id === id ? { ...img, role: img.role === "cover" ? "internal" : "cover" } : img));
    const removeImage = (id: string) => setImages(prev => prev.filter(img => img.id !== id));

    // ─── Drag and drop ───
    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback(() => setIsDragging(false), []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    // ─── 3D tilt ───
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const tiltX = useTransform(mouseY, [-300, 300], [8, -8]);
    const tiltY = useTransform(mouseX, [-300, 300], [-8, 8]);
    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    };
    const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

    const activeFontFamily = FONTS.find(f => f.id === design.coverFont)?.family;

    return (
        <div className="h-screen flex flex-col bg-[#f5f5f7] dark:bg-slate-950 overflow-hidden" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {/* ─── Studio Top Bar ─── */}
            <header className="h-14 flex-shrink-0 flex items-center justify-between px-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{design.title || "Untitled Photobook"}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-slate-400 leading-none">Photobook Studio</p>
                            {saveStatus === "saving" && <span className="flex items-center gap-1 text-[10px] text-slate-400"><Loader2 className="h-2.5 w-2.5 animate-spin" /> Saving</span>}
                            {saveStatus === "saved" && <span className="flex items-center gap-1 text-[10px] text-emerald-500"><Check className="h-2.5 w-2.5" /> Saved</span>}
                        </div>
                    </div>
                </div>

                {/* Mode Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl">
                    {[
                        { id: "upload" as const, label: "Photos", icon: ImageIcon },
                        { id: "design" as const, label: "Design", icon: Move },
                        { id: "proof" as const, label: "Proof", icon: FileText },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setMode(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                                mode === tab.id
                                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <tab.icon className="h-3.5 w-3.5" />
                            {tab.label}
                            {tab.id === "upload" && images.length > 0 && (
                                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{images.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Estimate</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white leading-none">GHS {cost}</p>
                    </div>
                    <Button onClick={() => setMode("proof")} size="sm" className="rounded-xl bg-blue-600 text-white font-bold px-5 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                        <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Checkout
                    </Button>
                </div>
            </header>

            {/* ─── Main Content Area ─── */}
            <div className="flex-1 flex min-h-0">
                {/* Design Panel (left sidebar) — only in design mode */}
                {mode === "design" && (
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex-shrink-0">
                        <DesignPanel design={design} images={images} onDesignChange={updateDesign} />
                    </motion.div>
                )}

                {/* ─── Canvas Area ─── */}
                <div className="flex-1 flex flex-col min-w-0">
                    <AnimatePresence mode="wait">
                        {/* ═══ UPLOAD MODE ═══ */}
                        {mode === "upload" && (
                            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col p-8 overflow-y-auto">
                                {images.length === 0 ? (
                                    /* Empty state — big drop zone */
                                    <div className={cn(
                                        "flex-1 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer",
                                        isDragging
                                            ? "border-blue-500 bg-blue-50/50 scale-[1.01]"
                                            : "border-slate-300/60 bg-white/50 hover:border-blue-400 hover:bg-blue-50/20"
                                    )} onClick={() => fileInputRef.current?.click()}>
                                        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
                                        <div className="text-center space-y-6 max-w-md">
                                            <div className={cn("h-20 w-20 mx-auto rounded-3xl flex items-center justify-center transition-all", isDragging ? "bg-blue-500 text-white scale-110" : "bg-slate-100 text-slate-400")}>
                                                <Upload className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Drop your photos here</h2>
                                                <p className="text-slate-500 mt-2 text-sm">or click to browse • JPG, PNG, HEIC supported</p>
                                            </div>
                                            <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400 font-medium">
                                                <span className="flex items-center gap-1.5"><Star className="h-3 w-3 text-amber-400" /> Best: 20–50 photos</span>
                                                <span>•</span>
                                                <span>Min: 10 photos</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Has images — grid with management */
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Your Photos</h2>
                                                <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full">{images.length}</span>
                                            </div>
                                            <label className="cursor-pointer">
                                                <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
                                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
                                                    <Plus className="h-3.5 w-3.5" /> Add More
                                                </div>
                                            </label>
                                        </div>

                                        {coverImages.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                                    <h3 className="text-sm font-bold text-slate-700">Cover Photos</h3>
                                                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">{coverImages.length}</span>
                                                </div>
                                                <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-8 gap-3">
                                                    {coverImages.map((img) => (
                                                        <ImageCard key={img.id} img={img} isCover onToggle={toggleRole} onRemove={removeImage} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-blue-500" />
                                                <h3 className="text-sm font-bold text-slate-700">Interior Pages</h3>
                                                <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">{internalImages.length}</span>
                                            </div>
                                            <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-8 gap-3">
                                                {internalImages.map((img) => (
                                                    <ImageCard key={img.id} img={img} isCover={false} onToggle={toggleRole} onRemove={removeImage} />
                                                ))}
                                                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-white/50 hover:bg-blue-50/50 hover:border-blue-400 cursor-pointer transition-all">
                                                    <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
                                                    <Plus className="h-5 w-5 text-slate-400" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ═══ DESIGN MODE ═══ */}
                        {mode === "design" && (
                            <motion.div key="design" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col items-center justify-center p-8 relative"
                                onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                                {/* Book Preview */}
                                <motion.div
                                    className="w-full max-w-[480px] cursor-zoom-in"
                                    onClick={() => setIsCinemaMode(true)}
                                    style={{ perspective: 2500, rotateX: tiltX, rotateY: tiltY }}
                                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                                    transition={{ type: "spring", stiffness: 40, damping: 15 }}
                                >
                                    <div className={cn("aspect-[4/5] shadow-[20px_40px_80px_rgba(0,0,0,0.35)] relative overflow-hidden transition-all duration-700",
                                        design.isRounded ? (isFlipped ? "rounded-[3rem_0.5rem_0.5rem_3rem]" : "rounded-[0.5rem_3rem_3rem_0.5rem]") : "rounded-[0.1rem]"
                                    )} style={{ backgroundColor: design.coverBgColor }}>
                                        {/* Material texture */}
                                        <div className="absolute inset-0 pointer-events-none z-10" style={{
                                            backgroundImage: `url("${MATERIALS[design.coverMaterial].texture}")`,
                                            opacity: MATERIALS[design.coverMaterial].opacity,
                                            mixBlendMode: MATERIALS[design.coverMaterial].blend as any
                                        }} />
                                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                                        <div className={cn("h-full w-full", isFlipped ? "[transform:rotateY(180deg)]" : "")}>
                                            {isFlipped ? (
                                                <BackCoverRenderer pImages={coverImages.length > 0 ? coverImages : images.slice(0, 8)} pColor={design.coverTextColor} />
                                            ) : (
                                                <CoverLayoutRenderer tplId={design.templateId} pTitle={design.title} pSubtitle={design.subtitle}
                                                    pImages={coverImages.length > 0 ? coverImages : images.slice(0, 8)}
                                                    pColor={design.coverTextColor} pIcon={design.coverIconName} pSymbol={design.coverSymbol}
                                                    pFont={design.coverFont} pFoil={design.coverFoil} pIllustration={design.illustrationId} />
                                            )}
                                        </div>

                                        {/* Spine */}
                                        <div className={cn("absolute inset-y-0 w-10 pointer-events-none flex items-center justify-center",
                                            isFlipped ? "right-0 bg-gradient-to-l from-black/20 via-black/5 to-transparent" : "left-0 bg-gradient-to-r from-black/20 via-black/5 to-transparent"
                                        )}>
                                            <div className="whitespace-nowrap font-black uppercase tracking-[0.3em] text-[7px] rotate-90 mix-blend-overlay opacity-30"
                                                style={{ color: design.coverTextColor, fontFamily: activeFontFamily }}>{design.spineText}</div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Controls bar */}
                                <div className="mt-8 flex items-center gap-3 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/40">
                                    <button onClick={() => setIsFlipped(!isFlipped)}
                                        className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all">
                                        <Move className={cn("h-3 w-3 transition-transform", isFlipped ? "rotate-180" : "")} />
                                        {isFlipped ? "Front" : "Back"}
                                    </button>
                                    <button onClick={() => setIsCinemaMode(true)}
                                        className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors" title="Cinema Mode">
                                        <Maximize2 className="h-4 w-4 text-slate-500" />
                                    </button>
                                </div>

                                {/* Asset tray */}
                                {images.length > 0 && (
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {images.slice(0, 16).map((img) => (
                                                <button key={img.id} onClick={() => toggleRole(img.id)}
                                                    className={cn("flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all relative",
                                                        img.role === "cover" ? "border-amber-400 shadow-sm" : "border-white/80 hover:border-slate-300"
                                                    )}>
                                                    <Image src={img.preview_url} alt="" fill className="object-cover" />
                                                    {img.role === "cover" && <Star className="absolute top-0.5 right-0.5 h-2 w-2 text-amber-400 fill-amber-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ═══ PROOF MODE ═══ */}
                        {mode === "proof" && (
                            <motion.div key="proof" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto p-8">
                                <div className="max-w-5xl mx-auto space-y-16">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Digital Proof</h2>
                                            <p className="text-sm text-slate-500 mt-1">Review your photobook before printing</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-bold text-emerald-600">Ready</span>
                                        </div>
                                    </div>

                                    {/* Front cover */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Front Cover</p>
                                        <div className="max-w-md mx-auto aspect-[4/5] shadow-2xl relative overflow-hidden" style={{
                                            backgroundColor: design.coverBgColor,
                                            borderRadius: design.isRounded ? '0.2rem 3rem 3rem 0.2rem' : '0.1rem'
                                        }}>
                                            <CoverLayoutRenderer tplId={design.templateId} pTitle={design.title} pSubtitle={design.subtitle}
                                                pImages={coverImages.length > 0 ? coverImages : images.slice(0, 8)} pColor={design.coverTextColor}
                                                pIcon={design.coverIconName} pSymbol={design.coverSymbol} pFont={design.coverFont} pFoil={design.coverFoil} pIllustration={design.illustrationId} />
                                        </div>
                                    </div>

                                    {/* Spreads */}
                                    {Array.from({ length: Math.ceil(internalImages.length / 2) }).map((_, idx) => (
                                        <div key={idx} className="space-y-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                                Pages {idx * 2 + 2}–{idx * 2 + 3}
                                            </p>
                                            <div className="max-w-4xl mx-auto aspect-[16/10] bg-white shadow-xl flex border border-slate-100 rounded-lg overflow-hidden">
                                                <div className="flex-1 border-r border-slate-100 relative bg-slate-50">
                                                    {internalImages[idx * 2] && <Image src={internalImages[idx * 2].preview_url} alt="" fill className="object-cover p-2" />}
                                                </div>
                                                <div className="flex-1 relative bg-slate-50">
                                                    {internalImages[idx * 2 + 1] && <Image src={internalImages[idx * 2 + 1].preview_url} alt="" fill className="object-cover p-2" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Back cover */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Back Cover</p>
                                        <div className="max-w-md mx-auto aspect-[4/5] shadow-2xl relative overflow-hidden" style={{
                                            backgroundColor: design.coverBgColor,
                                            borderRadius: design.isRounded ? '3rem 0.2rem 0.2rem 3rem' : '0.1rem'
                                        }}>
                                            <BackCoverRenderer pImages={coverImages.length > 0 ? coverImages : images.slice(0, 8)} pColor={design.coverTextColor} />
                                        </div>
                                    </div>

                                    {/* Order summary */}
                                    <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4">
                                        <h3 className="font-bold text-lg">Order Summary</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-slate-500">Size</span><span className="font-bold">{SIZES.find(s => s.id === design.sizeId)?.name} ({SIZES.find(s => s.id === design.sizeId)?.dimensions})</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">Pages</span><span className="font-bold">{totalPages} pages ({Math.ceil(internalImages.length / 2)} spreads)</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">Material</span><span className="font-bold">{MATERIALS[design.coverMaterial].name}</span></div>
                                            <div className="flex justify-between"><span className="text-slate-500">Foil</span><span className="font-bold">{FOILS[design.coverFoil].name}</span></div>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-slate-900 text-white rounded-xl">
                                            <span className="font-bold text-sm">Total</span>
                                            <span className="text-xl font-black">GHS {cost}</span>
                                        </div>
                                        <Button className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                                            Authorize & Print
                                        </Button>
                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100/50 space-y-2">
                                            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-600" /><p className="text-xs font-bold text-amber-900">Pre-Print Checklist</p></div>
                                            <ul className="space-y-1 text-xs text-amber-800/70">
                                                <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-amber-400" /> Spelling on covers verified</li>
                                                <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-amber-400" /> Image quality within bounds</li>
                                                <li className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-amber-400" /> {images.length} photos included</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ─── Drag overlay ─── */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] bg-blue-600/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                            <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-slate-900">Drop photos anywhere</h3>
                            <p className="text-slate-500 text-sm mt-1">They'll be added to your photobook</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Cinema Mode ─── */}
            <AnimatePresence>
                {isCinemaMode && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
                            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[180px] rounded-full" />
                        </div>
                        <button onClick={() => setIsCinemaMode(false)}
                            className="absolute top-8 right-8 h-12 w-12 rounded-full bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all z-10">
                            <X className="h-5 w-5" />
                        </button>
                        <div className="flex flex-col items-center gap-12 relative z-10">
                            <div className="text-center">
                                <h2 className="text-white text-3xl font-black uppercase tracking-tighter">{design.title}</h2>
                                <p className="text-blue-400 font-bold text-xs uppercase tracking-[0.5em] mt-2">{design.subtitle}</p>
                            </div>
                            <motion.div className="w-full max-w-xl" style={{ perspective: 3000 }}
                                animate={{ rotateY: isFlipped ? 180 : 0, scale: [1, 1.01, 1] }}
                                transition={{ rotateY: { type: "spring", stiffness: 40, damping: 15 }, scale: { duration: 5, repeat: Infinity } }}>
                                <div className={cn("aspect-[4/5] shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden",
                                    design.isRounded ? (isFlipped ? "rounded-[3.5rem_0.5rem_0.5rem_3.5rem]" : "rounded-[0.5rem_3.5rem_3.5rem_0.5rem]") : "rounded-[0.1rem]"
                                )} style={{ backgroundColor: design.coverBgColor }}>
                                    <div className={cn("h-full w-full", isFlipped ? "[transform:rotateY(180deg)]" : "")}>
                                        {isFlipped ? (
                                            <BackCoverRenderer pImages={coverImages.length > 0 ? coverImages : images.slice(0, 8)} pColor={design.coverTextColor} />
                                        ) : (
                                            <CoverLayoutRenderer tplId={design.templateId} pTitle={design.title} pSubtitle={design.subtitle}
                                                pImages={coverImages.length > 0 ? coverImages : images.slice(0, 8)} pColor={design.coverTextColor}
                                                pIcon={design.coverIconName} pSymbol={design.coverSymbol} pFont={design.coverFont} pFoil={design.coverFoil} pIllustration={design.illustrationId} />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                            <button onClick={() => setIsFlipped(!isFlipped)}
                                className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold text-xs uppercase tracking-wider shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
                                <Move className={cn("h-4 w-4", isFlipped ? "rotate-180" : "")} />
                                Inspect {isFlipped ? "Front" : "Back"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ImageCard({ img, isCover, onToggle, onRemove }: { img: StudioImage; isCover: boolean; onToggle: (id: string) => void; onRemove: (id: string) => void }) {
    return (
        <div className={cn("group relative aspect-square rounded-xl overflow-hidden bg-white shadow-sm border-2 transition-all",
            isCover ? "border-amber-400" : "border-transparent hover:border-slate-200"
        )}>
            <Image src={img.preview_url} alt="" fill className="object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => onToggle(img.id)} title={isCover ? "Remove from cover" : "Set as cover"}
                    className="h-7 w-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                    <Star className={cn("h-3.5 w-3.5", isCover ? "text-amber-500 fill-amber-500" : "text-slate-600")} />
                </button>
                <button onClick={() => onRemove(img.id)} title="Delete"
                    className="h-7 w-7 rounded-full bg-red-500/90 flex items-center justify-center hover:bg-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5 text-white" />
                </button>
            </div>
        </div>
    );
}
