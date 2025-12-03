"use client";

import * as React from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {getSupabaseBrowser} from "@/lib/supabase/browser-singleton";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";
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
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import {Checkbox} from "@/components/ui/checkbox";
import {Badge} from "@/components/ui/badge";
import {
    Loader2,
    MapPin,
    Globe,
    Plus,
    Database,
    Pencil,
    Trash2,
    Search,
    Flag,
    History,
    MoreHorizontal,
    LayoutDashboard,
    ArrowLeft,
    Filter,
    Clock,
    ChevronRight,
} from "lucide-react";
import {toast} from "sonner";
import {cn} from "@/lib/utils";

/* =====================================================
   Types
===================================================== */

export type DestinationOption = {
    id: string;
    name: string | null;
    country_code?: string | null;
    lat?: number | null;
    lng?: number | null;
    cover_url?: string | null;
    image_attribution?: string | null;
    current_history_id?: string | null;
    timezone?: string | null;
    category?: string | null;
    popularity?: number | null;
};

export type PlaceOption = {
    id: string;
    name: string;
    category?: string | null;
    lat?: number | null;
    lng?: number | null;
    tags?: string[] | null;
    description?: string | null;
    destination_id?: string | null;
    popularity?: number | null;
    cost_typical?: number | null;
    cost_currency?: string | null;
    kind?: string;
    url?: string | null;
    booking_url?: string | null;
    is_partner?: boolean;
};

export type PlaceHour = {
    id?: string;
    place_id?: string;
    day_of_week: number; // 0=Sun, 1=Mon...
    open_time: string | null; // "HH:MM:SS" or "HH:MM"
    close_time: string | null;
};

type ItineroDashboardClientProps = {
    initialDestinations: DestinationOption[];
    initialPlaces: PlaceOption[];
};

type KbygPayload = {
    currency?: string;
    plugs?: string;
    languages?: string[] | string;
    getting_around?: string;
    esim?: string;
    primary_city?: string;
};

type DestinationHistoryPayload = {
    about?: string;
    history?: string;
    kbyg?: KbygPayload;
};

type DestinationHistoryRowUI = {
    id: string;
    destination_id: string;
    section: string | null;
    content: string;
    payload: DestinationHistoryPayload | null;
    created_at: string | null;
    backdrop_image_url?: string | null;
    backdrop_image_attribution?: string | null;
};

/* =====================================================
   Component
===================================================== */

