"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClientBrowser } from "@/lib/supabase/browser";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Loader2,
    CalendarDays,
    MapPin,
    DollarSign,
    Footprints,
    Car,
    Bike,
    Train,
    Compass,
    Clock3,
} from "lucide-react";

// Modal
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

/** Map (no SSR) */
const LeafletMap = dynamic(() => import("./_leaflet/LeafletMap"), { ssr: false });
import "leaflet/dist/leaflet.css";
import AppShell from "@/components/layout/AppShell";

/* =========================
   Types
========================= */
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
            hint?: { hop_km?: number; score?: number };
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

/* =========================
   Helpers
========================= */
type Mode = "walk" | "bike" | "car" | "transit";
const REQUIRED_POINTS_TO_SAVE = 100;

function normalizeModeClient(m?: string): Mode {
    if (m === "bike" || m === "car" || m === "transit" || m === "walk") return m;
    if (m === "walking") return "walk";
    return "walk";
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
        x
            ? new Date(x + "T00:00:00").toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            : "—";
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
    if (mode === "walk") return <Footprints className={cl} />;
    if (mode === "bike") return <Bike className={cl} />;
    if (mode === "car") return <Car className={cl} />;
    if (mode === "transit") return <Train className={cl} />;
    return null;
}

/* =========================
   Page
========================= */
export default function PreviewPage() {
    const sb = createClientBrowser();
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const mapTheme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

    // state
    const [authed, setAuthed] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [preview, setPreview] = useState<PreviewResponse | null>(null);
    const [saving, setSaving] = useState(false);
    const [activeDayIdx, setActiveDayIdx] = useState(0);

    const [points, setPoints] = useState<number>(0);
    const [pointsBusy, setPointsBusy] = useState<boolean>(false);
    const [insufficientOpen, setInsufficientOpen] = useState(false);
    const [savingTrip, setSavingTrip] = useState(false);

    // derived
    const inputs = useMemo(() => preview?.trip_summary?.inputs, [preview]);
    const tripTitle = useMemo(() => {
        const dest = inputs?.destinations?.[0]?.name;
        return dest ? `${dest} — Your Trip Plan` : "Your Trip Plan";
    }, [inputs]);
    const modeIcon = modeToIcon(inputs?.mode);

    // bootstrap
    useEffect(() => {
        (async () => {
            try {
                const raw = localStorage.getItem("itinero:latest_preview");
                if (raw) setPreview(JSON.parse(raw));
                const { data: { user } } = await sb.auth.getUser();
                setAuthed(!!user);
                setUserId(user?.id ?? null);
            } finally {
                setLoading(false);
            }
        })();
    }, [sb]);

    // balance
    useEffect(() => {
        if (!userId) return;
        (async () => {
            setPointsBusy(true);
            try {
                const { data: rpcBalance } = await sb.rpc("get_points_balance");
                if (typeof rpcBalance === "number") setPoints(rpcBalance);
            } finally {
                setPointsBusy(false);
            }
        })();
    }, [sb, userId]);

    // clamp day index
    useEffect(() => {
        const len = preview?.days?.length ?? 0;
        if (!len) return;
        if (activeDayIdx > len - 1) setActiveDayIdx(len - 1);
    }, [preview?.days?.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // early returns
    if (loading) {
        return (
            <div className="mx-auto grid min-h-[60vh] max-w-4xl place-items-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Getting things ready…
                </div>
            </div>
        );
    }

    if (!authed) {
        return (
            <div className="mx-auto mt-10 max-w-lg">
                <Card className="border-none bg-gradient-to-br from-card to-card/60 shadow-md ring-1 ring-border/60">
                    <CardHeader>
                        <CardTitle>Sign in required</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>You need to be signed in to view this itinerary preview.</p>
                        <div className="flex gap-2">
                            <Button onClick={() => router.push("/login")}>Go to Login</Button>
                            <AuthButtons />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!preview) {
        return (
            <AppShell userEmail={null}>
                <div className="mx-auto mt-10 max-w-lg text-center">
                    <Card className="border-none bg-gradient-to-br from-card to-card/60 shadow-md ring-1 ring-border/60">
                        <CardHeader>
                            <CardTitle>No preview found</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>Generate a preview from the wizard first.</p>
                            <p>
                                If you just signed in, go back and click <strong>Generate preview</strong> again so we can load it here.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AppShell>
        );
    }

    // cosmetics
    const totalDays = preview.days?.length ?? preview.trip_summary.total_days ?? 0;
    const estTotal = preview.trip_summary.est_total_cost ?? 0;
    const dailyBudget = preview.trip_summary?.currency
        ? `${preview.trip_summary.currency} ${Math.round(estTotal / Math.max(totalDays, 1))}`
        : `~$${Math.round(estTotal / Math.max(totalDays, 1))}`;
    const progressPct = totalDays ? Math.min(100, Math.round(((activeDayIdx + 1) / totalDays) * 100)) : 0;

    // save trip
    async function saveDraftAsTrip(
        sb: ReturnType<typeof createClientBrowser>,
        preview: PreviewResponse,
        setSaving: (v: boolean) => void
    ) {
        setSaving(true);
        const COST = REQUIRED_POINTS_TO_SAVE ?? 100;

        if (points < COST) {
            setInsufficientOpen(true);
            setSaving(false);
            return;
        }

        let currentUserId: string | undefined;
        let pointsSpent = false;

        try {
            const { data: auth } = await sb.auth.getUser();
            currentUserId = auth?.user?.id ?? undefined;
            if (!currentUserId) throw new Error("Not authenticated");

            try {
                const { data: ok, error: rpcErr } = await sb.rpc("spend_points", { p_cost: COST });
                if (rpcErr) throw rpcErr;
                if (ok !== true) {
                    setInsufficientOpen(true);
                    return;
                }
                pointsSpent = true;
            } catch {
                const { error: debitErr } = await sb
                    .schema("itinero")
                    .from("points_ledger")
                    .insert({
                        user_id: currentUserId,
                        delta: -COST,
                        reason: "save_trip",
                        meta: { source: "web", at: new Date().toISOString() },
                    });

                if (debitErr) {
                    setInsufficientOpen(true);
                    return;
                }
                pointsSpent = true;
            }

            const ins = preview.trip_summary?.inputs;
            const title = ins?.destinations?.[0]?.name ? `${ins.destinations[0].name} Trip` : "Trip";

            const tripRow: {
                user_id: string;
                title: string | null;
                start_date: string | null;
                end_date: string | null;
                est_total_cost: number | null;
                currency: string | null;
                destination_id: string | null;
                inputs?: PreviewResponse["trip_summary"]["inputs"];
            } = {
                user_id: currentUserId!,
                title,
                start_date: ins?.start_date ?? preview.trip_summary.start_date ?? null,
                end_date: ins?.end_date ?? preview.trip_summary.end_date ?? null,
                est_total_cost:
                    typeof preview.trip_summary.est_total_cost === "number" ? preview.trip_summary.est_total_cost : null,
                currency: preview.trip_summary.currency ?? null,
                destination_id: ins?.destinations?.[0]?.id ?? null,
                inputs: ins,
            };

            const { data: tripInsert, error: tripErr } = await sb
                .schema("itinero")
                .from("trips")
                .insert(tripRow)
                .select("id")
                .single();
            if (tripErr) throw tripErr;
            const tripId: string = (tripInsert as { id: string }).id;

            type ItemInsert = {
                trip_id: string;
                day_index: number;
                date: string | null;
                order_index: number;
                when: "morning" | "afternoon" | "evening";
                place_id: string | null;
                title: string;
                est_cost: number | null;
                duration_min: number | null;
                travel_min_from_prev: number | null;
                notes: string | null;
            };

            const items: ItemInsert[] = [];
            preview.days.forEach((d, dIdx) => {
                d.blocks.forEach((b, iIdx) => {
                    items.push({
                        trip_id: tripId,
                        day_index: dIdx,
                        date: d.date ?? null,
                        order_index: iIdx,
                        when: b.when,
                        place_id: b.place_id ?? null,
                        title: b.title,
                        est_cost: typeof b.est_cost === "number" ? b.est_cost : null,
                        duration_min: typeof b.duration_min === "number" ? b.duration_min : null,
                        travel_min_from_prev:
                            typeof b.travel_min_from_prev === "number" ? b.travel_min_from_prev : null,
                        notes: b.notes ?? null,
                    });
                });
            });

            if (items.length) {
                const { error: itemsErr } = await sb.schema("itinero").from("itinerary_items").insert(items);
                if (itemsErr) throw itemsErr;
            }

            try {
                const { data: newBal } = await sb.rpc("get_points_balance");
                if (typeof newBal === "number") setPoints?.(newBal);
            } catch {
                /* ignore */
            }

            router.push(`/trips/${tripId}`);
        } catch (err) {
            if (pointsSpent && userId) {
                try {
                    const { error: refundErr } = await sb
                        .schema("itinero")
                        .from("points_ledger")
                        .insert({
                            user_id: userId,
                            delta: COST,
                            reason: "refund_save_trip_failed",
                            meta: { source: "web", at: new Date().toISOString() },
                        });
                    if (refundErr) console.error("refund insert failed:", refundErr);
                } catch (e) {
                    console.error("refund insert threw:", e);
                }
            }
            console.error("Save trip failed:", err);
        } finally {
            setSaving(false);
        }
    }

    const safeDay: Day =
        preview.days?.[activeDayIdx] ??
        ({
            date: preview.trip_summary.inputs?.start_date ?? preview.trip_summary.start_date ?? "",
            blocks: [],
            map_polyline: undefined,
            lodging: null,
        } as Day);

    return (
        <AppShell userEmail={null}>
            {/* Decorative backplate */}
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_65%_-10%,hsl(var(--primary)/0.12),transparent_60%)]" />

            <div className="w-full">
                {/* HERO */}
                <section className="relative">
                    <div className="mx-auto w-full max-w-6xl px-4 pb-4 pt-8 md:pt-10">
                        <div className="rounded-3xl border bg-card/60 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/50 md:p-7">
                            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                                {/* Title + chips */}
                                <div className="flex-1">
                                    <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">Preview Itinerary</div>
                                    <h1 className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-2xl font-bold leading-tight text-transparent md:text-3xl">
                                        {tripTitle}
                                    </h1>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <Badge variant="secondary" className="gap-1 rounded-full border bg-background/60">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {inputs?.destinations?.[0]?.name ?? "—"}
                                        </Badge>
                                        <Badge variant="secondary" className="gap-1 rounded-full border bg-background/60">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            {formatDateRange(preview.trip_summary)}
                                        </Badge>
                                        {modeIcon && (
                                            <Badge variant="secondary" className="gap-1 rounded-full border bg-background/60">
                                                {modeIcon}
                                                {inputs?.mode}
                                            </Badge>
                                        )}
                                        {inputs?.pace && (
                                            <Badge variant="outline" className="gap-1 rounded-full">
                                                pace: {inputs.pace}
                                            </Badge>
                                        )}
                                        {typeof estTotal === "number" && (
                                            <Badge variant="default" className="gap-1 rounded-full">
                                                <DollarSign className="h-3.5 w-3.5" />
                                                est. ${estTotal}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Action bar */}
                                <div className="grid w-full shrink-0 grid-cols-2 gap-2 md:w-auto">
                                    <Button
                                        className="rounded-full"
                                        onClick={() => saveDraftAsTrip(sb, preview as PreviewResponse, setSaving)}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                                            </>
                                        ) : (
                                            "Save Draft"
                                        )}
                                    </Button>

                                    <Button
                                        className="rounded-full"
                                        variant="outline"
                                        onClick={() => saveDraftAsTrip(sb, preview as PreviewResponse, setSaving)}
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
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                                            </>
                                        ) : (
                                            `Save (${pointsBusy ? "…" : points}/${REQUIRED_POINTS_TO_SAVE} pts)`
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Stat strip */}
                            <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                                <StatCard icon={<CalendarDays className="h-4 w-4" />} label="Days" value={String(totalDays || "—")} />
                                <StatCard icon={<DollarSign className="h-4 w-4" />} label="Daily est." value={dailyBudget} />
                                <StatCard icon={<Compass className="h-4 w-4" />} label="Mode" value={inputs?.mode ?? "—"} />
                                <StatCard icon={<Clock3 className="h-4 w-4" />} label="Pace" value={inputs?.pace ?? "—"} />
                            </div>

                            {/* Progress */}
                            <div className="mt-5">
                                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Trip progress</span>
                                    <span>
                    Day {activeDayIdx + 1} of {totalDays || "—"}
                  </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full border bg-muted/40">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BODY */}
                <section className="mx-auto w-full max-w-6xl px-4 pb-12">
                    <Card className="overflow-hidden border-none bg-transparent">
                        {/* Toolbar */}

                        <CardContent className="space-y-6 py-3">
                            {/* Interests */}
                            {Array.isArray(inputs?.interests) && inputs!.interests.length > 0 && (
                                <div className="rounded-2xl border bg-card/50 p-4">
                                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Interests</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {inputs!.interests.map((t) => (
                                            <Badge
                                                key={t}
                                                variant="outline"
                                                className="rounded-full border bg-background/60 px-2.5 py-1 capitalize"
                                            >
                                                {emojiFor(t)} {t}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Main: Day viewer + Map */}
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
                                                        className="rounded-full px-3"
                                                    >
                                                        Day {i + 1}
                                                    </Button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    {/* Split grid */}
                                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(460px,1fr)_minmax(520px,1fr)]">
                                        {/* Left: Timeline */}
                                        <div className="rounded-3xl border bg-card/60 p-3 shadow-sm">
                                            <DayViewer
                                                dayIdx={activeDayIdx}
                                                day={
                                                    preview.days?.[activeDayIdx] ?? {
                                                        date: preview.trip_summary.inputs?.start_date ?? preview.trip_summary.start_date ?? "",
                                                        blocks: [],
                                                    }
                                                }
                                                placesById={new Map(preview.places.map((p) => [p.id, p]))}
                                            />
                                        </div>

                                        {/* Right: Map */}
                                        <aside className="md:sticky md:top-24 h-[calc(100vh-180px)] md:self-start">
                                            <div className="relative overflow-hidden rounded-3xl border bg-card/60 shadow-sm">
                                                {/* subtle header overlay on map */}
                                                <div className="pointer-events-none absolute left-0 top-0 z-10 w-full bg-gradient-to-b from-background/70 to-transparent py-2 text-center text-xs text-muted-foreground">
                                                    Map overview
                                                </div>
                                                <LeafletMap
                                                    theme={mapTheme}
                                                    day={
                                                        preview.days?.[activeDayIdx] ?? {
                                                            date:
                                                                preview.trip_summary.inputs?.start_date ??
                                                                preview.trip_summary.start_date ??
                                                                "",
                                                            blocks: [],
                                                        }
                                                    }
                                                    placesById={new Map(preview.places.map((p) => [p.id, p]))}
                                                />
                                            </div>
                                        </aside>
                                    </div>
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
                            You need <strong>{REQUIRED_POINTS_TO_SAVE}</strong> points to save a trip. You currently have{" "}
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

/* =========================
   Local components
========================= */
function StatCard({
                      icon,
                      label,
                      value,
                  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="group rounded-2xl border bg-background/60 p-3 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
          <span className="grid h-7 w-7 place-items-center rounded-full border bg-card/60">
            {icon}
          </span>
                    <span className="text-[11px] uppercase tracking-wider">{label}</span>
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
                className="rounded-full"
                onClick={async () => {
                    setBusy(true);
                    try {
                        await sb.auth.signInWithOAuth({ provider: "google" });
                    } finally {
                        setBusy(false);
                    }
                }}
                disabled={busy}
            >
                {busy ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />…
                    </>
                ) : (
                    "Continue with Google"
                )}
            </Button>
        </div>
    );
}

function DayViewer({
                       dayIdx,
                       day,
                       placesById,
                   }: {
    dayIdx: number;
    day: Day;
    placesById: Map<string, Place>;
}) {
    const dayCost = useMemo(
        () => Math.max(0, Math.round(day.blocks.reduce((acc, b) => acc + (b.est_cost || 0), 0))),
        [day.blocks]
    );

    return (
        <div className="space-y-5 p-3 md:p-4">
            {/* header */}
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        Day {dayIdx + 1}
                    </div>
                    <div className="text-lg font-semibold">{formatISODate(day.date)}</div>
                </div>
                <div className="rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                    est. day cost: <span className="font-medium text-foreground">${dayCost}</span>
                </div>
            </div>

            {/* timeline */}
            <div className="relative">
                <div className="pointer-events-none absolute left-[14px] top-0 h-full w-px bg-border" />
                <div className="space-y-3">
                    {day.blocks.map((b, i) => {
                        const place = b.place_id ? placesById.get(b.place_id) : null;
                        return (
                            <div key={`${day.date}-${i}`} className="relative">
                                <div className="absolute left-2 top-5 h-3 w-3 -translate-x-1/2 rounded-full border bg-background shadow-sm" />
                                <div className="ml-6 rounded-2xl border bg-card/60 p-4 shadow-sm transition hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                            {b.when}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
                                            <Metric label="Est." value={`$${b.est_cost ?? 0}`} />
                                            <Metric label="Duration" value={`${b.duration_min}m`} />
                                            <Metric label="Travel" value={`${b.travel_min_from_prev}m`} />
                                        </div>
                                    </div>

                                    <div className="mt-2 grid gap-3 md:grid-cols-3">
                                        <div className="md:col-span-2">
                                            <div className="text-base font-medium">{b.title}</div>
                                            {!!b.notes && (
                                                <div className="mt-1 text-sm text-muted-foreground">
                                                    {b.notes.length > 240 ? `${b.notes.slice(0, 240)}…` : b.notes}
                                                </div>
                                            )}
                                            {place && (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    <span className="font-medium text-foreground">{place.name}</span>
                                                    {place.category && <span> • {place.category}</span>}
                                                    {place.lat != null && place.lng != null && (
                                                        <span className="ml-1">
                              • {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
                            </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {b.alternatives?.length ? (
                                        <div className="mt-3">
                                            <div className="text-xs text-muted-foreground">Alternatives</div>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {b.alternatives.slice(0, 3).map((a) => (
                                                    <span
                                                        key={a.id ?? a.name}
                                                        className="rounded-full border bg-background/70 px-2 py-1 text-xs"
                                                    >
                            {a.name} {a.est_cost ? `· ~$${a.est_cost}` : ""}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}

                    {!day.blocks.length && (
                        <div className="grid h-40 place-items-center rounded-2xl border bg-card/40 text-sm text-muted-foreground">
                            No activities for this day yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-full border bg-background/70 px-2 py-0.5">
            <span className="text-[11px]">{label}: </span>
            <span className="font-medium">{value}</span>
        </div>
    );
}