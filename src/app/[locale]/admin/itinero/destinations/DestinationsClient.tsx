
"use client";

import * as React from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Card,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Globe,
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Map as MapIcon,
    ImageIcon,
    MapPin,
    Info,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { DestinationOption } from "../types";
import { FormInput, TableImage } from "@/components/admin/AdminShared";
import { ScrollArea } from "@/components/ui/scroll-area";

type DestinationsClientProps = {
    initialDestinations: DestinationOption[];
};

export default function DestinationsClient({
    initialDestinations,
}: DestinationsClientProps) {
    const sb = React.useMemo(() => getSupabaseBrowser(), []);

    const [destinations, setDestinations] = React.useState<DestinationOption[]>(
        initialDestinations
    );

    /* ------------ Destinations form state ------------ */
    const [isDestDialogOpen, setIsDestDialogOpen] = React.useState(false);
    const [destName, setDestName] = React.useState("");
    const [destLat, setDestLat] = React.useState<string>("");
    const [destLng, setDestLng] = React.useState<string>("");
    const [destCountry, setDestCountry] = React.useState("");
    const [destImageUrl, setDestImageUrl] = React.useState("");
    const [destImageAttribution, setDestImageAttribution] = React.useState("");
    const [destTimezone, setDestTimezone] = React.useState("");
    const [destCategory, setDestCategory] = React.useState("");
    const [destPopularity, setDestPopularity] = React.useState<string>("");
    const [destSaving, setDestSaving] = React.useState(false);
    const [editingDestId, setEditingDestId] = React.useState<string | null>(null);
    const [destSearch, setDestSearch] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(1);
    const pageSize = 10;

    const [isGeocoding, setIsGeocoding] = React.useState(false);

    async function handleGeocode() {
        if (!destName.trim()) {
            toast.error("Please enter a destination name first");
            return;
        }

        setIsGeocoding(true);
        try {
            const query = encodeURIComponent(`${destName}${destCountry ? `, ${destCountry}` : ""}`);
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            const data = await res.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                setDestLat(parseFloat(lat).toString());
                setDestLng(parseFloat(lon).toString());

                // If country is empty, try to extract it from display_name
                if (!destCountry && display_name) {
                    const parts = display_name.split(", ");
                    const lastPart = parts[parts.length - 1];
                    // Very simple country code guess or just use the name if it's short
                    if (lastPart.length === 2) setDestCountry(lastPart.toUpperCase());
                }

                toast.success(`Found coordinates for: ${destName}`, {
                    description: `Lat: ${lat}, Lng: ${lon}`
                });
            } else {
                toast.error("Could not find coordinates for this destination");
            }
        } catch (e) {
            console.error(e);
            toast.error("Geocoding failed. Please try again or enter coordinates manually.");
        } finally {
            setIsGeocoding(false);
        }
    }

    /* --- Reset Helpers --- */
    function resetDestinationForm() {
        setDestName("");
        setDestLat("");
        setDestLng("");
        setDestCountry("");
        setDestImageUrl("");
        setDestImageAttribution("");
        setDestTimezone("");
        setDestCategory("");
        setDestPopularity("");
        setEditingDestId(null);
        setIsDestDialogOpen(false);
    }

    /* --- Effects --- */
    React.useEffect(() => {
        setCurrentPage(1);
    }, [destSearch]);

    /* --- Handlers --- */
    async function handleSaveDestination(e: React.FormEvent) {
        e.preventDefault();
        setDestSaving(true);

        const latNum = destLat ? parseFloat(destLat) : null;
        const lngNum = destLng ? parseFloat(destLng) : null;
        const popNum = destPopularity ? parseInt(destPopularity) : null;

        const payload = {
            name: destName.trim(),
            country_code: destCountry.trim() || null,
            lat: latNum,
            lng: lngNum,
            cover_url: destImageUrl.trim() || null,
            image_attribution: destImageAttribution.trim() || null,
            timezone: destTimezone.trim() || null,
            category: destCategory.trim() || null,
            popularity: popNum,
        };

        try {
            if (editingDestId) {
                // Update
                const { data, error } = await sb
                    .schema('itinero')
                    .from("destinations")
                    .update(payload)
                    .eq("id", editingDestId)
                    .select()
                    .single();

                if (error) throw error;

                setDestinations((prev) =>
                    prev.map((d) => (d.id === editingDestId ? data : d))
                );
                toast.success("Destination updated successfully");
            } else {
                // Create
                const { data, error } = await sb
                    .schema('itinero')
                    .from("destinations")
                    .insert(payload)
                    .select()
                    .single();

                if (error) throw error;
                setDestinations((prev) => [data, ...prev]);
                toast.success("Destination created successfully");
            }

            resetDestinationForm();
        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Failed to save destination", { description: msg });
        } finally {
            setDestSaving(false);
        }
    }

    function startEditDestination(d: DestinationOption) {
        setEditingDestId(d.id);
        setDestName(d.name ?? "");
        setDestCountry(d.country_code ?? "");
        setDestLat(d.lat?.toString() ?? "");
        setDestLng(d.lng?.toString() ?? "");
        setDestImageUrl(d.cover_url ?? "");
        setDestImageAttribution(d.image_attribution ?? "");
        setDestTimezone(d.timezone ?? "");
        setDestCategory(d.category ?? "");
        setDestPopularity(d.popularity ? String(d.popularity) : "");
        setIsDestDialogOpen(true);
    }

    async function handleDeleteDestination(id: string) {
        if (!confirm("Delete this destination?")) return;
        try {
            const { error } = await sb
                .schema("itinero").from("destinations").delete().eq("id", id);
            if (error) {
                console.error(error);
                toast.error("Failed to delete destination", { description: error.message });
                return;
            }

            setDestinations((prev) => prev.filter((d) => d.id !== id));
            toast.success("Destination deleted");

        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Unexpected error deleting destination.", { description: msg });
        }
    }

    /* --- Derived --- */
    const filteredDestinations = React.useMemo(() => {
        if (!destSearch.trim()) return destinations;
        const q = destSearch.trim().toLowerCase();
        return destinations.filter(
            (d) =>
                (d.name ?? "").toLowerCase().includes(q) ||
                (d.country_code ?? "").toLowerCase().includes(q)
        );
    }, [destinations, destSearch]);

    const paginatedDestinations = React.useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredDestinations.slice(start, end);
    }, [filteredDestinations, currentPage]);

    const totalPages = Math.ceil(filteredDestinations.length / pageSize);

    return (
        <div className="container mx-auto max-w-[1400px] p-8 space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-2">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-transparent">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        <span>Administration</span>
                        <ChevronRight className="h-3 w-3" />
                        <span className="capitalize text-blue-600 dark:text-blue-400">Destinations</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Manage Destinations
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Create, update, and manage your travel destinations and their metadata.
                    </p>
                </div>
            </header>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search destinations..."
                            className="pl-10 h-11 rounded-xl border-border bg-white dark:bg-slate-950 shadow-sm focus-visible:ring-blue-500 hover:border-blue-200 transition-colors"
                            value={destSearch}
                            onChange={(e) => setDestSearch(e.target.value)}
                        />
                    </div>
                    <Dialog open={isDestDialogOpen} onOpenChange={setIsDestDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetDestinationForm}
                                className="h-11 px-6 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5">
                                <Plus className="h-4 w-4" />
                                Add Destination
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 gap-0">
                            <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    {editingDestId ? <Pencil className="h-4 w-4 text-blue-500" /> : <Plus className="h-4 w-4 text-blue-500" />}
                                    {editingDestId ? "Edit Destination" : "Create New Destination"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500">
                                    Fill in the details below to {editingDestId ? "update the" : "create a new"} destination.
                                </DialogDescription>
                            </DialogHeader>

                            <form id="dest-form" onSubmit={handleSaveDestination} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                                    <div className="grid gap-8">
                                        {/* Basic Info Section */}
                                        <div className="grid gap-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                                                <Info className="h-4 w-4 text-blue-500" />
                                                Basic Information
                                            </div>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="sm:col-span-2">
                                                    <FormInput
                                                        label="Destination Name"
                                                        value={destName}
                                                        onChange={setDestName}
                                                        placeholder="e.g. Kyoto"
                                                    />
                                                </div>
                                                <FormInput
                                                    label="Country Code"
                                                    value={destCountry}
                                                    onChange={setDestCountry}
                                                    placeholder="JP"
                                                />
                                                <FormInput
                                                    label="Category"
                                                    value={destCategory}
                                                    onChange={setDestCategory}
                                                    placeholder="City, Island, etc."
                                                />
                                                <FormInput
                                                    label="Popularity Score"
                                                    value={destPopularity}
                                                    onChange={setDestPopularity}
                                                    placeholder="0-100"
                                                    type="number"
                                                />
                                                <FormInput
                                                    label="Timezone"
                                                    value={destTimezone}
                                                    onChange={setDestTimezone}
                                                    placeholder="Asia/Tokyo"
                                                />
                                            </div>
                                        </div>

                                        {/* Location Section */}
                                        <div className="grid gap-4">
                                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                    <MapPin className="h-4 w-4 text-emerald-500" />
                                                    Geographic Location
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
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <FormInput
                                                    label="Latitude"
                                                    value={destLat}
                                                    onChange={setDestLat}
                                                    placeholder="35.0116"
                                                    type="number"
                                                />
                                                <FormInput
                                                    label="Longitude"
                                                    value={destLng}
                                                    onChange={setDestLng}
                                                    placeholder="135.7681"
                                                    type="number"
                                                />
                                                {destLat && destLng && (
                                                    <div className="sm:col-span-2">
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 w-fit"
                                                        >
                                                            <ExternalLink className="h-2.5 w-2.5" /> Verify on Google Maps
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Media Section */}
                                        <div className="grid gap-4">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                                                <ImageIcon className="h-4 w-4 text-purple-500" />
                                                Media Assets
                                            </div>
                                            <FormInput
                                                label="Cover Image URL"
                                                value={destImageUrl}
                                                onChange={setDestImageUrl}
                                                placeholder="https://images.unsplash.com/..."
                                            />

                                            {destImageUrl && (
                                                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={destImageUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover transition-all hover:scale-105"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
                                                        Preview
                                                    </div>
                                                </div>
                                            )}

                                            <FormInput
                                                label="Image Attribution"
                                                value={destImageAttribution}
                                                onChange={setDestImageAttribution}
                                                placeholder="Photo by User on Unsplash"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <Button type="button" variant="outline" onClick={() => setIsDestDialogOpen(false)} className="mr-2">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={destSaving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                                        {destSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingDestId ? "Save Changes" : "Create Destination"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="border border-border/60 shadow-sm overflow-hidden bg-white dark:bg-slate-950 rounded-xl">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow className="hover:bg-transparent border-b border-border">
                                <TableHead className="font-semibold text-slate-500 w-[250px]">Name</TableHead>
                                <TableHead className="font-semibold text-slate-500">Location</TableHead>
                                <TableHead className="font-semibold text-slate-500">Category</TableHead>
                                <TableHead className="font-semibold text-slate-500 w-[150px]">Popularity</TableHead>
                                <TableHead className="text-right font-semibold text-slate-500">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDestinations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <MapIcon className="h-8 w-8 text-slate-300" />
                                            <p>No destinations found matching your search.</p>
                                            <Button variant="link" onClick={resetDestinationForm} className="text-blue-600">
                                                Create a new destination
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedDestinations.map((d) => (
                                    <TableRow key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-border">
                                                    <TableImage url={d.cover_url} alt={d.name ?? "Destination"}
                                                        icon={Globe} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 dark:text-slate-100 font-semibold">{d.name}</span>
                                                    <span className="text-xs text-slate-500">{d.country_code}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs text-slate-500">
                                                <span>{d.timezone || '-'}</span>
                                                {d.lat && d.lng && <span className="opacity-70">{d.lat.toFixed(2)}, {d.lng.toFixed(2)}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {d.category && (
                                                <Badge variant="outline" className="capitalize font-normal text-slate-600 bg-slate-50 border-slate-200">
                                                    {d.category}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${Math.min(d.popularity || 0, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-slate-600 w-6 text-right">
                                                    {d.popularity || 0}
                                                </span>
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
                                                    <DropdownMenuItem
                                                        onClick={() => startEditDestination(d)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteDestination(d.id)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Pagination Controls */}
                {filteredDestinations.length > pageSize && (
                    <div className="flex items-center justify-between border-t border-border px-4 py-4 bg-white dark:bg-slate-950 rounded-b-lg">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Showing <span className="font-medium text-slate-900 dark:text-slate-200">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(currentPage * pageSize, filteredDestinations.length)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{filteredDestinations.length}</span> entries
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Previous</span>
                            </Button>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-200 min-w-[3rem] text-center">
                                {currentPage} / {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
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
