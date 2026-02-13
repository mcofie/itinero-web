"use client";

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Layout,
    Image as ImageIcon,
    Sparkles,
    Check,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Plus,
    Upload,
    Info,
    Trophy,
    ShoppingBag,
    CloudRain,
    Sun,
    Wind,
    Camera,
    Heart,
    Mountain,
    Globe,
    Compass,
    Plane,
    MapPin,
    Palmtree,
    AlignLeft,
    Grid,
    Move,
    X,
    AlignCenter,
    AlignRight,
    Search,
    Maximize2,
    FileText,
    ShieldCheck,
    Star,
    BookOpen,
    Type
} from "lucide-react";
import {
    Flower,
    Butterfly,
    Bird,
    Anchor,
    Moon,
    Cactus,
    TreeEvergreen,
    PawPrint,
    Rainbow,
    Leaf,
    Crown,
    Lighthouse,
    SuitcaseRolling,
    Buildings,
    CastleTurret,
    Bridge,
    Cube,
    Heart as HeartPh,
    Sun as SunPh,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const MATERIALS = {
    linen: { id: 'linen', name: 'Natural Linen', texture: 'https://www.transparenttextures.com/patterns/linen.png', opacity: 0.05, blend: 'overlay' },
    silk: { id: 'silk', name: 'Silk Matte', texture: 'https://www.transparenttextures.com/patterns/subtle-white-feathers.png', opacity: 0.1, blend: 'soft-light' },
    grain: { id: 'grain', name: 'Heavy Grain', texture: 'https://www.transparenttextures.com/patterns/leather.png', opacity: 0.08, blend: 'multiply' },
} as const;

const FONTS = [
    { id: 'font-outfit', name: 'Outfit Modern', family: '"Outfit", sans-serif', import: 'Outfit:wght@100..900' },
    { id: 'font-playfair', name: 'Playfair Serif', family: '"Playfair Display", serif', import: 'Playfair+Display:wght@400..900' },
    { id: 'font-cormorant', name: 'Cormorant Luxe', family: '"Cormorant Garamond", serif', import: 'Cormorant+Garamond:wght@300..700' },
    { id: 'font-montserrat', name: 'Montserrat Bold', family: '"Montserrat", sans-serif', import: 'Montserrat:wght@100..900' },
    { id: 'font-syncopate', name: 'Syncopate Wide', family: '"Syncopate", sans-serif', import: 'Syncopate:wght@400;700' },
    { id: 'font-inter', name: 'Inter Tight', family: '"Inter", sans-serif', import: 'Inter:wght@100..900' },
    { id: 'font-marker', name: 'Wild Spirit', family: '"Permanent Marker", cursive', import: 'Permanent+Marker' },
    { id: 'font-script', name: 'Tropical Soul', family: '"Pacifico", cursive', import: 'Pacifico' },
    { id: 'font-rounded', name: 'Sunbeam Friends', family: '"Comfortaa", cursive', import: 'Comfortaa:wght@300..700' },
    { id: 'font-hand', name: 'Summer Postcard', family: '"Caveat", cursive', import: 'Caveat:wght@400..700' },
    { id: 'font-fun', name: 'Beach Party', family: '"Bangers", cursive', import: 'Bangers' },
];

const TEMPLATES = [
    {
        id: "modern-minimal",
        name: "Studio Minimal",
        description: "Clean grid arrangement with asymmetric white space",
        layout: "grid"
    },
    {
        id: "classic-heritage",
        name: "Heritage",
        description: "Classic framed focus with balanced serif typography",
        layout: "framed"
    },
    {
        id: "adventure",
        name: "Adventure",
        description: "Layered scattered arrangement for dynamic depth",
        layout: "scattered"
    },
    {
        id: "panorama",
        name: "Grand Horizon",
        description: "Expansive cinematic focus for landscape memories",
        layout: "panorama"
    },
    {
        id: "mosaic",
        name: "Digital Mosaic",
        description: "Densely packed grid for maximalist storytelling",
        layout: "mosaic"
    },
    {
        id: "editorial",
        name: "Editorial Proof",
        description: "High-contrast text focus with wrapped mini-thumbnails",
        layout: "editorial"
    },
    {
        id: "symbolic",
        name: "Artisan Icon",
        description: "Zero images. Pure symbolic focus with massive center graphic",
        layout: "symbolic"
    }
];

const SIZES = [
    { id: "small", name: "Artisan Pocket", dimensions: "6x8 in", price_multiplier: 1 },
    { id: "medium", name: "Studio Standard", dimensions: "8x10 in", price_multiplier: 1.25 },
    { id: "large", name: "Gallery Edition", dimensions: "11x14 in", price_multiplier: 1.6 }
];

export default function PhotobookEditor() {
    const ICON_MAP: Record<string, any> = {
        Heart, Camera, Sun, Palmtree, Mountain, Globe, Compass, Plane, MapPin,
        Flower, Butterfly, Bird, Anchor, "Moon Ph": Moon, Rainbow, "Leaf Ph": Leaf,
        London: Crown, "New York": Buildings, Coastal: Lighthouse, Europe: CastleTurret, Travel: SuitcaseRolling, SF: Bridge,
        "Modern Geometry": Cube, "Heart Lucide": Heart, "Camera Lucide": Camera, "Mountain Lucide": Mountain, "Globe Lucide": Globe, "MapPin Lucide": MapPin
    };

    const CoverLayoutRenderer = ({ tplId, pTitle, pSubtitle, pImages, pColor, pIcon, pSymbol, pFont, isCard = false }: any) => {
        const IconComponent = pIcon ? ICON_MAP[pIcon] || null : null;
        const fontStyle = pFont ? { fontFamily: FONTS.find(f => f.id === pFont)?.family } : {};

        const tTitle = pTitle || "LOCATION";
        const tSubtitle = pSubtitle || "JOURNEY";

        let content = null;

        if (tplId === "modern-minimal") {
            content = (
                <div className={cn("h-full grid grid-cols-12 gap-4", isCard ? "p-4" : "p-12 ml-6 py-16")}>
                    <div className="col-span-5 flex flex-col justify-center space-y-2">
                        {IconComponent && <IconComponent className={cn("opacity-60", isCard ? "h-2 w-2" : "h-8 w-8")} style={{ color: pColor }} />}
                        {pSymbol && <Image src={pSymbol} alt="S" width={isCard ? 10 : 32} height={isCard ? 10 : 32} className="opacity-60" />}
                        <h1 className={cn("font-[1000] uppercase tracking-tighter leading-none mix-blend-multiply", isCard ? "text-[10px]" : "text-4xl")} style={{ color: pColor, ...fontStyle }}>{tTitle}</h1>
                        <p className={cn("font-black uppercase tracking-tight opacity-70", isCard ? "text-[6px]" : "text-lg")} style={{ color: pColor, ...fontStyle }}>{tSubtitle}</p>
                    </div>
                    <div className="col-span-1" />
                    <div className="col-span-6 grid grid-cols-2 gap-1.5 h-full">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="bg-slate-200/50 rounded-md overflow-hidden relative shadow-sm">
                                {pImages[i] ? <Image src={pImages[i].preview_url} alt="P" fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="h-4 w-4" /></div>}
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else if (tplId === "classic-heritage") {
            content = (
                <div className={cn("h-full flex flex-col items-center justify-between text-center", isCard ? "p-4" : "p-12 ml-6 py-16")}>
                    <div className="space-y-1">
                        {IconComponent && <IconComponent className={cn("mx-auto opacity-80", isCard ? "h-3 w-3" : "h-12 w-12")} style={{ color: pColor }} />}
                        {pSymbol && <Image src={pSymbol} alt="S" width={isCard ? 12 : 48} height={isCard ? 12 : 48} className="mx-auto" />}
                        <span className={cn("font-black uppercase tracking-[0.3em] opacity-40", isCard ? "text-[4px]" : "text-[10px]")} style={{ color: pColor, ...fontStyle }}>Studio Edition</span>
                        <h1 className={cn("font-[1000] uppercase tracking-tight mix-blend-multiply", isCard ? "text-xs" : "text-5xl")} style={{ color: pColor, ...fontStyle }}>{tTitle}</h1>
                    </div>
                    <div className={cn("w-full aspect-square border-white shadow-xl relative overflow-hidden", isCard ? "max-w-[60px] border-2" : "max-w-[300px] border-8")}>
                        {pImages[0] ? <Image src={pImages[0].preview_url} alt="P" fill className="object-cover" /> : <div className="absolute inset-0 bg-slate-100 flex items-center justify-center opacity-20"><ImageIcon className="h-6 w-6" /></div>}
                    </div>
                    <p className={cn("font-black uppercase tracking-widest opacity-70 italic", isCard ? "text-[6px]" : "text-lg")} style={{ color: pColor, ...fontStyle }}>{tSubtitle}</p>
                </div>
            );
        } else if (tplId === "adventure") {
            content = (
                <div className={cn("h-full relative overflow-hidden", isCard ? "p-4" : "p-12 ml-6 py-16")}>
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-4 opacity-70 scale-110">
                        {[0, 1].map((i) => (
                            <div key={i} className={cn("relative rounded-lg shadow-xl overflow-hidden border-white", isCard ? "border-[2px]" : "border-4", i === 0 ? "rotate-3" : "-rotate-6 translate-x-4 translate-y-4")}>
                                {pImages[i] ? <Image src={pImages[i].preview_url} alt="P" fill className="object-cover" /> : <div className="absolute inset-0 bg-slate-200" />}
                            </div>
                        ))}
                    </div>
                    <div className="relative h-full flex flex-col items-center justify-center z-10 text-center pointer-events-none">
                        {IconComponent && <IconComponent className={cn("mb-2 opacity-90 backdrop-blur-sm", isCard ? "h-3 w-3" : "h-14 w-14")} style={{ color: pColor }} />}
                        <h1 className={cn("font-[1000] uppercase tracking-tight drop-shadow-2xl", isCard ? "text-lg" : "text-6xl")} style={{ color: pColor, ...fontStyle }}>{tTitle}</h1>
                        <p className={cn("font-black uppercase tracking-[0.5em] mt-1 drop-shadow-lg", isCard ? "text-[4px]" : "text-xs")} style={{ color: pColor, ...fontStyle }}>{tSubtitle}</p>
                    </div>
                </div>
            );
        } else if (tplId === "panorama") {
            content = (
                <div className={cn("h-full flex flex-col justify-end gap-4", isCard ? "p-4" : "p-12 ml-6 py-16")}>
                    <div className="flex-1 rounded-2xl overflow-hidden relative shadow-2xl border-white bg-slate-100 border-x-4">
                        {pImages[0] ? <Image src={pImages[0].preview_url} alt="P" fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="h-10 w-10" /></div>}
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 inset-x-0 text-center px-4 flex flex-col items-center">
                            {IconComponent && <IconComponent className={cn("mb-2 text-white/80", isCard ? "h-2 w-2" : "h-10 w-10")} />}
                            <h1 className={cn("font-black text-white uppercase tracking-tighter", isCard ? "text-[10px]" : "text-4xl")} style={{ ...fontStyle }}>{tTitle}</h1>
                        </div>
                    </div>
                    <div className="flex justify-between items-center px-2">
                        <p className={cn("font-black uppercase tracking-widest opacity-50", isCard ? "text-[4px]" : "text-[10px]")} style={{ color: pColor, ...fontStyle }}>{tSubtitle}</p>
                        <div className={cn("bg-white/40 h-0.5", isCard ? "w-4" : "w-12")} />
                    </div>
                </div>
            );
        } else if (tplId === "mosaic") {
            content = (
                <div className={cn("h-full grid grid-cols-4 grid-rows-4 gap-1", isCard ? "p-2" : "p-12 ml-6 py-16")}>
                    <div className="col-span-2 row-span-2 relative rounded overflow-hidden shadow-sm bg-slate-200">
                        {pImages[0] ? <Image src={pImages[0].preview_url} alt="P" fill className="object-cover" /> : null}
                    </div>
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <div key={i} className="relative rounded overflow-hidden shadow-sm bg-slate-100">
                            {pImages[i] ? <Image src={pImages[i].preview_url} alt="P" fill className="object-cover" /> : null}
                        </div>
                    ))}
                    <div className="col-span-4 mt-auto space-y-1">
                        {IconComponent && <IconComponent className={cn("opacity-40", isCard ? "h-2 w-2" : "h-6 w-6")} style={{ color: pColor }} />}
                        <h1 className={cn("font-black uppercase tracking-tight mix-blend-multiply", isCard ? "text-[10px]" : "text-3xl")} style={{ color: pColor, ...fontStyle }}>{tTitle}</h1>
                        <p className={cn("font-bold uppercase tracking-widest opacity-60", isCard ? "text-[4px]" : "text-[8px]")} style={{ color: pColor, ...fontStyle }}>{tSubtitle}</p>
                    </div>
                </div>
            );
        } else if (tplId === "editorial") {
            content = (
                <div className={cn("h-full flex flex-col gap-6", isCard ? "p-4" : "p-12 ml-6 py-16")}>
                    <div className="space-y-2 border-b-2 pb-6 border-current opacity-80" style={{ borderColor: pColor, color: pColor }}>
                        {IconComponent && <IconComponent className={cn("mb-2", isCard ? "h-4 w-4" : "h-12 w-12")} />}
                        <h1 className={cn("font-[1000] uppercase tracking-[-0.05em] leading-[0.8]", isCard ? "text-xl" : "text-7xl")} style={{ ...fontStyle }}>{tTitle}</h1>
                        <p className={cn("font-black uppercase tracking-[0.4em]", isCard ? "text-[5px]" : "text-sm")} style={{ ...fontStyle }}>{tSubtitle}</p>
                    </div>
                    <div className="flex-1 flex gap-4">
                        <div className="flex-1 relative rounded-lg overflow-hidden bg-slate-50">
                            {pImages[0] ? <Image src={pImages[0].preview_url} alt="P" fill className="object-cover" /> : null}
                        </div>
                        <div className="w-1/3 flex flex-col gap-3">
                            {[1, 2].map(i => (
                                <div key={i} className="flex-1 relative rounded bg-slate-100 overflow-hidden">
                                    {pImages[i] ? <Image src={pImages[i].preview_url} alt="P" fill className="object-cover" /> : null}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        } else if (tplId === "symbolic") {
            content = (
                <div className={cn("h-full flex flex-col items-center justify-center relative overflow-hidden", isCard ? "p-4" : "p-12 ml-6")}>
                    {/* The Hero: Massive Background Watermark */}
                    <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center pointer-events-none opacity-[0.07] overflow-hidden -rotate-6">
                        {IconComponent && <IconComponent className="w-[110%] h-[110%] scale-110" style={{ color: pColor }} />}
                        {pSymbol && <Image src={pSymbol} alt="S" fill className="object-contain scale-110" />}
                    </div>

                    <div className="flex flex-col items-center space-y-12 z-10 w-full">
                        <div className="text-center space-y-6">
                            <div className="h-0.5 w-16 bg-current mx-auto opacity-20" style={{ color: pColor }} />

                            <div className="space-y-4">
                                <h1 className={cn("font-[1000] uppercase tracking-[0.4em] leading-tight mix-blend-multiply", isCard ? "text-[12px]" : "text-6xl")} style={{ color: pColor, ...fontStyle }}>
                                    {tTitle}
                                </h1>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="h-px flex-1 bg-current opacity-10" style={{ color: pColor }} />
                                    <p className={cn("font-black uppercase tracking-[0.6em] opacity-40 whitespace-nowrap", isCard ? "text-[5px]" : "text-sm")} style={{ color: pColor, ...fontStyle }}>
                                        {tSubtitle}
                                    </p>
                                    <div className="h-px flex-1 bg-current opacity-10" style={{ color: pColor }} />
                                </div>
                            </div>

                            <div className="h-0.5 w-16 bg-current mx-auto opacity-20" style={{ color: pColor }} />
                        </div>
                    </div>

                    {/* Subtle Identification */}
                    <p className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[1.5em] opacity-20 whitespace-nowrap" style={{ color: pColor }}>
                        STRICTLY ARCHIVAL
                    </p>
                </div>
            );
        }

        return (
            <div className="relative h-full w-full">
                {content}
                {!isCard && (
                    <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.5em] opacity-30 text-center w-full" style={{ color: pColor }}>
                        Limited Edition • Itinero Studio
                    </p>
                )}
            </div>
        );
    };

    const BackCoverRenderer = ({ pImages, pColor, isCard = false }: any) => {
        return (
            <div className={cn("h-full flex flex-col items-center justify-center p-12 text-center relative", isCard ? "scale-75" : "")}>
                <div className="space-y-12 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center border-4 border-white shadow-2xl rotate-3 overflow-hidden relative">
                        {pImages.length > 0 ? (
                            <Image src={pImages[pImages.length - 1].preview_url} alt="Back" fill className="object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                                <Compass className="h-10 w-10 text-slate-400 opacity-20" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="h-px w-8 bg-current opacity-20" style={{ color: pColor }} />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40" style={{ color: pColor }}>FINIS</p>
                            <div className="h-px w-8 bg-current opacity-20" style={{ color: pColor }} />
                        </div>
                        <h2 className="text-2xl font-[1000] uppercase tracking-tighter mix-blend-multiply" style={{ color: pColor }}>Itinero Studio</h2>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-30" style={{ color: pColor }}>Made with Adventure in Mind</p>
                    </div>
                    <div className="mt-8 pt-8 border-t w-32 border-current opacity-10 flex flex-col items-center gap-2" style={{ color: pColor }}>
                        <div className="w-full h-8 bg-current opacity-30 rounded-sm" />
                        <p className="text-[7px] font-black tracking-widest">CERTIFIED ARTISAN</p>
                    </div>
                </div>
            </div>
        );
    };

    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"design" | "images" | "preview">("design");
    const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
    const [designerCategory, setDesignerCategory] = useState<"color" | "symbol" | "typography">("color");

    // Design States
    const [coverBgColor, setCoverBgColor] = useState("#ffffff");
    const [coverTextColor, setCoverTextColor] = useState("#0f172a");
    const [coverIconName, setCoverIconName] = useState<string | null>("Heart");
    const [coverSymbol, setCoverSymbol] = useState<string>("");
    const [layoutStyle, setLayoutStyle] = useState<"stacked" | "standard" | "offset" | "creative">("stacked");
    const [title, setTitle] = useState("OUR SUMMER");
    const [subtitle, setSubtitle] = useState("GREECE 2025");
    const [sizeId, setSizeId] = useState("small");
    const [isFlipped, setIsFlipped] = useState(false);
    const [isRounded, setIsRounded] = useState(true);
    const [isCinemaMode, setIsCinemaMode] = useState(false);
    const [coverMaterial, setCoverMaterial] = useState<keyof typeof MATERIALS>("linen");
    const [coverFont, setCoverFont] = useState(FONTS[0].id);
    const [spineText, setSpineText] = useState("OUR SUMMER 2025");
    const [peekProgress, setPeekProgress] = useState(0);

    // Mouse Tracking for 3D Tilt
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const tiltX = useTransform(mouseY, [-300, 300], [10, -10]);
    const tiltY = useTransform(mouseX, [-300, 300], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    // Image States
    const [images, setImages] = useState<any[]>([]);

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${FONTS.map(f => f.import).join('&family=')}&display=swap`;
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    const coverImages = images.filter(img => img.role === "cover");

    const internalImages = images.filter(img => img.role === "internal");

    const [activeSpread, setActiveSpread] = useState(0);

    const activeFontFamily = FONTS.find(f => f.id === coverFont)?.family;
    const globalFontStyle = { fontFamily: activeFontFamily };

    const totalPages = 12 + Math.ceil(internalImages.length / 2) * 2;

    const cost = Math.round(150 * (SIZES.find(s => s.id === sizeId)?.price_multiplier || 1));

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const newImages = Array.from(files).map((file, i) => ({
            id: Math.random().toString(36).substr(2, 9),
            preview_url: URL.createObjectURL(file),
            file,
            role: "internal" // Default placement
        }));
        setImages([...images, ...newImages]);
    };

    const toggleImageRole = (id: string) => {
        setImages(images.map(img =>
            img.id === id ? { ...img, role: img.role === "cover" ? "internal" : "cover" } : img
        ));
    };

    const removeImage = (id: string) => {
        setImages(images.filter(img => img.id !== id));
    };

    const handlePayment = () => {
        router.push("/photobooks/success");
    };

    return (
        <div className="min-h-screen bg-[#fafafb] dark:bg-slate-950 font-outfit">
            <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:bg-slate-900/70 dark:border-slate-800/60">
                <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <div className="flex flex-col">
                            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">Photobook Studio</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Project: {title || "Untitled"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Estimate</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white leading-none">GHS {cost}</span>
                        </div>
                        <Button
                            onClick={handlePayment}
                            className="rounded-full bg-blue-600 font-extrabold px-8 shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all text-white"
                        >
                            Checkout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1800px] mx-auto px-6 lg:px-12 py-12">
                <div className="flex items-center justify-center mb-16">
                    <div className="flex p-1.5 bg-slate-200/40 rounded-2xl dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab("design")}
                            className={cn(
                                "flex items-center gap-2.5 px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                                activeTab === "design"
                                    ? "bg-white shadow-md text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                            )}
                        >
                            <Layout className="h-4 w-4" /> Design
                        </button>
                        <button
                            onClick={() => setActiveTab("images")}
                            className={cn(
                                "flex items-center gap-2.5 px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                                activeTab === "images"
                                    ? "bg-white shadow-md text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                            )}
                        >
                            <ImageIcon className="h-4 w-4" /> Photos
                        </button>
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={cn(
                                "flex items-center gap-2.5 px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                                activeTab === "preview"
                                    ? "bg-slate-900 border-slate-900 shadow-md text-white dark:bg-white dark:text-slate-900"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                            )}
                        >
                            <ShoppingBag className="h-4 w-4" /> Proofing
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "design" && (
                        <motion.div
                            key="design"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-16"
                        >
                            {/* Templates Table */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 dark:bg-amber-900/30">
                                        <Grid className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight">Component Arrangement</h2>
                                        <p className="text-sm text-slate-500 font-medium tracking-wide">Select the layout structure for your project</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Simplified Templates */}
                                    {TEMPLATES.map((tmpl) => (
                                        <button
                                            key={tmpl.id}
                                            onClick={() => setTemplateId(tmpl.id)}
                                            className={cn(
                                                "group relative flex p-6 rounded-[2.5rem] border transition-all duration-500 overflow-hidden",
                                                templateId === tmpl.id
                                                    ? "border-blue-600 bg-white shadow-xl ring-4 ring-blue-500/5 dark:border-blue-500 dark:bg-slate-900"
                                                    : "border-slate-200/60 bg-white/50 hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:border-slate-800"
                                            )}
                                        >
                                            <div className="w-[120px] aspect-[4/5] transition-all duration-700 group-hover:scale-105 relative overflow-hidden shadow-2xl shrink-0" style={{
                                                backgroundColor: templateId === tmpl.id ? coverBgColor : '#f8fafc',
                                                borderRadius: isRounded ? '0.2rem 1rem 1rem 0.2rem' : '0.1rem'
                                            }}>
                                                <CoverLayoutRenderer
                                                    tplId={tmpl.id}
                                                    pTitle={title}
                                                    pSubtitle={subtitle}
                                                    pImages={coverImages.length > 0 ? coverImages : images.slice(0, 8)}
                                                    pColor={coverTextColor}
                                                    pIcon={coverIconName}
                                                    pSymbol={coverSymbol}
                                                    pFont={coverFont}
                                                    isCard={true}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                                            </div>
                                            <div className="flex-1 pl-6 text-left flex flex-col justify-center">
                                                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-1">{tmpl.name}</h3>
                                                <p className="text-[11px] text-slate-500 font-bold leading-relaxed opacity-80">{tmpl.description}</p>
                                                {templateId === tmpl.id && (
                                                    <div className="mt-3 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[9px] uppercase tracking-widest">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> Focused View
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <div className="flex flex-col lg:flex-row gap-16">
                                {/* Design Sidebar */}
                                <div className="w-full lg:w-[420px] flex-shrink-0">
                                    <div className="sticky top-32 space-y-8">
                                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-xl p-6">
                                            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
                                                {[
                                                    { id: "color", label: "Color", icon: Sparkles },
                                                    { id: "symbol", label: "Symbol", icon: ImageIcon },
                                                    { id: "typography", label: "Text", icon: Layout },
                                                ].map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setDesignerCategory(cat.id as any)}
                                                        className={cn(
                                                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                                            designerCategory === cat.id
                                                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                                                : "text-slate-500 hover:text-slate-700"
                                                        )}
                                                    >
                                                        <cat.icon className="h-3.5 w-3.5" />
                                                        <span className="hidden sm:inline">{cat.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="space-y-8 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                                {designerCategory === "color" && (
                                                    <div className="space-y-8">
                                                        <div className="space-y-6">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Sparkles className="h-3 w-3" /> Curated Palettes
                                                            </p>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {[
                                                                    { name: "Aegean", colors: ["#0369a1", "#f0f9ff", "#ffffff"], label: "Deep Sea" },
                                                                    { name: "Forest", colors: ["#166534", "#f0fdf4", "#ffffff"], label: "Nature" },
                                                                    { name: "Sunset", colors: ["#ff9a3d", "#fef9c3", "#ffffff"], label: "Golden Hour" },
                                                                    { name: "Studio", colors: ["#0f172a", "#f8fafc", "#ffffff"], label: "Minimal" },
                                                                ].map((p) => (
                                                                    <button
                                                                        key={p.name}
                                                                        onClick={() => {
                                                                            setCoverBgColor(p.colors[0]);
                                                                            setCoverTextColor(p.colors[2]);
                                                                        }}
                                                                        className="w-full hover:bg-slate-50 dark:hover:bg-slate-800/50 p-3 rounded-2xl border border-transparent hover:border-slate-100 transition-all text-left"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex -space-x-2">
                                                                                {p.colors.map((c, i) => (
                                                                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" style={{ backgroundColor: c }} />
                                                                                ))}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs font-black text-slate-900 dark:text-white">{p.name}</p>
                                                                                <p className="text-[10px] font-bold text-slate-400">{p.label}</p>
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Background</p>
                                                            <div className="grid grid-cols-5 gap-3">
                                                                {["#8eb6d9", "#b8e1dd", "#f5b8c8", "#f9e9ad", "#ffffff", "#0f172a", "#166534", "#ff9a3d", "#be123c", "#4338ca"].map((c) => (
                                                                    <button
                                                                        key={c}
                                                                        onClick={() => setCoverBgColor(c)}
                                                                        className={cn(
                                                                            "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
                                                                            coverBgColor === c ? "border-slate-900 ring-2 ring-slate-100" : "border-transparent"
                                                                        )}
                                                                        style={{ backgroundColor: c }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {designerCategory === "symbol" && (
                                                    <div className="space-y-8">
                                                        {[
                                                            {
                                                                name: "Global Destinations",
                                                                symbols: [
                                                                    { id: "Paris", path: "/images/photobooks/paris-tower.png", label: "Paris" },
                                                                    { id: "Athens", path: "/images/photobooks/greece-eye.png", label: "Athens" },
                                                                    { id: "Amalfi", path: "/images/photobooks/italy-lemon.png", label: "Amalfi" },
                                                                    { id: "London", icon: Crown, label: "London" },
                                                                    { id: "New York", icon: Buildings, label: "NYC" },
                                                                    { id: "Coastal", icon: Lighthouse, label: "Coastal" },
                                                                    { id: "Europe", icon: CastleTurret, label: "Europe" },
                                                                    { id: "Travel", icon: SuitcaseRolling, label: "Travel" },
                                                                    { id: "SF", icon: Bridge, label: "SF" },
                                                                ]
                                                            },
                                                            {
                                                                name: "Artisanal Assets",
                                                                symbols: [
                                                                    { id: "maple", path: "/images/photobooks/maple-leaf.png" },
                                                                    { id: "palm", path: "/images/photobooks/palm-tree.png" },
                                                                    { id: "mountains", path: "/images/photobooks/mountains.png" },
                                                                    { id: "seashell", path: "/images/photobooks/seashell.png" },
                                                                    { id: "parrot", path: "/images/photobooks/parrot.png" },
                                                                    { id: "turtle", path: "/images/photobooks/turtle.png" },
                                                                    { id: "coconut", path: "/images/photobooks/coconut.png" },
                                                                ]
                                                            },
                                                            {
                                                                name: "Modern Geometry",
                                                                symbols: [
                                                                    { id: "Heart Lucide", icon: Heart, label: "Heart" },
                                                                    { id: "Camera Lucide", icon: Camera, label: "Lens" },
                                                                    { id: "Mountain Lucide", icon: Mountain, label: "Peak" },
                                                                    { id: "Globe Lucide", icon: Globe, label: "World" },
                                                                    { id: "MapPin Lucide", icon: MapPin, label: "Pin" },
                                                                ]
                                                            },
                                                            {
                                                                name: "Studio Embellishments",
                                                                symbols: [
                                                                    { id: "Flower", icon: Flower },
                                                                    { id: "Butterfly", icon: Butterfly },
                                                                    { id: "Bird", icon: Bird },
                                                                    { id: "Anchor", icon: Anchor },
                                                                    { id: "Moon Ph", icon: Moon },
                                                                    { id: "Rainbow", icon: Rainbow },
                                                                    { id: "Leaf Ph", icon: Leaf },
                                                                ]
                                                            }
                                                        ].map((collection) => (
                                                            <div key={collection.name} className="space-y-4">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{collection.name}</p>
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    {collection.symbols.map((s: any) => (
                                                                        <button
                                                                            key={s.id}
                                                                            onClick={() => {
                                                                                if (s.icon) {
                                                                                    setCoverIconName(s.id);
                                                                                    setCoverSymbol("");
                                                                                } else {
                                                                                    setCoverSymbol(s.path);
                                                                                    setCoverIconName(null);
                                                                                }
                                                                            }}
                                                                            className={cn(
                                                                                "aspect-square rounded-2xl bg-slate-50/50 dark:bg-white/5 border-2 flex items-center justify-center p-3 transition-all group/asset relative",
                                                                                (s.icon ? coverIconName === s.id : coverSymbol === s.path)
                                                                                    ? "border-blue-600 bg-white shadow-md scale-105"
                                                                                    : "border-transparent hover:border-slate-200"
                                                                            )}
                                                                        >
                                                                            {s.icon ? (
                                                                                <s.icon className="h-6 w-6 text-slate-600 group-hover:text-slate-900" weight={!s.id.includes("Lucide") ? "duotone" : undefined} />
                                                                            ) : (
                                                                                <div className="relative w-full h-full">
                                                                                    <Image src={s.path} alt={s.id} fill className="object-contain" />
                                                                                </div>
                                                                            )}
                                                                            {s.label && (
                                                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 font-black">
                                                                                    {s.label}
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {designerCategory === "typography" && (
                                                    <div className="space-y-8">
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {[
                                                                { id: "stacked", name: "Poster", desc: "Bold, centered aesthetic", icon: Layout },
                                                                { id: "standard", name: "Classic", desc: "Minimalist header focus", icon: AlignLeft },
                                                            ].map((style) => (
                                                                <button
                                                                    key={style.id}
                                                                    onClick={() => setLayoutStyle(style.id as any)}
                                                                    className={cn(
                                                                        "w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left",
                                                                        layoutStyle === style.id ? "border-blue-600 bg-white shadow-md" : "border-transparent bg-slate-50/50 hover:bg-white"
                                                                    )}
                                                                >
                                                                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", layoutStyle === style.id ? "bg-blue-600 text-white" : "bg-white text-slate-400")}>
                                                                        <style.icon className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{style.name}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400">{style.desc}</p>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Typeface Selection</p>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                {FONTS.map((font) => (
                                                                    <button
                                                                        key={font.id}
                                                                        onClick={() => setCoverFont(font.id)}
                                                                        className={cn(
                                                                            "p-3 rounded-xl border transition-all text-left group",
                                                                            coverFont === font.id ? "border-blue-600 bg-white shadow-sm" : "border-transparent bg-slate-50 hover:bg-white"
                                                                        )}
                                                                    >
                                                                        <p className={cn("text-xs font-bold text-slate-900 mb-1 truncate", coverFont === font.id ? "text-blue-600" : "")} style={{ fontFamily: font.family }}>{font.name}</p>
                                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-40">SAMPLE TYPE</p>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Headline Control</p>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 opacity-60">Headline</label>
                                                                <Input
                                                                    value={title}
                                                                    onChange={(e) => setTitle(e.target.value.toUpperCase())}
                                                                    className="h-11 rounded-xl border-slate-200 font-bold bg-white/50 focus:bg-white transition-all shadow-none"
                                                                    placeholder="LOCATION"
                                                                    style={{ fontFamily: FONTS.find(f => f.id === coverFont)?.family }}
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 opacity-60">Sub-caption</label>
                                                                <Input
                                                                    value={subtitle}
                                                                    onChange={(e) => setSubtitle(e.target.value.toUpperCase())}
                                                                    className="h-11 rounded-xl border-slate-200 font-bold bg-white/50 focus:bg-white transition-all shadow-none"
                                                                    placeholder="YEAR"
                                                                    style={{ fontFamily: FONTS.find(f => f.id === coverFont)?.family }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Spine Customization</p>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 opacity-60">Vertical Spine Text</label>
                                                                <Input
                                                                    value={spineText}
                                                                    onChange={(e) => setSpineText(e.target.value.toUpperCase())}
                                                                    className="h-11 rounded-xl border-slate-200 font-bold bg-white/50 focus:bg-white transition-all shadow-none"
                                                                    placeholder="SPINE TITLE"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Texture & Finish</p>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {(Object.values(MATERIALS)).map((m) => (
                                                                    <button
                                                                        key={m.id}
                                                                        onClick={() => setCoverMaterial(m.id as any)}
                                                                        className={cn(
                                                                            "flex items-center justify-between p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                                                                            coverMaterial === m.id ? "border-blue-600 bg-white shadow-sm text-blue-600" : "border-transparent bg-slate-50 text-slate-400 hover:bg-white"
                                                                        )}
                                                                    >
                                                                        {m.name}
                                                                        {coverMaterial === m.id && <Check className="h-3 w-3" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Corner Finish</p>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <button
                                                                    onClick={() => setIsRounded(true)}
                                                                    className={cn(
                                                                        "p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                                                                        isRounded ? "border-blue-600 bg-white shadow-sm text-blue-600" : "border-transparent bg-slate-50 text-slate-400 hover:bg-white"
                                                                    )}
                                                                >
                                                                    Modern Rounded
                                                                </button>
                                                                <button
                                                                    onClick={() => setIsRounded(false)}
                                                                    className={cn(
                                                                        "p-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                                                                        !isRounded ? "border-blue-600 bg-white shadow-sm text-blue-600" : "border-transparent bg-slate-50 text-slate-400 hover:bg-white"
                                                                    )}
                                                                >
                                                                    Classic Sharp
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 p-6">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Print Format</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {SIZES.map((size) => (
                                                    <button
                                                        key={size.id}
                                                        onClick={() => setSizeId(size.id)}
                                                        className={cn(
                                                            "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                                            sizeId === size.id ? "border-blue-600 bg-white shadow-sm" : "border-transparent text-slate-500 hover:bg-white"
                                                        )}
                                                    >
                                                        <div className="text-left">
                                                            <p className="text-[10px] font-black uppercase text-slate-900 leading-none mb-1">{size.name}</p>
                                                            <p className="text-[8px] font-bold text-slate-400 uppercase">{size.dimensions}</p>
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-900">
                                                            {size.price_multiplier === 1 ? "Baseline" : `+ ${Math.round((size.price_multiplier - 1) * 100)}%`}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Immersive Studio Stage */}
                                <div className="flex-1 min-w-0" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                                    <div className="bg-slate-50/50 dark:bg-slate-900/40 rounded-[4rem] p-16 lg:p-32 flex flex-col items-center justify-center min-h-[800px] border border-slate-200/50 dark:border-slate-800/50 shadow-[inset_0_2px_40px_rgba(0,0,0,0.02)] relative group overflow-hidden">

                                        {/* 3D Environment Background Elements */}
                                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                                            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-slate-400 to-transparent" />
                                            <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-slate-400 to-transparent" />
                                        </div>

                                        <div className="absolute top-10 flex flex-col items-center gap-4 z-30">
                                            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live Simulation Ready</p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setIsFlipped(!isFlipped)}
                                                    className="group/flip flex items-center gap-3 px-6 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    <Move className={cn("h-3.5 w-3.5 transition-transform duration-500", isFlipped ? "rotate-180" : "")} />
                                                    {isFlipped ? "Show Front" : "Flip to Back"}
                                                </button>

                                                <button
                                                    onClick={() => setIsCinemaMode(true)}
                                                    className="flex items-center gap-3 px-6 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                                                >
                                                    <Maximize2 className="h-3.5 w-3.5" />
                                                    Cinema Mode
                                                </button>
                                            </div>
                                        </div>

                                        <motion.div
                                            className="w-full max-w-[550px] perspective-[2500px] cursor-zoom-in"
                                            onClick={() => setIsCinemaMode(true)}
                                            style={{ rotateX: tiltX, rotateY: tiltY }}
                                            animate={{
                                                rotateY: isFlipped ? 180 : (peekProgress * -45),
                                                z: peekProgress * 50
                                            }}
                                            transition={{ type: "spring", stiffness: 40, damping: 15 }}
                                        >
                                            <div
                                                className={cn(
                                                    "aspect-[4/5] shadow-[30px_50px_100px_rgba(0,0,0,0.25)] relative overflow-hidden transition-all duration-700",
                                                    isRounded
                                                        ? (isFlipped ? "rounded-[3rem_0.5rem_0.5rem_3rem]" : "rounded-[0.5rem_3rem_3rem_0.5rem]")
                                                        : "rounded-[0.1rem]"
                                                )}
                                                style={{ backgroundColor: coverBgColor }}
                                            >
                                                <div className="absolute inset-0 pointer-events-none z-10"
                                                    style={{
                                                        backgroundImage: `url("${MATERIALS[coverMaterial].texture}")`,
                                                        opacity: MATERIALS[coverMaterial].opacity,
                                                        mixBlendMode: MATERIALS[coverMaterial].blend as any
                                                    }}
                                                />
                                                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                                                <div className={cn("h-full w-full", isFlipped ? "[transform:rotateY(180deg)]" : "")}>
                                                    {isFlipped ? (
                                                        <BackCoverRenderer pImages={coverImages.length > 0 ? coverImages : images.slice(0, 8)} pColor={coverTextColor} />
                                                    ) : (
                                                        <CoverLayoutRenderer
                                                            tplId={templateId}
                                                            pTitle={title}
                                                            pSubtitle={subtitle}
                                                            pImages={coverImages.length > 0 ? coverImages : images.slice(0, 8)}
                                                            pColor={coverTextColor}
                                                            pIcon={coverIconName}
                                                            pSymbol={coverSymbol}
                                                            pFont={coverFont}
                                                        />
                                                    )}
                                                </div>

                                                {/* Book Spine Simulation */}
                                                <div className={cn(
                                                    "absolute inset-y-0 w-12 transition-all duration-700 pointer-events-none flex items-center justify-center",
                                                    isFlipped ? "right-0 bg-gradient-to-l from-black/20 via-black/5 to-transparent" : "left-0 bg-gradient-to-r from-black/20 via-black/5 to-transparent"
                                                )}>
                                                    <div className={cn(
                                                        "whitespace-nowrap font-black uppercase tracking-[0.3em] text-[7px] rotate-90 mix-blend-overlay opacity-30",
                                                        isFlipped ? "mr-4" : "ml-4"
                                                    )} style={{ color: coverTextColor, ...globalFontStyle }}>
                                                        {spineText}
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "absolute inset-y-0 w-8 transition-all duration-700 pointer-events-none",
                                                    isFlipped ? "right-0 bg-black/10 blur-[1px]" : "left-0 bg-black/10 blur-[1px]"
                                                )} />
                                                <div className={cn(
                                                    "absolute inset-y-0 w-[4px] bg-white/20 transition-all duration-700 pointer-events-none",
                                                    isFlipped ? "right-0" : "left-0"
                                                )} />
                                            </div>
                                        </motion.div>

                                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[60%] h-8 bg-black/10 blur-[40px] rounded-full" />

                                        <div className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-4 z-30">
                                            <div className="flex items-center gap-6 px-8 py-4 bg-white/40 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Thumb Through</p>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.01"
                                                    value={peekProgress}
                                                    onChange={(e) => setPeekProgress(parseFloat(e.target.value))}
                                                    className="w-48 accent-slate-900"
                                                />
                                                <span className="text-[10px] font-black text-slate-900 w-8">{Math.round(peekProgress * 100)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "images" && (
                        <motion.div
                            key="images"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-20 pb-20"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                                        <ImageIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight uppercase">Media Asset Manager</h2>
                                        <p className="text-sm text-slate-500 font-medium tracking-wide">{images.length} assets synced from local storage</p>
                                    </div>
                                </div>

                                <label className="cursor-pointer">
                                    <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
                                    <div className="px-10 py-4 bg-slate-900 text-white rounded-full font-black shadow-2xl hover:bg-slate-800 hover:scale-105 transition-all text-sm tracking-widest uppercase">
                                        Bulk Import
                                    </div>
                                </label>
                            </div>

                            {/* Cover Assets Bucket */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4">
                                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                    <h3 className="font-[1000] text-xl uppercase tracking-tighter">Hero Cover Assets</h3>
                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full">{coverImages.length} SELECTED</span>
                                </div>

                                {coverImages.length === 0 ? (
                                    <div className="h-40 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50/30">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No pictures assigned to cover yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6">
                                        {coverImages.map((img) => (
                                            <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-white shadow-md border-2 border-amber-400">
                                                <Image src={img.preview_url} alt="P" fill className="object-cover transition-transform group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => toggleImageRole(img.id)}
                                                        className="px-4 py-1.5 bg-white text-slate-900 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-slate-100"
                                                    >
                                                        Remove from Cover
                                                    </button>
                                                    <Button size="icon" variant="destructive" onClick={() => removeImage(img.id)} className="h-8 w-8 rounded-full">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Internal Assets Bucket */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                    <h3 className="font-[1000] text-xl uppercase tracking-tighter">Story Chapters <span className="text-slate-400 opacity-40 font-black">(Internal)</span></h3>
                                    <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">{internalImages.length} SYNCED</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6">
                                    {internalImages.map((img) => (
                                        <div key={img.id} className="group relative aspect-square rounded-3xl overflow-hidden bg-white shadow-xl">
                                            <Image src={img.preview_url} alt="P" fill className="object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                <button
                                                    onClick={() => toggleImageRole(img.id)}
                                                    className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg"
                                                >
                                                    Set as Cover Hero
                                                </button>
                                                <Button size="icon" variant="destructive" onClick={() => removeImage(img.id)} className="h-8 w-8 rounded-full">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <label className="cursor-pointer group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl aspect-square bg-slate-50/50 hover:bg-white hover:border-blue-500 transition-all">
                                        <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
                                        <Upload className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                        <span className="mt-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Add Internal Photos</span>
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "preview" && (
                        <div className="space-y-12 pb-20">
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight uppercase">Digital Art Proof</h2>
                                        <p className="text-sm text-slate-500 font-medium tracking-wide italic">Final simulation before artisanal printing • V 1.04.2</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" className="rounded-full font-black text-[9px] uppercase tracking-widest bg-white shadow-sm border-slate-200">
                                        Download PDF Proof
                                    </Button>
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Ready for Production</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                                <div className="lg:col-span-8 space-y-24">
                                    {/* Page 1: Front Cover */}
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 text-center">PAGE [01] • OUTER FRONT COVER</p>
                                        <div className="relative group mx-auto">
                                            {/* Bleed Lines */}
                                            <div className="absolute -inset-8 border-[0.5px] border-dashed border-slate-200 pointer-events-none rounded-[4rem]" />
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-4 text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                                                <span>+ 3mm Bleed Zone</span>
                                                <span>•</span>
                                                <span>Trim Line</span>
                                            </div>

                                            <div className="w-full max-w-lg aspect-[4/5] mx-auto shadow-2xl relative overflow-hidden transition-all duration-500" style={{
                                                backgroundColor: coverBgColor,
                                                borderRadius: isRounded ? '0.2rem 3rem 3rem 0.2rem' : '0.1rem'
                                            }}>
                                                <CoverLayoutRenderer
                                                    tplId={templateId}
                                                    pTitle={title}
                                                    pSubtitle={subtitle}
                                                    pImages={images}
                                                    pColor={coverTextColor}
                                                />
                                                <div className="absolute inset-y-0 left-0 w-8 bg-black/10 blur-[1px] opacity-40" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Spreads: Gallery */}
                                    {Array.from({ length: Math.ceil(internalImages.length / 2) }).map((_, idx) => (
                                        <div key={idx} className="space-y-6">
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 text-center">SPREAD {idx + 1} • PAGES [{String((idx * 2) + 2).padStart(2, '0')}]-[{String((idx * 2) + 3).padStart(2, '0')}]</p>
                                            <div className="relative mx-auto w-full max-w-4xl aspect-[16/10] bg-white shadow-xl flex border border-slate-100">
                                                <div className="absolute -inset-4 border-[0.5px] border-slate-100 pointer-events-none" />
                                                <div className="flex-1 border-r border-slate-100 relative overflow-hidden bg-slate-50">
                                                    {internalImages[idx * 2] && <Image src={internalImages[idx * 2].preview_url} alt="P" fill className="object-cover p-2" />}
                                                </div>
                                                <div className="flex-1 relative overflow-hidden bg-slate-50">
                                                    {internalImages[idx * 2 + 1] && <Image src={internalImages[idx * 2 + 1].preview_url} alt="P" fill className="object-cover p-2" />}
                                                </div>
                                                <div className="absolute inset-y-0 left-1/2 -translate-x-px w-px bg-slate-200 z-10" />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Last Page: Back Cover */}
                                    <div className="space-y-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 text-center">PAGE [{String(totalPages + 1).padStart(2, '0')}] • OUTER BACK COVER</p>
                                        <div className="relative mx-auto">
                                            <div className="absolute -inset-8 border-[0.5px] border-dashed border-slate-200 pointer-events-none rounded-[4rem]" />
                                            <div className="w-full max-w-lg aspect-[4/5] mx-auto shadow-2xl relative overflow-hidden transition-all duration-500" style={{
                                                backgroundColor: coverBgColor,
                                                borderRadius: isRounded ? '3rem 0.2rem 0.2rem 3rem' : '0.1rem'
                                            }}>
                                                <BackCoverRenderer pImages={images} pColor={coverTextColor} />
                                                <div className="absolute inset-y-0 right-0 w-8 bg-black/10 blur-[1px] opacity-40" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-20 text-center border-t border-slate-100">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[1em] mb-4">End of Proof</p>
                                        <div className="flex justify-center gap-2">
                                            {[1, 2, 3].map(i => <div key={i} className="h-1 w-1 rounded-full bg-slate-200" />)}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-8">
                                    <Card className="rounded-[2.5rem] border-slate-200 shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
                                        <CardContent className="p-8 space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                        <Trophy className="h-4 w-4" />
                                                    </div>
                                                    <h3 className="font-black text-xl tracking-tight uppercase">Artisan Order</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-[11px] p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                                        <span className="text-slate-500 font-bold uppercase tracking-widest">Dimension</span>
                                                        <span className="font-black">{SIZES.find(s => s.id === sizeId)?.name}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[11px] p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                                        <span className="text-slate-500 font-bold uppercase tracking-widest">Total Pages</span>
                                                        <span className="font-black">{totalPages + 2 /* Front + Back cover handled separately in count often, but here spreads + covers */} SPREADS Content</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm p-5 bg-slate-900 shadow-2xl text-white rounded-[2rem]">
                                                        <span className="font-black uppercase text-[10px] tracking-widest">Grand Total</span>
                                                        <span className="font-black text-xl">GHS {cost}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button onClick={handlePayment} size="lg" className="w-full rounded-[1.5rem] bg-blue-600 text-white font-black h-16 text-lg hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-600/20">
                                                Authorize & Print
                                            </Button>

                                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100/50 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                                                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-none">Pre-Print Checklist</p>
                                                </div>
                                                <ul className="space-y-2 text-[10px] font-bold text-amber-800/70">
                                                    <li className="flex items-center gap-2">
                                                        <div className="h-1 w-1 rounded-full bg-amber-400" />
                                                        Spelling on covers verified
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <div className="h-1 w-1 rounded-full bg-amber-400" />
                                                        Image quality within bounds
                                                    </li>
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Studio Cinema Mode Overlay */}
                <AnimatePresence>
                    {isCinemaMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center overflow-hidden"
                        >
                            {/* Cinematic Background Atmosphere */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
                                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[180px] rounded-full" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]" />
                                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/black-paper.png")` }} />
                            </div>

                            {/* Cinema Controls */}
                            <div className="absolute top-12 left-12 flex items-center gap-6">
                                <div className="h-0.5 w-12 bg-white/20" />
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.8em] opacity-40">Artisan Simulation Mode</p>
                            </div>

                            <button
                                onClick={() => setIsCinemaMode(false)}
                                className="absolute top-12 right-12 h-14 w-14 rounded-full bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all active:scale-95 group"
                            >
                                <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            <div className="w-full max-w-6xl flex flex-col items-center gap-16 px-8 relative z-10">
                                <div className="text-center space-y-3">
                                    <h2 className="text-white text-4xl font-[1000] uppercase tracking-tighter mix-blend-difference">{title}</h2>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="h-px w-8 bg-blue-500/50" />
                                        <p className="text-blue-400 font-bold text-[11px] uppercase tracking-[0.5em]">{subtitle} • ITINERO STUDIO</p>
                                        <div className="h-px w-8 bg-blue-500/50" />
                                    </div>
                                </div>

                                <motion.div
                                    className="w-full max-w-2xl perspective-[3000px]"
                                    animate={{
                                        rotateY: isFlipped ? 180 : 0,
                                        scale: [1, 1.02, 1],
                                        rotateX: [0, 2, 0]
                                    }}
                                    transition={{
                                        rotateY: { type: "spring", stiffness: 40, damping: 15 },
                                        scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                                        rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                >
                                    <div
                                        className={cn(
                                            "aspect-[4/5] shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden transition-all duration-700",
                                            isRounded
                                                ? (isFlipped ? "rounded-[3.5rem_0.5rem_0.5rem_3.5rem]" : "rounded-[0.5rem_3.5rem_3.5rem_0.5rem]")
                                                : "rounded-[0.1rem]"
                                        )}
                                        style={{ backgroundColor: coverBgColor }}
                                    >
                                        <div className="absolute inset-0 pointer-events-none z-10"
                                            style={{
                                                backgroundImage: `url("${MATERIALS[coverMaterial].texture}")`,
                                                opacity: MATERIALS[coverMaterial].opacity * 1.5, // Enhancing for Cinema Mode
                                                mixBlendMode: MATERIALS[coverMaterial].blend as any
                                            }}
                                        />
                                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                                        <div className={cn("h-full w-full", isFlipped ? "[transform:rotateY(180deg)]" : "")}>
                                            {isFlipped ? (
                                                <BackCoverRenderer pImages={coverImages.length > 0 ? coverImages : images.slice(0, 8)} pColor={coverTextColor} />
                                            ) : (
                                                <CoverLayoutRenderer
                                                    tplId={templateId}
                                                    pTitle={title}
                                                    pSubtitle={subtitle}
                                                    pImages={coverImages.length > 0 ? coverImages : images.slice(0, 8)}
                                                    pColor={coverTextColor}
                                                    pIcon={coverIconName}
                                                    pSymbol={coverSymbol}
                                                    pFont={coverFont}
                                                />
                                            )}
                                        </div>

                                        {/* Cinema Spine Simulation */}
                                        <div className={cn(
                                            "absolute inset-y-0 w-16 transition-all duration-700 pointer-events-none flex items-center justify-center",
                                            isFlipped ? "right-0 bg-gradient-to-l from-black/40 via-black/10 to-transparent" : "left-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent"
                                        )}>
                                            <div className={cn(
                                                "whitespace-nowrap font-black uppercase tracking-[0.4em] text-[10px] rotate-90 mix-blend-overlay opacity-30",
                                                isFlipped ? "mr-6" : "ml-6"
                                            )} style={{ color: coverTextColor, ...globalFontStyle }}>
                                                {spineText}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "absolute inset-y-0 w-12 transition-all duration-700 pointer-events-none",
                                            isFlipped ? "right-0 bg-black/20 blur-[2px]" : "left-0 bg-black/20 blur-[2px]"
                                        )} />
                                    </div>
                                </motion.div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsFlipped(!isFlipped)}
                                        className="group px-10 py-4 bg-white text-slate-900 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                                    >
                                        <Move className={cn("h-4 w-4 transition-transform duration-500", isFlipped ? "rotate-180" : "")} />
                                        Inspect {isFlipped ? "Front" : "Reverse"} Cover
                                    </button>
                                </div>
                            </div>

                            {/* Cinema Footnote */}
                            <p className="absolute bottom-12 text-[9px] font-bold text-white/20 uppercase tracking-[1em]">Handcrafted in Itinero Digital Studio</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

