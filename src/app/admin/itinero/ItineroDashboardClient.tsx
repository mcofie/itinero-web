// app/admin/itinero/ItineroDashboardClient.tsx
"use client";

import * as React from "react";
import {createClientBrowser} from "@/lib/supabase/browser";
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
} from "lucide-react";

/* =====================================================
   Types
===================================================== */

export type DestinationOption = {
    id: string;
    name: string | null;
    country?: string | null;
    lat?: number | null;
    lng?: number | null;
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
};

type ItineroDashboardClientProps = {
    initialDestinations: DestinationOption[];
    initialPlaces: PlaceOption[];
};

/** Shape of KBYG payload we save in destination_history */
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

/** Lightweight client-side "guided tour" model */
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
    const sb = createClientBrowser();

    const [destinations, setDestinations] =
        React.useState<DestinationOption[]>(initialDestinations);
    const [places, setPlaces] =
        React.useState<PlaceOption[]>(initialPlaces);

    /* ------------ Destinations form state (create/edit) ------------ */
    const [destName, setDestName] = React.useState("");
    const [destLat, setDestLat] = React.useState<string>("");
    const [destLng, setDestLng] = React.useState<string>("");
    const [destCountry, setDestCountry] = React.useState("");
    const [destSaving, setDestSaving] = React.useState(false);
    const [destMessage, setDestMessage] = React.useState<string | null>(
        null
    );
    const [editingDestId, setEditingDestId] =
        React.useState<string | null>(null);
    const [destSearch, setDestSearch] = React.useState("");

    /* ------------ Destination history form state (create/edit) ------------ */
    const [histDestinationId, setHistDestinationId] =
        React.useState<string>("");
    const [histAbout, setHistAbout] = React.useState("");
    const [histHistory, setHistHistory] = React.useState("");
    const [histCurrency, setHistCurrency] = React.useState("");
    const [histPlugs, setHistPlugs] = React.useState("");
    const [histLanguages, setHistLanguages] = React.useState(""); // comma separated
    const [histGettingAround, setHistGettingAround] =
        React.useState("");
    const [histEsim, setHistEsim] = React.useState("");
    const [histPrimaryCity, setHistPrimaryCity] = React.useState("");
    const [histBackdropUrl, setHistBackdropUrl] =
        React.useState("");
    const [histBackdropAttribution, setHistBackdropAttribution] =
        React.useState("");
    const [histSaving, setHistSaving] = React.useState(false);
    const [histMessage, setHistMessage] = React.useState<string | null>(
        null
    );

    const [historyList, setHistoryList] = React.useState<
        DestinationHistoryRowUI[]
    >([]);
    const [histLoadingList, setHistLoadingList] =
        React.useState(false);
    const [editingHistId, setEditingHistId] =
        React.useState<string | null>(null);

    /* ------------ Places form state (create/edit) ------------ */
    const [placeDestinationId, setPlaceDestinationId] =
        React.useState<string>("");
    const [placeName, setPlaceName] = React.useState("");
    const [placeCategory, setPlaceCategory] = React.useState("");
    const [placeLat, setPlaceLat] = React.useState<string>("");
    const [placeLng, setPlaceLng] = React.useState<string>("");
    const [placeTags, setPlaceTags] = React.useState("");
    const [placeDescription, setPlaceDescription] =
        React.useState("");
    const [placeSaving, setPlaceSaving] = React.useState(false);
    const [placeMessage, setPlaceMessage] = React.useState<
        string | null
    >(null);
    const [editingPlaceId, setEditingPlaceId] =
        React.useState<string | null>(null);
    const [placeSearch, setPlaceSearch] = React.useState("");

    /* ------------ Guided Tours (client-side only) ------------ */
    const [guidedTours, setGuidedTours] = React.useState<GuidedTour[]>(
        []
    );
    const [tourDestinationId, setTourDestinationId] =
        React.useState<string>("");
    const [tourTitle, setTourTitle] = React.useState("");
    const [tourSummary, setTourSummary] = React.useState("");
    const [tourDays, setTourDays] = React.useState<string>("3");
    const [tourDifficulty, setTourDifficulty] =
        React.useState<GuidedTour["difficulty"]>("easy");
    const [tourMessage, setTourMessage] = React.useState<string | null>(
        null
    );

    /* =====================================================
       Helpers
    ===================================================== */

    function resetDestinationForm() {
        setDestName("");
        setDestLat("");
        setDestLng("");
        setDestCountry("");
        setEditingDestId(null);
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
    }

    function resetPlaceForm() {
        setPlaceName("");
        setPlaceCategory("");
        setPlaceLat("");
        setPlaceLng("");
        setPlaceTags("");
        setPlaceDescription("");
        setEditingPlaceId(null);
        // keep placeDestinationId so user doesn't have to reselect
    }

    function tagsToString(tags?: string[] | null): string {
        if (!tags || !tags.length) return "";
        return tags.join(", ");
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

    function safeStringContains(haystack: string, needle: string) {
        return haystack.toLowerCase().includes(needle.toLowerCase());
    }

    function parseDays(v: string): number {
        const n = Number(v);
        return Number.isFinite(n) && n > 0 ? Math.round(n) : 1;
    }

    /* =====================================================
       Effects
    ===================================================== */

    // Load history list whenever the selected destination changes
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
                const {data, error} = await sb
                    .schema("itinero")
                    .from("destination_history")
                    .select(
                        "id,destination_id,section,payload,created_at,backdrop_image_url,backdrop_image_attribution"
                    )
                    .eq("destination_id", histDestinationId)
                    .order("created_at", {ascending: false});

                if (error) {
                    console.error("Load destination_history error:", error);
                    setHistMessage(error.message ?? "Failed to load history.");
                    setHistoryList([]);
                    return;
                }

                const rows = Array.isArray(data)
                    ? (data as DestinationHistoryRowUI[])
                    : [];
                setHistoryList(rows);
            } catch (err) {
                console.error("Load destination_history error:", err);
                setHistMessage("Unexpected error loading history.");
                setHistoryList([]);
            } finally {
                setHistLoadingList(false);
            }
        })();
    }, [histDestinationId, sb]);

    /* =====================================================
       Destinations: create / update / delete
    ===================================================== */

    async function handleSaveDestination(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();
        setDestMessage(null);

        if (!destName.trim()) {
            setDestMessage("Name is required.");
            return;
        }

        setDestSaving(true);
        try {
            const latNum =
                destLat.trim() !== "" ? Number(destLat.trim()) : null;
            const lngNum =
                destLng.trim() !== "" ? Number(destLng.trim()) : null;

            if (editingDestId) {
                // UPDATE
                const {data, error} = await sb
                    .schema("itinero")
                    .from("destinations")
                    .update({
                        name: destName.trim(),
                        lat: Number.isFinite(latNum) ? latNum : null,
                        lng: Number.isFinite(lngNum) ? lngNum : null,
                        country: destCountry.trim() || null,
                    })
                    .eq("id", editingDestId)
                    .select("id,name,country,lat,lng")
                    .single<DestinationOption>();

                if (error) {
                    console.error("Update destination error:", error);
                    setDestMessage(error.message ?? "Failed to update.");
                    return;
                }

                if (data) {
                    setDestinations((prev) =>
                        prev.map((d) => (d.id === data.id ? data : d))
                    );
                    setDestMessage("Destination updated.");
                }
            } else {
                // CREATE
                const {data, error} = await sb
                    .schema("itinero")
                    .from("destinations")
                    .insert({
                        name: destName.trim(),
                        lat: Number.isFinite(latNum) ? latNum : null,
                        lng: Number.isFinite(lngNum) ? lngNum : null,
                        country: destCountry.trim() || null,
                    })
                    .select("id,name,country,lat,lng")
                    .single<DestinationOption>();

                if (error) {
                    console.error("Create destination error:", error);
                    setDestMessage(error.message ?? "Failed to create.");
                    return;
                }

                if (data) {
                    setDestinations((prev) => [...prev, data]);
                    setDestMessage("Destination created.");
                }
            }

            resetDestinationForm();
        } catch (err) {
            console.error("Save destination error:", err);
            setDestMessage("Unexpected error while saving destination.");
        } finally {
            setDestSaving(false);
        }
    }

    function startEditDestination(d: DestinationOption) {
        setEditingDestId(d.id);
        setDestName(d.name ?? "");
        setDestCountry(d.country ?? "");
        setDestLat(
            typeof d.lat === "number" && Number.isFinite(d.lat)
                ? String(d.lat)
                : ""
        );
        setDestLng(
            typeof d.lng === "number" && Number.isFinite(d.lng)
                ? String(d.lng)
                : ""
        );
        setDestMessage(null);
    }

    async function handleDeleteDestination(id: string) {
        const row = destinations.find((d) => d.id === id);
        const label = row?.name ?? id;

        const ok = window.confirm(
            `Delete destination "${label}"? This may fail if there are trips/history referencing it.`
        );
        if (!ok) return;

        setDestMessage(null);
        try {
            const {error} = await sb
                .schema("itinero")
                .from("destinations")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("Delete destination error:", error);
                setDestMessage(error.message ?? "Failed to delete.");
                return;
            }

            setDestinations((prev) => prev.filter((d) => d.id !== id));
            if (histDestinationId === id) {
                setHistDestinationId("");
                setHistoryList([]);
                resetHistoryForm();
            }
            if (placeDestinationId === id) {
                setPlaceDestinationId("");
            }
            setDestMessage("Destination deleted.");
        } catch (err) {
            console.error("Delete destination error:", err);
            setDestMessage("Unexpected error while deleting destination.");
        }
    }

    /* =====================================================
       Destination history: create / update / delete
    ===================================================== */

    async function handleSaveDestinationHistory(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();
        setHistMessage(null);

        if (!histDestinationId) {
            setHistMessage("Destination is required.");
            return;
        }

        const payload: DestinationHistoryPayload = {};
        if (histAbout.trim()) payload.about = histAbout.trim();
        if (histHistory.trim()) payload.history = histHistory.trim();

        const kbyg: KbygPayload = {};
        if (histCurrency.trim()) kbyg.currency = histCurrency.trim();
        if (histPlugs.trim()) kbyg.plugs = histPlugs.trim();
        if (histLanguages.trim()) {
            kbyg.languages = histLanguages
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
        }
        if (histGettingAround.trim())
            kbyg.getting_around = histGettingAround.trim();
        if (histEsim.trim()) kbyg.esim = histEsim.trim();
        if (histPrimaryCity.trim())
            kbyg.primary_city = histPrimaryCity.trim();

        if (Object.keys(kbyg).length > 0) {
            payload.kbyg = kbyg;
        }

        setHistSaving(true);
        try {
            if (editingHistId) {
                // UPDATE
                const {data, error} = await sb
                    .schema("itinero")
                    .from("destination_history")
                    .update({
                        destination_id: histDestinationId,
                        section: "main",
                        payload,
                        backdrop_image_url: histBackdropUrl.trim() || null,
                        backdrop_image_attribution:
                            histBackdropAttribution.trim() || null,
                    })
                    .eq("id", editingHistId)
                    .select(
                        "id,destination_id,section,payload,created_at,backdrop_image_url,backdrop_image_attribution"
                    )
                    .single<DestinationHistoryRowUI>();

                if (error) {
                    console.error("Update destination_history error:", error);
                    setHistMessage(error.message ?? "Failed to update history.");
                    return;
                }

                if (data) {
                    setHistoryList((prev) =>
                        prev.map((row) => (row.id === data.id ? data : row))
                    );
                    setHistMessage("Destination history updated.");
                }
            } else {
                // CREATE
                const {data, error} = await sb
                    .schema("itinero")
                    .from("destination_history")
                    .insert({
                        destination_id: histDestinationId,
                        section: "main",
                        payload,
                        backdrop_image_url: histBackdropUrl.trim() || null,
                        backdrop_image_attribution:
                            histBackdropAttribution.trim() || null,
                    })
                    .select(
                        "id,destination_id,section,payload,created_at,backdrop_image_url,backdrop_image_attribution"
                    )
                    .single<DestinationHistoryRowUI>();

                if (error) {
                    console.error("Create destination_history error:", error);
                    setHistMessage(error.message ?? "Failed to create history.");
                    return;
                }

                if (data) {
                    setHistoryList((prev) => [data, ...prev]);
                    setHistMessage("Destination history created.");
                }
            }

            resetHistoryForm();
        } catch (err) {
            console.error("Save destination_history error:", err);
            setHistMessage("Unexpected error while saving history.");
        } finally {
            setHistSaving(false);
        }
    }

    function startEditHistory(row: DestinationHistoryRowUI) {
        setEditingHistId(row.id);
        const payload = row.payload ?? {};

        setHistAbout(payload.about ?? "");
        setHistHistory(payload.history ?? "");

        const kbyg = payload.kbyg ?? {};
        setHistCurrency(kbyg.currency ?? "");
        setHistPlugs(kbyg.plugs ?? "");

        if (Array.isArray(kbyg.languages)) {
            setHistLanguages(kbyg.languages.join(", "));
        } else if (typeof kbyg.languages === "string") {
            setHistLanguages(kbyg.languages);
        } else {
            setHistLanguages("");
        }

        setHistGettingAround(kbyg.getting_around ?? "");
        setHistEsim(kbyg.esim ?? "");
        setHistPrimaryCity(kbyg.primary_city ?? "");

        setHistBackdropUrl(row.backdrop_image_url ?? "");
        setHistBackdropAttribution(
            row.backdrop_image_attribution ?? ""
        );
        setHistMessage(null);
    }

    async function handleDeleteHistory(id: string) {
        const ok = window.confirm(
            "Delete this destination history entry?"
        );
        if (!ok) return;

        setHistMessage(null);
        try {
            const {error} = await sb
                .schema("itinero")
                .from("destination_history")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("Delete destination_history error:", error);
                setHistMessage(error.message ?? "Failed to delete history.");
                return;
            }

            setHistoryList((prev) => prev.filter((h) => h.id !== id));
            if (editingHistId === id) {
                resetHistoryForm();
            }
            setHistMessage("Destination history deleted.");
        } catch (err) {
            console.error("Delete destination_history error:", err);
            setHistMessage(
                "Unexpected error while deleting history entry."
            );
        }
    }

    /* =====================================================
       Places: create / update / delete
    ===================================================== */

    async function handleSavePlace(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();
        setPlaceMessage(null);

        if (!placeDestinationId) {
            setPlaceMessage("Destination is required for a place.");
            return;
        }

        if (!placeName.trim()) {
            setPlaceMessage("Name is required.");
            return;
        }

        setPlaceSaving(true);
        try {
            const latNum =
                placeLat.trim() !== "" ? Number(placeLat.trim()) : null;
            const lngNum =
                placeLng.trim() !== "" ? Number(placeLng.trim()) : null;

            const tagsArr =
                placeTags.trim().length > 0
                    ? placeTags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                    : null;

            if (editingPlaceId) {
                // UPDATE
                const {data, error} = await sb
                    .schema("itinero")
                    .from("places")
                    .update({
                        destination_id: placeDestinationId,
                        name: placeName.trim(),
                        category: placeCategory.trim() || null,
                        lat: Number.isFinite(latNum) ? latNum : null,
                        lng: Number.isFinite(lngNum) ? lngNum : null,
                        tags: tagsArr,
                        description: placeDescription.trim() || null,
                    })
                    .eq("id", editingPlaceId)
                    .select(
                        "id,name,category,lat,lng,tags,description,destination_id"
                    )
                    .single<PlaceOption>();

                if (error) {
                    console.error("Update place error:", error);
                    setPlaceMessage(error.message ?? "Failed to update place.");
                    return;
                }

                if (data) {
                    setPlaces((prev) =>
                        prev.map((p) => (p.id === data.id ? data : p))
                    );
                    setPlaceMessage("Place updated.");
                }
            } else {
                // CREATE
                const {data, error} = await sb
                    .schema("itinero")
                    .from("places")
                    .insert({
                        destination_id: placeDestinationId,
                        name: placeName.trim(),
                        category: placeCategory.trim() || null,
                        lat: Number.isFinite(latNum) ? latNum : null,
                        lng: Number.isFinite(lngNum) ? lngNum : null,
                        tags: tagsArr,
                        description: placeDescription.trim() || null,
                    })
                    .select(
                        "id,name,category,lat,lng,tags,description,destination_id"
                    )
                    .single<PlaceOption>();

                if (error) {
                    console.error("Create place error:", error);
                    setPlaceMessage(error.message ?? "Failed to create place.");
                    return;
                }

                if (data) {
                    setPlaces((prev) => [...prev, data]);
                    setPlaceMessage("Place created.");
                }
            }

            resetPlaceForm();
        } catch (err) {
            console.error("Save place error:", err);
            setPlaceMessage("Unexpected error while saving place.");
        } finally {
            setPlaceSaving(false);
        }
    }

    function startEditPlace(p: PlaceOption) {
        setEditingPlaceId(p.id);
        setPlaceDestinationId(p.destination_id ?? "");
        setPlaceName(p.name);
        setPlaceCategory(p.category ?? "");
        setPlaceLat(
            typeof p.lat === "number" && Number.isFinite(p.lat)
                ? String(p.lat)
                : ""
        );
        setPlaceLng(
            typeof p.lng === "number" && Number.isFinite(p.lng)
                ? String(p.lng)
                : ""
        );
        setPlaceTags(tagsToString(p.tags));
        setPlaceDescription(p.description ?? "");
        setPlaceMessage(null);
    }

    async function handleDeletePlace(id: string) {
        const row = places.find((p) => p.id === id);
        const label = row?.name ?? id;
        const ok = window.confirm(
            `Delete place "${label}"? This may fail if itinerary items reference it.`
        );
        if (!ok) return;

        setPlaceMessage(null);
        try {
            const {error} = await sb
                .schema("itinero")
                .from("places")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("Delete place error:", error);
                setPlaceMessage(error.message ?? "Failed to delete place.");
                return;
            }

            setPlaces((prev) => prev.filter((p) => p.id !== id));
            if (editingPlaceId === id) {
                resetPlaceForm();
            }
            setPlaceMessage("Place deleted.");
        } catch (err) {
            console.error("Delete place error:", err);
            setPlaceMessage("Unexpected error while deleting place.");
        }
    }

    /* =====================================================
       Guided Tours (client-side)
    ===================================================== */

    function handleAddGuidedTour(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();
        setTourMessage(null);

        if (!tourDestinationId) {
            setTourMessage("Destination is required.");
            return;
        }
        if (!tourTitle.trim()) {
            setTourMessage("Title is required.");
            return;
        }

        const days = parseDays(tourDays);
        const id = `local-${Date.now()}`;

        const destName =
            destinations.find((d) => d.id === tourDestinationId)?.name ??
            "";

        setGuidedTours((prev) => [
            ...prev,
            {
                id,
                title: tourTitle.trim(),
                destination_id: tourDestinationId,
                summary: tourSummary.trim() || `${days}-day tour in ${destName}`,
                days,
                difficulty: tourDifficulty,
            },
        ]);

        setTourTitle("");
        setTourSummary("");
        setTourDays("3");
        setTourDifficulty("easy");

        setTourMessage(
            "Guided tour added locally. Wire this up to a table like `itinero.guided_tours` when ready."
        );
    }

    function handleDeleteGuidedTour(id: string) {
        setGuidedTours((prev) => prev.filter((t) => t.id !== id));
    }

    /* =====================================================
       Derived values (filters, counts)
    ===================================================== */

    const filteredDestinations = React.useMemo(() => {
        if (!destSearch.trim()) return destinations;
        const q = destSearch.trim().toLowerCase();
        return destinations.filter((d) => {
            const name = (d.name ?? "").toLowerCase();
            const country = (d.country ?? "").toLowerCase();
            return name.includes(q) || country.includes(q);
        });
    }, [destinations, destSearch]);

    const filteredPlacesByDestination =
        placeDestinationId && places.length
            ? places.filter(
                (p) => p.destination_id === placeDestinationId
            )
            : places;

    const visiblePlaces = React.useMemo(() => {
        if (!placeSearch.trim()) return filteredPlacesByDestination;
        const q = placeSearch.trim().toLowerCase();
        return filteredPlacesByDestination.filter((p) => {
            const name = p.name.toLowerCase();
            const category = (p.category ?? "").toLowerCase();
            const tags = tagsToString(p.tags).toLowerCase();
            const desc = (p.description ?? "").toLowerCase();
            return (
                name.includes(q) ||
                category.includes(q) ||
                tags.includes(q) ||
                desc.includes(q)
            );
        });
    }, [filteredPlacesByDestination, placeSearch]);

    const selectedDestLabel =
        destinations.find((d) => d.id === placeDestinationId)?.name ??
        "Select destination";

    const placesCountByDestination = React.useMemo(() => {
        const map = new Map<string, number>();
        for (const p of places) {
            if (!p.destination_id) continue;
            map.set(
                p.destination_id,
                (map.get(p.destination_id) ?? 0) + 1
            );
        }
        return map;
    }, [places]);

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="space-y-4">
            {/* Top header (applies to all sections) */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight">
                        Itinero Content Dashboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage destinations, destination history (KBYG), places
                        and guided tours for your itineraries.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3"/>
                        {destinations.length} destinations
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Database className="h-3 w-3"/>
                        {places.length} places (loaded)
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="destinations" className="mt-2">
                <TabsList className="mb-4 flex-wrap">
                    <TabsTrigger value="destinations">Destinations</TabsTrigger>
                    <TabsTrigger value="history">Destination History</TabsTrigger>
                    <TabsTrigger value="places">Places</TabsTrigger>
                    <TabsTrigger value="guided">Guided Tours</TabsTrigger>
                </TabsList>

                {/* =====================================================
           DESTINATIONS SECTION
        ===================================================== */}
                <TabsContent value="destinations">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary"/>
                                    Destinations
                                </CardTitle>
                                <CardDescription>
                                    Create and manage destinations used by trips and
                                    destination history.
                                </CardDescription>
                            </div>
                            <Badge
                                variant="outline"
                                className="hidden items-center gap-1 sm:flex"
                            >
                                <Database className="h-3 w-3"/>
                                {destinations.length} total
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                                {/* Form column */}
                                <form
                                    className="grid gap-4 md:grid-cols-2"
                                    onSubmit={handleSaveDestination}
                                >
                                    <div className="space-y-1">
                                        <Label htmlFor="dest-name">
                                            {editingDestId
                                                ? "Edit destination name"
                                                : "Name"}
                                        </Label>
                                        <Input
                                            id="dest-name"
                                            value={destName}
                                            onChange={(e) => setDestName(e.target.value)}
                                            placeholder="Nairobi"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="dest-country">
                                            Country (optional)
                                        </Label>
                                        <Input
                                            id="dest-country"
                                            value={destCountry}
                                            onChange={(e) =>
                                                setDestCountry(e.target.value)
                                            }
                                            placeholder="Kenya"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="dest-lat">
                                            Latitude (optional)
                                        </Label>
                                        <Input
                                            id="dest-lat"
                                            type="number"
                                            step="0.000001"
                                            value={destLat}
                                            onChange={(e) => setDestLat(e.target.value)}
                                            placeholder="-1.286389"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="dest-lng">
                                            Longitude (optional)
                                        </Label>
                                        <Input
                                            id="dest-lng"
                                            type="number"
                                            step="0.000001"
                                            value={destLng}
                                            onChange={(e) => setDestLng(e.target.value)}
                                            placeholder="36.817223"
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex items-center justify-between gap-4 pt-2">
                                        <div className="text-xs text-muted-foreground">
                                            These rows go into{" "}
                                            <code>itinero.destinations</code>.
                                            {editingDestId && (
                                                <span className="ml-2">
                          Editing destination ID:{" "}
                                                    <code className="font-mono text-[11px]">
                            {editingDestId}
                          </code>
                        </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {editingDestId && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={resetDestinationForm}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button type="submit" disabled={destSaving}>
                                                {destSaving && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                                )}
                                                <Plus className="mr-1 h-4 w-4"/>
                                                {editingDestId
                                                    ? "Save changes"
                                                    : "Add destination"}
                                            </Button>
                                        </div>
                                    </div>

                                    {destMessage && (
                                        <p className="md:col-span-2 text-xs text-muted-foreground">
                                            {destMessage}
                                        </p>
                                    )}
                                </form>

                                {/* List column */}
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Existing destinations
                                            </h3>
                                            <p className="text-[11px] text-muted-foreground">
                                                Filter by name or country. Right column shows
                                                quick stats per destination.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-full sm:w-48">
                                                <Search
                                                    className="pointer-events-none absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground"/>
                                                <Input
                                                    className="pl-7 h-8 text-xs"
                                                    placeholder="Search destinations..."
                                                    value={destSearch}
                                                    onChange={(e) =>
                                                        setDestSearch(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {filteredDestinations.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">
                                            {destinations.length === 0
                                                ? "No destinations yet. Add your first destination using the form."
                                                : "No destinations match your search."}
                                        </p>
                                    ) : (
                                        <div className="max-h-60 overflow-auto rounded-md border text-xs">
                                            <table className="w-full border-collapse text-left">
                                                <thead className="border-b bg-muted/40">
                                                <tr>
                                                    <th className="px-2 py-1">Name</th>
                                                    <th className="px-2 py-1">Country</th>
                                                    <th className="px-2 py-1">Places</th>
                                                    <th className="px-2 py-1">ID</th>
                                                    <th className="px-2 py-1 text-right">
                                                        Actions
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {filteredDestinations.map((d) => {
                                                    const placesCount =
                                                        placesCountByDestination.get(
                                                            d.id
                                                        ) ?? 0;
                                                    return (
                                                        <tr
                                                            key={d.id}
                                                            className="border-b last:border-0 align-middle"
                                                        >
                                                            <td className="px-2 py-1">
                                                                {d.name ?? "—"}
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                {d.country ?? "—"}
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                {placesCount > 0 ? (
                                                                    <span>
                                      {placesCount} place
                                                                        {placesCount === 1 ? "" : "s"}
                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground">
                                      –
                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-1 font-mono text-[10px]">
                                                                {d.id}
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                <div className="flex justify-end gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() =>
                                                                            startEditDestination(d)
                                                                        }
                                                                    >
                                                                        <Pencil className="h-3 w-3"/>
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-6 w-6 text-destructive"
                                                                        onClick={() =>
                                                                            handleDeleteDestination(d.id)
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-3 w-3"/>
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* =====================================================
           DESTINATION HISTORY SECTION
        ===================================================== */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary"/>
                                Destination History / KBYG
                            </CardTitle>
                            <CardDescription>
                                Attach rich “about”, history and “Know Before You Go”
                                metadata to a destination.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)]">
                                {/* Form column */}
                                <form
                                    className="grid gap-4 md:grid-cols-2"
                                    onSubmit={handleSaveDestinationHistory}
                                >
                                    <div className="space-y-1 md:col-span-2">
                                        <Label>Destination</Label>
                                        <Select
                                            value={histDestinationId}
                                            onValueChange={(value) => {
                                                setHistDestinationId(value);
                                                setEditingHistId(null);
                                                resetHistoryForm();
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select destination"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {destinations.map((d) => (
                                                    <SelectItem key={d.id} value={d.id}>
                                                        {d.name ?? d.id}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[11px] text-muted-foreground">
                                            This will insert/update{" "}
                                            <code>itinero.destination_history</code> with a
                                            JSON payload.
                                        </p>
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <Label htmlFor="hist-about">About</Label>
                                        <Textarea
                                            id="hist-about"
                                            rows={3}
                                            value={histAbout}
                                            onChange={(e) =>
                                                setHistAbout(e.target.value)
                                            }
                                            placeholder="High-level description of the destination..."
                                        />
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <Label htmlFor="hist-history">History</Label>
                                        <Textarea
                                            id="hist-history"
                                            rows={4}
                                            value={histHistory}
                                            onChange={(e) =>
                                                setHistHistory(e.target.value)
                                            }
                                            placeholder="Concise historical notes..."
                                        />
                                    </div>

                                    {/* KBYG fields */}
                                    <div className="space-y-1">
                                        <Label htmlFor="hist-currency">Currency</Label>
                                        <Input
                                            id="hist-currency"
                                            value={histCurrency}
                                            onChange={(e) =>
                                                setHistCurrency(e.target.value)
                                            }
                                            placeholder="KES"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="hist-plugs">Power plugs</Label>
                                        <Input
                                            id="hist-plugs"
                                            value={histPlugs}
                                            onChange={(e) =>
                                                setHistPlugs(e.target.value)
                                            }
                                            placeholder="Type G • 240V / 50Hz"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="hist-languages">
                                            Languages (comma separated)
                                        </Label>
                                        <Input
                                            id="hist-languages"
                                            value={histLanguages}
                                            onChange={(e) =>
                                                setHistLanguages(e.target.value)
                                            }
                                            placeholder="English, Swahili"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="hist-getting-around">
                                            Getting around
                                        </Label>
                                        <Input
                                            id="hist-getting-around"
                                            value={histGettingAround}
                                            onChange={(e) =>
                                                setHistGettingAround(e.target.value)
                                            }
                                            placeholder="Ride-hailing is common, matatus for local transit..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="hist-esim">
                                            eSIM / connectivity
                                        </Label>
                                        <Input
                                            id="hist-esim"
                                            value={histEsim}
                                            onChange={(e) =>
                                                setHistEsim(e.target.value)
                                            }
                                            placeholder="Airalo, Holafly etc."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="hist-primary-city">
                                            Primary city / region
                                        </Label>
                                        <Input
                                            id="hist-primary-city"
                                            value={histPrimaryCity}
                                            onChange={(e) =>
                                                setHistPrimaryCity(e.target.value)
                                            }
                                            placeholder="Nairobi"
                                        />
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <Label htmlFor="hist-backdrop-url">
                                            Backdrop image URL (optional)
                                        </Label>
                                        <Input
                                            id="hist-backdrop-url"
                                            value={histBackdropUrl}
                                            onChange={(e) =>
                                                setHistBackdropUrl(e.target.value)
                                            }
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <Label htmlFor="hist-backdrop-attr">
                                            Image attribution (optional)
                                        </Label>
                                        <Input
                                            id="hist-backdrop-attr"
                                            value={histBackdropAttribution}
                                            onChange={(e) =>
                                                setHistBackdropAttribution(e.target.value)
                                            }
                                            placeholder="Photo by ..."
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex items-center justify-between gap-4 pt-2">
                                        <div className="text-xs text-muted-foreground">
                                            The payload matches what your preview &amp; print
                                            pages expect:{" "}
                                            <code>about</code>, <code>history</code>,{" "}
                                            <code>kbyg</code>.
                                            {editingHistId && (
                                                <span className="ml-2">
                          Editing history entry:{" "}
                                                    <code className="font-mono text-[11px]">
                            {editingHistId}
                          </code>
                        </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {editingHistId && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={resetHistoryForm}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button
                                                type="submit"
                                                disabled={
                                                    histSaving || !histDestinationId
                                                }
                                            >
                                                {histSaving && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                                )}
                                                <Plus className="mr-1 h-4 w-4"/>
                                                {editingHistId
                                                    ? "Save changes"
                                                    : "Add history"}
                                            </Button>
                                        </div>
                                    </div>

                                    {histMessage && (
                                        <p className="md:col-span-2 text-xs text-muted-foreground">
                                            {histMessage}
                                        </p>
                                    )}
                                </form>

                                {/* List column */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            History entries
                                        </h3>
                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                            {histDestinationId ? (
                                                <span>
                          Destination:{" "}
                                                    {
                                                        destinations.find(
                                                            (d) => d.id === histDestinationId
                                                        )?.name
                                                    }
                        </span>
                                            ) : (
                                                <span>Select a destination</span>
                                            )}
                                            {histLoadingList && (
                                                <span className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin"/>
                          Loading
                        </span>
                                            )}
                                        </div>
                                    </div>
                                    {historyList.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">
                                            {histDestinationId
                                                ? "No history entries yet for this destination."
                                                : "Select a destination to see or add history entries."}
                                        </p>
                                    ) : (
                                        <div className="max-h-72 overflow-auto rounded-md border text-xs">
                                            <table className="w-full border-collapse text-left">
                                                <thead className="border-b bg-muted/40">
                                                <tr>
                                                    <th className="px-2 py-1">Created</th>
                                                    <th className="px-2 py-1">Summary</th>
                                                    <th className="px-2 py-1 text-right">
                                                        Actions
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {historyList.map((h) => {
                                                    const aboutSnippet =
                                                        h.payload?.about?.slice(0, 80) ?? "";
                                                    const hasKbyg = Boolean(h.payload?.kbyg);
                                                    return (
                                                        <tr
                                                            key={h.id}
                                                            className="border-b last:border-0 align-top"
                                                        >
                                                            <td className="px-2 py-1 whitespace-nowrap">
                                                                {formatDateShort(h.created_at)}
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                {aboutSnippet ? (
                                                                    <div>{aboutSnippet}…</div>
                                                                ) : (
                                                                    <div className="text-muted-foreground">
                                                                        (No about text)
                                                                    </div>
                                                                )}
                                                                {hasKbyg && (
                                                                    <div
                                                                        className="mt-1 text-[10px] text-muted-foreground">
                                                                        KBYG: currency / plugs /
                                                                        languages / etc.
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                <div className="flex justify-end gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-6 w-6"
                                                                        onClick={() =>
                                                                            startEditHistory(h)
                                                                        }
                                                                    >
                                                                        <Pencil className="h-3 w-3"/>
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-6 w-6 text-destructive"
                                                                        onClick={() =>
                                                                            handleDeleteHistory(h.id)
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-3 w-3"/>
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* =====================================================
           PLACES SECTION
        ===================================================== */}
                <TabsContent value="places">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary"/>
                                Places
                            </CardTitle>
                            <CardDescription>
                                Add and manage individual places tied to a destination so
                                itineraries can reference them.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)]">
                                {/* Form column */}
                                <form
                                    className="grid gap-4 md:grid-cols-2"
                                    onSubmit={handleSavePlace}
                                >
                                    {/* Destination selector (required) */}
                                    <div className="space-y-1 md:col-span-2">
                                        <Label>Destination</Label>
                                        <Select
                                            value={placeDestinationId}
                                            onValueChange={(value) => {
                                                setPlaceDestinationId(value);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder="Select destination"
                                                    aria-label={selectedDestLabel}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {destinations.map((d) => (
                                                    <SelectItem key={d.id} value={d.id}>
                                                        {d.name ?? d.id}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[11px] text-muted-foreground">
                                            Places are stored with{" "}
                                            <code>destination_id</code> and the list on the
                                            right is filtered by the selected destination.
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="place-name">
                                            {editingPlaceId ? "Edit place name" : "Name"}
                                        </Label>
                                        <Input
                                            id="place-name"
                                            value={placeName}
                                            onChange={(e) => setPlaceName(e.target.value)}
                                            placeholder="Giraffe Centre"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="place-category">
                                            Category (optional)
                                        </Label>
                                        <Input
                                            id="place-category"
                                            value={placeCategory}
                                            onChange={(e) =>
                                                setPlaceCategory(e.target.value)
                                            }
                                            placeholder="Attraction, Cafe, Museum..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="place-lat">
                                            Latitude (optional)
                                        </Label>
                                        <Input
                                            id="place-lat"
                                            type="number"
                                            step="0.000001"
                                            value={placeLat}
                                            onChange={(e) => setPlaceLat(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="place-lng">
                                            Longitude (optional)
                                        </Label>
                                        <Input
                                            id="place-lng"
                                            type="number"
                                            step="0.000001"
                                            value={placeLng}
                                            onChange={(e) => setPlaceLng(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <Label htmlFor="place-tags">
                                            Tags (comma separated, optional)
                                        </Label>
                                        <Input
                                            id="place-tags"
                                            value={placeTags}
                                            onChange={(e) => setPlaceTags(e.target.value)}
                                            placeholder="wildlife, family, outdoor"
                                        />
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <Label htmlFor="place-description">
                                            Description (optional)
                                        </Label>
                                        <Textarea
                                            id="place-description"
                                            rows={3}
                                            value={placeDescription}
                                            onChange={(e) =>
                                                setPlaceDescription(e.target.value)
                                            }
                                            placeholder="Short description or notes..."
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex items-center justify-between gap-4 pt-2">
                                        <div className="text-xs text-muted-foreground">
                                            These rows go into <code>itinero.places</code> and
                                            are linked to a destination via{" "}
                                            <code>destination_id</code>.
                                            {editingPlaceId && (
                                                <span className="ml-2">
                          Editing place ID:{" "}
                                                    <code className="font-mono text-[11px]">
                            {editingPlaceId}
                          </code>
                        </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {editingPlaceId && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={resetPlaceForm}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button
                                                type="submit"
                                                disabled={
                                                    placeSaving || !placeDestinationId
                                                }
                                            >
                                                {placeSaving && (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                                )}
                                                <Plus className="mr-1 h-4 w-4"/>
                                                {editingPlaceId
                                                    ? "Save changes"
                                                    : "Add place"}
                                            </Button>
                                        </div>
                                    </div>

                                    {placeMessage && (
                                        <p className="md:col-span-2 text-xs text-muted-foreground">
                                            {placeMessage}
                                        </p>
                                    )}
                                </form>

                                {/* List column */}
                                <div className="space-y-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Existing places{" "}
                                                {placeDestinationId
                                                    ? "(for selected destination)"
                                                    : "(all loaded)"}
                                            </h3>
                                            <p className="text-[11px] text-muted-foreground">
                                                Filter by name, category, tags or description.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-full sm:w-48">
                                                <Search
                                                    className="pointer-events-none absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground"/>
                                                <Input
                                                    className="pl-7 h-8 text-xs"
                                                    placeholder="Search places..."
                                                    value={placeSearch}
                                                    onChange={(e) =>
                                                        setPlaceSearch(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {visiblePlaces.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">
                                            {filteredPlacesByDestination.length === 0
                                                ? placeDestinationId
                                                    ? "No places yet for this destination. Add one using the form."
                                                    : "No places loaded yet. Choose a destination and add a place."
                                                : "No places match your search."}
                                        </p>
                                    ) : (
                                        <div className="max-h-60 overflow-auto rounded-md border text-xs">
                                            <table className="w-full border-collapse text-left">
                                                <thead className="border-b bg-muted/40">
                                                <tr>
                                                    <th className="px-2 py-1">Name</th>
                                                    <th className="px-2 py-1">Category</th>
                                                    <th className="px-2 py-1">Tags</th>
                                                    <th className="px-2 py-1 text-right">
                                                        Actions
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {visiblePlaces.map((p) => (
                                                    <tr
                                                        key={p.id}
                                                        className="border-b last:border-0 align-top"
                                                    >
                                                        <td className="px-2 py-1">
                                                            {p.name ?? "—"}
                                                        </td>
                                                        <td className="px-2 py-1">
                                                            {p.category ?? "—"}
                                                        </td>
                                                        <td className="px-2 py-1">
                                                            {tagsToString(p.tags) || "—"}
                                                        </td>
                                                        <td className="px-2 py-1">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() =>
                                                                        startEditPlace(p)
                                                                    }
                                                                >
                                                                    <Pencil className="h-3 w-3"/>
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-destructive"
                                                                    onClick={() =>
                                                                        handleDeletePlace(p.id)
                                                                    }
                                                                >
                                                                    <Trash2 className="h-3 w-3"/>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* =====================================================
           GUIDED TOURS SECTION (client-side stub)
        ===================================================== */}
                <TabsContent value="guided">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Flag className="h-4 w-4 text-primary"/>
                                Guided Tours
                            </CardTitle>
                            <CardDescription>
                                Experiment with curated multi-day tour presets tied to
                                destinations. This section is currently client-side
                                only; later you can back it with{" "}
                                <code>itinero.guided_tours</code>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
                                {/* Form column */}
                                <form
                                    className="grid gap-4 md:grid-cols-2"
                                    onSubmit={handleAddGuidedTour}
                                >
                                    <div className="space-y-1 md:col-span-2">
                                        <Label>Destination</Label>
                                        <Select
                                            value={tourDestinationId}
                                            onValueChange={setTourDestinationId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select destination"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {destinations.map((d) => (
                                                    <SelectItem key={d.id} value={d.id}>
                                                        {d.name ?? d.id}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <Label htmlFor="tour-title">Tour title</Label>
                                        <Input
                                            id="tour-title"
                                            value={tourTitle}
                                            onChange={(e) => setTourTitle(e.target.value)}
                                            placeholder="Nairobi in 3 Days"
                                        />
                                    </div>

                                    <div className="space-y-1 md:col-span-2">
                                        <Label htmlFor="tour-summary">Summary</Label>
                                        <Textarea
                                            id="tour-summary"
                                            rows={3}
                                            value={tourSummary}
                                            onChange={(e) =>
                                                setTourSummary(e.target.value)
                                            }
                                            placeholder="Short description of what this guided tour covers..."
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor="tour-days">Days</Label>
                                        <Input
                                            id="tour-days"
                                            type="number"
                                            min={1}
                                            value={tourDays}
                                            onChange={(e) =>
                                                setTourDays(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label>Difficulty</Label>
                                        <Select
                                            value={tourDifficulty}
                                            onValueChange={(v) =>
                                                setTourDifficulty(
                                                    v as GuidedTour["difficulty"]
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select difficulty"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="easy">
                                                    Easy (relaxed)
                                                </SelectItem>
                                                <SelectItem value="moderate">
                                                    Moderate (mix)
                                                </SelectItem>
                                                <SelectItem value="intense">
                                                    Intense (full days)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="md:col-span-2 flex items-center justify-between gap-4 pt-2">
                                        <div className="text-xs text-muted-foreground">
                                            This section is purely client-side for now. Once
                                            you are happy with the structure, connect it to a
                                            Supabase table.
                                        </div>
                                        <Button type="submit">
                                            <Plus className="mr-1 h-4 w-4"/>
                                            Add guided tour
                                        </Button>
                                    </div>

                                    {tourMessage && (
                                        <p className="md:col-span-2 text-xs text-muted-foreground">
                                            {tourMessage}
                                        </p>
                                    )}
                                </form>

                                {/* List column */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            Guided tours (local only)
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground">
                                            These are not stored in the database yet.
                                        </p>
                                    </div>
                                    {guidedTours.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">
                                            No guided tours yet. Create a few presets to align
                                            with your Itinero value prop (e.g. “48 hours in
                                            Accra”, “Best of Naivasha weekend”).
                                        </p>
                                    ) : (
                                        <div className="max-h-72 overflow-auto rounded-md border text-xs">
                                            <table className="w-full border-collapse text-left">
                                                <thead className="border-b bg-muted/40">
                                                <tr>
                                                    <th className="px-2 py-1">Title</th>
                                                    <th className="px-2 py-1">Destination</th>
                                                    <th className="px-2 py-1">Days</th>
                                                    <th className="px-2 py-1">Difficulty</th>
                                                    <th className="px-2 py-1 text-right">
                                                        Actions
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {guidedTours.map((t) => {
                                                    const destName =
                                                        destinations.find(
                                                            (d) => d.id === t.destination_id
                                                        )?.name ?? t.destination_id;
                                                    return (
                                                        <tr
                                                            key={t.id}
                                                            className="border-b last:border-0 align-top"
                                                        >
                                                            <td className="px-2 py-1">
                                                                {t.title}
                                                                <div
                                                                    className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                                                                    {t.summary}
                                                                </div>
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                {destName}
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                {t.days}d
                                                            </td>
                                                            <td className="px-2 py-1 capitalize">
                                                                {t.difficulty}
                                                            </td>
                                                            <td className="px-2 py-1">
                                                                <div className="flex justify-end">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-6 w-6 text-destructive"
                                                                        onClick={() =>
                                                                            handleDeleteGuidedTour(
                                                                                t.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-3 w-3"/>
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}