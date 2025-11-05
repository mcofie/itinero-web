"use client";

import * as React from "react";
import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {motion, AnimatePresence} from "framer-motion";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Calendar} from "@/components/ui/calendar";
import {cn} from "@/lib/utils";
import AuthGateDialog from "@/components/auth/AuthGateDialog";
import {createClientBrowser} from "@/lib/supabase/browser";

import type {DateRange} from "react-day-picker";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Loader2,
    MapPin,
    Sparkles,
    Users,
    Car,
    Footprints,
} from "lucide-react";

/* ---------------- date-only helpers ---------------- */
type DateRangeValue = { from?: Date; to?: Date } | undefined;

function toDateOnlyString(d: Date) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function parseDateOnlyString(s?: string) {
    if (!s) return undefined;
    const [y, m, d] = s.split("-").map(Number);
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
}

/* ---------------- request types ---------------- */
type Destination = { id?: string; name: string; lat?: number; lng?: number };
type Lodging = { name: string };

type RequestBody = {
    destinations: Destination[];
    start_date: string;
    end_date: string;
    budget_daily: number | "";
    interests: string[];
    pace: "chill" | "balanced" | "packed";
    mode: "walk" | "bike" | "car" | "transit";
    lodging?: Lodging;
};

const DEFAULT_INTERESTS = [
    "beach",
    "culture",
    "food",
    "nature",
    "nightlife",
    "shopping",
    "art",
    "music",
    "hiking",
    "sports",
    "wellness",
    "architecture",
    "festivals",
    "wildlife",
] as const;

const STEPS = [
    {key: "dest", label: "Destination", icon: MapPin},
    {key: "dates", label: "Dates", icon: CalendarDays},
    {key: "budget", label: "Budget", icon: Footprints},
    {key: "interests", label: "Interests", icon: Sparkles},
    {key: "pace", label: "Pace", icon: Footprints},
    {key: "mode", label: "Transport", icon: Car},
    {key: "lodging", label: "Lodging", icon: Users},
    {key: "review", label: "Review", icon: Sparkles},
] as const;

/* ================== DateRangePicker (theme-aware) ================== */
function DateRangePicker({
                             value,
                             onChange,
                             className = "",
                             disablePast = true,
                         }: {
    value: DateRangeValue;
    onChange: (range: DateRangeValue) => void;
    className?: string;
    disablePast?: boolean;
}) {
    const disabled = disablePast ? [{before: new Date()}] : undefined;
    const selectedForCalendar: DateRange | undefined = value
        ? {from: value.from!, to: value.to}
        : undefined;

    return (
        <div className={className}>
            <Calendar
                mode="range"
                numberOfMonths={2}
                selected={selectedForCalendar}
                onSelect={onChange}
                disabled={disabled}
                className="rounded-xl border bg-card p-3 md:p-4"
                classNames={{
                    months: "gap-3 md:gap-4",
                    month: "space-y-3",
                    head_cell: "text-xs font-medium text-muted-foreground",
                    cell: "p-0 relative",
                    day: "h-9 w-9 md:h-10 md:w-10 rounded-md aria-selected:opacity-100",
                    day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    day_today: "bg-primary/10 text-primary",
                    day_outside: "text-muted-foreground opacity-50",
                    nav_button: "h-9 w-9 md:h-10 md:w-10",
                }}
            />
        </div>
    );
}

