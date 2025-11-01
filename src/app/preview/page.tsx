"use client";

import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";
import {createClientBrowser} from "@/lib/supabase/browser";
import {normalizeModeClient} from "@/lib/utils/normalizeModeClient";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator"; // removed (unused)
import {ScrollArea} from "@/components/ui/scroll-area";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {
    Loader2,
    CalendarDays,
    MapPin,
    DollarSign,
    Footprints,
    Car,
    Bike,
    Train,
    LogOut,
    User2,
    Plane,
    Compass,
    Clock3,
} from "lucide-react";

// dnd-kit
import {DndContext, closestCenter, type DragEndEvent} from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

// Modal
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog";

/** Dynamically load the Leaflet map (avoids SSR "window is not defined") */
const LeafletMap = dynamic(() => import("./_leaflet/LeafletMap"), {ssr: false});
import "leaflet/dist/leaflet.css";

/** How many points are required to save a trip */
const REQUIRED_POINTS_TO_SAVE = 100;

/** ---------- Page ---------- */
export default function PreviewPage() {
    const sb = createClientBrowser();
    const router = useRouter();


    // --- hooks first (fixed order) ---
    const [authed, setAuthed] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [preview, setPreview] = useState<PreviewResponse | null>(null);
    const [saving, setSaving] = useState(false);
    const [edit, setEdit] = useState(false);
    const [activeDayIdx, setActiveDayIdx] = useState(0);

    // points
    const [points, setPoints] = useState<number>(0);
    const [pointsBusy, setPointsBusy] = useState<boolean>(false);
    const [insufficientOpen, setInsufficientOpen] = useState(false);
    const [savingTrip, setSavingTrip] = useState(false);

    // compute derived values with hooks BEFORE any early return
    const inputs = useMemo(() => preview?.trip_summary?.inputs, [preview]);
    const tripTitle = useMemo(() => {
        const dest = inputs?.destinations?.[0]?.name;
        return dest ? `${dest} — Your Trip Plan` : "Your Trip Plan";
    }, [inputs]);
    const modeIcon = modeToIcon(inputs?.mode);

    useEffect(() => {
        (async () => {
            try {
                const raw = localStorage.getItem("itinero:latest_preview");
                if (raw) setPreview(JSON.parse(raw));
                const {
                    data: {user},
                } = await sb.auth.getUser();
                setAuthed(!!user);
                setUserEmail(user?.email ?? null);
                setUserId(user?.id ?? null);
            } finally {
                setLoading(false);
            }
        })();
    }, [sb]);

    // fetch points (sum of ledger)
    useEffect(() => {
        if (!userId) return;
        (async () => {
            setPointsBusy(true);
            try {
                const {data, error} = await sb
                    .schema("itinero")
                    .from("points_ledger")
                    .select("sum:sum(delta)")
                    .eq("user_id", userId)
                    .maybeSingle<{ sum: number | null }>();

                const bal = !error ? Number(data?.sum ?? 0) : 0;
                setPoints(Number.isFinite(bal) ? bal : 0);
            } finally {
                setPointsBusy(false);
            }
        })();
    }, [sb, userId]);

    // --- early returns (safe now) ---
    if (loading) {
        return (
            <div className="mx-auto grid min-h-[60vh] max-w-4xl place-items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin"/> Checking session…
                </div>
            </div>
        );
    }

    if (!authed) {
        return (
            <div className="mx-auto mt-10 max-w-lg">
                <Card>
                    <CardHeader>
                        <CardTitle>Sign in required</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>You need to be signed in to view your itinerary preview.</p>
                        <div className="flex gap-2">
                            <Button onClick={() => router.push("/login")}>Go to Login</Button>
                            <AuthButtons/>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // --- authed shell below ---
    if (!preview) {
        return (
            <AppShell userEmail={userEmail} onLogout={async () => {
                await sb.auth.signOut();
                router.replace("/login");
            }}>
                <div className="mx-auto mt-10 max-w-lg text-center">
                    <Card>
                        <CardHeader>
                            <CardTitle>No preview found</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>Generate a preview from the wizard first.</p>
                            <p>
                                If you just signed in, go back and click <strong>Generate preview</strong> again so we
                                can reload it here.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AppShell>
        );
    }

    // derived totals for cosmetics
    const totalDays = preview.days?.length ?? preview.trip_summary.total_days ?? 0;
    const estTotal = preview.trip_summary.est_total_cost ?? 0;
    const dailyBudget = preview.trip_summary?.currency
        ? `${preview.trip_summary.currency} ${Math.round(estTotal / Math.max(totalDays, 1))}`
        : `~$${Math.round(estTotal / Math.max(totalDays, 1))}`;

    const progressPct = (() => {
        if (!totalDays) return 0;
        return Math.min(100, Math.round(((activeDayIdx + 1) / totalDays) * 100));
    })();

    async function handleSaveTrip() {
        if (!userId || !preview) return;
        if (pointsBusy) return;

        if (points < REQUIRED_POINTS_TO_SAVE) {
            setInsufficientOpen(true);
            return;
        }

        setSavingTrip(true);
        try {
            const ts = preview.trip_summary;        // ✅ narrows type
            const inps = ts.inputs ?? inputs;

            // 1) Create trip
            const title = inputs?.destinations?.[0]?.name ? `${inputs.destinations[0].name} Trip` : "Trip";

            const payloadTrip: {
                user_id: string;
                title: string;
                start_date: string | null;
                end_date: string | null;
                est_total_cost: number | null;
                currency: string | null;
                inputs?: PreviewResponse["trip_summary"]["inputs"];
            } = {
                user_id: userId,
                title,
                start_date: inputs?.start_date ?? preview.trip_summary.start_date ?? null,
                end_date: inputs?.end_date ?? preview.trip_summary.end_date ?? null,
                est_total_cost: preview.trip_summary.est_total_cost ?? null,
                currency: preview.trip_summary.currency ?? null,
                inputs, // store raw inputs for provenance
            };

            const {
                data: tripIns,
                error: tripErr
            } = await sb.from("itinero.trips").insert(payloadTrip).select("id").single();

            if (tripErr) throw tripErr;
            const tripId = (tripIns as { id: string }).id;

            // 2) Create trip items
            const itemsPayload: Array<{
                trip_id: string;
                day_index: number;
                date: string | null;
                order_index: number;
                when: Day["blocks"][number]["when"];
                place_id: string | null;
                title: string;
                est_cost: number | null;
                duration_min: number | null;
                travel_min_from_prev: number | null;
                notes: string | null;
            }> = [];

            for (let d = 0; d < preview.days.length; d++) {
                const day = preview.days[d];
                for (let i = 0; i < day.blocks.length; i++) {
                    const b = day.blocks[i];
                    itemsPayload.push({
                        trip_id: tripId,
                        day_index: d,
                        date: day.date ?? null,
                        order_index: i,
                        when: b.when,
                        place_id: b.place_id,
                        title: b.title,
                        est_cost: b.est_cost ?? null,
                        duration_min: b.duration_min ?? null,
                        travel_min_from_prev: b.travel_min_from_prev ?? null,
                        notes: b.notes ?? null,
                    });
                }
            }

            if (itemsPayload.length) {
                const {error: itemsErr} = await sb.from("itinero.trip_items").insert(itemsPayload);
                if (itemsErr) throw itemsErr;
            }

            // 3) Deduct points
            const {error: ledgerErr} = await sb.from("itinero.points_ledger").insert({
                user_id: userId,
                delta: -REQUIRED_POINTS_TO_SAVE,
                reason: "save_trip",
                source: "ui",
            });
            if (ledgerErr) throw ledgerErr;

            // 4) Update local points & navigate
            setPoints((p) => p - REQUIRED_POINTS_TO_SAVE);
            router.push(`/trips`);
        } catch (e) {
            // optional: toast here
            if (process.env.NODE_ENV !== "production") {
                console.debug("[save_trip] failed", e);
            }
        } finally {
            setSavingTrip(false);
        }
    }

    return (
        <AppShell userEmail={userEmail} onLogout={async () => {
            await sb.auth.signOut();
            router.replace("/login");
        }}>
            <div className="w-full">
                {/* HERO */}
                <section className="relative overflow-hidden">
                    <div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,hsl(var(--primary)/0.12),transparent_70%)]"/>
                    <div className="mx-auto w-full max-w-6xl px-4 pb-4 pt-8 md:pt-10">
                        <div
                            className="flex flex-col-reverse items-start gap-6 md:flex-row md:items-end md:justify-between">
                            <div>
                                <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Preview
                                    Itinerary
                                </div>
                                <h1 className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-2xl font-bold leading-tight text-transparent md:text-3xl">
                                    {tripTitle}
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                    <Badge variant="outline" className="gap-1">
                                        <MapPin className="h-3.5 w-3.5"/>
                                        {inputs?.destinations?.[0]?.name ?? "—"}
                                    </Badge>
                                    <Badge variant="outline" className="gap-1">
                                        <CalendarDays className="h-3.5 w-3.5"/>
                                        {formatDateRange(preview.trip_summary)}
                                    </Badge>
                                    {modeIcon && (
                                        <Badge variant="outline" className="gap-1">
                                            {modeIcon}
                                            {inputs?.mode}
                                        </Badge>
                                    )}
                                    {inputs?.pace && <Badge variant="outline">pace: {inputs.pace}</Badge>}
                                    {typeof estTotal === "number" && (
                                        <Badge variant="secondary" className="gap-1">
                                            <DollarSign className="h-3.5 w-3.5"/>
                                            est. ${estTotal}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Action bar */}
                            <div className="flex shrink-0 flex-wrap gap-2">
                                <Button
                                    onClick={() => saveDraftAsTrip(sb, preview as PreviewResponse, setSaving)}
                                    disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving…
                                        </>
                                    ) : (
                                        "Save Draft"
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={handleSaveTrip}
                                    disabled={savingTrip || pointsBusy}
                                    title={
                                        pointsBusy
                                            ? "Checking points…"
                                            : points < REQUIRED_POINTS_TO_SAVE
                                                ? `Requires ${REQUIRED_POINTS_TO_SAVE} pts (you have ${points})`
                                                : "Save to Trips"
                                    }
                                >
                                    {savingTrip ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving Trip…
                                        </>
                                    ) : (
                                        `Save Trip (${pointsBusy ? "…" : points}/${REQUIRED_POINTS_TO_SAVE} pts)`
                                    )}
                                </Button>

                                <Button variant={edit ? "secondary" : "outline"} onClick={() => setEdit(!edit)}>
                                    {edit ? "Done" : "Edit"}
                                </Button>
                            </div>
                        </div>

                        {/* Stat strip */}
                        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                            <StatCard icon={<CalendarDays className="h-4 w-4"/>} label="Days"
                                      value={String(totalDays || "—")}/>
                            <StatCard icon={<DollarSign className="h-4 w-4"/>} label="Daily est." value={dailyBudget}/>
                            <StatCard icon={<Compass className="h-4 w-4"/>} label="Mode" value={inputs?.mode ?? "—"}/>
                            <StatCard icon={<Clock3 className="h-4 w-4"/>} label="Pace" value={inputs?.pace ?? "—"}/>
                        </div>

                        {/* Progress */}
                        <div className="mt-4">
                            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                <span>Trip progress</span>
                                <span>
                  Day {activeDayIdx + 1} of {totalDays || "—"}
                </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full border bg-muted/40">
                                <div className="h-full rounded-full bg-primary transition-all"
                                     style={{width: `${progressPct}%`}}/>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BODY */}
                <section className="mx-auto w-full max-w-6xl px-4 pb-10">
                    <Card className="overflow-hidden border">
                        <CardHeader className="border-b bg-muted/30 py-3">
                            {/* Tabs header (visual only; content below) */}
                            <Tabs defaultValue="days" className="w-full">
                                <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                                    <TabsTrigger value="days" className="rounded-full">
                                        Days
                                    </TabsTrigger>
                                    <TabsTrigger value="places" className="rounded-full">
                                        Places
                                    </TabsTrigger>
                                    <TabsTrigger value="raw" className="rounded-full">
                                        Raw
                                    </TabsTrigger>
                                </TabsList>
                                <div className="sr-only"/>
                            </Tabs>
                        </CardHeader>

                        <CardContent className="space-y-6 py-6">
                            {/* Interests */}
                            {Array.isArray(inputs?.interests) && inputs!.interests.length > 0 && (
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Interests
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {inputs!.interests.map((t) => (
                                            <Badge key={t} variant="outline" className="capitalize">
                                                {emojiFor(t)} {t}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Main: Day editor + Map */}
                            <Tabs defaultValue="days">
                                <TabsContent value="days" className="mt-0">
                                    {/* Day picker */}
                                    <div className="relative">
                                        <ScrollArea className="w-full">
                                            <div className="flex w-max gap-2">
                                                {(preview.days || []).map((_, i) => (
                                                    <Button
                                                        key={i}
                                                        size="sm"
                                                        variant={activeDayIdx === i ? "default" : "secondary"}
                                                        onClick={() => setActiveDayIdx(i)}
                                                        className="rounded-full"
                                                    >
                                                        Day {i + 1}
                                                    </Button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    {/* Split grid */}
                                    <div
                                        className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(480px,1fr)_minmax(540px,1fr)]">
                                        <div className="rounded-2xl border bg-card p-2 md:p-3">
                                            <DayEditor
                                                edit={edit}
                                                dayIdx={activeDayIdx}
                                                day={preview.days[activeDayIdx]}
                                                placesById={new Map(preview.places.map((p) => [p.id, p]))}
                                                onChange={(nextDay) => {
                                                    const next = {
                                                        ...preview,
                                                        days: preview.days.map((d, i) => (i === activeDayIdx ? nextDay : d)),
                                                    } as PreviewResponse;
                                                    setPreview(next);
                                                    localStorage.setItem("itinero:latest_preview", JSON.stringify(next));
                                                }}
                                            />
                                        </div>

                                        <aside className="md:sticky md:top-20 h-[calc(100vh-160px)] md:self-start">
                                            <div className="overflow-hidden rounded-2xl border">
                                                <LeafletMap day={preview.days[activeDayIdx]}
                                                            placesById={new Map(preview.places.map((p) => [p.id, p]))}/>
                                            </div>
                                        </aside>
                                    </div>
                                </TabsContent>

                                {/* PLACES TAB */}
                                <TabsContent value="places" className="mt-0">
                                    <div className="rounded-2xl border p-4">
                                        <PlacesList places={preview.places}/>
                                    </div>
                                </TabsContent>

                                {/* RAW TAB */}
                                <TabsContent value="raw" className="mt-0">
                                    <ScrollArea className="h-[420px] w-full overflow-hidden rounded-2xl border">
                                        <pre className="p-4 text-xs">{JSON.stringify(preview, null, 2)}</pre>
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </section>
            </div>

            {/* Not enough points dialog */}
            <Dialog open={insufficientOpen} onOpenChange={setInsufficientOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Not enough points</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 text-sm">
                        <p>
                            You need <strong>{REQUIRED_POINTS_TO_SAVE}</strong> points to save a trip. You currently
                            have{" "}
                            <strong>{pointsBusy ? "…" : points}</strong>.
                        </p>
                        <p className="text-muted-foreground">Top up your points and try again.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setInsufficientOpen(false)}>
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                setInsufficientOpen(false);
                                router.push("/rewards");
                            }}
                        >
                            Top up
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}

/** ---------- Shell (nav only when authed) ---------- */
function AppShell({
                      userEmail,
                      onLogout,
                      children,
                  }: {
    userEmail: string | null;
    onLogout: () => Promise<void> | void;
    children: React.ReactNode;
}) {
    const router = useRouter();
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
                    <div className="flex cursor-pointer items-center gap-2" onClick={() => router.push("/")}
                         title="Itinero">
                        <Plane className="h-5 w-5"/>
                        <span className="text-sm font-semibold">Itinero</span>
                    </div>
                    <nav className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push("/trips")}>
                            Trips
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
                            <User2 className="mr-1 h-4 w-4"/> Profile
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onLogout()}>
                            <LogOut className="mr-1 h-4 w-4"/> Logout
                        </Button>
                        {userEmail ?
                            <Badge variant="outline" className="ml-2 hidden sm:inline-flex">{userEmail}</Badge> : null}
                    </nav>
                </div>
            </header>

            <main className="flex-1">{children}</main>
        </div>
    );
}

/** ---------- Local components ---------- */
function StatCard({icon, label, value}: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-card/60 p-3 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="rounded-md border bg-background p-1">{icon}</span>
                    <span className="text-xs uppercase tracking-wider">{label}</span>
                </div>
                <div className="text-base font-semibold">{value}</div>
            </div>
        </div>
    );
}

