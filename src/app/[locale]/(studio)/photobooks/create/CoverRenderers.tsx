"use client";

import React from "react";
import Image from "next/image";
import { Image as ImageIcon, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { FONTS, FOILS, ICON_MAP, DESTINATION_ILLUSTRATIONS } from "./studio-config";

export const CoverLayoutRenderer = ({ tplId, pTitle, pSubtitle, pImages, pColor, pIcon, pSymbol, pFont, pFoil = 'none', pIllustration, isCard = false }: any) => {
    const IconComponent = pIcon ? ICON_MAP[pIcon] || null : null;
    const fontStyle = pFont ? { fontFamily: FONTS.find(f => f.id === pFont)?.family } : {};
    const foilStyle: any = pFoil !== 'none' ? {
        backgroundImage: FOILS[pFoil as keyof typeof FOILS].gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundSize: '200% auto',
        animation: 'shimmer 3s linear infinite'
    } : { color: pColor };

    const tTitle = pTitle || "LOCATION";
    const tSubtitle = pSubtitle || "JOURNEY";

    if (tplId === "modern-minimal") {
        return (
            <div className={cn("h-full grid grid-cols-12 gap-4", isCard ? "p-4" : "p-12 ml-6 py-16")}>
                <div className="col-span-12 flex flex-col justify-center space-y-2">
                    {IconComponent && <IconComponent className={cn("opacity-60", isCard ? "h-2 w-2" : "h-8 w-8")} style={{ color: pColor }} />}
                    {pSymbol && <Image src={pSymbol} alt="S" width={isCard ? 10 : 32} height={isCard ? 10 : 32} className="opacity-60" />}
                    <h1 className={cn("font-[1000] uppercase tracking-tighter leading-none mix-blend-multiply", isCard ? "text-[10px]" : "text-4xl")} style={{ color: pColor, ...fontStyle }}>{tTitle}</h1>
                    <p className={cn("font-black uppercase tracking-tight opacity-70", isCard ? "text-[6px]" : "text-lg")} style={{ color: pColor, ...fontStyle }}>{tSubtitle}</p>
                </div>
                {!isCard && (
                    <div className="col-span-12 grid grid-cols-4 gap-2 h-32 mt-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="bg-slate-200/50 rounded-lg overflow-hidden relative shadow-sm">
                                {pImages[i] ? <Image src={pImages[i].preview_url} alt="P" fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center opacity-10"><ImageIcon className="h-4 w-4" /></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (tplId === "classic-heritage") {
        return (
            <div className={cn("h-full flex flex-col items-center justify-between text-center", isCard ? "p-4" : "p-12 ml-6 py-16")}>
                <div className="space-y-1 flex flex-col items-center">
                    {IconComponent && <IconComponent className={cn("mx-auto opacity-80 mb-2", isCard ? "h-3 w-3" : "h-12 w-12")} style={pFoil !== 'none' ? { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' } : { color: pColor }} />}
                    <span className={cn("font-black uppercase tracking-[0.3em] opacity-40", isCard ? "text-[4px]" : "text-[10px]")} style={{ ...fontStyle, ...foilStyle }}>Studio Edition</span>
                    <h1 className={cn("font-[1000] uppercase tracking-tight mix-blend-multiply", isCard ? "text-xs" : "text-5xl")} style={{ ...fontStyle, ...foilStyle }}>{tTitle}</h1>
                </div>
                <div className={cn("w-full aspect-square border-white shadow-xl relative overflow-hidden", isCard ? "max-w-[60px] border-2" : "max-w-[300px] border-8")}>
                    {pImages[0] ? <Image src={pImages[0].preview_url} alt="P" fill className="object-cover" /> : <div className="absolute inset-0 bg-slate-100 flex items-center justify-center opacity-20"><ImageIcon className="h-6 w-6" /></div>}
                </div>
                <p className={cn("font-black uppercase tracking-widest opacity-70 italic", isCard ? "text-[6px]" : "text-lg")} style={{ ...fontStyle, ...foilStyle }}>{tSubtitle}</p>
            </div>
        );
    }

    if (tplId === "adventure") {
        return (
            <div className={cn("h-full relative overflow-hidden", isCard ? "p-4" : "p-12 ml-6 py-16")}>
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-4 opacity-70 scale-110">
                    {[0, 1].map((i) => (
                        <div key={i} className={cn("relative rounded-lg shadow-xl overflow-hidden border-white", isCard ? "border-[2px]" : "border-4", i === 0 ? "rotate-3" : "-rotate-6 translate-x-4 translate-y-4")}>
                            {pImages[i] ? <Image src={pImages[i].preview_url} alt="P" fill className="object-cover" /> : <div className="absolute inset-0 bg-slate-200" />}
                        </div>
                    ))}
                </div>
                <div className="relative h-full flex flex-col items-center justify-center z-10 text-center pointer-events-none">
                    {IconComponent && <IconComponent className={cn("mb-2 opacity-90", isCard ? "h-3 w-3" : "h-14 w-14")} style={{ color: pColor }} />}
                    <h1 className={cn("font-[1000] uppercase tracking-tight drop-shadow-2xl", isCard ? "text-lg" : "text-6xl")} style={{ color: pColor, ...fontStyle }}>{tTitle}</h1>
                    <p className={cn("font-black uppercase tracking-[0.5em] mt-1 drop-shadow-lg", isCard ? "text-[4px]" : "text-xs")} style={{ color: pColor, ...fontStyle }}>{tSubtitle}</p>
                </div>
            </div>
        );
    }

    if (tplId === "panorama") {
        return (
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
    }

    if (tplId === "editorial") {
        return (
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
    }

    // symbolic (default)
    if (tplId === "destination") {
        const illData = pIllustration ? DESTINATION_ILLUSTRATIONS[pIllustration] : null;
        return (
            <div className={cn("h-full flex flex-col items-center justify-between overflow-hidden relative", isCard ? "p-3" : "p-10 py-12")}>
                {/* Big bold title at top */}
                <div className="text-center z-10 w-full mt-2">
                    <h1 className={cn("font-[900] uppercase leading-[0.9] tracking-tight", isCard ? "text-lg" : "text-7xl")} style={{ color: pColor, ...fontStyle }}>{tTitle}</h1>
                    {tSubtitle && <p className={cn("font-bold mt-1 opacity-70", isCard ? "text-[5px]" : "text-lg")} style={{ color: pColor, ...fontStyle }}>{tSubtitle}</p>}
                </div>
                {/* Large centered illustration */}
                <div className={cn("flex-1 flex items-center justify-center w-full", isCard ? "my-1" : "my-4")}>
                    {illData ? (
                        <div
                            className={cn(isCard ? "w-14 h-14" : "w-52 h-52")}
                            dangerouslySetInnerHTML={{ __html: illData.svg }}
                        />
                    ) : IconComponent ? (
                        <IconComponent className={cn(isCard ? "h-10 w-10" : "h-40 w-40")} style={{ color: pColor, opacity: 0.8 }} />
                    ) : (
                        <div className={cn("rounded-full bg-current opacity-10", isCard ? "h-10 w-10" : "h-32 w-32")} style={{ color: pColor }} />
                    )}
                </div>
                {/* Subtle bottom accent */}
                {!isCard && <div className="h-0.5 w-20 rounded-full opacity-20" style={{ backgroundColor: pColor }} />}
            </div>
        );
    }

    if (tplId === "postcard") {
        const illData = pIllustration ? DESTINATION_ILLUSTRATIONS[pIllustration] : null;
        return (
            <div className={cn("h-full flex flex-col items-center justify-center overflow-hidden relative", isCard ? "p-2" : "p-8")}>
                {/* Stamp-style border */}
                <div className={cn("absolute border-dashed opacity-20", isCard ? "inset-2 border" : "inset-6 border-2")} style={{ borderColor: pColor }} />
                <div className="flex flex-col items-center text-center z-10 gap-4">
                    {illData ? (
                        <div className={cn(isCard ? "w-10 h-10" : "w-36 h-36")} dangerouslySetInnerHTML={{ __html: illData.svg }} />
                    ) : IconComponent ? (
                        <IconComponent className={cn(isCard ? "h-6 w-6" : "h-24 w-24")} style={{ color: pColor, opacity: 0.8 }} />
                    ) : null}
                    <div>
                        <h1 className={cn("font-[900] uppercase leading-[0.9] tracking-tight", isCard ? "text-sm" : "text-5xl")} style={{ color: pColor, ...fontStyle }}>{tTitle}</h1>
                        {tSubtitle && <p className={cn("font-bold mt-1 italic opacity-60", isCard ? "text-[5px]" : "text-base")} style={{ color: pColor, ...fontStyle }}>{tSubtitle}</p>}
                    </div>
                </div>
                {/* Stamp corner accents */}
                {!isCard && (
                    <>
                        <div className="absolute top-8 right-8 w-12 h-14 border-2 rounded-sm flex items-center justify-center opacity-20" style={{ borderColor: pColor }}>
                            <div className="text-[6px] font-bold uppercase" style={{ color: pColor }}>STAMP</div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className={cn("h-full flex flex-col items-center justify-center relative overflow-hidden", isCard ? "p-4" : "p-12 ml-6")}>
            <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center pointer-events-none opacity-[0.07] overflow-hidden -rotate-6">
                {IconComponent && <IconComponent className="w-[110%] h-[110%] scale-110" style={{ color: pColor }} />}
            </div>
            <div className="flex flex-col items-center space-y-12 z-10 w-full">
                <div className="text-center space-y-6">
                    <div className="h-0.5 w-16 bg-current mx-auto opacity-20" style={{ color: pColor }} />
                    <h1 className={cn("font-[1000] uppercase tracking-[0.4em] leading-tight mix-blend-multiply", isCard ? "text-[12px]" : "text-6xl")} style={{ color: pColor, ...fontStyle }}>{tTitle}</h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px flex-1 bg-current opacity-10" style={{ color: pColor }} />
                        <p className={cn("font-black uppercase tracking-[0.6em] opacity-40 whitespace-nowrap", isCard ? "text-[5px]" : "text-sm")} style={{ color: pColor, ...fontStyle }}>{tSubtitle}</p>
                        <div className="h-px flex-1 bg-current opacity-10" style={{ color: pColor }} />
                    </div>
                    <div className="h-0.5 w-16 bg-current mx-auto opacity-20" style={{ color: pColor }} />
                </div>
            </div>
        </div>
    );
};

export const BackCoverRenderer = ({ pImages, pColor, isCard = false }: any) => (
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
        </div>
    </div>
);