export default function ItineroDashboardClient({
                                                   initialDestinations,
                                                   initialPlaces,
                                               }: ItineroDashboardClientProps) {
    const sb = React.useMemo(() => getSupabaseBrowser(), []);

    const [destinations, setDestinations] = React.useState<DestinationOption[]>(
        initialDestinations
    );
    const [places, setPlaces] = React.useState<PlaceOption[]>(initialPlaces);

    const [activeTab, setActiveTab] = React.useState<"destinations" | "history" | "places">("destinations");

    /* ------------ Destinations form state ------------ */
    const [isDestSheetOpen, setIsDestSheetOpen] = React.useState(false);
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

    /* ------------ Destination history form state ------------ */
    const [histDestinationId, setHistDestinationId] =
        React.useState<string>("");
    const [histContent, setHistContent] = React.useState("");
    const [histAbout, setHistAbout] = React.useState("");
    const [histHistory, setHistHistory] = React.useState("");
    const [histCurrency, setHistCurrency] = React.useState("");
    const [histPlugs, setHistPlugs] = React.useState("");
    const [histLanguages, setHistLanguages] = React.useState("");
    const [histGettingAround, setHistGettingAround] = React.useState("");
    const [histEsim, setHistEsim] = React.useState("");
    const [histPrimaryCity, setHistPrimaryCity] = React.useState("");
    const [histBackdropUrl, setHistBackdropUrl] = React.useState("");
    const [histBackdropAttribution, setHistBackdropAttribution] =
        React.useState("");
    const [histSaving, setHistSaving] = React.useState(false);
    const [histSearch, setHistSearch] = React.useState("");

    const [historyList, setHistoryList] = React.useState<
        DestinationHistoryRowUI[]
    >([]);
    const [histLoadingList, setHistLoadingList] = React.useState(false);
    const [isHistorySheetOpen, setIsHistorySheetOpen] = React.useState(false);
    const [editingHistId, setEditingHistId] =
        React.useState<string | null>(null);


    /* ------------ Places form state ------------ */
    const [isPlaceSheetOpen, setIsPlaceSheetOpen] = React.useState(false);
    const [placeDestinationId, setPlaceDestinationId] =
        React.useState<string>("");
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

    // Hours state: 0=Sun, 1=Mon, ..., 6=Sat
    // We'll store them in a map or array. Let's use an array of objects for the form.
    const [placeHours, setPlaceHours] = React.useState<PlaceHour[]>([]);
    const [hoursLoading, setHoursLoading] = React.useState(false);

    const [placeSaving, setPlaceSaving] = React.useState(false);
    const [editingPlaceId, setEditingPlaceId] = React.useState<string | null>(
        null
    );
    const [placeSearch, setPlaceSearch] = React.useState("");
    const [placeFilterDestId, setPlaceFilterDestId] = React.useState<string>("all");

    /* --- Reset Helpers --- */

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
        setIsDestSheetOpen(false);
    }

    function resetHistoryForm() {
        setHistContent("");
        setHistAbout("");
        setHistHistory("");
        setHistCurrency("");
        setHistPlugs("");
        setHistLanguages("");
        setHistGettingAround("");
        setHistEsim("");
        setHistPrimaryCity("");
        setHistBackdropUrl("");
        setHistBackdropAttribution("");
        setEditingHistId(null);
        setEditingHistId(null);
        setIsHistorySheetOpen(false);
    }

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
        setEditingPlaceId(null);
        setIsPlaceSheetOpen(false);
    }

    function tagsToString(tags?: string[] | null): string {
        return tags && tags.length ? tags.join(", ") : "";
    }

    function formatDateShort(iso?: string | null): string {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "2-digit",
            });
        } catch {
            return iso;
        }
    }

    function parseDays(v: string): number {
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? Math.round(n) : 1;
    }

    /* --- Effects --- */

    // Load history entries when History tab destination changes
    React.useEffect(() => {
        if (!histDestinationId) {
            setHistoryList([]);
            resetHistoryForm();
            return;
        }
        (async () => {
            setHistLoadingList(true);
            try {
                const {data, error} = await sb
                    .schema("itinero")
                    .from("destination_history")
                    .select(
                        "id,destination_id,section,payload,created_at,backdrop_image_url,backdrop_image_attribution"
                    )
                    .eq("destination_id", histDestinationId)
                    .order("created_at", {ascending: false});

                if (error) {
                    console.error("Failed to load history:", error);
                    toast.error("Failed to load history", {description: error.message});
                    setHistoryList([]);
                    return;
                }
                setHistoryList((data as DestinationHistoryRowUI[]) ?? []);
            } catch (e: unknown) {
                console.error(e);
                const msg = e instanceof Error ? e.message : String(e);
                toast.error("Unexpected error loading history", {description: msg});
                setHistoryList([]);
            } finally {
                setHistLoadingList(false);
            }
        })();
    }, [histDestinationId, sb]);


    // Load place hours when editingPlaceId changes
    React.useEffect(() => {
        if (!editingPlaceId) {
            setPlaceHours([]);
            return;
        }
        (async () => {
            setHoursLoading(true);
            try {
                const {data, error} = await sb
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
            } finally {
                setHoursLoading(false);
            }
        })();
    }, [editingPlaceId, sb]);

    /* --- Handlers: Destinations --- */

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
                const {data, error} = await sb
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
                const {data, error} = await sb
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
            toast.error("Failed to save destination", {description: msg});
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
        setIsDestSheetOpen(true);
    }

    async function handleDeleteDestination(id: string) {
        if (!confirm("Delete this destination?")) return;
        try {
            const {error} = await sb
                .schema("itinero").from("destinations").delete().eq("id", id);
            if (error) {
                console.error(error);
                toast.error("Failed to delete destination", {description: error.message});
                return;
            }

            setDestinations((prev) => prev.filter((d) => d.id !== id));
            toast.success("Destination deleted");

            // Also clean dependent state
            if (histDestinationId === id) {
                setHistDestinationId("");
            }
            if (placeDestinationId === id) {
                setPlaceDestinationId("");
            }

        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Unexpected error deleting destination.", {description: msg});
        }
    }


    /* --- Handlers: History / KBYG --- */

    async function handleSaveHistory(e: React.FormEvent) {
        e.preventDefault();
        if (!histDestinationId) {
            toast.error("Select a destination first.");
            return;
        }

        setHistSaving(true);
        try {
            const languagesVal =
                histLanguages.trim() === ""
                    ? undefined
                    : histLanguages
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);

            const payload: DestinationHistoryPayload = {
                about: histAbout.trim() || undefined,
                history: histHistory.trim() || undefined,
                kbyg: {
                    currency: histCurrency.trim() || undefined,
                    plugs: histPlugs.trim() || undefined,
                    languages: languagesVal,
                    getting_around: histGettingAround.trim() || undefined,
                    esim: histEsim.trim() || undefined,
                    primary_city: histPrimaryCity.trim() || undefined,
                },
            };

            if (editingHistId) {
                const {data, error} = await sb
                    .from("destination_history")
                    .update({
                        content: histContent.trim(),
                        payload,
                        backdrop_image_url: histBackdropUrl.trim() || null,
                        backdrop_image_attribution:
                            histBackdropAttribution.trim() || null,
                    })
                    .eq("id", editingHistId)
                    .select(
                        "id,destination_id,section,content,payload,created_at,backdrop_image_url,backdrop_image_attribution"
                    )
                    .single();

                if (error) throw error;

                setHistoryList((prev) =>
                    prev.map((h) =>
                        h.id === editingHistId
                            ? data
                            : h
                    )
                );
                toast.success("History entry updated successfully");
            } else {
                const {data, error} = await sb
                    .from("destination_history")
                    .insert({
                        destination_id: histDestinationId,
                        section: "kbyg",
                        content: histContent.trim(),
                        payload,
                        backdrop_image_url: histBackdropUrl.trim() || null,
                        backdrop_image_attribution:
                            histBackdropAttribution.trim() || null,
                    })
                    .select(
                        "id,destination_id,section,content,payload,created_at,backdrop_image_url,backdrop_image_attribution"
                    )
                    .single();

                if (error) throw error;

                setHistoryList((prev) => [
                    data,
                    ...prev,
                ]);
                toast.success("History entry created successfully");
            }

            resetHistoryForm();
        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Failed to save history entry", {description: msg});
        } finally {
            setHistSaving(false);
        }
    }

    function startEditHistory(h: DestinationHistoryRowUI) {
        setEditingHistId(h.id);
        setHistContent(h.content ?? "");
        const payload = h.payload ?? {};
        setHistAbout(payload.about ?? "");
        setHistHistory(payload.history ?? "");

        const k = payload.kbyg ?? {};
        setHistCurrency(k.currency ?? "");
        setHistPlugs(k.plugs ?? "");
        const langs =
            Array.isArray(k.languages)
                ? (k.languages as string[]).join(", ")
                : typeof k.languages === "string"
                    ? k.languages
                    : "";
        setHistLanguages(langs);
        setHistGettingAround(k.getting_around ?? "");
        setHistEsim(k.esim ?? "");
        setHistPrimaryCity(k.primary_city ?? "");
        setHistBackdropUrl(h.backdrop_image_url ?? "");
        setHistBackdropUrl(h.backdrop_image_url ?? "");
        setHistBackdropAttribution(h.backdrop_image_attribution ?? "");
        setIsHistorySheetOpen(true);
    }

    async function handleDeleteHistory(id: string) {
        if (!confirm("Delete this history entry?")) return;
        try {
            const {error} = await sb
                .from("destination_history")
                .delete()
                .eq("id", id);

            if (error) {
                console.error(error);
                toast.error("Failed to delete history", {description: error.message});
                return;
            }

            setHistoryList((prev) => prev.filter((h) => h.id !== id));
            toast.success("History entry deleted");
            if (editingHistId === id) {
                resetHistoryForm();
            }
        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Failed to delete history entry", {description: msg});
        }
    }

    async function handleSetCurrentHistory(h: DestinationHistoryRowUI) {
        try {
            const {error} = await sb
                .schema('itinero')
                .from("destinations")
                .update({current_history_id: h.id})
                .eq("id", h.destination_id);

            if (error) {
                console.error(error);
                toast.error("Failed to set current history", {description: error.message});
                return;
            }

            setDestinations(prev => prev.map(d =>
                d.id === h.destination_id
                    ? {...d, current_history_id: h.id}
                    : d
            ));
            toast.success("Set as current history for destination");
        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Unexpected error", {description: msg});
        }
    }

    /* --- Handlers: Places --- */

    function updateHour(day: number, field: "open" | "close", value: string) {
        setPlaceHours((prev) => {
            const existing = prev.find((h) => h.day_of_week === day);
            if (existing) {
                return prev.map((h) =>
                    h.day_of_week === day
                        ? {...h, [field === "open" ? "open_time" : "close_time"]: value}
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
            // Remove entry or set times to null
            setPlaceHours((prev) => prev.filter((h) => h.day_of_week !== day));
        } else {
            // Add entry with default times? Or just empty?
            // Let's add empty
            setPlaceHours((prev) => [
                ...prev,
                {day_of_week: day, open_time: "", close_time: ""},
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
                const {data, error} = await sb
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
                    const {error: hoursError} = await sb
                        .from("place_hours")
                        .insert(hoursPayload);

                    if (hoursError) {
                        console.error("Error saving hours:", hoursError);
                        toast.error("Place updated, but error saving hours.");
                    }
                }
            } else {
                // Create
                const {data, error} = await sb
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
                    const {error: hoursError} = await sb
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
            toast.error("Failed to save place", {description: msg});
        } finally {
            setPlaceSaving(false);
        }
    }

    function startEditPlace(p: PlaceOption) {
        setEditingPlaceId(p.id);
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
        setIsPlaceSheetOpen(true);
    }

    async function handleDeletePlace(id: string) {
        if (!confirm("Delete this place?")) return;
        try {
            const {error} = await sb.from("places").delete().eq("id", id);
            if (error) {
                console.error(error);
                toast.error("Failed to delete place", {description: error.message});
                return;
            }

            setPlaces((prev) => prev.filter((p) => p.id !== id));
            toast.success("Place deleted");
        } catch (e: unknown) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Failed to delete place", {description: msg});
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

    const filteredPlaces = React.useMemo(() => {
        if (!placeSearch.trim()) return places;
        const q = placeSearch.trim().toLowerCase();
        return places.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.category ?? "").toLowerCase().includes(q)
        );
    }, [places, placeSearch]);

    const filteredHistory = React.useMemo(() => {
        if (!histSearch.trim()) return historyList;
        const q = histSearch.trim().toLowerCase();
        return historyList.filter((h) => {
            const destName = destinations.find(d => d.id === h.destination_id)?.name || "";
            return destName.toLowerCase().includes(q) || h.content.toLowerCase().includes(q);
        });
    }, [historyList, histSearch, destinations]);

    const visiblePlaces = React.useMemo(() => {
        let list = places;
        if (placeDestinationId)
            list = list.filter(
                (p) => p.destination_id === placeDestinationId
            );
        if (placeSearch.trim()) {
            const q = placeSearch.trim().toLowerCase();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    (p.category ?? "").toLowerCase().includes(q)
            );
        }
        if (placeFilterDestId && placeFilterDestId !== "all") {
            list = list.filter((p) => p.destination_id === placeFilterDestId);
        }
        return list;
    }, [places, placeDestinationId, placeSearch, placeFilterDestId]);

    const selectedDestLabel =
        destinations.find((d) => d.id === placeDestinationId)?.name ??
        "Select destination";

    /* --- Render --- */
    return (
        <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <aside
                className="w-64 flex-shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
                        <LayoutDashboard className="h-5 w-5 text-blue-600"/>
                        Itinero Admin
                    </div>
                </div>
                <nav className="p-4 space-y-1">
                    <Button
                        variant={activeTab === "destinations" ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start gap-3",
                            activeTab === "destinations" && "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        )}
                        onClick={() => setActiveTab("destinations")}
                    >
                        <Globe className="h-4 w-4"/>
                        Destinations
                    </Button>
                    <Button
                        variant={activeTab === "places" ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start gap-3",
                            activeTab === "places" && "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        )}
                        onClick={() => setActiveTab("places")}
                    >
                        <MapPin className="h-4 w-4"/>
                        Places
                    </Button>
                    <Button
                        variant={activeTab === "history" ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start gap-3",
                            activeTab === "history" && "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        )}
                        onClick={() => setActiveTab("history")}
                    >
                        <History className="h-4 w-4"/>
                        History & KBYG
                    </Button>
                </nav>
                <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800">
                    <Button variant="outline" className="w-full gap-2 justify-start text-slate-600 dark:text-slate-400"
                            asChild>
                        <a href="/admin">
                            <ArrowLeft className="h-4 w-4"/>
                            Back to Main Admin
                        </a>
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
                <div className="container mx-auto max-w-7xl px-6 py-8 space-y-8">
                    {/* Header */}
                    <header
                        className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <span>Admin</span>
                                <ChevronRight className="h-4 w-4"/>
                                <span className="font-medium text-foreground capitalize">{activeTab}</span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {activeTab === "destinations" && "Destinations"}
                                {activeTab === "places" && "Places"}
                                {activeTab === "history" && "History & Content"}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                {activeTab === "destinations" && "Manage your travel destinations and their metadata."}
                                {activeTab === "places" && "Curate places, attractions, and hotels for each destination."}
                                {activeTab === "history" && "Edit rich content, history, and practical information."}
                            </p>
                        </div>
                    </header>

                    {activeTab === "destinations" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="relative w-72">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"/>
                                    <Input
                                        placeholder="Search destinations..."
                                        className="pl-9 bg-white dark:bg-slate-900"
                                        value={destSearch}
                                        onChange={(e) => setDestSearch(e.target.value)}
                                    />
                                </div>
                                <Sheet open={isDestSheetOpen} onOpenChange={setIsDestSheetOpen}>
                                    <SheetTrigger asChild>
                                        <Button onClick={resetDestinationForm}
                                                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                            <Plus className="h-4 w-4"/>
                                            Add Destination
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                                        <SheetHeader>
                                            <SheetTitle>
                                                {editingDestId ? "Edit Destination" : "New Destination"}
                                            </SheetTitle>
                                            <SheetDescription>
                                                {editingDestId
                                                    ? "Update destination details below."
                                                    : "Add a new destination to the database."}
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="py-6">
                                            <form id="dest-form" onSubmit={handleSaveDestination} className="space-y-4">
                                                <div className="space-y-4">
                                                    <div
                                                        className="font-medium text-sm text-slate-900 dark:text-white border-b pb-2">Basic
                                                        Information
                                                    </div>
                                                    <FormInput
                                                        label="Name (Required)"
                                                        value={destName}
                                                        onChange={setDestName}
                                                        placeholder="e.g. Paris"
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormInput
                                                            label="Country Code"
                                                            value={destCountry}
                                                            onChange={setDestCountry}
                                                            placeholder="FR"
                                                        />
                                                        <FormInput
                                                            label="Category"
                                                            value={destCategory}
                                                            onChange={setDestCategory}
                                                            placeholder="city, region..."
                                                        />
                                                    </div>
                                                    <FormInput
                                                        label="Popularity (0-100)"
                                                        value={destPopularity}
                                                        onChange={setDestPopularity}
                                                        placeholder="85"
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <div
                                                        className="font-medium text-sm text-slate-900 dark:text-white border-b pb-2">Location
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormInput
                                                            label="Latitude"
                                                            value={destLat}
                                                            onChange={setDestLat}
                                                            placeholder="48.8566"
                                                        />
                                                        <FormInput
                                                            label="Longitude"
                                                            value={destLng}
                                                            onChange={setDestLng}
                                                            placeholder="2.3522"
                                                        />
                                                    </div>
                                                    <FormInput
                                                        label="Timezone"
                                                        value={destTimezone}
                                                        onChange={setDestTimezone}
                                                        placeholder="Europe/Paris"
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <div
                                                        className="font-medium text-sm text-slate-900 dark:text-white border-b pb-2">Media
                                                    </div>
                                                    <FormInput
                                                        label="Cover Image URL"
                                                        value={destImageUrl}
                                                        onChange={setDestImageUrl}
                                                        placeholder="https://..."
                                                    />
                                                    <FormInput
                                                        label="Image Attribution"
                                                        value={destImageAttribution}
                                                        onChange={setDestImageAttribution}
                                                        placeholder="Photo by..."
                                                    />
                                                </div>
                                            </form>
                                        </div>
                                        <SheetFooter>
                                            <Button type="submit" form="dest-form" disabled={destSaving}>
                                                {destSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                                {editingDestId ? "Save Changes" : "Create Destination"}
                                            </Button>
                                        </SheetFooter>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            <Card className="border-0 shadow-none">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Country</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Popularity</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDestinations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5}
                                                           className="h-24 text-center text-muted-foreground">
                                                    No destinations found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredDestinations.map((d) => (
                                                <TableRow key={d.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <TableImage url={d.cover_url} alt={d.name ?? "Destination"}
                                                                        icon={Globe}/>
                                                            {d.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{d.country_code}</TableCell>
                                                    <TableCell>
                                                        {d.category && (
                                                            <Badge variant="outline" className="capitalize">
                                                                {d.category}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{d.popularity}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4"/>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem
                                                                    onClick={() => startEditDestination(d)}>
                                                                    <Pencil className="mr-2 h-4 w-4"/>
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator/>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteDestination(d.id)}
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4"/>
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
                        </div>
                    )}

                    {/* Placeholder for other tabs to be implemented next */}
                    {activeTab === "places" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="relative w-72 flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"/>
                                        <Input
                                            placeholder="Search places..."
                                            className="pl-9 bg-white dark:bg-slate-900"
                                            value={placeSearch}
                                            onChange={(e) => setPlaceSearch(e.target.value)}
                                        />
                                    </div>
                                    <Select value={placeFilterDestId} onValueChange={setPlaceFilterDestId}>
                                        <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900">
                                            <SelectValue placeholder="Filter by Destination"/>
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
                                <Sheet open={isPlaceSheetOpen} onOpenChange={setIsPlaceSheetOpen}>
                                    <SheetTrigger asChild>
                                        <Button onClick={resetPlaceForm}
                                                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                            <Plus className="h-4 w-4"/>
                                            Add Place
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
                                        <SheetHeader>
                                            <SheetTitle>
                                                {editingPlaceId ? "Edit Place" : "New Place"}
                                            </SheetTitle>
                                            <SheetDescription>
                                                {editingPlaceId
                                                    ? "Update place details below."
                                                    : "Add a new place to the database."}
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="py-6">
                                            <form id="place-form" onSubmit={handleSavePlace} className="space-y-4">
                                                <div className="space-y-4">
                                                    <div
                                                        className="font-medium text-sm text-slate-900 dark:text-white border-b pb-2">Basic
                                                        Info
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label
                                                            className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                            Destination (Required)
                                                        </Label>
                                                        <Select
                                                            value={placeDestinationId}
                                                            onValueChange={setPlaceDestinationId}
                                                        >
                                                            <SelectTrigger
                                                                className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                                                                <SelectValue placeholder="Select a destination"/>
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

                                                    <FormInput
                                                        label="Name (Required)"
                                                        value={placeName}
                                                        onChange={setPlaceName}
                                                        placeholder="e.g. Eiffel Tower"
                                                    />
                                                    <FormTextarea
                                                        label="Description"
                                                        value={placeDescription}
                                                        onChange={setPlaceDescription}
                                                        placeholder="Brief description..."
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <div
                                                        className="font-medium text-sm text-slate-900 dark:text-white border-b pb-2">Details
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormInput
                                                            label="Category"
                                                            value={placeCategory}
                                                            onChange={setPlaceCategory}
                                                            placeholder="landmark, restaurant..."
                                                        />
                                                        <div className="space-y-1.5">
                                                            <Label
                                                                className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                                Kind
                                                            </Label>
                                                            <Select value={placeKind} onValueChange={setPlaceKind}>
                                                                <SelectTrigger
                                                                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                                                                    <SelectValue/>
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="poi">POI</SelectItem>
                                                                    <SelectItem
                                                                        value="restaurant">Restaurant</SelectItem>
                                                                    <SelectItem value="hotel">Hotel</SelectItem>
                                                                    <SelectItem value="activity">Activity</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <FormInput
                                                            label="Popularity"
                                                            value={placePopularity}
                                                            onChange={setPlacePopularity}
                                                            placeholder="0-100"
                                                        />
                                                        <FormInput
                                                            label="Cost Typical"
                                                            value={placeCostTypical}
                                                            onChange={setPlaceCostTypical}
                                                            placeholder="e.g. 20"
                                                        />
                                                        <FormInput
                                                            label="Currency"
                                                            value={placeCostCurrency}
                                                            onChange={setPlaceCostCurrency}
                                                            placeholder="EUR"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div
                                                        className="font-medium text-sm text-slate-900 dark:text-white border-b pb-2">Location
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
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
                                                </div>

                                                <div className="space-y-4">
                                                    <div
                                                        className="font-medium text-sm text-slate-900 dark:text-white border-b pb-2">Links
                                                        & Media
                                                    </div>
                                                    <FormInput
                                                        label="Tags (comma separated)"
                                                        value={placeTags}
                                                        onChange={setPlaceTags}
                                                        placeholder="romantic, view, history"
                                                    />

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

                                                    <div className="flex items-center space-x-2 pt-2">
                                                        <Checkbox
                                                            id="is_partner"
                                                            checked={placeIsPartner}
                                                            onCheckedChange={(c) => setPlaceIsPartner(!!c)}
                                                        />
                                                        <Label htmlFor="is_partner"
                                                               className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            Is Partner / Promoted?
                                                        </Label>
                                                    </div>
                                                </div>

                                                <Separator/>

                                                <div className="space-y-3">
                                                    <Label
                                                        className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        Opening Hours
                                                    </Label>
                                                    <div className="space-y-2">
                                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => {
                                                            const hour = placeHours.find((h) => h.day_of_week === idx);
                                                            const isOpen = !!hour;
                                                            return (
                                                                <div key={idx}
                                                                     className="flex items-center gap-3 text-sm">
                                                                    <div
                                                                        className="w-10 font-medium text-slate-500">{dayName}</div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Checkbox
                                                                            checked={isOpen}
                                                                            onCheckedChange={(checked) => toggleClosed(idx, !checked)}
                                                                        />
                                                                        <span
                                                                            className={cn("text-xs w-12", isOpen ? "text-green-600 font-medium" : "text-slate-400")}>
                                                                            {isOpen ? "Open" : "Closed"}
                                                                        </span>
                                                                    </div>
                                                                    {isOpen && (
                                                                        <div className="flex items-center gap-2 flex-1">
                                                                            <Input
                                                                                value={hour.open_time ?? ""}
                                                                                onChange={(e) => updateHour(idx, "open", e.target.value)}
                                                                                placeholder="09:00"
                                                                                className="h-7 w-20 text-xs"
                                                                            />
                                                                            <span className="text-slate-400">-</span>
                                                                            <Input
                                                                                value={hour.close_time ?? ""}
                                                                                onChange={(e) => updateHour(idx, "close", e.target.value)}
                                                                                placeholder="17:00"
                                                                                className="h-7 w-20 text-xs"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <SheetFooter>
                                            <Button type="submit" form="place-form" disabled={placeSaving}>
                                                {placeSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                                {editingPlaceId ? "Save Changes" : "Create Place"}
                                            </Button>
                                        </SheetFooter>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            <Card className="border-0 shadow-none">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Destination</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Kind</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
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
                                            filteredPlaces.map((p) => (
                                                <TableRow key={p.id}
                                                          className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <TableImage url={null} alt={p.name} icon={MapPin}/>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    {p.is_partner && <Badge variant="secondary"
                                                                                            className="text-[10px] h-5 px-1 bg-amber-100 text-amber-700">PRO</Badge>}
                                                                    <span>{p.name}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {destinations.find(d => d.id === p.destination_id)?.name || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {p.category && (
                                                            <Badge variant="outline" className="capitalize">
                                                                {p.category}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="capitalize">{p.kind}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4"/>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => startEditPlace(p)}>
                                                                    <Pencil className="mr-2 h-4 w-4"/>
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator/>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeletePlace(p.id)}
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4"/>
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
                        </div>
                    )}
                    {activeTab === "history" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="relative w-72">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"/>
                                    <Input
                                        placeholder="Search history..."
                                        className="pl-9 bg-white dark:bg-slate-900"
                                        value={histSearch}
                                        onChange={(e) => setHistSearch(e.target.value)}
                                    />
                                </div>
                                <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
                                    <SheetTrigger asChild>
                                        <Button onClick={resetHistoryForm}
                                                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                                            <Plus className="h-4 w-4"/>
                                            Add Entry
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
                                        <SheetHeader>
                                            <SheetTitle>
                                                {editingHistId ? "Edit History Entry" : "New History Entry"}
                                            </SheetTitle>
                                            <SheetDescription>
                                                {editingHistId
                                                    ? "Update history/KBYG details below."
                                                    : "Add a new history/KBYG entry."}
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="py-6">
                                            <form id="hist-form" onSubmit={handleSaveHistory} className="space-y-4">
                                                <div className="space-y-4">
                                                    <div
                                                        className="font-medium text-sm text-slate-900 dark:text-white border-b pb-2">Context
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label
                                                            className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                            Destination (Required)
                                                        </Label>
                                                        <Select
                                                            value={histDestinationId}
                                                            onValueChange={setHistDestinationId}
                                                        >
                                                            <SelectTrigger
                                                                className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                                                                <SelectValue placeholder="Select a destination"/>
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
                                                </div>

                                                <div className="space-y-4">
                                                    <div
                                                        className="font-medium text-sm text-slate-900 dark:text-white border-b pb-2">Content
                                                    </div>
                                                    <FormTextarea
                                                        label="Content (Main)"
                                                        value={histContent}
                                                        onChange={setHistContent}
                                                        placeholder="Main history content..."
                                                        rows={6}
                                                    />
                                                    <FormTextarea
                                                        label="About"
                                                        value={histAbout}
                                                        onChange={setHistAbout}
                                                        placeholder="About this destination..."
                                                        rows={3}
                                                    />
                                                    <FormTextarea
                                                        label="History"
                                                        value={histHistory}
                                                        onChange={setHistHistory}
                                                        placeholder="Historical background..."
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <div
                                                        className="font-medium text-sm text-slate-900 dark:text-white border-b pb-2">Details
                                                    </div>
                                                    <FormTextarea
                                                        label="Getting Around"
                                                        value={histGettingAround}
                                                        onChange={setHistGettingAround}
                                                        placeholder="Transportation info..."
                                                        rows={3}
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormInput
                                                            label="Currency"
                                                            value={histCurrency}
                                                            onChange={setHistCurrency}
                                                            placeholder="EUR"
                                                        />
                                                        <FormInput
                                                            label="Plugs"
                                                            value={histPlugs}
                                                            onChange={setHistPlugs}
                                                            placeholder="Type C, E"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormInput
                                                            label="Languages"
                                                            value={histLanguages}
                                                            onChange={setHistLanguages}
                                                            placeholder="French, English"
                                                        />
                                                        <FormInput
                                                            label="Primary City"
                                                            value={histPrimaryCity}
                                                            onChange={setHistPrimaryCity}
                                                            placeholder="Paris"
                                                        />
                                                    </div>
                                                    <FormInput
                                                        label="eSIM Info"
                                                        value={histEsim}
                                                        onChange={setHistEsim}
                                                        placeholder="eSIM details..."
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    <div
                                                        className="font-medium text-sm text-slate-900 dark:text-white border-b pb-2">Media
                                                    </div>
                                                    <FormInput
                                                        label="Backdrop Image URL"
                                                        value={histBackdropUrl}
                                                        onChange={setHistBackdropUrl}
                                                        placeholder="https://..."
                                                    />
                                                    <FormInput
                                                        label="Backdrop Attribution"
                                                        value={histBackdropAttribution}
                                                        onChange={setHistBackdropAttribution}
                                                        placeholder="Photo by..."
                                                    />
                                                </div>


                                            </form>
                                        </div>
                                        <SheetFooter>
                                            <Button type="submit" form="hist-form" disabled={histSaving}>
                                                {histSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                                {editingHistId ? "Save Changes" : "Create Entry"}
                                            </Button>
                                        </SheetFooter>
                                    </SheetContent>
                                </Sheet>
                            </div>

                            <Card className="border-0 shadow-none">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Destination</TableHead>
                                            <TableHead>Content Preview</TableHead>
                                            <TableHead>Created At</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredHistory.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4}
                                                           className="h-24 text-center text-muted-foreground">
                                                    No history entries found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredHistory.map((h) => (
                                                <TableRow key={h.id}
                                                          className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <TableImage url={h.backdrop_image_url} alt="Backdrop"
                                                                        icon={History}/>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    {destinations.find(d => d.id === h.destination_id)?.current_history_id === h.id && (
                                                                        <Badge variant="secondary"
                                                                               className="text-[10px] h-5 px-1 bg-green-100 text-green-700">Current</Badge>
                                                                    )}
                                                                    <span>{destinations.find(d => d.id === h.destination_id)?.name || "Unknown"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-md truncate">
                                                        {h.content}
                                                    </TableCell>
                                                    <TableCell>
                                                        {h.created_at ? new Date(h.created_at).toLocaleDateString() : "-"}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4"/>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleSetCurrentHistory(h)}>
                                                                    <Flag className="mr-2 h-4 w-4"/>
                                                                    Set as Current
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator/>
                                                                <DropdownMenuItem onClick={() => startEditHistory(h)}>
                                                                    <Pencil className="mr-2 h-4 w-4"/>
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator/>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDeleteHistory(h.id)}
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4"/>
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
                        </div>
                    )
                    }
                </div>
            </main>
        </div>
    );
}

/* ---------- Sub-components for clean code ---------- */

function TableImage({
                        url,
                        alt,
                        icon: Icon,
                    }: {
    url?: string | null;
    alt: string;
    icon: React.ElementType;
}) {
    if (url) {
        return (
            <div
                className="h-9 w-9 rounded-md bg-slate-100 overflow-hidden relative border border-slate-200 dark:border-slate-700 dark:bg-slate-800 flex-shrink-0">
                <Image
                    src={url}
                    alt={alt}
                    fill
                    className="object-cover"
                />
            </div>
        );
    }
    return (
        <div
            className="h-9 w-9 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200 dark:border-slate-700 dark:bg-slate-800 flex-shrink-0">
            <Icon className="h-4 w-4 text-slate-400"/>
        </div>
    );
}

function FormInput({
                       label,
                       value,
                       onChange,
                       placeholder,
                       type = "text",
                   }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {label}
            </Label>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-600 dark:bg-slate-950 dark:border-slate-800"
            />
        </div>
    );
}

function FormTextarea({
                          label,
                          value,
                          onChange,
                          placeholder,
                          rows,
                      }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    rows?: number;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {label}
            </Label>
            <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="bg-slate-50 border-slate-200 rounded-xl resize-none focus-visible:ring-blue-600 dark:bg-slate-950 dark:border-slate-800"
            />
        </div>
    );
}

function ActionBtn({
                       icon: Icon,
                       onClick,
                       destructive,
                   }: {
    icon: React.ElementType;
    onClick: () => void;
    destructive?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                destructive
                    ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    : "text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
            )}
        >
            <Icon className="h-4 w-4"/>
        </button>
    );
}