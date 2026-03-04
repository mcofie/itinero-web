"use client";

import React from "react";
import Image from "next/image";
import { Grid, Sparkles, Type, ShoppingBag, Check, Maximize2, Trophy, Palette, Image as ImageIcon, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    TEMPLATES, FONTS, FOILS, MATERIALS, SIZES, PALETTES, BG_COLORS, EMBELLISHMENTS, DESTINATION_ILLUSTRATIONS,
    type DesignState, type StudioImage,
} from "./studio-config";
import { CoverLayoutRenderer } from "./CoverRenderers";

type DesignPanelProps = {
    design: DesignState;
    images: StudioImage[];
    onDesignChange: (updates: Partial<DesignState>) => void;
};

const categories = [
    { id: "layout" as const, icon: Grid, label: "Layout" },
    { id: "aesthetic" as const, icon: Sparkles, label: "Style" },
    { id: "illustrations" as const, icon: MapPin, label: "Art" },
    { id: "typography" as const, icon: Type, label: "Type" },
    { id: "print" as const, icon: ShoppingBag, label: "Print" },
];

export default function DesignPanel({ design, images, onDesignChange }: DesignPanelProps) {
    const [activeCategory, setActiveCategory] = React.useState<"layout" | "aesthetic" | "illustrations" | "typography" | "print">("layout");

    const generateMagicTitle = () => {
        const options = [
            { t: "ETERNAL HORIZONS", s: "A MEDITERRANEAN ODYSSEY" },
            { t: "STUDIO ARCHIVE", s: "CURATED MOMENTS VOL. 1" },
            { t: "WILD HEARTS", s: "LOST IN THE CANYON" },
            { t: "GOLDEN STATE", s: "PACIFIC COAST HIGHWAY" },
            { t: "THE ANTHOLOGY", s: "OUR GREATEST ADVENTURE" },
        ];
        const r = options[Math.floor(Math.random() * options.length)];
        onDesignChange({ title: r.t, subtitle: r.s, spineText: `${r.t} ${new Date().getFullYear()}` });
    };

    return (
        <div className="h-full flex bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800">
            {/* Icon Rail */}
            <div className="w-16 flex-shrink-0 bg-slate-950 flex flex-col items-center py-6 gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "group relative flex flex-col items-center justify-center w-11 h-11 rounded-xl transition-all duration-200",
                            activeCategory === cat.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                    >
                        <cat.icon className="h-4.5 w-4.5" />
                        <span className="absolute left-full ml-3 bg-slate-800 text-white text-[10px] px-2.5 py-1 rounded-lg hidden group-hover:block whitespace-nowrap z-50 font-bold tracking-wide">
                            {cat.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Properties Panel */}
            <div className="flex-1 w-[300px] overflow-y-auto">
                <div className="p-6 space-y-8">
                    {activeCategory === "layout" && (
                        <>
                            <SectionLabel icon={Grid} label="Cover Layout" />
                            <div className="grid grid-cols-2 gap-3">
                                {TEMPLATES.map((tmpl) => (
                                    <button
                                        key={tmpl.id}
                                        onClick={() => onDesignChange({ templateId: tmpl.id })}
                                        className={cn(
                                            "group flex flex-col p-2.5 rounded-xl border transition-all text-center",
                                            design.templateId === tmpl.id
                                                ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-200/50 shadow-sm"
                                                : "border-slate-100 bg-slate-50/30 hover:bg-white hover:border-slate-200"
                                        )}
                                    >
                                        <div className="w-full aspect-[4/5] bg-white rounded-lg shadow-sm overflow-hidden relative mb-2">
                                            <CoverLayoutRenderer tplId={tmpl.id} pTitle="" pSubtitle="" pImages={images.slice(0, 4)} pColor="#cbd5e1" isCard />
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-700 truncate">{tmpl.name}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <SectionLabel icon={Maximize2} label="Corner Style" />
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    {[{ label: "Rounded", value: true }, { label: "Sharp", value: false }].map(o => (
                                        <button key={String(o.value)} onClick={() => onDesignChange({ isRounded: o.value })}
                                            className={cn("p-3 rounded-xl border text-[10px] font-bold uppercase tracking-wide transition-all",
                                                design.isRounded === o.value ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-100 text-slate-400"
                                            )}>{o.label}</button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeCategory === "aesthetic" && (
                        <>
                            <SectionLabel icon={Palette} label="Color Palette" />
                            <div className="space-y-1.5">
                                {PALETTES.map((p) => (
                                    <button key={p.name} onClick={() => onDesignChange({ coverBgColor: p.colors[1], coverTextColor: p.colors[0] })}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="flex -space-x-1.5">
                                            {p.colors.map((c, i) => <div key={i} className="h-6 w-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />)}
                                        </div>
                                        <div className="text-left"><p className="text-xs font-bold text-slate-800">{p.name}</p><p className="text-[10px] text-slate-400">{p.label}</p></div>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <SectionLabel icon={Sparkles} label="Background" />
                                <div className="grid grid-cols-5 gap-2 mt-3">
                                    {BG_COLORS.map((c) => (
                                        <button key={c} onClick={() => onDesignChange({ coverBgColor: c })}
                                            className={cn("h-8 w-8 rounded-full border-2 transition-all hover:scale-110", design.coverBgColor === c ? "border-blue-500 ring-2 ring-blue-100 scale-110" : "border-slate-200")}
                                            style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <SectionLabel icon={ImageIcon} label="Embellishment" />
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                    {EMBELLISHMENTS.map((e) => (
                                        <button key={e.id} onClick={() => onDesignChange({ coverIconName: e.id, coverSymbol: "" })}
                                            className={cn("aspect-square rounded-xl border-2 flex items-center justify-center transition-all",
                                                design.coverIconName === e.id ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-100 bg-slate-50/50"
                                            )}>
                                            <e.icon className="h-5 w-5 text-slate-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeCategory === "illustrations" && (
                        <>
                            <SectionLabel icon={MapPin} label="Destination Art" />
                            <p className="text-[10px] text-slate-400 mt-1 mb-3">Pick an illustration for your cover. Works best with the Destination or Postcard templates.</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => onDesignChange({ illustrationId: null })}
                                    className={cn("p-3 rounded-xl border text-center transition-all",
                                        !design.illustrationId ? "border-blue-500 bg-blue-50/40 shadow-sm" : "border-slate-100 bg-slate-50/30 hover:bg-white"
                                    )}
                                >
                                    <p className="text-xs font-bold text-slate-500">None</p>
                                </button>
                                {Object.entries(DESTINATION_ILLUSTRATIONS).map(([id, ill]) => (
                                    <button
                                        key={id}
                                        onClick={() => onDesignChange({ illustrationId: id })}
                                        className={cn("flex flex-col items-center p-3 rounded-xl border transition-all",
                                            design.illustrationId === id ? "border-blue-500 bg-blue-50/40 shadow-sm" : "border-slate-100 bg-slate-50/30 hover:bg-white hover:border-slate-200"
                                        )}
                                    >
                                        <div className="w-12 h-12 mb-1" dangerouslySetInnerHTML={{ __html: ill.svg }} />
                                        <p className="text-[10px] font-bold text-slate-600 truncate w-full">{ill.name}</p>
                                        <p className="text-[8px] text-slate-400 truncate w-full">{ill.tags.slice(0, 2).join(", ")}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <SectionLabel icon={Sparkles} label="Quick Presets" />
                                <p className="text-[10px] text-slate-400 mt-1 mb-3">One-click destination themes</p>
                                <div className="space-y-2">
                                    {[
                                        { label: "🇬🇷 Greece", title: "GREECE", sub: "", ill: "evil-eye", bg: "#b8d4e8", text: "#1a3a5c", font: "font-fredoka", tpl: "destination" },
                                        { label: "🇫🇷 Paris", title: "PARIS", sub: "", ill: "frangipani", bg: "#f8c8d8", text: "#8a2040", font: "font-fredoka", tpl: "destination" },
                                        { label: "🇪🇸 Ibiza", title: "IBIZA", sub: new Date().getFullYear().toString(), ill: "coral", bg: "#d4b8e8", text: "#5a2d7a", font: "font-fredoka", tpl: "destination" },
                                        { label: "🇮🇩 Bali", title: "BALI", sub: "", ill: "watermelon", bg: "#fce4ec", text: "#c2185b", font: "font-righteous", tpl: "destination" },
                                        { label: "🇺🇸 Miami", title: "MIAMI", sub: "", ill: "coconut", bg: "#f8c8d8", text: "#6a1a3a", font: "font-fredoka", tpl: "destination" },
                                        { label: "🇫🇷 Cannes", title: "CANNES", sub: "France", ill: "frangipani", bg: "#b8d4e8", text: "#2a4a6a", font: "font-quicksand", tpl: "destination" },
                                        { label: "🇹🇷 Cappadocia", title: "CAPPADOCIA", sub: "Turkey", ill: "hot-air-balloon", bg: "#f8d0b8", text: "#8a3a1a", font: "font-righteous", tpl: "destination" },
                                    ].map((p) => (
                                        <button key={p.label} onClick={() => onDesignChange({
                                            title: p.title, subtitle: p.sub, illustrationId: p.ill,
                                            coverBgColor: p.bg, coverTextColor: p.text, coverFont: p.font,
                                            templateId: p.tpl, spineText: `${p.title} ${new Date().getFullYear()}`
                                        })}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors text-left"
                                        >
                                            <span className="text-lg">{p.label.split(" ")[0]}</span>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{p.label.split(" ").slice(1).join(" ")}</p>
                                                <div className="flex gap-1 mt-0.5">
                                                    {[p.bg, p.text].map((c, i) => <div key={i} className="h-3 w-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />)}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {activeCategory === "typography" && (
                        <>
                            <div className="flex items-center justify-between">
                                <SectionLabel icon={Type} label="Titles" />
                                <button onClick={generateMagicTitle} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">✨ Magic</button>
                            </div>
                            <div className="space-y-3">
                                <FieldInput label="Title" value={design.title} onChange={(v) => onDesignChange({ title: v.toUpperCase() })} />
                                <FieldInput label="Subtitle" value={design.subtitle} onChange={(v) => onDesignChange({ subtitle: v.toUpperCase() })} />
                                <FieldInput label="Spine" value={design.spineText} onChange={(v) => onDesignChange({ spineText: v.toUpperCase() })} />
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <SectionLabel icon={Type} label="Typeface" />
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    {FONTS.map((f) => (
                                        <button key={f.id} onClick={() => onDesignChange({ coverFont: f.id })}
                                            className={cn("p-3 rounded-xl border text-left transition-all",
                                                design.coverFont === f.id ? "border-blue-500 bg-blue-50/40" : "border-slate-100 bg-slate-50/30 hover:bg-white"
                                            )}>
                                            <p className="text-xs font-bold truncate" style={{ fontFamily: f.family }}>{f.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <SectionLabel icon={Palette} label="Text Color" />
                                <div className="flex gap-2 mt-3">
                                    <input type="color" value={design.coverTextColor} onChange={(e) => onDesignChange({ coverTextColor: e.target.value })} className="h-10 w-16 rounded-lg cursor-pointer border-2 border-slate-100 bg-white" />
                                    <Input value={design.coverTextColor} onChange={(e) => onDesignChange({ coverTextColor: e.target.value })} className="h-10 rounded-xl border-slate-100 font-mono text-sm bg-slate-50/50" />
                                </div>
                            </div>
                        </>
                    )}

                    {activeCategory === "print" && (
                        <>
                            <SectionLabel icon={ShoppingBag} label="Material" />
                            {Object.values(MATERIALS).map((m) => (
                                <button key={m.id} onClick={() => onDesignChange({ coverMaterial: m.id as any })}
                                    className={cn("w-full flex items-center justify-between p-3.5 rounded-xl border text-sm font-bold transition-all",
                                        design.coverMaterial === m.id ? "border-blue-500 bg-blue-50/40 text-blue-600" : "border-slate-100 text-slate-500 hover:bg-slate-50"
                                    )}>
                                    {m.name} {design.coverMaterial === m.id && <Check className="h-4 w-4" />}
                                </button>
                            ))}

                            <div className="pt-6 border-t border-slate-100">
                                <SectionLabel icon={Trophy} label="Foil Stamp" />
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    {Object.values(FOILS).map((f) => (
                                        <button key={f.id} onClick={() => onDesignChange({ coverFoil: f.id as any })}
                                            className={cn("p-3 rounded-xl border text-[10px] font-bold uppercase tracking-wide flex items-center justify-between transition-all",
                                                design.coverFoil === f.id ? "border-blue-500 bg-white text-blue-600 shadow-sm" : "border-slate-100 text-slate-400"
                                            )}>
                                            {f.name}
                                            {f.id !== 'none' && <div className="h-4 w-4 rounded-full shadow-inner" style={{ background: f.gradient || 'transparent' }} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <SectionLabel icon={Maximize2} label="Size" />
                                <div className="space-y-2 mt-3">
                                    {SIZES.map((s) => (
                                        <button key={s.id} onClick={() => onDesignChange({ sizeId: s.id })}
                                            className={cn("w-full flex items-center justify-between p-3.5 rounded-xl border transition-all",
                                                design.sizeId === s.id ? "border-blue-500 bg-blue-50/40 text-blue-600" : "border-slate-100 text-slate-500 hover:bg-slate-50"
                                            )}>
                                            <div className="text-left"><p className="text-sm font-bold">{s.name}</p><p className="text-[10px] text-slate-400">{s.dimensions}</p></div>
                                            <p className="text-xs font-bold">{s.price_multiplier === 1 ? "Base" : `+${Math.round((s.price_multiplier - 1) * 100)}%`}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
    return (
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Icon className="h-3 w-3" /> {label}
        </p>
    );
}

function FieldInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
            <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-10 rounded-xl border-slate-100 font-bold bg-slate-50/50 focus:bg-white shadow-none text-sm" />
        </div>
    );
}
