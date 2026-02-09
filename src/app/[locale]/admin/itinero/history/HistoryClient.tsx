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
    Globe
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

    const [editingHistoryId, setEditingHistoryId] = React.useState<string | null>(null);
    const [histSaving, setHistSaving] = React.useState(false);

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
                primary_city: kbygPrimaryCity
            };

            const payloadData: DestinationHistoryPayload = {
                about: histAbout,
                history: histHistory,
                kbyg: kbygData,
            };

            const payloadValues = {
                destination_id: selectedDestId,
                section: "main",
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
                        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                            <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    {editingHistoryId ? <Pencil className="h-4 w-4 text-blue-500" /> : <Plus className="h-4 w-4 text-blue-500" />}
                                    {editingHistoryId ? "Edit History Entry" : "New History Entry"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500">
                                    Create or update rich content for {destinations.find(d => d.id === selectedDestId)?.name || "destination"}.
                                </DialogDescription>
                            </DialogHeader>

                            <form id="history-form" onSubmit={handleSaveHistory}>
                                <ScrollArea className="max-h-[70vh] px-6 py-6">
                                    <div className="grid gap-8">
                                        {/* Rich Content Section */}
                                        <div className="grid gap-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                                                <BookOpen className="h-4 w-4 text-blue-500" />
                                                Rich Content
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
                                                rows={8}
                                            />
                                        </div>

                                        {/* KBYG Section */}
                                        <div className="grid gap-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                                                <Info className="h-4 w-4 text-emerald-500" />
                                                Know Before You Go (KBYG)
                                                <Badge variant="outline" className="ml-auto text-[10px] h-5 px-1.5 font-normal">JSON Auto-gen</Badge>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <FormInput
                                                    label="Currency"
                                                    value={kbygCurrency}
                                                    onChange={setKbygCurrency}
                                                    placeholder="e.g. Euro (EUR)"
                                                />
                                                <FormInput
                                                    label="Electric Plugs"
                                                    value={kbygPlugs}
                                                    onChange={setKbygPlugs}
                                                    placeholder="e.g. Type C / E"
                                                />
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="sm:col-span-2">
                                                    <FormInput
                                                        label="Languages (comma separated)"
                                                        value={kbygLanguages}
                                                        onChange={setKbygLanguages}
                                                        placeholder="e.g. French, English"
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <FormInput
                                                        label="Getting Around"
                                                        value={kbygGettingAround}
                                                        onChange={setKbygGettingAround}
                                                        placeholder="e.g. The metro is the best way to travel..."
                                                    />
                                                </div>
                                                <FormInput
                                                    label="eSIM Recommendation"
                                                    value={kbygEsim}
                                                    onChange={setKbygEsim}
                                                    placeholder="e.g. Airalo"
                                                />
                                                <FormInput
                                                    label="Primary City"
                                                    value={kbygPrimaryCity}
                                                    onChange={setKbygPrimaryCity}
                                                    placeholder="e.g. Paris"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
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
