"use client";

import * as React from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Loader2,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Flag,
    History as HistoryIcon,
    ChevronRight,
    BookOpen,
    Info,
    Globe,
    Coins,
    HeartHandshake,
    AlertCircle,
    PhoneCall,
    Lightbulb,
    ShieldAlert,
    Sparkles,
    Wand2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DestinationOption, DestinationHistoryRowUI, DestinationHistoryPayload } from "../types";
import { FormInput, FormTextarea } from "@/components/admin/AdminShared";

type HistoryClientProps = {
    initialDestinations: DestinationOption[];
};

export default function HistoryClient({
    initialDestinations,
}: HistoryClientProps) {
    const sb = React.useMemo(() => getSupabaseBrowser(), []);

    const [destinations] = React.useState<DestinationOption[]>(initialDestinations);

    /* ------------ History State ------------ */
    const [selectedDestId, setSelectedDestId] = React.useState<string>("");
    const [historyRows, setHistoryRows] = React.useState<DestinationHistoryRowUI[]>([]);
    const [historyLoading, setHistoryLoading] = React.useState(false);
    const [currentDestHistoryId, setCurrentDestHistoryId] = React.useState<string | null>(null);

    /* ------------ History Form State ------------ */
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = React.useState(false);
    const [histAbout, setHistAbout] = React.useState("");
    const [histHistory, setHistHistory] = React.useState("");

    // KBYG State Fields
    const [kbygCurrency, setKbygCurrency] = React.useState("");
    const [kbygPlugs, setKbygPlugs] = React.useState("");
    const [kbygLanguages, setKbygLanguages] = React.useState("");
    const [kbygGettingAround, setKbygGettingAround] = React.useState("");
    const [kbygEsim, setKbygEsim] = React.useState("");
    const [kbygPrimaryCity, setKbygPrimaryCity] = React.useState("");
    const [kbygTipping, setKbygTipping] = React.useState("");
    const [kbygPayment, setKbygPayment] = React.useState("");
    const [kbygCostCoffee, setKbygCostCoffee] = React.useState("");
    const [kbygCostMeal, setKbygCostMeal] = React.useState("");
    const [kbygCostBeer, setKbygCostBeer] = React.useState("");
    const [kbygEtiquetteDos, setKbygEtiquetteDos] = React.useState("");
    const [kbygEtiquetteDonts, setKbygEtiquetteDonts] = React.useState("");
    const [kbygPackingTips, setKbygPackingTips] = React.useState("");
    const [kbygEmergencyPolice, setKbygEmergencyPolice] = React.useState("");
    const [kbygEmergencyMedical, setKbygEmergencyMedical] = React.useState("");
    const [kbygHiddenGemTitle, setKbygHiddenGemTitle] = React.useState("");
    const [kbygHiddenGemDesc, setKbygHiddenGemDesc] = React.useState("");
    const [kbygPhotography, setKbygPhotography] = React.useState("");
    const [kbygGestures, setKbygGestures] = React.useState("");
    const [kbygDressCode, setKbygDressCode] = React.useState("");

    const [editingHistoryId, setEditingHistoryId] = React.useState<string | null>(null);
    const [histSaving, setHistSaving] = React.useState(false);
    const [isMagicLoading, setIsMagicLoading] = React.useState(false);

    /* --- Magic Fill Logic --- */
    const handleMagicFill = async () => {
        const destName = destinations.find(d => d.id === selectedDestId)?.name;
        if (!destName) return;

        setIsMagicLoading(true);
        // Simulate "Thinking"
        await new Promise(r => setTimeout(r, 1200));

        // Intelligent Defaults Dictionary
        const DEST_KNOWLEDGE: Record<string, any> = {
            "Nairobi": {
                currency: "Kenyan Shilling (KES)",
                plugs: "Type G",
                languages: "Swahili, English",
                getting_around: "Matatus, Uber, and Bolt are popular. For a unique experience, try a Boda Boda for short distances.",
                primary_city: "Nairobi",
                costs: { coffee: "KES 350", meal: "KES 1,200", beer: "KES 400" },
                etiquette: { dos: "Greet people politely, use your right hand", donts: "Avoid photography of govt buildings" },
                tipping: "10% in restaurants is appreciated but not mandatory.",
                packing: "Light layers for the day, warm jacket for cool evenings.",
                hidden_gem: { title: "The Alchemist Bar", desc: "A creative hub in Westlands with food trucks and live music." }
            },
            "Paris": {
                currency: "Euro (EUR)",
                plugs: "Type C / E",
                languages: "French, English",
                getting_around: "The Metro is the most efficient. Walking is highly recommended in central arrondissements.",
                primary_city: "Paris",
                costs: { coffee: "€4.50", meal: "€25.00", beer: "€7.00" },
                etiquette: { dos: "Say 'Bonjour' when entering shops", donts: "Don't speak loudly in public transport" },
                tipping: "Service is included (service compris), but a small extra is common.",
                packing: "Comfortable walking shoes and a stylish scarf.",
                hidden_gem: { title: "Promenade Plantée", desc: "An elevated park built on an old railway viaduct." }
            }
        };

        const k = DEST_KNOWLEDGE[destName] || {
            currency: "Local Currency",
            plugs: "Type C",
            languages: "Local Language, English",
            getting_around: "Walking and local ride-sharing are usually best.",
            primary_city: destName,
            costs: { coffee: "$4.00", meal: "$15.00", beer: "$6.00" },
            etiquette: { dos: "Be respectful of local traditions", donts: "Avoid sensitive political topics" },
            tipping: "Check local customs, 10% is often standard.",
            packing: "Check local weather forecasts before traveling.",
            hidden_gem: { title: "Local Market", desc: "Always explore the central market for authentic food." }
        };

        // Fill State
        setKbygCurrency(k.currency);
        setKbygPlugs(k.plugs);
        setKbygLanguages(k.languages);
        setKbygGettingAround(k.getting_around);
        setKbygPrimaryCity(k.primary_city);
        setKbygCostCoffee(k.costs.coffee);
        setKbygCostMeal(k.costs.meal);
        setKbygCostBeer(k.costs.beer);
        setKbygTipping(k.tipping);
        setKbygPackingTips(k.packing);
        setKbygEtiquetteDos(k.etiquette.dos);
        setKbygEtiquetteDonts(k.etiquette.donts);
        setKbygHiddenGemTitle(k.hidden_gem.title);
        setKbygHiddenGemDesc(k.hidden_gem.desc);

        setIsMagicLoading(false);
        toast.success(`Magic Fill complete for ${destName}!`);
    };

    /* --- Effects --- */
    React.useEffect(() => {
        if (selectedDestId) {
            fetchHistory(selectedDestId);
        } else {
            setHistoryRows([]);
            setCurrentDestHistoryId(null);
        }
    }, [selectedDestId]);

    /* --- Data Fetching --- */
    async function fetchHistory(destId: string) {
        setHistoryLoading(true);
        try {
            // Get current history pointer
            const { data: dData } = await sb
                .schema('itinero')
                .from("destinations")
                .select("current_history_id")
                .eq("id", destId)
                .single();
            setCurrentDestHistoryId(dData?.current_history_id ?? null);

            // Get history rows
            const { data: hRows, error } = await sb
                .schema('itinero')
                .from("destination_history")
                .select("*")
                .eq("destination_id", destId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setHistoryRows((hRows as DestinationHistoryRowUI[]) || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load history entries");
        } finally {
            setHistoryLoading(false);
        }
    }

    /* --- Reset Helpers --- */
    function resetHistoryForm() {
        setHistAbout("");
        setHistHistory("");
        setKbygCurrency("");
        setKbygPlugs("");
        setKbygLanguages("");
        setKbygGettingAround("");
        setKbygEsim("");
        setKbygPrimaryCity("");
        setKbygTipping("");
        setKbygPayment("");
        setKbygCostCoffee("");
        setKbygCostMeal("");
        setKbygCostBeer("");
        setKbygEtiquetteDos("");
        setKbygEtiquetteDonts("");
        setKbygPackingTips("");
        setKbygEmergencyPolice("");
        setKbygEmergencyMedical("");
        setKbygHiddenGemTitle("");
        setKbygHiddenGemDesc("");
        setKbygPhotography("");
        setKbygGestures("");
        setKbygDressCode("");
        setEditingHistoryId(null);
        setIsHistoryDialogOpen(false);
    }

    /* --- Handlers --- */
    async function handleSaveHistory(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedDestId) {
            toast.error("No destination selected.");
            return;
        }

        setHistSaving(true);
        try {
            // Construct KBYG object
            const kbygData = {
                currency: kbygCurrency,
                plugs: kbygPlugs,
                languages: kbygLanguages,
                getting_around: kbygGettingAround,
                esim: kbygEsim,
                primary_city: kbygPrimaryCity,
                tipping: kbygTipping,
                payment: kbygPayment,
                cost_coffee: kbygCostCoffee,
                cost_meal: kbygCostMeal,
                cost_beer: kbygCostBeer,
                etiquette_dos: kbygEtiquetteDos,
                etiquette_donts: kbygEtiquetteDonts,
                packing_tips: kbygPackingTips,
                emergency_police: kbygEmergencyPolice,
                emergency_medical: kbygEmergencyMedical,
                hidden_gem_title: kbygHiddenGemTitle,
                hidden_gem_desc: kbygHiddenGemDesc,
                photography: kbygPhotography,
                gestures: kbygGestures,
                dress_code: kbygDressCode
            };

            const payloadData: DestinationHistoryPayload = {
                about: histAbout,
                history: histHistory,
                kbyg: kbygData,
            };

            const payloadValues = {
                destination_id: selectedDestId,
                section: "mixed",
                content: "v1", // Legacy field, keeping simplified
                payload: payloadData,
            };

            if (editingHistoryId) {
                const { error } = await sb
                    .schema('itinero')
                    .from("destination_history")
                    .update(payloadValues)
                    .eq("id", editingHistoryId);

                if (error) throw error;
                toast.success("History updated");
            } else {
                const { error } = await sb
                    .schema('itinero')
                    .from("destination_history")
                    .insert(payloadValues);

                if (error) throw error;
                toast.success("History created");
            }

            resetHistoryForm();
            fetchHistory(selectedDestId);

        } catch (e: unknown) {
            console.error(e);
            toast.error("Failed to save history");
        } finally {
            setHistSaving(false);
        }
    }

    function startEditHistory(h: DestinationHistoryRowUI) {
        setEditingHistoryId(h.id);
        const p = h.payload || {};
        const k = p.kbyg || {};

        setHistAbout(p.about || "");
        setHistHistory(p.history || "");

        // Flatten KBYG
        setKbygCurrency(k.currency || "");
        setKbygPlugs(k.plugs || "");
        const lang = k.languages;
        setKbygLanguages(Array.isArray(lang) ? lang.join(", ") : (lang || ""));
        setKbygGettingAround(k.getting_around || "");
        setKbygEsim(k.esim || "");
        setKbygPrimaryCity(k.primary_city || "");
        setKbygTipping(k.tipping || "");
        setKbygPayment(k.payment || "");
        setKbygCostCoffee(k.cost_coffee || "");
        setKbygCostMeal(k.cost_meal || "");
        setKbygCostBeer(k.cost_beer || "");
        setKbygEtiquetteDos(k.etiquette_dos || "");
        setKbygEtiquetteDonts(k.etiquette_donts || "");
        setKbygPackingTips(k.packing_tips || "");
        setKbygEmergencyPolice(k.emergency_police || "");
        setKbygEmergencyMedical(k.emergency_medical || "");
        setKbygHiddenGemTitle(k.hidden_gem_title || "");
        setKbygHiddenGemDesc(k.hidden_gem_desc || "");
        setKbygPhotography(k.photography || "");
        setKbygGestures(k.gestures || "");
        setKbygDressCode(k.dress_code || "");

        setIsHistoryDialogOpen(true);
    }

    async function handleSetCurrentHistory(h: DestinationHistoryRowUI) {
        try {
            const { error } = await sb
                .schema('itinero')
                .from("destinations")
                .update({ current_history_id: h.id })
                .eq("id", h.destination_id);

            if (error) throw error;
            setCurrentDestHistoryId(h.id);
            toast.success("Set as current active content");
        } catch (e) {
            console.error(e);
            toast.error("Failed to update current history");
        }
    }

    async function handleDeleteHistory(id: string) {
        if (!confirm("Delete this history entry?")) return;
        try {
            const { error } = await sb
                .schema('itinero')
                .from("destination_history")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setHistoryRows((prev) => prev.filter((r) => r.id !== id));
            if (currentDestHistoryId === id) {
                setCurrentDestHistoryId(null);
            }
            toast.success("Deleted history entry");
        } catch (e) {
            console.error(e);

        }
    }

    return (
        <div className="container mx-auto max-w-[1400px] p-8 space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-2">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-transparent">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        <span>Administration</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="capitalize text-blue-600 dark:text-blue-400">History</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        History & Content
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage rich content, history, and practical information (KBYG) for destinations.
                    </p>
                </div>
            </header>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="w-[300px]">
                        <Select value={selectedDestId} onValueChange={setSelectedDestId}>
                            <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 focus:ring-blue-500">
                                <SelectValue placeholder="Select Destination to Edit..." />
                            </SelectTrigger>
                            <SelectContent>
                                {destinations.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={resetHistoryForm}
                                disabled={!selectedDestId}
                                className="h-11 px-6 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none"
                            >
                                <Plus className="h-4 w-4" />
                                Add Entry
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col p-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 gap-0">
                            <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    {editingHistoryId ? <Pencil className="h-4 w-4 text-blue-500" /> : <Plus className="h-4 w-4 text-blue-500" />}
                                    {editingHistoryId ? "Edit History Entry" : "New History Entry"}
                                </DialogTitle>

                                <DialogDescription className="text-slate-500 flex items-center justify-between">
                                    <span>Create or update rich content for {destinations.find(d => d.id === selectedDestId)?.name || "destination"}.</span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleMagicFill}
                                        disabled={isMagicLoading}
                                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 h-8 gap-1.5"
                                    >
                                        <Wand2 className={cn("h-3.5 w-3.5", isMagicLoading && "animate-pulse")} />
                                        {isMagicLoading ? "Drafting..." : "Magic Fill"}
                                    </Button>
                                </DialogDescription>
                            </DialogHeader>

                            <form id="history-form" onSubmit={handleSaveHistory} className="flex flex-col flex-1 min-h-0 overflow-hidden bg-slate-50/30 dark:bg-slate-900/10">
                                <Tabs defaultValue="narrative" className="flex-1 flex flex-col h-full overflow-hidden">
                                    <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                                        <TabsList className="bg-slate-100/50 dark:bg-slate-900/50 p-1 h-auto flex-wrap">
                                            <TabsTrigger value="narrative" className="rounded-lg px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                                                <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                                                Narrative
                                            </TabsTrigger>
                                            <TabsTrigger value="lifestyle" className="rounded-lg px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                                                <Info className="h-4 w-4 mr-2 text-emerald-500" />
                                                Lifestyle
                                            </TabsTrigger>
                                            <TabsTrigger value="finances" className="rounded-lg px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                                                <Coins className="h-4 w-4 mr-2 text-amber-500" />
                                                Finances
                                            </TabsTrigger>
                                            <TabsTrigger value="social" className="rounded-lg px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                                                <HeartHandshake className="h-4 w-4 mr-2 text-pink-500" />
                                                Social
                                            </TabsTrigger>
                                            <TabsTrigger value="safety" className="rounded-lg px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                                                <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
                                                Safety
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                                        <TabsContent value="narrative" className="m-0 focus-visible:outline-none">
                                            <div className="space-y-6">
                                                <div className="flex flex-col gap-1 mb-2">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Deep Dive Content</h3>
                                                    <p className="text-xs text-slate-500">The primary storytelling section for travelers.</p>
                                                </div>
                                                <FormTextarea
                                                    label="About (Introduction)"
                                                    value={histAbout}
                                                    onChange={setHistAbout}
                                                    placeholder="Brief introduction about the destination..."
                                                    rows={4}
                                                />
                                                <FormTextarea
                                                    label="History (Deep Dive)"
                                                    value={histHistory}
                                                    onChange={setHistHistory}
                                                    placeholder="Detailed historical background..."
                                                    rows={10}
                                                />
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="lifestyle" className="m-0 focus-visible:outline-none">
                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                                    <div className="flex flex-col gap-1">
                                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Survival Logistics</h3>
                                                        <p className="text-xs text-slate-500">Essential day-to-day coordination info.</p>
                                                    </div>
                                                    <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800">
                                                        KBYG Essentials
                                                    </Badge>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <FormInput label="Currency" value={kbygCurrency} onChange={setKbygCurrency} placeholder="e.g. Euro (EUR)" />
                                                        <div className="flex gap-1.5 pt-1">
                                                            {["USD", "EUR", "KES", "GBP"].map(curr => (
                                                                <button
                                                                    key={curr}
                                                                    type="button"
                                                                    onClick={() => setKbygCurrency(prev => prev.includes(curr) ? prev : curr)}
                                                                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                                                                >
                                                                    {curr}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <FormInput label="Electric Plugs" value={kbygPlugs} onChange={setKbygPlugs} placeholder="e.g. Type C / E" />
                                                        <div className="flex gap-1.5 pt-1">
                                                            {["Type C", "Type G", "Type A"].map(plug => (
                                                                <button
                                                                    key={plug}
                                                                    type="button"
                                                                    onClick={() => setKbygPlugs(plug)}
                                                                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                                                                >
                                                                    {plug}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <FormInput label="Languages (comma separated)" value={kbygLanguages} onChange={setKbygLanguages} placeholder="e.g. French, English" />
                                                    <FormTextarea label="Getting Around" value={kbygGettingAround} onChange={setKbygGettingAround} placeholder="e.g. The metro is the best way to travel..." rows={2} />
                                                    <div className="grid sm:grid-cols-2 gap-6">
                                                        <FormInput label="eSIM Recommendation" value={kbygEsim} onChange={setKbygEsim} placeholder="e.g. Airalo" />
                                                        <FormInput label="Primary City" value={kbygPrimaryCity} onChange={setKbygPrimaryCity} placeholder="e.g. Paris" />
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="finances" className="m-0 focus-visible:outline-none">
                                            <div className="space-y-8">
                                                <div className="flex flex-col gap-1 mb-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Budget & Economy</h3>
                                                    <p className="text-xs text-slate-500">Helping travelers estimate their daily spending.</p>
                                                </div>

                                                <div className="grid sm:grid-cols-3 gap-6">
                                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                        <FormInput label="Coffee Cost" value={kbygCostCoffee} onChange={setKbygCostCoffee} placeholder="$4.50" />
                                                    </div>
                                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                        <FormInput label="Meal Cost" value={kbygCostMeal} onChange={setKbygCostMeal} placeholder="$18.00" />
                                                    </div>
                                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                        <FormInput label="Beer Cost" value={kbygCostBeer} onChange={setKbygCostBeer} placeholder="$7.00" />
                                                    </div>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-6 pt-4">
                                                    <FormTextarea label="Tipping Culture" value={kbygTipping} onChange={setKbygTipping} placeholder="e.g. 10% is standard..." rows={3} />
                                                    <FormTextarea label="Payment Methods" value={kbygPayment} onChange={setKbygPayment} placeholder="e.g. Cash is king..." rows={3} />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="social" className="m-0 focus-visible:outline-none">
                                            <div className="space-y-8">
                                                <div className="flex flex-col gap-1 mb-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Social Protocol</h3>
                                                    <p className="text-xs text-slate-500">Cultural nuances and behavior guidelines.</p>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-6">
                                                    <FormInput label="Etiquette Do's" value={kbygEtiquetteDos} onChange={setKbygEtiquetteDos} placeholder="Handshakes, eye contact..." />
                                                    <FormInput label="Etiquette Don'ts" value={kbygEtiquetteDonts} onChange={setKbygEtiquetteDonts} placeholder="Pointing, loud talking..." />
                                                </div>

                                                <div className="grid sm:grid-cols-3 gap-6">
                                                    <FormInput label="Photography" value={kbygPhotography} onChange={setKbygPhotography} placeholder="Ask first" />
                                                    <FormInput label="Gestures" value={kbygGestures} onChange={setKbygGestures} placeholder="Thumbs up" />
                                                    <FormInput label="Dress Code" value={kbygDressCode} onChange={setKbygDressCode} placeholder="Modest" />
                                                </div>

                                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-800/50 space-y-4">
                                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
                                                        <Lightbulb className="h-5 w-5" />
                                                        The Hidden Gem
                                                    </div>
                                                    <FormInput label="Title" value={kbygHiddenGemTitle} onChange={setKbygHiddenGemTitle} placeholder="Evening Market" />
                                                    <FormTextarea label="Discovery Description" value={kbygHiddenGemDesc} onChange={setKbygHiddenGemDesc} placeholder="Helpful description..." rows={3} />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="safety" className="m-0 focus-visible:outline-none">
                                            <div className="space-y-8">
                                                <div className="flex flex-col gap-1 mb-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Safety & Prep</h3>
                                                    <p className="text-xs text-slate-500">Emergency contacts and preparedness.</p>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-6">
                                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                                                        <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                                                            <ShieldAlert className="h-4 w-4" />
                                                            Hotlines
                                                        </div>
                                                        <FormInput label="Local Police" value={kbygEmergencyPolice} onChange={setKbygEmergencyPolice} placeholder="e.g. 911" />
                                                        <FormInput label="Medical Emergency" value={kbygEmergencyMedical} onChange={setKbygEmergencyMedical} placeholder="e.g. 999" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                                                            <Flag className="h-4 w-4" />
                                                            Preparedness
                                                        </div>
                                                        <FormTextarea label="Packing Tips" value={kbygPackingTips} onChange={setKbygPackingTips} placeholder="Bring a jacket..." rows={5} />
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                                <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <Button type="button" variant="outline" onClick={() => setIsHistoryDialogOpen(false)} className="mr-2">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={histSaving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                                        {histSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingHistoryId ? "Save Changes" : "Create Entry"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {selectedDestId && (
                    <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-950 rounded-xl">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                                    <TableHead className="font-semibold text-slate-500 w-[200px]">Status</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Preview</TableHead>
                                    <TableHead className="font-semibold text-slate-500 w-[150px]">Created At</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-500 w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                                        </TableCell>
                                    </TableRow>
                                ) : historyRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No history entries found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    historyRows.map((h) => {
                                        const isCurrent = currentDestHistoryId === h.id;
                                        const preview = (h.payload?.about || "").slice(0, 100) + "...";
                                        return (
                                            <TableRow key={h.id} className={cn("hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors", isCurrent && "bg-blue-50/50 dark:bg-blue-900/10")}>
                                                <TableCell>
                                                    {isCurrent ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none">
                                                            Current Live
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-slate-500 font-normal">
                                                            Draft / Older
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">
                                                        {preview}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-slate-400">
                                                        {h.created_at ? new Date(h.created_at).toLocaleDateString() : "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleSetCurrentHistory(h)} disabled={isCurrent}>
                                                                <Flag className="mr-2 h-4 w-4" />
                                                                Set as Live
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => startEditHistory(h)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteHistory(h.id)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                )}

                {!selectedDestId && (
                    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <HistoryIcon className="h-10 w-10 text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Select a Destination</h3>
                        <p className="text-slate-500 max-w-sm mt-1">
                            Choose a destination from the dropdown above to view and manage its history and content blocks.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
