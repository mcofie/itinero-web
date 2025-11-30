"use client";

import * as React from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

/* =====================================================
   Types
===================================================== */

export type DestinationOption = {
    id: string;
    name: string | null;
    country?: string | null; // mapped from country_code in DB
    lat?: number | null;
    lng?: number | null;
    cover_url?: string | null;
    image_attribution?: string | null;
    current_history_id?: string | null;
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
    payload: DestinationHistoryPayload | null;
    created_at: string | null;
    backdrop_image_url?: string | null;
    backdrop_image_attribution?: string | null;
};

type GuidedTour = {
    id: string;
    title: string;
    destination_id: string;
    summary: string;
    days: number;
    difficulty: "easy" | "moderate" | "intense";
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

    /* ------------ Destinations form state ------------ */
    const [destName, setDestName] = React.useState("");
    const [destLat, setDestLat] = React.useState<string>("");
    const [destLng, setDestLng] = React.useState<string>("");
    const [destCountry, setDestCountry] = React.useState("");
    const [destImageUrl, setDestImageUrl] = React.useState("");
    const [destImageAttribution, setDestImageAttribution] = React.useState("");
    const [destSaving, setDestSaving] = React.useState(false);
    const [destMessage, setDestMessage] = React.useState<string | null>(null);
    const [editingDestId, setEditingDestId] = React.useState<string | null>(null);
    const [destSearch, setDestSearch] = React.useState("");

    /* ------------ Destination history form state ------------ */
    const [histDestinationId, setHistDestinationId] =
        React.useState<string>("");
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
    const [histMessage, setHistMessage] = React.useState<string | null>(null);

    const [historyList, setHistoryList] = React.useState<
        DestinationHistoryRowUI[]
    >([]);
    const [histLoadingList, setHistLoadingList] = React.useState(false);
    const [editingHistId, setEditingHistId] =
        React.useState<string | null>(null);

    /* ------------ Current-history selector state (Destinations tab) ------------ */
    const [currentHistoryDestId, setCurrentHistoryDestId] =
        React.useState<string>("");
    const [currentHistoryList, setCurrentHistoryList] = React.useState<
        DestinationHistoryRowUI[]
    >([]);
    const [currentHistoryId, setCurrentHistoryId] = React.useState<string>("");
    const [currentHistoryLoading, setCurrentHistoryLoading] =
        React.useState(false);
    const [currentHistorySaving, setCurrentHistorySaving] =
        React.useState(false);
    const [currentHistoryMessage, setCurrentHistoryMessage] =
        React.useState<string | null>(null);

    /* ------------ Places form state ------------ */
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
    const [placeSaving, setPlaceSaving] = React.useState(false);
    const [placeMessage, setPlaceMessage] = React.useState<string | null>(null);
    const [editingPlaceId, setEditingPlaceId] = React.useState<string | null>(
        null
    );
    const [placeSearch, setPlaceSearch] = React.useState("");

    /* ------------ Guided Tours ------------ */
    const [guidedTours, setGuidedTours] = React.useState<GuidedTour[]>([]);
    const [tourDestinationId, setTourDestinationId] =
        React.useState<string>("");
    const [tourTitle, setTourTitle] = React.useState("");
    const [tourSummary, setTourSummary] = React.useState("");
    const [tourDays, setTourDays] = React.useState<string>("3");
    const [tourDifficulty, setTourDifficulty] =
        React.useState<GuidedTour["difficulty"]>("easy");
    const [tourMessage, setTourMessage] = React.useState<string | null>(null);
    const [tourSaving, setTourSaving] = React.useState(false);
    const [editingTourId, setEditingTourId] =
        React.useState<string | null>(null);

    /* --- Reset Helpers --- */
    function resetDestinationForm() {
        setDestName("");
        setDestLat("");
        setDestLng("");
        setDestCountry("");
        setDestImageUrl("");
        setDestImageAttribution("");
        setEditingDestId(null);
        setDestMessage(null);
    }

    function resetHistoryForm() {
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
        setHistMessage(null);
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
        setEditingPlaceId(null);
        setPlaceMessage(null);
    }

    function resetTourForm() {
        setTourTitle("");
        setTourSummary("");
        setTourDays("3");
        setTourDifficulty("easy");
        setEditingTourId(null);
        setTourMessage(null);
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
            setHistMessage(null);
            try {
                const { data, error } = await sb
                    .schema("itinero")
                    .from("destination_history")
                    .select(
                        "id,destination_id,section,payload,created_at,backdrop_image_url,backdrop_image_attribution"
                    )
                    .eq("destination_id", histDestinationId)
                    .order("created_at", { ascending: false });

                if (error) {
                    setHistMessage(error.message ?? "Failed to load history.");
                    setHistoryList([]);
                    return;
                }
                setHistoryList((data as DestinationHistoryRowUI[]) ?? []);
            } catch {
                setHistMessage("Unexpected error loading history.");
                setHistoryList([]);
            } finally {
                setHistLoadingList(false);
            }
        })();
    }, [histDestinationId, sb]);

    // Load guided tours when destination changes
    React.useEffect(() => {
        if (!tourDestinationId) {
            setGuidedTours([]);
            resetTourForm();
            return;
        }
        (async () => {
            setTourMessage(null);
            try {
                const { data, error } = await sb
                    .schema("itinero")
                    .from("guided_tours")
                    .select("id,title,destination_id,summary,days,difficulty")
                    .eq("destination_id", tourDestinationId)
                    .order("created_at", { ascending: false });

                if (error) {
                    setTourMessage(error.message ?? "Failed to load tours.");
                    setGuidedTours([]);
                    return;
                }
                setGuidedTours((data as GuidedTour[]) ?? []);
            } catch {
                setTourMessage("Unexpected error loading tours.");
                setGuidedTours([]);
            }
        })();
    }, [tourDestinationId, sb]);

    // Load history options for "current_history_id" selector in Destinations tab
    React.useEffect(() => {
        if (!currentHistoryDestId) {
            setCurrentHistoryList([]);
            setCurrentHistoryId("");
            setCurrentHistoryMessage(null);
            return;
        }

        (async () => {
            setCurrentHistoryLoading(true);
            setCurrentHistoryMessage(null);
            try {
                const { data, error } = await sb
                    .schema("itinero")
                    .from("destination_history")
                    .select(
                        "id,destination_id,section,payload,created_at,backdrop_image_url,backdrop_image_attribution"
                    )
                    .eq("destination_id", currentHistoryDestId)
                    .order("created_at", { ascending: false });

                if (error) {
                    setCurrentHistoryMessage(
                        error.message ?? "Failed to load history entries."
                    );
                    setCurrentHistoryList([]);
                    return;
                }
                const list = (data as DestinationHistoryRowUI[]) ?? [];
                setCurrentHistoryList(list);

                // default selected = destination.current_history_id (if present)
                const dest = destinations.find((d) => d.id === currentHistoryDestId);
                if (dest?.current_history_id) {
                    setCurrentHistoryId(dest.current_history_id);
                } else if (list.length > 0) {
                    setCurrentHistoryId(list[0].id);
                } else {
                    setCurrentHistoryId("");
                }
            } catch {
                setCurrentHistoryMessage("Unexpected error loading history entries.");
                setCurrentHistoryList([]);
            } finally {
                setCurrentHistoryLoading(false);
            }
        })();
    }, [currentHistoryDestId, destinations, sb]);

    /* --- Handlers: Destinations --- */

    async function handleSaveDestination(e: React.FormEvent) {
        e.preventDefault();
        setDestMessage(null);
        if (!destName.trim())
            return setDestMessage("Name is required.");

        setDestSaving(true);
        try {
            const latNum =
                destLat.trim() !== "" ? Number(destLat.trim()) : null;
            const lngNum =
                destLng.trim() !== "" ? Number(destLng.trim()) : null;

            if (editingDestId) {
                const { data, error } = await sb
                    .schema("itinero")
                    .from("destinations")
                    .update({
                        name: destName.trim(),
                        country_code: destCountry.trim() || null,
                        lat: latNum,
                        lng: lngNum,
                        cover_url: destImageUrl.trim() || null,
                        image_attribution: destImageAttribution.trim() || null,
                    })
                    .eq("id", editingDestId)
                    .select(
                        "id,name,country:country_code,lat,lng,cover_url,image_attribution,current_history_id"
                    )
                    .maybeSingle();

                if (error || !data) {
                    setDestMessage(
                        error?.message ?? "Error updating destination."
                    );
                    return;
                }

                setDestinations((prev) =>
                    prev.map((d) =>
                        d.id === editingDestId ? (data as DestinationOption) : d
                    )
                );
                setDestMessage("Destination updated.");
            } else {
                const { data, error } = await sb
                    .schema("itinero")
                    .from("destinations")
                    .insert({
                        name: destName.trim(),
                        country_code: destCountry.trim() || null,
                        lat: latNum,
                        lng: lngNum,
                        cover_url: destImageUrl.trim() || null,
                        image_attribution: destImageAttribution.trim() || null,
                    })
                    .select(
                        "id,name,country:country_code,lat,lng,cover_url,image_attribution,current_history_id"
                    )
                    .single();

                if (error || !data) {
                    setDestMessage(
                        error?.message ?? "Error creating destination."
                    );
                    return;
                }

                setDestinations((prev) => [
                    ...prev,
                    data as DestinationOption,
                ]);
                setDestMessage("Destination created.");
            }
            resetDestinationForm();
        } catch {
            setDestMessage("Error saving destination.");
        } finally {
            setDestSaving(false);
        }
    }

    function startEditDestination(d: DestinationOption) {
        setEditingDestId(d.id);
        setDestName(d.name ?? "");
        setDestCountry(d.country ?? "");
        setDestLat(d.lat?.toString() ?? "");
        setDestLng(d.lng?.toString() ?? "");
        setDestImageUrl(d.cover_url ?? "");
        setDestImageAttribution(d.image_attribution ?? "");
        setDestMessage(null);
    }

    async function handleDeleteDestination(id: string) {
        if (!confirm("Delete this destination?")) return;
        setDestMessage(null);
        try {
            const { error } = await sb
                .schema("itinero")
                .from("destinations")
                .delete()
                .eq("id", id);

            if (error) {
                setDestMessage(error.message ?? "Error deleting destination.");
                return;
            }

            setDestinations((prev) => prev.filter((d) => d.id !== id));

            // Also clean dependent state
            if (histDestinationId === id) {
                setHistDestinationId("");
            }
            if (placeDestinationId === id) {
                setPlaceDestinationId("");
            }
            if (tourDestinationId === id) {
                setTourDestinationId("");
            }
            if (currentHistoryDestId === id) {
                setCurrentHistoryDestId("");
            }
        } catch {
            setDestMessage("Unexpected error deleting destination.");
        }
    }

    async function handleSetCurrentHistory(e: React.FormEvent) {
        e.preventDefault();
        setCurrentHistoryMessage(null);
        if (!currentHistoryDestId) {
            setCurrentHistoryMessage("Select a destination first.");
            return;
        }
        if (!currentHistoryId) {
            setCurrentHistoryMessage("Select a history entry to set as current.");
            return;
        }

        setCurrentHistorySaving(true);
        try {
            const { data, error } = await sb
                .schema("itinero")
                .from("destinations")
                .update({
                    current_history_id: currentHistoryId,
                })
                .eq("id", currentHistoryDestId)
                .select(
                    "id,name,country:country_code,lat,lng,cover_url,image_attribution,current_history_id"
                )
                .maybeSingle();

            if (error || !data) {
                setCurrentHistoryMessage(
                    error?.message ?? "Error setting current history."
                );
                return;
            }

            const updated = data as DestinationOption;
            setDestinations((prev) =>
                prev.map((d) => (d.id === updated.id ? updated : d))
            );
            setCurrentHistoryMessage("Current history updated.");
        } catch {
            setCurrentHistoryMessage("Unexpected error updating current history.");
        } finally {
            setCurrentHistorySaving(false);
        }
    }

    /* --- Handlers: History / KBYG --- */

    async function handleSaveHistory(e: React.FormEvent) {
        e.preventDefault();
        if (!histDestinationId) {
            setHistMessage("Select a destination first.");
            return;
        }

        setHistSaving(true);
        setHistMessage(null);
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
                const { data, error } = await sb
                    .schema("itinero")
                    .from("destination_history")
                    .update({
                        payload,
                        backdrop_image_url: histBackdropUrl.trim() || null,
                        backdrop_image_attribution:
                            histBackdropAttribution.trim() || null,
                    })
                    .eq("id", editingHistId)
                    .select(
                        "id,destination_id,section,payload,created_at,backdrop_image_url,backdrop_image_attribution"
                    )
                    .maybeSingle();

                if (error || !data) {
                    setHistMessage(
                        error?.message ?? "Error updating history entry."
                    );
                    return;
                }

                setHistoryList((prev) =>
                    prev.map((h) =>
                        h.id === editingHistId
                            ? (data as DestinationHistoryRowUI)
                            : h
                    )
                );
                setHistMessage("History entry updated.");
            } else {
                const { data, error } = await sb
                    .schema("itinero")
                    .from("destination_history")
                    .insert({
                        destination_id: histDestinationId,
                        section: "kbyg",
                        payload,
                        backdrop_image_url: histBackdropUrl.trim() || null,
                        backdrop_image_attribution:
                            histBackdropAttribution.trim() || null,
                    })
                    .select(
                        "id,destination_id,section,payload,created_at,backdrop_image_url,backdrop_image_attribution"
                    )
                    .single();

                if (error || !data) {
                    setHistMessage(
                        error?.message ?? "Error creating history entry."
                    );
                    return;
                }

                setHistoryList((prev) => [
                    data as DestinationHistoryRowUI,
                    ...prev,
                ]);
                setHistMessage("History entry created.");
            }

            resetHistoryForm();
        } catch {
            setHistMessage("Unexpected error saving history entry.");
        } finally {
            setHistSaving(false);
        }
    }

    function startEditHistory(h: DestinationHistoryRowUI) {
        setEditingHistId(h.id);
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
        setHistBackdropAttribution(h.backdrop_image_attribution ?? "");
        setHistMessage(null);
    }

    async function handleDeleteHistory(id: string) {
        if (!confirm("Delete this history entry?")) return;
        setHistMessage(null);
        try {
            const { error } = await sb
                .schema("itinero")
                .from("destination_history")
                .delete()
                .eq("id", id);

            if (error) {
                setHistMessage(error.message ?? "Error deleting history.");
                return;
            }

            setHistoryList((prev) => prev.filter((h) => h.id !== id));
            if (editingHistId === id) {
                resetHistoryForm();
            }
        } catch {
            setHistMessage("Unexpected error deleting history entry.");
        }
    }

    /* --- Handlers: Places --- */

    async function handleSavePlace(e: React.FormEvent) {
        e.preventDefault();
        setPlaceMessage(null);
        if (!placeDestinationId)
            return setPlaceMessage("Select a destination first.");
        if (!placeName.trim())
            return setPlaceMessage("Name is required.");

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

            if (editingPlaceId) {
                const { data, error } = await sb
                    .schema("itinero")
                    .from("places")
                    .update({
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
                    })
                    .eq("id", editingPlaceId)
                    .select(
                        "id,name,category,lat,lng,tags,description,destination_id,popularity,cost_typical,cost_currency"
                    )
                    .maybeSingle();

                if (error || !data) {
                    setPlaceMessage(
                        error?.message ?? "Error updating place."
                    );
                    return;
                }

                setPlaces((prev) =>
                    prev.map((p) =>
                        p.id === editingPlaceId ? (data as PlaceOption) : p
                    )
                );
                setPlaceMessage("Place updated.");
            } else {
                const { data, error } = await sb
                    .schema("itinero")
                    .from("places")
                    .insert({
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
                    })
                    .select(
                        "id,name,category,lat,lng,tags,description,destination_id,popularity,cost_typical,cost_currency"
                    )
                    .single();

                if (error || !data) {
                    setPlaceMessage(
                        error?.message ?? "Error creating place."
                    );
                    return;
                }

                setPlaces((prev) => [...prev, data as PlaceOption]);
                setPlaceMessage("Place created.");
            }

            resetPlaceForm();
        } catch {
            setPlaceMessage("Unexpected error saving place.");
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
        setPlacePopularity(
            typeof p.popularity === "number" ? p.popularity.toString() : ""
        );
        setPlaceCostTypical(
            typeof p.cost_typical === "number" ? p.cost_typical.toString() : ""
        );
        setPlaceCostCurrency(p.cost_currency ?? "");
        setPlaceMessage(null);
    }

    async function handleDeletePlace(id: string) {
        if (!confirm("Delete this place?")) return;
        setPlaceMessage(null);
        try {
            const { error } = await sb
                .schema("itinero")
                .from("places")
                .delete()
                .eq("id", id);

            if (error) {
                setPlaceMessage(error.message ?? "Error deleting place.");
                return;
            }

            setPlaces((prev) => prev.filter((p) => p.id !== id));
        } catch {
            setPlaceMessage("Unexpected error deleting place.");
        }
    }

    /* --- Handlers: Guided Tours --- */

    async function handleSaveTour(e: React.FormEvent) {
        e.preventDefault();
        setTourMessage(null);
        if (!tourDestinationId)
            return setTourMessage("Select a destination first.");
        if (!tourTitle.trim())
            return setTourMessage("Title is required.");

        const days = parseDays(tourDays);
        setTourSaving(true);
        try {
            if (editingTourId) {
                const { data, error } = await sb
                    .schema("itinero")
                    .from("guided_tours")
                    .update({
                        destination_id: tourDestinationId,
                        title: tourTitle.trim(),
                        summary: tourSummary.trim() || null,
                        days,
                        difficulty: tourDifficulty,
                    })
                    .eq("id", editingTourId)
                    .select(
                        "id,title,destination_id,summary,days,difficulty"
                    )
                    .maybeSingle();

                if (error || !data) {
                    setTourMessage(
                        error?.message ?? "Error updating tour."
                    );
                    return;
                }

                setGuidedTours((prev) =>
                    prev.map((t) =>
                        t.id === editingTourId ? (data as GuidedTour) : t
                    )
                );
                setTourMessage("Tour updated.");
            } else {
                const { data, error } = await sb
                    .schema("itinero")
                    .from("guided_tours")
                    .insert({
                        destination_id: tourDestinationId,
                        title: tourTitle.trim(),
                        summary: tourSummary.trim() || null,
                        days,
                        difficulty: tourDifficulty,
                    })
                    .select(
                        "id,title,destination_id,summary,days,difficulty"
                    )
                    .single();

                if (error || !data) {
                    setTourMessage(
                        error?.message ?? "Error creating tour."
                    );
                    return;
                }

                setGuidedTours((prev) => [
                    data as GuidedTour,
                    ...prev,
                ]);
                setTourMessage("Tour created.");
            }
            resetTourForm();
        } catch {
            setTourMessage("Unexpected error saving tour.");
        } finally {
            setTourSaving(false);
        }
    }

    function startEditTour(t: GuidedTour) {
        setEditingTourId(t.id);
        setTourDestinationId(t.destination_id);
        setTourTitle(t.title);
        setTourSummary(t.summary);
        setTourDays(String(t.days));
        setTourDifficulty(t.difficulty);
        setTourMessage(null);
    }

    async function handleDeleteTour(id: string) {
        if (!confirm("Delete this tour?")) return;
        setTourMessage(null);
        try {
            const { error } = await sb
                .schema("itinero")
                .from("guided_tours")
                .delete()
                .eq("id", id);

            if (error) {
                setTourMessage(error.message ?? "Error deleting tour.");
                return;
            }

            setGuidedTours((prev) => prev.filter((t) => t.id !== id));
            if (editingTourId === id) {
                resetTourForm();
            }
        } catch {
            setTourMessage("Unexpected error deleting tour.");
        }
    }

    /* --- Derived --- */

    const filteredDestinations = React.useMemo(() => {
        if (!destSearch.trim()) return destinations;
        const q = destSearch.trim().toLowerCase();
        return destinations.filter(
            (d) =>
                (d.name ?? "").toLowerCase().includes(q) ||
                (d.country ?? "").toLowerCase().includes(q)
        );
    }, [destinations, destSearch]);

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
        return list;
    }, [places, placeDestinationId, placeSearch]);

    const selectedDestLabel =
        destinations.find((d) => d.id === placeDestinationId)?.name ??
        "Select destination";

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Content Dashboard
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-xl text-sm">
                            Manage destinations, places, history and guided tours for
                            the Itinero platform.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Badge
                            className="rounded-full bg-white border-slate-200 text-slate-600 px-3 py-1 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                            <MapPin className="mr-1.5 h-3.5 w-3.5 text-blue-600" />{" "}
                            {destinations.length} Destinations
                        </Badge>
                        <Badge
                            className="rounded-full bg-white border-slate-200 text-slate-600 px-3 py-1 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                            <Database className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />{" "}
                            {places.length} Places
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="destinations" className="w-full">
                    <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                        <TabsList
                            className="inline-flex h-11 items-center justify-start rounded-full bg-slate-200/60 p-1 text-slate-500 w-full md:w-auto dark:bg-slate-800">
                            <TabPill value="destinations" icon={Globe} label="Destinations" />
                            <TabPill value="history" icon={History} label="History / KBYG" />
                            <TabPill value="places" icon={MapPin} label="Places" />
                            <TabPill value="guided" icon={Flag} label="Guided Tours" />
                        </TabsList>
                    </div>

                    {/* DESTINATIONS */}
                    <TabsContent value="destinations" className="mt-6 space-y-6">
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                            <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                                        {editingDestId ? "Edit Destination" : "Add Destination"}
                                    </CardTitle>
                                    <CardDescription>Add or update city details.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        className="space-y-4"
                                        onSubmit={handleSaveDestination}
                                    >
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormInput
                                                label="Name"
                                                value={destName}
                                                onChange={setDestName}
                                                placeholder="e.g. Cape Town"
                                            />
                                            <FormInput
                                                label="Country"
                                                value={destCountry}
                                                onChange={setDestCountry}
                                                placeholder="e.g. South Africa"
                                            />
                                            <FormInput
                                                label="Latitude"
                                                value={destLat}
                                                onChange={setDestLat}
                                                placeholder="-33.92"
                                                type="number"
                                            />
                                            <FormInput
                                                label="Longitude"
                                                value={destLng}
                                                onChange={setDestLng}
                                                placeholder="18.42"
                                                type="number"
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <FormInput
                                                label="Image URL"
                                                value={destImageUrl}
                                                onChange={setDestImageUrl}
                                                placeholder="https://images.unsplash.com/..."
                                            />
                                            <FormInput
                                                label="Image Attribution"
                                                value={destImageAttribution}
                                                onChange={setDestImageAttribution}
                                                placeholder="Photo by Jane Doe / Unsplash"
                                            />
                                        </div>

                                        {destMessage && (
                                            <p className="text-xs text-slate-500 pt-1">
                                                {destMessage}
                                            </p>
                                        )}
                                        <div className="flex justify-between pt-2">
                                            {editingDestId && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={resetDestinationForm}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button
                                                type="submit"
                                                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                                                disabled={destSaving}
                                            >
                                                {destSaving ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Plus className="mr-2 h-4 w-4" />
                                                )}
                                                {editingDestId ? "Save Changes" : "Add Destination"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card
                                className="border-slate-200 shadow-sm flex flex-col h-[600px] dark:border-slate-800 dark:bg-slate-900">
                                <div
                                    className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex gap-3 dark:border-slate-800 dark:bg-slate-900">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search..."
                                            value={destSearch}
                                            onChange={(e) => setDestSearch(e.target.value)}
                                            className="pl-9 h-9 bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto p-0">
                                    <table className="w-full text-sm text-left">
                                        <thead
                                            className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 dark:bg-slate-950 dark:text-slate-400">
                                            <tr>
                                                <th className="px-4 py-3">Image</th>
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3">Country</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredDestinations.map((d) => (
                                                <tr
                                                    key={d.id}
                                                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        {d.cover_url ? (
                                                            <img
                                                                src={d.cover_url}
                                                                alt={d.name ?? "Destination"}
                                                                className="h-10 w-16 object-cover rounded-md border border-slate-200 dark:border-slate-700"
                                                            />
                                                        ) : (
                                                            <div
                                                                className="h-10 w-16 rounded-md bg-slate-100 text-[10px] text-slate-400 flex items-center justify-center dark:bg-slate-800">
                                                                No image
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span>{d.name}</span>
                                                            {d.current_history_id && (
                                                                <span
                                                                    className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                                                    • Current history set
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                        {d.country}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <ActionBtn
                                                                icon={Pencil}
                                                                onClick={() => startEditDestination(d)}
                                                            />
                                                            <ActionBtn
                                                                icon={Trash2}
                                                                onClick={() =>
                                                                    handleDeleteDestination(d.id)
                                                                }
                                                                destructive
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!filteredDestinations.length && (
                                        <div className="p-6 text-center text-xs text-slate-500">
                                            No destinations.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Current history selector for destinations */}
                        <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">
                                    Current History Mapping
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Choose which history entry should be treated as the current
                                    one for a destination. This sets{" "}
                                    <code className="text-[11px] bg-slate-800/60 px-1 py-0.5 rounded">
                                        destinations.current_history_id
                                    </code>
                                    .
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form
                                    className="grid gap-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]"
                                    onSubmit={handleSetCurrentHistory}
                                >
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                            Destination
                                        </Label>
                                        <Select
                                            value={currentHistoryDestId}
                                            onValueChange={(v) => {
                                                setCurrentHistoryDestId(v);
                                            }}
                                        >
                                            <SelectTrigger
                                                className="bg-slate-50 border-slate-200 h-10 rounded-lg dark:bg-slate-950 dark:border-slate-800">
                                                <SelectValue placeholder="Pick destination..." />
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

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                            History Entry
                                        </Label>
                                        {currentHistoryLoading ? (
                                            <div className="flex items-center text-xs text-slate-400 h-10">
                                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                                Loading history entries…
                                            </div>
                                        ) : currentHistoryList.length === 0 ? (
                                            <div className="text-xs text-slate-400 h-10 flex items-center">
                                                {currentHistoryDestId
                                                    ? "No history entries for this destination yet."
                                                    : "Select a destination first."}
                                            </div>
                                        ) : (
                                            <Select
                                                value={currentHistoryId}
                                                onValueChange={setCurrentHistoryId}
                                            >
                                                <SelectTrigger
                                                    className="bg-slate-50 border-slate-200 h-10 rounded-lg dark:bg-slate-950 dark:border-slate-800">
                                                    <SelectValue placeholder="Choose history entry…" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {currentHistoryList.map((h) => (
                                                        <SelectItem key={h.id} value={h.id}>
                                                            {formatDateShort(h.created_at)} •{" "}
                                                            {h.section ?? "mixed"}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    <div className="flex items-end">
                                        <Button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                            disabled={
                                                !currentHistoryDestId ||
                                                !currentHistoryId ||
                                                currentHistorySaving
                                            }
                                        >
                                            {currentHistorySaving && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Set Current
                                        </Button>
                                    </div>
                                </form>

                                {currentHistoryMessage && (
                                    <p className="text-xs text-slate-400">
                                        {currentHistoryMessage}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* HISTORY / KBYG */}
                    <TabsContent value="history" className="mt-6">
                        <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">
                                    Destination Metadata
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Select Destination first */}
                                <div className="max-w-md">
                                    <Label className="text-xs font-bold uppercase text-slate-500 mb-1.5 block">
                                        Select Destination
                                    </Label>
                                    <Select
                                        value={histDestinationId}
                                        onValueChange={(v) => {
                                            setHistDestinationId(v);
                                            resetHistoryForm();
                                        }}
                                    >
                                        <SelectTrigger
                                            className="bg-slate-50 border-slate-200 h-11 rounded-xl dark:bg-slate-950 dark:border-slate-800">
                                            <SelectValue placeholder="Choose a city..." />
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

                                {histDestinationId && (
                                    <div className="grid gap-8 lg:grid-cols-2">
                                        <form className="space-y-5" onSubmit={handleSaveHistory}>
                                            <div className="space-y-4">
                                                <FormTextarea
                                                    label="About"
                                                    value={histAbout}
                                                    onChange={setHistAbout}
                                                    rows={3}
                                                    placeholder="High-level description of this destination."
                                                />
                                                <FormTextarea
                                                    label="History"
                                                    value={histHistory}
                                                    onChange={setHistHistory}
                                                    rows={3}
                                                    placeholder="Interesting historical context, eras, key events..."
                                                />
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <FormInput
                                                        label="Currency"
                                                        value={histCurrency}
                                                        onChange={setHistCurrency}
                                                        placeholder="e.g. GHS"
                                                    />
                                                    <FormInput
                                                        label="Plugs"
                                                        value={histPlugs}
                                                        onChange={setHistPlugs}
                                                        placeholder="Type G / 230V"
                                                    />
                                                </div>
                                                <FormInput
                                                    label="Languages"
                                                    value={histLanguages}
                                                    onChange={setHistLanguages}
                                                    placeholder="comma-separated, e.g. English, Twi"
                                                />
                                                <FormInput
                                                    label="Getting Around"
                                                    value={histGettingAround}
                                                    onChange={setHistGettingAround}
                                                    placeholder="Metro, Uber, walking..."
                                                />
                                                <FormInput
                                                    label="eSIM Provider"
                                                    value={histEsim}
                                                    onChange={setHistEsim}
                                                    placeholder="e.g. Airalo"
                                                />
                                                <FormInput
                                                    label="Primary City"
                                                    value={histPrimaryCity}
                                                    onChange={setHistPrimaryCity}
                                                    placeholder="e.g. Accra"
                                                />
                                                <FormInput
                                                    label="Backdrop URL"
                                                    value={histBackdropUrl}
                                                    onChange={setHistBackdropUrl}
                                                    placeholder="Optional hero image url"
                                                />
                                                <FormInput
                                                    label="Backdrop Attribution"
                                                    value={histBackdropAttribution}
                                                    onChange={setHistBackdropAttribution}
                                                    placeholder="Photo credit / source"
                                                />
                                            </div>
                                            {histMessage && (
                                                <p className="text-xs text-slate-400">
                                                    {histMessage}
                                                </p>
                                            )}
                                            <Button
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                                type="submit"
                                                disabled={histSaving}
                                            >
                                                {histSaving && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                {editingHistId ? "Save Changes" : "Save History"}
                                            </Button>
                                        </form>

                                        <div
                                            className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 h-96 overflow-auto dark:border-slate-800 dark:bg-slate-950">
                                            <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">
                                                Existing Entries
                                            </h4>
                                            {histLoadingList ? (
                                                <div
                                                    className="flex items-center justify-center py-10 text-xs text-slate-500">
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Loading history…
                                                </div>
                                            ) : historyList.length === 0 ? (
                                                <p className="text-sm text-slate-500 italic text-center py-10">
                                                    No history entries found.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {historyList.map((h) => (
                                                        <div
                                                            key={h.id}
                                                            className={cn(
                                                                "bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-sm flex justify-between gap-3 items-start dark:bg-slate-900 dark:border-slate-800",
                                                                editingHistId === h.id &&
                                                                "ring-2 ring-blue-500 ring-offset-1"
                                                            )}
                                                        >
                                                            <div>
                                                                <div
                                                                    className="font-medium text-slate-900 dark:text-white text-xs">
                                                                    {formatDateShort(h.created_at)}
                                                                </div>
                                                                <div
                                                                    className="text-slate-500 mt-1 line-clamp-2 text-xs">
                                                                    {h.payload?.about || "No description"}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <ActionBtn
                                                                    icon={Pencil}
                                                                    onClick={() => startEditHistory(h)}
                                                                />
                                                                <ActionBtn
                                                                    icon={Trash2}
                                                                    onClick={() => handleDeleteHistory(h.id)}
                                                                    destructive
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PLACES */}
                    <TabsContent value="places" className="mt-6">
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                            <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">
                                        {editingPlaceId ? "Edit Place" : "Manage Places"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-slate-500 uppercase">
                                            Destination
                                        </Label>
                                        <Select
                                            value={placeDestinationId}
                                            onValueChange={setPlaceDestinationId}
                                        >
                                            <SelectTrigger
                                                className="bg-slate-50 border-slate-200 h-10 rounded-lg dark:bg-slate-950 dark:border-slate-800">
                                                <SelectValue
                                                    placeholder="Filter map..."
                                                    defaultValue={selectedDestLabel}
                                                />
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

                                    <form className="space-y-4" onSubmit={handleSavePlace}>
                                        <FormInput
                                            label="Place Name"
                                            value={placeName}
                                            onChange={setPlaceName}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormInput
                                                label="Lat"
                                                value={placeLat}
                                                onChange={setPlaceLat}
                                                type="number"
                                            />
                                            <FormInput
                                                label="Lng"
                                                value={placeLng}
                                                onChange={setPlaceLng}
                                                type="number"
                                            />
                                        </div>
                                        <FormInput
                                            label="Category"
                                            value={placeCategory}
                                            onChange={setPlaceCategory}
                                            placeholder="Restaurant, Museum..."
                                        />
                                        <FormInput
                                            label="Tags"
                                            value={placeTags}
                                            onChange={setPlaceTags}
                                            placeholder="comma-separated, e.g. food, nightlife"
                                        />
                                        <FormTextarea
                                            label="Description"
                                            value={placeDescription}
                                            onChange={setPlaceDescription}
                                            rows={2}
                                            placeholder="Short note about this place..."
                                        />
                                        {placeMessage && (
                                            <p className="text-xs text-slate-400">
                                                {placeMessage}
                                            </p>
                                        )}
                                        <div className="flex justify-between gap-2">
                                            {editingPlaceId && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={resetPlaceForm}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button
                                                type="submit"
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                                disabled={!placeDestinationId || placeSaving}
                                            >
                                                {placeSaving && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                )}
                                                {editingPlaceId ? "Save Place" : "Add Place"}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card
                                className="border-slate-200 shadow-sm flex flex-col h-[700px] dark:border-slate-800 dark:bg-slate-900">
                                <div
                                    className="p-3 border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950">
                                    <Input
                                        placeholder="Search places..."
                                        value={placeSearch}
                                        onChange={(e) => setPlaceSearch(e.target.value)}
                                        className="bg-white border-slate-200 h-9 dark:bg-slate-900 dark:border-slate-800"
                                    />
                                </div>
                                <div className="flex-1 overflow-auto p-0">
                                    {visiblePlaces.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 text-sm">
                                            No places found.
                                        </div>
                                    ) : (
                                        <table className="w-full text-sm text-left">
                                            <thead
                                                className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 dark:bg-slate-950">
                                                <tr>
                                                    <th className="px-4 py-2">Name</th>
                                                    <th className="px-4 py-2">Category</th>
                                                    <th className="px-4 py-2 text-right">Edit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {visiblePlaces.map((p) => (
                                                    <tr
                                                        key={p.id}
                                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                    >
                                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                                            {p.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                            {p.category}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <ActionBtn
                                                                    icon={Pencil}
                                                                    onClick={() => startEditPlace(p)}
                                                                />
                                                                <ActionBtn
                                                                    icon={Trash2}
                                                                    onClick={() => handleDeletePlace(p.id)}
                                                                    destructive
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                    {/* GUIDED TOURS */}
                    <TabsContent value="guided" className="mt-6">
                        <Card className="border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">
                                    Guided Tours
                                </CardTitle>
                                <CardDescription>
                                    Create curated multi-day experiences attached to a
                                    destination.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="max-w-md space-y-2">
                                    <Label className="text-xs font-bold uppercase text-slate-500">
                                        Destination
                                    </Label>
                                    <Select
                                        value={tourDestinationId}
                                        onValueChange={(v) => {
                                            setTourDestinationId(v);
                                            resetTourForm();
                                        }}
                                    >
                                        <SelectTrigger
                                            className="bg-slate-50 border-slate-200 h-10 rounded-lg dark:bg-slate-950 dark:border-slate-800">
                                            <SelectValue placeholder="Pick destination..." />
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

                                {tourDestinationId && (
                                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                                        <form
                                            className="space-y-4"
                                            onSubmit={handleSaveTour}
                                        >
                                            <FormInput
                                                label="Tour Title"
                                                value={tourTitle}
                                                onChange={setTourTitle}
                                                placeholder="e.g. 3-Day Food & Culture in Accra"
                                            />
                                            <FormTextarea
                                                label="Summary"
                                                value={tourSummary}
                                                onChange={setTourSummary}
                                                rows={3}
                                                placeholder="Short overview of what this tour covers..."
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormInput
                                                    label="Days"
                                                    value={tourDays}
                                                    onChange={setTourDays}
                                                    type="number"
                                                />
                                                <div className="space-y-1.5">
                                                    <Label
                                                        className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                        Difficulty
                                                    </Label>
                                                    <Select
                                                        value={tourDifficulty}
                                                        onValueChange={(v) =>
                                                            setTourDifficulty(
                                                                v as GuidedTour["difficulty"]
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            className="bg-slate-50 border-slate-200 h-10 rounded-lg dark:bg-slate-950 dark:border-slate-800">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="easy">
                                                                Easy (chill)
                                                            </SelectItem>
                                                            <SelectItem value="moderate">
                                                                Moderate (balanced)
                                                            </SelectItem>
                                                            <SelectItem value="intense">
                                                                Intense (packed)
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            {tourMessage && (
                                                <p className="text-xs text-slate-400">
                                                    {tourMessage}
                                                </p>
                                            )}
                                            <div className="flex gap-2">
                                                {editingTourId && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={resetTourForm}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                                <Button
                                                    type="submit"
                                                    className="ml-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
                                                    disabled={tourSaving}
                                                >
                                                    {tourSaving && (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    )}
                                                    {editingTourId ? "Save Tour" : "Add Tour"}
                                                </Button>
                                            </div>
                                        </form>

                                        <div
                                            className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 h-[420px] overflow-auto dark:border-slate-800 dark:bg-slate-950">
                                            <h4 className="text-xs font-bold uppercase text-slate-400 mb-3">
                                                Existing Tours
                                            </h4>
                                            {guidedTours.length === 0 ? (
                                                <p className="text-sm text-slate-500 italic text-center py-10">
                                                    No tours for this destination yet.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {guidedTours.map((t) => (
                                                        <div
                                                            key={t.id}
                                                            className={cn(
                                                                "bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-sm flex justify-between gap-3 items-start dark:bg-slate-900 dark:border-slate-800",
                                                                editingTourId === t.id &&
                                                                "ring-2 ring-blue-500 ring-offset-1"
                                                            )}
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                                                        {t.title}
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[10px] rounded-full px-2 py-0.5"
                                                                    >
                                                                        {t.days} days •{" "}
                                                                        {t.difficulty.toUpperCase()}
                                                                    </Badge>
                                                                </div>
                                                                {t.summary && (
                                                                    <p className="text-xs text-slate-500 line-clamp-2">
                                                                        {t.summary}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <ActionBtn
                                                                    icon={Pencil}
                                                                    onClick={() => startEditTour(t)}
                                                                />
                                                                <ActionBtn
                                                                    icon={Trash2}
                                                                    onClick={() => handleDeleteTour(t.id)}
                                                                    destructive
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

/* ---------- Sub-components for clean code ---------- */

function TabPill({
    value,
    icon: Icon,
    label,
}: {
    value: string;
    icon: React.ElementType;
    label: string;
}) {
    return (
        <TabsTrigger
            value={value}
            className="rounded-full px-4 py-2 text-sm font-medium gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400"
        >
            <Icon className="h-4 w-4" />
            {label}
        </TabsTrigger>
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
            <Icon className="h-4 w-4" />
        </button>
    );
}