/* ================== Main Wizard ================== */
export default function TripWizard() {
    const sb = createClientBrowser();
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [busy, setBusy] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    const [state, setState] = useState<RequestBody>({
        destinations: [{id: "", name: ""}],
        start_date: "",
        end_date: "",
        budget_daily: "",
        interests: ["beach", "culture", "food", "nature"],
        pace: "balanced",
        mode: "car",
        lodging: {name: ""},
    });

    // keep calendar selection local (not required externally)
    const [, setSelectedRange] = useState<DateRangeValue>(undefined);

    useEffect(() => {
        const {data: sub} = sb.auth.onAuthStateChange(async (evt) => {
            if (evt === "SIGNED_IN") {
                await sb.auth.getSession();
                router.replace("/preview");
                router.refresh();
            }
        });
        return () => sub.subscription.unsubscribe();
    }, [sb, router]);

    const progress = ((step + 1) / STEPS.length) * 100;

    const isValid = useMemo(() => {
        if (step === 0) return state.destinations[0]?.name.trim().length > 1;
        if (step === 1) return !!state.start_date && !!state.end_date;
        if (step === 2) return state.budget_daily === "" || Number(state.budget_daily) >= 0;
        if (step === 3) return state.interests.length > 0;
        if (step === 4) return ["chill", "balanced", "packed"].includes(state.pace);
        if (step === 5) return ["walk", "bike", "car", "transit"].includes(state.mode);
        return true;
    }, [step, state]);

    const goBack = () => setStep((s) => Math.max(0, s - 1));
    const jumpTo = (i: number) => setStep(i);

    const goNext = async () => {
        if (!isValid || busy) return;

        if (step < STEPS.length - 1) {
            setStep((s) => s + 1);
            return;
        }

        setBusy(true);
        try {
            const payload = toPayload(state);
            const {data, error} = await sb.functions.invoke("build_preview_itinerary", {body: payload});

            localStorage.setItem("itinero:latest_preview", JSON.stringify(data));
            if (error) throw error;

            const {
                data: {user},
            } = await sb.auth.getUser();

            if (!user) {
                setAuthOpen(true);
            } else {
                router.replace("/preview");
                router.refresh();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setBusy(false);
        }
    };

    function updateDest(value: string) {
        setState((s) => ({...s, destinations: [{name: value}]}));
    }

    function toggleInterest(tag: string) {
        setState((s) => {
            const set = new Set(s.interests);
            if (set.has(tag)) set.delete(tag);
            else set.add(tag);
            return {...s, interests: Array.from(set)};
        });
    }

    /* map state <-> calendar */
    const selectedRange: DateRangeValue = useMemo(() => {
        const from = parseDateOnlyString(state.start_date);
        const to = parseDateOnlyString(state.end_date);
        return from || to ? {from, to} : undefined;
    }, [state.start_date, state.end_date]);

    const handleRangeChange = (range: DateRangeValue) => {
        if (!range) {
            setState((s) => ({...s, start_date: "", end_date: ""}));
            return;
        }
        const from = range.from ? toDateOnlyString(range.from) : "";
        const to = range.to ? toDateOnlyString(range.to) : "";
        setState((s) => ({...s, start_date: from, end_date: to}));
    };

    // display helpers
    const fmtHuman = (s?: string) =>
        s
            ? new Date(s + "T00:00:00").toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            : "—";

    const nightsBetween = (a?: string, b?: string) => {
        if (!a || !b) return 0;
        const d1 = new Date(a + "T00:00:00");
        const d2 = new Date(b + "T00:00:00");
        return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86_400_000));
    };

    const selectedForCalendar: DateRange | undefined = selectedRange
        ? {from: selectedRange.from, to: selectedRange.to}
        : undefined;

    return (
        <div className="mx-auto w-full max-w-3xl">
            <HeaderProgress
                steps={STEPS.map((s) => ({label: s.label, icon: s.icon}))}
                activeIndex={step}
                onStepClick={jumpTo}
                progress={progress}
            />

            {/* Theme-aware card wrapper */}
            <div className="relative mt-6 rounded-b-2xl bg-card">
                <div className="p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <Slide key="step-dest">
                                <FieldBlock
                                    label="Destination"
                                    hint="Pick from our database or keep typing free text"
                                    icon={MapPin}
                                >
                                    <DestinationField
                                        value={state.destinations[0] ?? {name: ""}}
                                        onChange={(dest) => setState((s) => ({...s, destinations: [dest]}))}
                                    />
                                </FieldBlock>
                            </Slide>
                        )}

                        {step === 1 && (
                            <Slide key="step-dates">
                                <FieldBlock label="Dates" hint="Select your travel window" icon={CalendarDays}>
                                    <div className="grid gap-4">
                                        {/* Mobile: 1 month */}
                                        <div className="sm:hidden">
                                            <Calendar
                                                mode="range"
                                                numberOfMonths={1}
                                                selected={selectedForCalendar}
                                                onSelect={handleRangeChange}
                                                disabled={[{before: new Date()}]}
                                                className="rounded-xl border bg-card p-3"
                                                classNames={{
                                                    months: "gap-2",
                                                    month: "space-y-2",
                                                    head_cell: "text-xs font-medium text-muted-foreground",
                                                    cell: "p-0",
                                                    day: "h-9 w-9 rounded-md aria-selected:opacity-100",
                                                    day_selected: "bg-primary text-primary-foreground hover:bg-primary",
                                                    day_today: "bg-primary/10 text-primary dark:text-primary-foreground/80",
                                                    nav_button: "h-9 w-9",
                                                }}
                                            />
                                        </div>

                                        {/* ≥sm & <lg: 2 months */}
                                        <div className="hidden sm:block lg:hidden">
                                            <Calendar
                                                mode="range"
                                                numberOfMonths={1}
                                                selected={selectedForCalendar}
                                                onSelect={handleRangeChange}
                                                disabled={[{before: new Date()}]}
                                                className="rounded-xl border bg-card p-3"
                                                classNames={{
                                                    months: "gap-3 md:gap-4",
                                                    month: "space-y-3",
                                                    head_cell: "text-xs font-medium text-muted-foreground",
                                                    cell: "p-0",
                                                    day: "h-9 w-9 md:h-10 md:w-10 rounded-md aria-selected:opacity-100",
                                                    day_selected: "bg-primary text-primary-foreground hover:bg-primary",
                                                    day_today: "bg-primary/10 text-primary dark:text-primary-foreground/80",
                                                    nav_button: "h-9 w-9 md:h-10 md:w-10",
                                                }}
                                            />
                                        </div>

                                        {/* ≥lg: 3 months (nice for desktops) */}
                                        <div className="hidden lg:block">
                                            <Calendar
                                                mode="range"
                                                numberOfMonths={2}
                                                selected={selectedForCalendar}
                                                onSelect={handleRangeChange}
                                                disabled={[{before: new Date()}]}
                                                className="rounded-xl border p-4"
                                                classNames={{
                                                    months: "gap-2 xl:gap-4",
                                                    month: "space-y-3",
                                                    head_cell: "text-xs font-medium text-muted-foreground",
                                                    cell: "p-0",
                                                    day: "h-10 w-10 xl:h-11 xl:w-11 rounded-md aria-selected:opacity-100",
                                                    day_selected: "bg-primary text-primary-foreground hover:bg-primary",
                                                    day_today: "bg-primary/10 text-primary dark:text-primary-foreground/80",
                                                    nav_button: "h-10 w-10",
                                                }}
                                            />
                                        </div>

                                        {/* Selected summary */}
                                        <div
                                            className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2 text-sm">
      <span className="rounded-full border px-2.5 py-1">
        Start: <span className="font-medium">{fmtHuman(state.start_date)}</span>
      </span>
                                            <span className="rounded-full border px-2.5 py-1">
        End: <span className="font-medium">{fmtHuman(state.end_date)}</span>
      </span>
                                            <span className="rounded-full bg-muted px-2.5 py-1">
        Nights: <span className="font-medium">{nightsBetween(state.start_date, state.end_date)}</span>
      </span>

                                            {(state.start_date || state.end_date) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRangeChange(undefined)}
                                                    className="ml-0 sm:ml-1 text-primary underline-offset-2 hover:underline"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </FieldBlock>
                            </Slide>
                        )}

                        {step === 2 && (
                            <Slide key="step-budget">
                                <FieldBlock
                                    label="Daily budget"
                                    hint="Used to balance activity costs"
                                    icon={Footprints}
                                >
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="e.g., 150"
                                            value={String(state.budget_daily)}
                                            onChange={(e) =>
                                                setState((s) => ({
                                                    ...s,
                                                    budget_daily: e.target.value === "" ? "" : Number(e.target.value),
                                                }))
                                            }
                                        />
                                        <span className="text-sm text-muted-foreground">USD (approx.)</span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {[50, 100, 150, 250].map((v) => (
                                            <Button
                                                key={v}
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                className="rounded-full"
                                                onClick={() => setState((s) => ({...s, budget_daily: v}))}
                                            >
                                                ≈ {v}
                                            </Button>
                                        ))}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="rounded-full"
                                            onClick={() => setState((s) => ({...s, budget_daily: ""}))}
                                        >
                                            Skip
                                        </Button>
                                    </div>
                                </FieldBlock>
                            </Slide>
                        )}

                        {step === 3 && (
                            <Slide key="step-interests">
                                <FieldBlock label="Interests" hint="Pick what excites you" icon={Sparkles}>
                                    <div className="flex flex-wrap gap-2">
                                        {DEFAULT_INTERESTS.map((tag) => (
                                            <Button
                                                key={tag}
                                                type="button"
                                                size="sm"
                                                variant={state.interests.includes(tag) ? "default" : "secondary"}
                                                className="rounded-full capitalize"
                                                onClick={() => toggleInterest(tag)}
                                            >
                                                {tag}
                                            </Button>
                                        ))}
                                    </div>
                                </FieldBlock>
                            </Slide>
                        )}

                        {step === 4 && (
                            <Slide key="step-pace">
                                <FieldBlock label="Pace" hint="How packed should your days feel?" icon={Footprints}>
                                    <div className="flex flex-wrap gap-2">
                                        {(["chill", "balanced", "packed"] as const).map((opt) => (
                                            <Button
                                                key={opt}
                                                type="button"
                                                size="sm"
                                                variant={state.pace === opt ? "default" : "secondary"}
                                                className="rounded-full capitalize"
                                                onClick={() => setState((s) => ({...s, pace: opt}))}
                                            >
                                                {opt}
                                            </Button>
                                        ))}
                                    </div>
                                </FieldBlock>
                            </Slide>
                        )}

                        {step === 5 && (
                            <Slide key="step-mode">
                                <FieldBlock
                                    label="Transport mode"
                                    hint="We’ll estimate travel time accordingly"
                                    icon={Car}
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {(["walk", "bike", "car", "transit"] as const).map((opt) => (
                                            <Button
                                                key={opt}
                                                type="button"
                                                size="sm"
                                                variant={state.mode === opt ? "default" : "secondary"}
                                                className="rounded-full capitalize"
                                                onClick={() => setState((s) => ({...s, mode: opt}))}
                                            >
                                                {opt}
                                            </Button>
                                        ))}
                                    </div>
                                </FieldBlock>
                            </Slide>
                        )}

                        {step === 6 && (
                            <Slide key="step-lodging">
                                <FieldBlock
                                    label="Lodging (optional)"
                                    hint="We’ll try to start/end days near here"
                                    icon={Users}
                                >
                                    <Input
                                        placeholder="Hotel or address"
                                        value={state.lodging?.name || ""}
                                        onChange={(e) =>
                                            setState((s) => ({
                                                ...s,
                                                lodging: {name: e.target.value},
                                            }))
                                        }
                                    />
                                </FieldBlock>
                            </Slide>
                        )}

                        {step === 7 && (
                            <Slide key="step-review">
                                <ReviewCard data={toPayload(state)} onEditStep={jumpTo} onGenerate={goNext}/>
                            </Slide>
                        )}
                    </AnimatePresence>

                    {/* Footer nav */}
                    <div className="mt-6 flex items-center justify-between">
                        <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0 || busy}>
                            <ChevronLeft className="mr-2 h-4 w-4"/> Back
                        </Button>
                        <Button type="button" onClick={goNext} disabled={!isValid || busy}>
                            {busy ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Working…
                                </>
                            ) : step === STEPS.length - 1 ? (
                                "Generate preview"
                            ) : (
                                <>
                                    Next <ChevronRight className="ml-1 h-4 w-4"/>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <AuthGateDialog
                open={authOpen}
                onOpenChange={setAuthOpen}
                title="Sign in to save & share your trip"
                postLogin={() => {
                }}
            />
        </div>
    );
}

