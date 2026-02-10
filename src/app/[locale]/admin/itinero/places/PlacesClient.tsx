"use client";

import * as React from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Loader2,
    MapPin,
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Utensils,
    BedDouble,
    Camera,
    Info,
    Tag,
    Clock,
    DollarSign,
    Link as LinkIcon,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DestinationOption, PlaceOption, PlaceHour } from "../types";
import { FormInput, FormTextarea } from "@/components/admin/AdminShared";
import { ScrollArea } from "@/components/ui/scroll-area";

type PlacesClientProps = {
    initialDestinations: DestinationOption[];
    initialPlaces: PlaceOption[];
};

export default function PlacesClient({
    initialDestinations,
    initialPlaces,
}: PlacesClientProps) {
    const sb = React.useMemo(() => getSupabaseBrowser(), []);

    const [places, setPlaces] = React.useState<PlaceOption[]>(initialPlaces);
    const [destinations] = React.useState<DestinationOption[]>(initialDestinations);

    /* ------------ Places form state ------------ */
    const [isPlaceDialogOpen, setIsPlaceDialogOpen] = React.useState(false);
    const [placeDestinationId, setPlaceDestinationId] = React.useState<string>("");
    const [placeName, setPlaceName] = React.useState("");
    const [placeCategory, setPlaceCategory] = React.useState("");
    const [placeLat, setPlaceLat] = React.useState<string>("");
    const [placeLng, setPlaceLng] = React.useState<string>("");
    const [placeTags, setPlaceTags] = React.useState("");
    const [placeDescription, setPlaceDescription] = React.useState("");
    const [placePopularity, setPlacePopularity] = React.useState<string>("");
    const [placeCostTypical, setPlaceCostTypical] = React.useState<string>("");
    const [placeCostCurrency, setPlaceCostCurrency] = React.useState<string>("");
    const [placeKind, setPlaceKind] = React.useState("poi");
    const [placeUrl, setPlaceUrl] = React.useState("");
    const [placeBookingUrl, setPlaceBookingUrl] = React.useState("");
    const [placeIsPartner, setPlaceIsPartner] = React.useState(false);

    // Hours state
    const [placeHours, setPlaceHours] = React.useState<PlaceHour[]>([]);

    const [placeSaving, setPlaceSaving] = React.useState(false);
    const [editingPlaceId, setEditingPlaceId] = React.useState<string | null>(null);
    const [placeSearch, setPlaceSearch] = React.useState("");
    const [placeFilterDestId, setPlaceFilterDestId] = React.useState<string>("all");

    // Places Pagination
    const [placesPage, setPlacesPage] = React.useState(1);
    const [placesPageSize] = React.useState(10);

    const [isGeocoding, setIsGeocoding] = React.useState(false);

    async function handleGeocode() {
        if (!placeName.trim()) {
            toast.error("Please enter a place name first");
            return;
        }

        setIsGeocoding(true);
        try {
            const dest = destinations.find(d => d.id === placeDestinationId);
            const context = dest ? `, ${dest.name}` : "";
            const query = encodeURIComponent(`${placeName}${context}`);
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            const data = await res.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setPlaceLat(parseFloat(lat).toString());
                setPlaceLng(parseFloat(lon).toString());

                toast.success(`Found coordinates for: ${placeName}`, {
                    description: `Lat: ${lat}, Lng: ${lon}`
                });
            } else {
                toast.error("Could not find coordinates for this place");
            }
        } catch (e) {
            console.error(e);
            toast.error("Geocoding failed. Please try again or enter coordinates manually.");
        } finally {
            setIsGeocoding(false);
        }
    }

    /* --- Reset Helpers --- */
    function resetPlaceForm() {
        setPlaceName("");
        setPlaceCategory("");
        setPlaceLat("");
        setPlaceLng("");
        setPlaceTags("");
        setPlaceDescription("");
        setPlacePopularity("");
        setPlaceCostTypical("");
        setPlaceCostCurrency("");
        setPlaceKind("poi");
        setPlaceUrl("");
        setPlaceBookingUrl("");
        setPlaceIsPartner(false);
        setPlaceHours([]);
        setEditingPlaceId(null);
        setIsPlaceDialogOpen(false);
        if (placeFilterDestId !== "all") {
            setPlaceDestinationId(placeFilterDestId);
        } else {
            setPlaceDestinationId("");
        }
    }

    function tagsToString(tags?: string[] | null): string {
        return tags && tags.length ? tags.join(", ") : "";
    }

    /* --- Effects --- */
    // Reset pagination when search changes
    React.useEffect(() => {
        setPlacesPage(1);
    }, [placeSearch, placeFilterDestId]);

    // Load place hours when editingPlaceId changes
    React.useEffect(() => {
        if (!editingPlaceId) {
            setPlaceHours([]);
            return;
        }
        (async () => {
            try {
                const { data, error } = await sb
                    .schema("itinero")
                    .from("place_hours")
                    .select("*")
                    .eq("place_id", editingPlaceId);

                if (error) {
                    console.error("Error loading hours:", error);
                    return;
                }
                setPlaceHours((data as PlaceHour[]) ?? []);
            } catch (err) {
                console.error("Error loading hours:", err);
            }
        })();
    }, [editingPlaceId, sb]);

    /* --- Handlers --- */
    function updateHour(day: number, field: "open" | "close", value: string) {
        setPlaceHours((prev) => {
            const existing = prev.find((h) => h.day_of_week === day);
            if (existing) {
                return prev.map((h) =>
                    h.day_of_week === day
                        ? { ...h, [field === "open" ? "open_time" : "close_time"]: value }
                        : h
                );
            } else {
                return [
                    ...prev,
                    {
                        day_of_week: day,
                        open_time: field === "open" ? value : null,
                        close_time: field === "close" ? value : null,
                    },
                ];
            }
        });
    }

    function toggleClosed(day: number, isClosed: boolean) {
        if (isClosed) {
            setPlaceHours((prev) => prev.filter((h) => h.day_of_week !== day));
        } else {
            setPlaceHours((prev) => [
                ...prev,
                { day_of_week: day, open_time: "", close_time: "" },
            ]);
        }
    }

    async function handleSavePlace(e: React.FormEvent) {
        e.preventDefault();
        if (!placeDestinationId) {
            toast.error("Select a destination first.");
            return;
        }
        if (!placeName.trim()) {
            toast.error("Name is required.");
            return;
        }

        setPlaceSaving(true);
        try {
            const latNum =
                placeLat.trim() !== "" ? Number(placeLat.trim()) : null;
            const lngNum =
                placeLng.trim() !== "" ? Number(placeLng.trim()) : null;
            const tagsArr = placeTags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            const popularityNum =
                placePopularity.trim() !== "" ? Number(placePopularity.trim()) : null;
            const costTypicalNum =
                placeCostTypical.trim() !== "" ? Number(placeCostTypical.trim()) : null;
            const costCurrencyVal =
                placeCostCurrency.trim() !== "" ? placeCostCurrency.trim() : null;

            const payload = {
                destination_id: placeDestinationId,
                name: placeName.trim(),
                category: placeCategory.trim() || null,
                lat: latNum,
                lng: lngNum,
                tags: tagsArr.length ? tagsArr : null,
                description: placeDescription.trim() || null,
                popularity: popularityNum,
                cost_typical: costTypicalNum,
                cost_currency: costCurrencyVal,
                kind: placeKind,
                url: placeUrl.trim() || null,
                booking_url: placeBookingUrl.trim() || null,
                is_partner: placeIsPartner,
            };

            if (editingPlaceId) {
                const { data, error } = await sb
                    .schema('itinero')
                    .from("places")
                    .update(payload)
                    .eq("id", editingPlaceId)
                    .select()
                    .single();

                if (error) throw error;

                setPlaces((prev) =>
                    prev.map((p) =>
                        p.id === editingPlaceId ? data : p
                    )
                );
                toast.success("Place updated successfully");

                // Update hours
                await sb
                    .schema("itinero")
                    .from("place_hours")
                    .delete()
                    .eq("place_id", editingPlaceId);

                if (placeHours.length > 0) {
                    const hoursPayload = placeHours.map((h) => ({
                        place_id: editingPlaceId,
                        day_of_week: h.day_of_week,
                        open_time: h.open_time || null,
                        close_time: h.close_time || null,
                    }));
                    const { error: hoursError } = await sb
                        .schema("itinero")
                        .from("place_hours")
                        .insert(hoursPayload);

                    if (hoursError) {
                        console.error("Error saving hours:", hoursError);
                        toast.error("Place updated, but error saving hours.");
                    }
                }
            } else {
                // Create
                const { data, error } = await sb
                    .schema('itinero')
                    .from("places")
                    .insert(payload)
                    .select()
                    .single();

                if (error) throw error;

                setPlaces((prev) => [data, ...prev]);
                toast.success("Place created successfully");

                // If we have hours, insert them
                if (placeHours.length > 0) {
                    const hoursPayload = placeHours.map((h) => ({
                        place_id: data.id,
                        day_of_week: h.day_of_week,
                        open_time: h.open_time || null,
                        close_time: h.close_time || null,
                    }));
                    const { error: hoursError } = await sb
                        .schema("itinero")
                        .from("place_hours")
                        .insert(hoursPayload);

                    if (hoursError) {
                        console.error("Error saving hours:", hoursError);
                        toast.error("Place created, but error saving hours");
                    }
                }
            }

            resetPlaceForm();
        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Failed to save place", { description: msg });
        } finally {
            setPlaceSaving(false);
        }
    }

    function startEditPlace(p: PlaceOption) {
        setEditingPlaceId(p.id);
        setPlaceDestinationId(p.destination_id ?? "");
        setPlaceName(p.name);
        setPlaceCategory(p.category ?? "");
        setPlaceLat(p.lat?.toString() ?? "");
        setPlaceLng(p.lng?.toString() ?? "");
        setPlaceTags(tagsToString(p.tags));
        setPlaceDescription(p.description ?? "");
        setPlacePopularity(p.popularity?.toString() ?? "");
        setPlaceCostTypical(p.cost_typical?.toString() ?? "");
        setPlaceCostCurrency(p.cost_currency ?? "");
        setPlaceKind(p.kind ?? "poi");
        setPlaceUrl(p.url ?? "");
        setPlaceBookingUrl(p.booking_url ?? "");
        setPlaceIsPartner(p.is_partner ?? false);
        setIsPlaceDialogOpen(true);
    }

    async function handleDeletePlace(id: string) {
        if (!confirm("Delete this place?")) return;
        try {
            const { error } = await sb
                .schema('itinero')
                .from("places").delete().eq("id", id);
            if (error) {
                console.error(error);
                toast.error("Failed to delete place", { description: error.message });
                return;
            }

            setPlaces((prev) => prev.filter((p) => p.id !== id));
            toast.success("Place deleted");
        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Failed to delete place", { description: msg });
        }
    }

    /* --- Derived --- */
    const filteredPlaces = React.useMemo(() => {
        let result = places;

        if (placeFilterDestId && placeFilterDestId !== "all") {
            result = result.filter((p) => p.destination_id === placeFilterDestId);
        }

        if (placeSearch.trim()) {
            const q = placeSearch.trim().toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    (p.category ?? "").toLowerCase().includes(q) ||
                    (p.tags || []).some(t => t.toLowerCase().includes(q))
            );
        }

        return result;
    }, [places, placeSearch, placeFilterDestId]);

    const paginatedPlaces = React.useMemo(() => {
        const start = (placesPage - 1) * placesPageSize;
        const end = start + placesPageSize;
        return filteredPlaces.slice(start, end);
    }, [filteredPlaces, placesPage, placesPageSize]);

    const totalPlacesPages = Math.ceil(filteredPlaces.length / placesPageSize);

    // Helpers
    const getKindIcon = (kind?: string) => {
        switch (kind) {
            case "restaurant": return <Utensils className="h-4 w-4" />;
            case "hotel": return <BedDouble className="h-4 w-4" />;
            case "activity": return <Camera className="h-4 w-4" />;
            default: return <MapPin className="h-4 w-4" />;
        }
    };

    return (
        <div className="container mx-auto max-w-[1400px] p-8 space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-2">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-transparent">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        <span>Administration</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="capitalize text-blue-600 dark:text-blue-400">Places</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Curate Places
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Curate places, attractions, and hotels for each destination.
                    </p>
                </div>
            </header>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="relative w-72 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name, tag..."
                                className="pl-10 h-11 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-blue-500 hover:border-blue-200 transition-colors"
                                value={placeSearch}
                                onChange={(e) => setPlaceSearch(e.target.value)}
                            />
                        </div>

                        <Select value={placeFilterDestId} onValueChange={setPlaceFilterDestId}>
                            <SelectTrigger className="w-[200px] h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-blue-500">
                                <SelectValue placeholder="Filter by Destination" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Destinations</SelectItem>
                                {destinations.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Dialog open={isPlaceDialogOpen} onOpenChange={setIsPlaceDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetPlaceForm}
                                className="h-11 px-6 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5">
                                <Plus className="h-4 w-4" />
                                Add Place
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col p-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 gap-0">
                            <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    {editingPlaceId ? <Pencil className="h-4 w-4 text-blue-500" /> : <Plus className="h-4 w-4 text-blue-500" />}
                                    {editingPlaceId ? "Edit Place" : "Create New Place"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500">
                                    Fill in the details below to {editingPlaceId ? "update the" : "create a new"} place.
                                </DialogDescription>
                            </DialogHeader>

                            <form id="place-form" onSubmit={handleSavePlace} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                                    <div className="grid gap-8">
                                        {/* Basic Info */}
                                        <div className="grid gap-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                                                <Info className="h-4 w-4 text-blue-500" />
                                                Core Information
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                        Destination (Required)
                                                    </Label>
                                                    <Select
                                                        value={placeDestinationId}
                                                        onValueChange={setPlaceDestinationId}
                                                    >
                                                        <SelectTrigger
                                                            className="bg-white border-slate-200 rounded-xl dark:bg-slate-950 dark:border-slate-800 h-10">
                                                            <SelectValue placeholder="Select a destination" />
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
                                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                                    <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                                        Type of Place
                                                    </Label>
                                                    <Select value={placeKind} onValueChange={setPlaceKind}>
                                                        <SelectTrigger
                                                            className="bg-white border-slate-200 rounded-xl dark:bg-slate-950 dark:border-slate-800 h-10">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="poi">Point of Interest (POI)</SelectItem>
                                                            <SelectItem value="restaurant">Restaurant / Bar</SelectItem>
                                                            <SelectItem value="hotel">Hotel / Accommodation</SelectItem>
                                                            <SelectItem value="activity">Activity / Tour</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="col-span-2">
                                                    <FormInput
                                                        label="Name (Required)"
                                                        value={placeName}
                                                        onChange={setPlaceName}
                                                        placeholder="e.g. Eiffel Tower"
                                                    />
                                                </div>

                                                <div className="col-span-2">
                                                    <FormTextarea
                                                        label="Overview / Description"
                                                        value={placeDescription}
                                                        onChange={setPlaceDescription}
                                                        placeholder="A brief overview of the place..."
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details & Location */}
                                        <div className="grid sm:grid-cols-2 gap-8">
                                            {/* Left Column: Stats & Tags */}
                                            <div className="grid gap-4 content-start">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                                                    <Tag className="h-4 w-4 text-purple-500" />
                                                    Classification
                                                </div>
                                                <FormInput
                                                    label="Category (Sub-type)"
                                                    value={placeCategory}
                                                    onChange={setPlaceCategory}
                                                    placeholder="Landmark, Cafe, Museum..."
                                                />
                                                <FormInput
                                                    label="Tags (comma separated)"
                                                    value={placeTags}
                                                    onChange={setPlaceTags}
                                                    placeholder="romantic, view, history"
                                                />
                                                <FormInput
                                                    label="Popularity (0-100)"
                                                    value={placePopularity}
                                                    onChange={setPlacePopularity}
                                                    placeholder="85"
                                                    type="number"
                                                />
                                            </div>

                                            {/* Right Column: Location & Cost */}
                                            <div className="grid gap-4 content-start">
                                                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                        <MapPin className="h-4 w-4 text-emerald-500" />
                                                        Location & Cost
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isGeocoding}
                                                        onClick={handleGeocode}
                                                        className="h-8 text-xs gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    >
                                                        {isGeocoding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                                                        Find Coordinates
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <FormInput
                                                        label="Latitude"
                                                        value={placeLat}
                                                        onChange={setPlaceLat}
                                                        placeholder="48.8584"
                                                    />
                                                    <FormInput
                                                        label="Longitude"
                                                        value={placeLng}
                                                        onChange={setPlaceLng}
                                                        placeholder="2.2945"
                                                    />
                                                </div>
                                                {placeLat && placeLng && (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${placeLat},${placeLng}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 w-fit mt-1"
                                                    >
                                                        <ExternalLink className="h-2.5 w-2.5" /> Verify on Google Maps
                                                    </a>
                                                )}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <FormInput
                                                        label="Cost Typical"
                                                        value={placeCostTypical}
                                                        onChange={setPlaceCostTypical}
                                                        placeholder="20"
                                                        type="number"
                                                    />
                                                    <FormInput
                                                        label="Currency"
                                                        value={placeCostCurrency}
                                                        onChange={setPlaceCostCurrency}
                                                        placeholder="EUR"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* External Links */}
                                        <div className="grid gap-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                                                <LinkIcon className="h-4 w-4 text-orange-500" />
                                                External Links & Partner Status
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <FormInput
                                                    label="Website URL"
                                                    value={placeUrl}
                                                    onChange={setPlaceUrl}
                                                    placeholder="https://..."
                                                />
                                                <FormInput
                                                    label="Booking URL"
                                                    value={placeBookingUrl}
                                                    onChange={setPlaceBookingUrl}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div className="flex items-center space-x-3 pt-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <Checkbox
                                                    id="is_partner"
                                                    checked={placeIsPartner}
                                                    onCheckedChange={(c) => setPlaceIsPartner(!!c)}
                                                />
                                                <div className="grid gap-1">
                                                    <Label htmlFor="is_partner"
                                                        className="text-sm font-medium leading-none cursor-pointer">
                                                        Is Partner / Promoted?
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Promoted places will be highlighted and may appear higher in lists.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hours */}
                                        <div className="grid gap-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                                                <Clock className="h-4 w-4 text-blue-500" />
                                                Operating Hours
                                            </div>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => {
                                                    const hour = placeHours.find((h) => h.day_of_week === idx);
                                                    const isOpen = !!hour;
                                                    return (
                                                        <div key={idx}
                                                            className={cn(
                                                                "flex items-center justify-between p-3 rounded-xl border transition-all",
                                                                isOpen
                                                                    ? "bg-white border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800"
                                                                    : "bg-slate-50 border-transparent dark:bg-slate-950 opacity-70"
                                                            )}>
                                                            <div className="flex items-center gap-3">
                                                                <Checkbox
                                                                    checked={isOpen}
                                                                    onCheckedChange={(checked) => toggleClosed(idx, !checked)}
                                                                />
                                                                <span className="text-sm font-medium w-8 text-slate-700 dark:text-slate-300">{dayName}</span>
                                                            </div>

                                                            {isOpen ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        type="time"
                                                                        value={hour.open_time?.slice(0, 5) ?? ""}
                                                                        onChange={(e) => updateHour(idx, "open", e.target.value)}
                                                                        className="h-8 w-[84px] text-xs bg-transparent border-slate-200 px-2"
                                                                    />
                                                                    <span className="text-slate-400 text-[10px]">—</span>
                                                                    <Input
                                                                        type="time"
                                                                        value={hour.close_time?.slice(0, 5) ?? ""}
                                                                        onChange={(e) => updateHour(idx, "close", e.target.value)}
                                                                        className="h-8 w-[84px] text-xs bg-transparent border-slate-200 px-2"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-slate-400 font-medium px-2">Closed</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <Button type="button" variant="outline" onClick={() => setIsPlaceDialogOpen(false)} className="mr-2">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={placeSaving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                                        {placeSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingPlaceId ? "Save Changes" : "Create Place"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-950 rounded-xl">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                                <TableHead className="font-semibold text-slate-500 w-[200px]">Name</TableHead>
                                <TableHead className="font-semibold text-slate-500">Destination</TableHead>
                                <TableHead className="font-semibold text-slate-500">Category & Kind</TableHead>
                                <TableHead className="font-semibold text-slate-500">Tags</TableHead>
                                <TableHead className="text-right font-semibold text-slate-500">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPlaces.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}
                                        className="h-24 text-center text-muted-foreground">
                                        No places found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedPlaces.map((p) => {
                                    const destName = destinations.find(d => d.id === p.destination_id)?.name || "-";
                                    return (
                                        <TableRow key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-500">
                                                        {getKindIcon(p.kind)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-slate-900 dark:text-slate-100">{p.name}</span>
                                                        {p.is_partner && (
                                                            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                                                                Partner
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{destName}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 items-start">
                                                    {p.category && (
                                                        <Badge variant="outline" className="capitalize font-normal text-slate-600">
                                                            {p.category}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-slate-400 capitalize">{p.kind}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {p.tags?.slice(0, 3).map((tag, i) => (
                                                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {p.tags && p.tags.length > 3 && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-400">+{p.tags.length - 3}</span>
                                                    )}
                                                </div>
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
                                                        <DropdownMenuItem onClick={() => startEditPlace(p)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeletePlace(p.id)}
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

                {/* Pagination Controls */}
                {filteredPlaces.length > placesPageSize && (
                    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-4 bg-white dark:bg-slate-950 rounded-b-lg">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-medium text-slate-900 dark:text-slate-200">{(placesPage - 1) * placesPageSize + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(placesPage * placesPageSize, filteredPlaces.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{filteredPlaces.length}</span> entries
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPlacesPage((p) => Math.max(1, p - 1))}
                                disabled={placesPage === 1}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Previous</span>
                            </Button>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200 min-w-[3rem] text-center">
                                {placesPage} / {totalPlacesPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPlacesPage((p) => Math.min(totalPlacesPages, p + 1))}
                                disabled={placesPage === totalPlacesPages}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Next</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