function AuthButtons() {
    const sb = createClientBrowser();
    const [busy, setBusy] = useState(false);
    return (
        <div className="flex gap-2">
            <Button
                variant="secondary"
                onClick={async () => {
                    setBusy(true);
                    try {
                        await sb.auth.signInWithOAuth({provider: "google"});
                    } finally {
                        setBusy(false);
                    }
                }}
                disabled={busy}
            >
                {busy ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>…
                    </>
                ) : (
                    "Continue with Google"
                )}
            </Button>
        </div>
    );
}

type Mode = "walk" | "bike" | "car" | "transit";
type LodgingLike = { name?: string; lat?: number; lng?: number } | null;

function DayEditor({
                       edit,
                       dayIdx,
                       day,
                       placesById,
                       onChange,
                   }: {
    edit: boolean;
    dayIdx: number;
    day: Day;
    placesById: Map<string, Place>;
    onChange: (nextDay: Day) => void;
}) {
    const sb = createClientBrowser();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerForIdx, setPickerForIdx] = useState<number | null>(null);

    // safe read of trip inputs from localStorage
    const tripInputs: PreviewResponse["trip_summary"]["inputs"] | null = useMemo(() => {
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem("itinero:latest_preview");
            return raw ? (JSON.parse(raw)?.trip_summary?.inputs ?? null) : null;
        } catch {
            return null;
        }
    }, []);

    const tripMode = normalizeModeClient(tripInputs?.mode ?? "walking");

    // const tripMode: Mode = (tripInputs?.mode ?? "walk") as Mode;
    const tripLodging: LodgingLike = day.lodging ?? tripInputs?.lodging ?? null;

    // DnD reorder
    const onDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over || active.id === over.id) return;
        const oldIndex = day.blocks.findIndex((_, i) => `${day.date}-${i}` === active.id);
        const newIndex = day.blocks.findIndex((_, i) => `${day.date}-${i}` === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const next = [...day.blocks];
        const [moved] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, moved);
        onChange({...day, blocks: next});
    };

    const updateBlock = (i: number, patch: Partial<Day["blocks"][0]>) => {
        const blocks = day.blocks.map((b, idx) => (idx === i ? {...b, ...patch} : b));
        onChange({...day, blocks});
    };

    const addBlock = () => {
        const blocks = [
            ...day.blocks,
            {
                when: "afternoon" as const,
                place_id: null,
                title: "New activity",
                est_cost: 10,
                duration_min: 90,
                travel_min_from_prev: 15,
                notes: "",
            },
        ];
        onChange({...day, blocks});
    };

    const removeBlock = (i: number) => {
        const blocks = day.blocks.filter((_, idx) => idx !== i);
        onChange({...day, blocks});
    };

    const dayCost = useMemo(() => Math.max(0, Math.round(day.blocks.reduce((acc, b) => acc + (b.est_cost || 0), 0))), [day.blocks]);

    // RPC response type
    type BuildLegsResponse = {
        ordered_points: Array<{ type: "start" | "waypoint" | "end"; id: string | null }>;
        polyline6?: string;
        polyline?: string;
    };

    return (
        <div className="space-y-4 p-3 md:p-4">
            {/* header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Day {dayIdx + 1}</div>
                    <div className="text-lg font-semibold">{formatISODate(day.date)}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                    est. day cost: <span className="font-medium text-foreground">${dayCost}</span>
                </div>
            </div>

            {/* controls */}
            {edit && (
                <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={addBlock}>
                        + Add block
                    </Button>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            // collect waypoints with coordinates
                            const waypointPlaces: Place[] = day.blocks
                                .map((b) => (b.place_id ? placesById.get(b.place_id) : null))
                                .filter((p): p is Place => !!p && typeof p.lat === "number" && typeof p.lng === "number");

                            const waypoints: Array<{
                                id: string;
                                name: string;
                                lat: number;
                                lng: number
                            }> = waypointPlaces.map((p) => ({
                                id: p.id,
                                name: p.name,
                                lat: p.lat as number,
                                lng: p.lng as number,
                            }));

                            const start: { id: string | null; name: string; lat: number; lng: number } | null =
                                tripLodging && typeof tripLodging.lat === "number" && typeof tripLodging.lng === "number"
                                    ? {
                                        id: null,
                                        name: tripLodging.name ?? "Lodging",
                                        lat: tripLodging.lat,
                                        lng: tripLodging.lng,
                                    }
                                    : waypoints[0] || null;

                            if (!start || waypoints.length === 0) return;

                            const {data, error} = await sb.functions.invoke<BuildLegsResponse>("build_legs_for_day", {
                                body: {mode: tripMode, start, waypoints, roundtrip: true},
                            });

                            if (!error && data) {
                                try {
                                    const orderIds = (data.ordered_points || [])
                                        .filter((pt) => pt.type === "waypoint" && typeof pt.id === "string")
                                        .map((pt) => pt.id as string);

                                    const pickById = new Map<string, { block: Day["blocks"][number] }>();
                                    day.blocks.forEach((b) => {
                                        if (b.place_id) pickById.set(b.place_id, {block: b});
                                    });

                                    const reordered: typeof day.blocks = [];
                                    for (const id of orderIds) {
                                        const hit = pickById.get(id);
                                        if (hit) reordered.push(hit.block);
                                    }
                                    // append any missing blocks (e.g., without place_id)
                                    for (const blk of day.blocks) {
                                        if (!reordered.includes(blk)) reordered.push(blk);
                                    }

                                    const nextDay: Day = {
                                        ...day,
                                        blocks: reordered,
                                        map_polyline: data.polyline6 ?? data.polyline ?? day.map_polyline,
                                    };
                                    onChange(nextDay);
                                } catch {
                                    /* ignore */
                                }
                            }
                        }}
                    >
                        Rebuild day
                    </Button>
                </div>
            )}

            {/* timeline blocks */}
            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={day.blocks.map((_, i) => `${day.date}-${i}`)}
                                 strategy={verticalListSortingStrategy}>
                    <div className="relative">
                        <div className="pointer-events-none absolute left-[14px] top-0 h-full w-px bg-border"/>
                        <div className="space-y-3">
                            {day.blocks.map((b, i) => {
                                const place = b.place_id ? placesById.get(b.place_id) : null;
                                return (
                                    <SortableItem key={`${day.date}-${i}`} id={`${day.date}-${i}`}>
                                        <div className="relative">
                                            <div
                                                className="absolute left-2 top-4 h-3 w-3 -translate-x-1/2 rounded-full border bg-background shadow-sm"/>
                                            {!edit ? (
                                                <div
                                                    className="ml-6 rounded-xl border bg-card/60 p-4 shadow-sm transition hover:shadow">
                                                    <div className="flex items-center justify-between">
                                                        <div
                                                            className="text-[11px] uppercase tracking-wider text-muted-foreground">{b.when}</div>
                                                    </div>
                                                    <div className="mt-2 grid gap-3 md:grid-cols-3">
                                                        <div className="md:col-span-2">
                                                            <div className="text-base font-medium">{b.title}</div>
                                                            {b.notes && <div
                                                                className="mt-1 text-sm text-muted-foreground">{b.notes}</div>}
                                                            {place && (
                                                                <div className="mt-2 text-sm text-muted-foreground">
                                                                    <span
                                                                        className="font-medium text-foreground">{place.name}</span>
                                                                    {place.category && <span> • {place.category}</span>}
                                                                    {place.lat != null && place.lng != null && (
                                                                        <span
                                                                            className="ml-1"> • {place.lat.toFixed(3)}, {place.lng.toFixed(3)}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                            <Metric label="Est. cost" value={`$${b.est_cost ?? 0}`}/>
                                                            <Metric label="Duration" value={`${b.duration_min}m`}/>
                                                            <Metric label="Travel"
                                                                    value={`${b.travel_min_from_prev}m`}/>
                                                        </div>
                                                    </div>
                                                    {b.alternatives?.length ? (
                                                        <div className="mt-3">
                                                            <div
                                                                className="text-xs text-muted-foreground">Alternatives
                                                            </div>
                                                            <div className="mt-1 flex flex-wrap gap-2">
                                                                {b.alternatives.slice(0, 3).map((a) => (
                                                                    <span key={a.id ?? a.name}
                                                                          className="rounded-full border px-2 py-1 text-xs">
                                    {a.name} {a.est_cost ? `· ~$${a.est_cost}` : ""}
                                  </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <div className="ml-6 rounded-xl border bg-card/60 p-4 shadow-sm">
                                                    <div className="flex items-center justify-between">
                                                        <div
                                                            className="text-[11px] uppercase tracking-wider text-muted-foreground">{b.when}</div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setPickerForIdx(i);
                                                                    setPickerOpen(true);
                                                                }}
                                                            >
                                                                Pick place
                                                            </Button>
                                                            <Button variant="ghost" size="sm"
                                                                    onClick={() => removeBlock(i)}>
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <label
                                                                className="text-xs text-muted-foreground">Title</label>
                                                            <Input value={b.title}
                                                                   onChange={(e) => updateBlock(i, {title: e.target.value})}/>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <LabeledNumber label="Est. cost" value={b.est_cost}
                                                                           onChange={(v) => updateBlock(i, {est_cost: v})}/>
                                                            <LabeledNumber label="Duration (min)" value={b.duration_min}
                                                                           onChange={(v) => updateBlock(i, {duration_min: v})}/>
                                                            <LabeledNumber
                                                                label="Travel (min)"
                                                                value={b.travel_min_from_prev}
                                                                onChange={(v) => updateBlock(i, {travel_min_from_prev: v})}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <label
                                                                className="text-xs text-muted-foreground">Notes</label>
                                                            <Textarea
                                                                placeholder="Optional notes"
                                                                value={b.notes ?? ""}
                                                                onChange={(e) => updateBlock(i, {notes: e.target.value})}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label
                                                                className="text-xs text-muted-foreground">Place</label>
                                                            <div className="rounded-md border p-2 text-sm">
                                                                {place ? (
                                                                    <div
                                                                        className="flex items-center justify-between gap-2">
                                                                        <div>
                                                                            <div
                                                                                className="font-medium">{place.name}</div>
                                                                            <div
                                                                                className="text-xs text-muted-foreground">{place.category ?? "—"}</div>
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {place.lat != null && place.lng != null ? `${place.lat.toFixed(3)}, ${place.lng.toFixed(3)}` : ""}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">No place selected</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </SortableItem>
                                );
                            })}
                        </div>
                    </div>
                </SortableContext>
            </DndContext>

            {/* Picker modal */}
            <PlacePicker
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                onSelect={(place) => {
                    if (pickerForIdx == null) return;
                    const patch: Partial<Day["blocks"][0]> = {place_id: place.id, title: place.name};
                    const blocks = day.blocks.map((b, idx) => (idx === pickerForIdx ? {...b, ...patch} : b));
                    onChange({...day, blocks});
                }}
            />
        </div>
    );
}

function Metric({label, value}: { label: string; value: string | number }) {
    return (
        <div className="rounded-md border bg-background p-2">
            <div className="text-[11px] text-muted-foreground">{label}</div>
            <div className="font-medium">{value}</div>
        </div>
    );
}

function LabeledNumber({
                           label,
                           value,
                           onChange,
                       }: {
    label: string;
    value: number | undefined;
    onChange: (n: number) => void;
}) {
    return (
        <div className="space-y-2">
            <label className="text-xs text-muted-foreground">{label}</label>
            <Input type="number" min={0} value={String(value ?? "")}
                   onChange={(e) => onChange(Number(e.target.value || 0))}/>
        </div>
    );
}

function PlacesList({places}: { places: Place[] }) {
    if (!places?.length) return <div className="text-sm text-muted-foreground">No places included.</div>;
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {places.map((p) => (
                <div key={p.id} className="rounded-xl border bg-card/60 p-3 shadow-sm">
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{p.category ?? "—"}</div>
                    {typeof p.popularity === "number" &&
                        <div className="mt-2 text-xs text-muted-foreground">popularity: {p.popularity}</div>}
                </div>
            ))}
        </div>
    );
}

/** -------- helpers -------- */
function SortableItem({id, children}: { id: string; children: React.ReactNode }) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});
    const style: React.CSSProperties = {transform: CSS.Transform.toString(transform), transition};
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

function PlacePicker({
                         open,
                         onOpenChange,
                         onSelect,
                     }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSelect: (p: Place) => void;
}) {
    const sb = createClientBrowser();
    const [q, setQ] = useState("");
    const [rows, setRows] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);

    async function search() {
        setLoading(true);
        try {
            let query = sb
                .schema("itinero")
                .from("places")
                .select("id,name,lat,lng,category,popularity")
                .limit(25);

            if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);
            const {data} = await query;
            if (data) setRows(data as unknown as Place[]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (open) {
            setQ("");
            setRows([]);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Pick a place</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search places…"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") search();
                            }}
                        />
                        <Button onClick={search} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : "Search"}
                        </Button>
                    </div>
                    <div className="max-h-72 overflow-auto rounded-md border">
                        {!rows.length ? (
                            <div className="p-3 text-sm text-muted-foreground">No results yet</div>
                        ) : (
                            <ul className="divide-y">
                                {rows.map((p) => (
                                    <li key={p.id}
                                        className="flex items-center justify-between gap-3 p-3 hover:bg-accent/50">
                                        <div>
                                            <div className="font-medium">{p.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {p.category ?? "—"}
                                                {typeof p.popularity === "number" ? ` • pop ${p.popularity}` : ""}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                onSelect(p);
                                                onOpenChange(false);
                                            }}
                                        >
                                            Select
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

async function saveDraft(
    sb: ReturnType<typeof createClientBrowser>,
    preview: PreviewResponse,
    setSaving: (v: boolean) => void
) {
    try {
        setSaving(true);
        const {error} = await sb.from("draft_previews").insert({payload: preview});
        if (error) throw error;
    } finally {
        setSaving(false);
    }
}


// Replace your old saveDraft with this:
async function saveDraftAsTrip(
    sb: ReturnType<typeof createClientBrowser>,
    preview: PreviewResponse,
    setSaving: (v: boolean) => void,
) {
    setSaving(true);
    try {
        // 0) auth
        const {data: auth} = await sb.auth.getUser();
        const userId: string | undefined = auth?.user?.id ?? undefined;
        if (!userId) throw new Error("Not authenticated");

        // 1) trip row (matches itinero.trips)
        const inputs = preview.trip_summary?.inputs;
        const title =
            inputs?.destinations?.[0]?.name
                ? `${inputs.destinations[0].name} Trip`
                : "Trip";

        const tripRow: {
            user_id: string;
            title: string | null;
            start_date: string | null;
            end_date: string | null;
            est_total_cost: number | null;
            currency: string | null;
            inputs?: PreviewResponse["trip_summary"]["inputs"];
        } = {
            user_id: userId,
            title,
            start_date: inputs?.start_date ?? preview.trip_summary.start_date ?? null,
            end_date: inputs?.end_date ?? preview.trip_summary.end_date ?? null,
            est_total_cost:
                typeof preview.trip_summary.est_total_cost === "number"
                    ? preview.trip_summary.est_total_cost
                    : null,
            currency: preview.trip_summary.currency ?? null,
            inputs, // keep provenance
        };

        const {data: tripInsert, error: tripErr} = await sb
            .schema("itinero")
            .from("trips")
            .insert(tripRow)
            .select("id")
            .single();

        if (tripErr) throw tripErr;
        const tripId: string = (tripInsert as { id: string }).id;

        // 2) itinerary items (matches itinero.itinerary_items)
        type ItemInsert = {
            trip_id: string;
            day_index: number;
            date: string | null;
            order_index: number;
            when: "morning" | "afternoon" | "evening";
            place_id: string | null;                 // must be uuid if FK exists
            title: string;
            est_cost: number | null;
            duration_min: number | null;
            travel_min_from_prev: number | null;
            notes: string | null;
        };

        const items: ItemInsert[] = [];
        preview.days.forEach((day, dIdx) => {
            day.blocks.forEach((b, iIdx) => {
                items.push({
                    trip_id: tripId,
                    day_index: dIdx,
                    date: day.date ?? null,
                    order_index: iIdx,
                    when: b.when,
                    place_id: b.place_id, // ensure these ids are UUIDs that exist in itinero.places
                    title: b.title,
                    est_cost: typeof b.est_cost === "number" ? b.est_cost : null,
                    duration_min:
                        typeof b.duration_min === "number" ? b.duration_min : null,
                    travel_min_from_prev:
                        typeof b.travel_min_from_prev === "number"
                            ? b.travel_min_from_prev
                            : null,
                    notes: b.notes ?? null,
                });
            });
        });

        if (items.length) {
            const {error: itemsErr} = await sb
                .schema("itinero")
                .from("itinerary_items")
                .insert(items);
            if (itemsErr) throw itemsErr;
        }
    } finally {
        setSaving(false);
    }
}


function emojiFor(tag: string) {
    const t = tag.toLowerCase();
    if (t.includes("beach")) return "🌴";
    if (t.includes("food") || t.includes("dining")) return "🍽";
    if (t.includes("culture") || t.includes("museum")) return "🏛";
    if (t.includes("music")) return "🎶";
    if (t.includes("night")) return "🌙";
    if (t.includes("shop")) return "🛍";
    if (t.includes("hiking") || t.includes("trail")) return "🥾";
    if (t.includes("wildlife") || t.includes("safari")) return "🦁";
    if (t.includes("art")) return "🎨";
    if (t.includes("sports")) return "🏅";
    if (t.includes("wellness") || t.includes("spa")) return "💆";
    if (t.includes("architecture")) return "🏗";
    if (t.includes("festival") || t.includes("event")) return "🎉";
    if (t.includes("nature") || t.includes("park")) return "🌿";
    return "✨";
}

function formatDateRange(summary: PreviewResponse["trip_summary"]) {
    const start = summary.inputs?.start_date ?? summary.start_date;
    const end = summary.inputs?.end_date ?? summary.end_date;
    const fmt = (x?: string) =>
        x ? new Date(x + "T00:00:00").toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }) : "—";
    if (start && end) return `${fmt(start)} → ${fmt(end)}`;
    return fmt(start || end);
}

function formatISODate(x?: string) {
    if (!x) return "—";
    try {
        return new Date(x + "T00:00:00").toLocaleDateString(undefined, {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return x;
    }
}

function modeToIcon(mode?: string) {
    if (!mode) return null;
    const cl = "mr-1 h-3.5 w-3.5";
    if (mode === "walk") return <Footprints className={cl}/>;
    if (mode === "bike") return <Bike className={cl}/>;
    if (mode === "car") return <Car className={cl}/>;
    if (mode === "transit") return <Train className={cl}/>;
    return null;
}

/** ---------- types (mirror of function output) ---------- */
export type PreviewResponse = {
    trip_summary: {
        total_days: number;
        est_total_cost: number;
        currency?: string;
        inputs?: {
            destinations?: { id: string; name: string; lat?: number; lng?: number }[];
            start_date?: string;
            end_date?: string;
            interests?: string[];
            pace?: "chill" | "balanced" | "packed";
            mode?: "walk" | "bike" | "car" | "transit";
            lodging?: { name: string; lat?: number; lng?: number } | null;
        };
        start_date?: string;
        end_date?: string;
    };
    days: Day[];
    places: Place[];
};

export type Day = {
    date: string;
    blocks: Array<{
        when: "morning" | "afternoon" | "evening";
        place_id: string | null;
        title: string;
        est_cost: number;
        duration_min: number;
        travel_min_from_prev: number;
        notes?: string;
        alternatives?: Array<{
            id: string | null;
            name: string;
            est_cost: number;
            hint?: { hop_km?: number; score?: number }
        }>;
    }>;
    map_polyline?: string;
    lodging?: { name: string; lat: number; lng: number } | null;
    return_to_lodging_min?: number | null;
    est_day_cost?: number;
    budget_daily?: number;
};

export type Place = {
    id: string;
    name: string;
    lat?: number;
    lng?: number;
    category?: string | null;
    tags?: string[] | null;
    popularity?: number | null;
    cost_typical?: number | null;
    cost_currency?: string | null;
};