/* ================== Destination search ================== */
function DestinationField({
                              value,
                              onChange,
                          }: {
    value: Destination;
    onChange: (d: Destination) => void;
}) {
    const sb = createClientBrowser();
    const [q, setQ] = useState<string>(value.name ?? "");
    const [rows, setRows] = useState<Destination[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const term = q.trim();
        if (!term) {
            setRows([]);
            return;
        }
        setLoading(true);
        const t = setTimeout(async () => {
            try {
                const {data, error} = await sb
                    .schema("itinero")
                    .from("destinations")
                    .select("id,name,lat,lng")
                    .ilike("name", `%${term}%`)
                    .order("name", {ascending: true})
                    .limit(10);

                if (!error && data) {
                    setRows(
                        data.map((r) => ({
                            id: String(r.id),
                            name: r.name as string,
                            lat: typeof r.lat === "number" ? r.lat : undefined,
                            lng: typeof r.lng === "number" ? r.lng : undefined,
                        }))
                    );
                }
            } finally {
                setLoading(false);
            }
        }, 250);
        return () => clearTimeout(t);
    }, [q, sb]);

    useEffect(() => {
        if (value?.name && value.name !== q) setQ(value.name);
    }, [value?.name]); // keep input text in sync

    const pick = (d: Destination) => {
        onChange(d);
        setQ(d.name);
        setOpen(false);
    };

    return (
        <div className="relative">
            <Input
                placeholder="e.g., Accra"
                value={q}
                onChange={(e) => {
                    setQ(e.target.value);
                    setOpen(true);
                    onChange({...value, id: undefined, lat: undefined, lng: undefined, name: e.target.value});
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                    setTimeout(() => setOpen(false), 120);
                }}
            />

            {open && (rows.length > 0 || loading) && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-sm">
                    {loading ? (
                        <div className="p-3 text-sm text-muted-foreground">Searching…</div>
                    ) : (
                        <ul className="max-h-64 overflow-auto divide-y">
                            {rows.map((r) => (
                                <li
                                    key={r.id ?? r.name}
                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => pick(r)}
                                >
                                    <div className="font-medium">{r.name}</div>
                                    {typeof r.lat === "number" && typeof r.lng === "number" ? (
                                        <div className="text-xs text-muted-foreground">
                                            {r.lat.toFixed(3)}, {r.lng.toFixed(3)}
                                        </div>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

/* ================== Utilities & UI bits ================== */
function toPayload(s: RequestBody) {
    const d = s.destinations[0];
    return {
        destinations: [
            {
                id: d?.id,
                name: (d?.name ?? "").trim(),
                lat: d?.lat,
                lng: d?.lng,
            },
        ],
        start_date: s.start_date,
        end_date: s.end_date,
        budget_daily: s.budget_daily === "" ? 0 : Number(s.budget_daily),
        interests: s.interests,
        pace: s.pace,
        mode: s.mode,
        lodging: s.lodging?.name ? {name: s.lodging.name} : undefined,
    } as const;
}

type StepIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

function HeaderProgress({
                            steps,
                            activeIndex,
                            onStepClick,
                            progress,
                        }: {
    steps: { label: string; icon: StepIcon }[];
    activeIndex: number;
    onStepClick?: (i: number) => void;
    progress: number;
}) {
    return (
        <div className="relative">
            <div className="mb-3 flex items-center gap-2 overflow-x-auto">
                {steps.map((s, i) => {
                    const Icon = s.icon;
                    const active = i === activeIndex;
                    return (
                        <button
                            key={s.label}
                            type="button"
                            onClick={() => onStepClick?.(i)}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                                active
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-muted hover:bg-accent"
                            )}
                        >
              <span
                  className={cn(
                      "grid h-5 w-5 place-items-center rounded-full text-[11px] font-medium",
                      active ? "bg-primary-foreground text-primary" : "bg-background"
                  )}
              >
                {i + 1}
              </span>
                            <Icon className="h-4 w-4 opacity-80"/> {s.label}
                        </button>
                    );
                })}
            </div>
            <div className="h-1 w-full rounded-full bg-muted">
                <div className="h-1 rounded-full bg-primary transition-[width]" style={{width: `${progress}%`}}/>
            </div>
        </div>
    );
}

function FieldBlock({
                        label,
                        hint,
                        icon: Icon,
                        children,
                    }: {
    label: string;
    hint?: string;
    icon?: StepIcon;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-3">
                {Icon && (
                    <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-muted">
                        <Icon className="h-4 w-4"/>
                    </div>
                )}
                <div className="flex-1">
                    <Label className="text-base">{label}</Label>
                    {hint && <div className="mt-1 text-sm text-muted-foreground">{hint}</div>}
                    {children}
                </div>
            </div>
        </div>
    );
}

function Slide({children, key: k}: { children: React.ReactNode; key?: string }) {
    return (
        <motion.div
            key={k}
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -8}}
            transition={{duration: 0.18}}
        >
            {children}
        </motion.div>
    );
}

/* ---------------- Review Card ---------------- */
function ReviewCard({
                        data,
                        onEditStep,
                        onGenerate,
                    }: {
    data: ReturnType<typeof toPayload>;
    onEditStep: (i: number) => void;
    onGenerate: () => void;
}) {
    const chips = (data.interests || []).slice(0, 12);
    return (
        <div className="mx-auto max-w-2xl">
            <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
                {/* soft gradient header */}
                <div
                    className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"/>
                <div className="relative p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold tracking-tight">Your Journey at a Glance</h2>
                        <span className="text-xs text-muted-foreground">Review & confirm</span>
                    </div>

                    <SectionRow icon={<MapPin className="h-4 w-4"/>} label="Destination" onEdit={() => onEditStep(0)}>
            <span
                className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-lg font-semibold text-transparent">
              {data.destinations?.[0]?.name || "—"}
            </span>
                    </SectionRow>

                    <SectionRow icon={<CalendarDays className="h-4 w-4"/>} label="Dates" onEdit={() => onEditStep(1)}>
                        <div className="text-base font-medium">{formatDateRange(data.start_date, data.end_date)}</div>
                    </SectionRow>

                    <SectionRow icon={<Footprints className="h-4 w-4"/>} label="Daily Budget"
                                onEdit={() => onEditStep(2)}>
                        <div className="text-base font-medium">
                            {data.budget_daily ? `$${data.budget_daily}/day` : "Not specified"}
                        </div>
                    </SectionRow>

                    <SectionRow icon={<Sparkles className="h-4 w-4"/>} label="Interests" onEdit={() => onEditStep(3)}>
                        <div className="flex flex-wrap gap-2">
                            {chips.length ? (
                                chips.map((t) => (
                                    <span key={t} className="rounded-full border px-2.5 py-1 text-xs capitalize">
                    {emojiFor(t)} {t}
                  </span>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">None selected</span>
                            )}
                        </div>
                    </SectionRow>

                    <SectionRow icon={<Footprints className="h-4 w-4"/>} label="Pace & Transport"
                                onEdit={() => onEditStep(4)}>
                        <div className="flex flex-wrap gap-2">
                            <span
                                className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">Pace: {data.pace}</span>
                            <span
                                className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">Mode: {data.mode}</span>
                        </div>
                    </SectionRow>

                    <SectionRow icon={<Users className="h-4 w-4"/>} label="Lodging" onEdit={() => onEditStep(6)}>
                        <div className="text-base font-medium">{data.lodging?.name || "Not provided"}</div>
                    </SectionRow>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground">We’ll use this to generate a smart preview
                            itinerary.
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={() => onEditStep(0)}>
                                Edit Trip
                            </Button>
                            <Button type="button" onClick={onGenerate}>
                                Generate Itinerary
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionRow({
                        icon,
                        label,
                        onEdit,
                        children,
                    }: {
    icon: React.ReactNode;
    label: string;
    onEdit?: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 border-t py-4 first:border-t-0">
            <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-muted">{icon}</div>
            <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="mt-1">{children}</div>
            </div>
            {onEdit ? (
                <button onClick={onEdit} className="text-xs text-primary underline-offset-2 hover:underline">
                    Edit
                </button>
            ) : (
                <span/>
            )}
        </div>
    );
}

/* ---------------- small helpers ---------------- */
function formatDateRange(start?: string, end?: string) {
    if (!start && !end) return "—";
    const s = start ? new Date(start + "T00:00:00") : null;
    const e = end ? new Date(end + "T00:00:00") : null;
    const fmt = (d: Date) =>
        d.toLocaleDateString(undefined, {day: "2-digit", month: "short", year: "numeric"});
    if (s && e) return `${fmt(s)} → ${fmt(e)}`;
    if (s) return fmt(s);
    if (e) return fmt(e);
    return "—";
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