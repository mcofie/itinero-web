"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CurrencySelect } from "@/components/CurrencySelect";
import { getCurrencyMeta } from "@/lib/currency-data";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import AuthGateDialog from "@/components/auth/AuthGateDialog";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { getLatestFxSnapshot, convertUsingSnapshot } from "@/lib/fx/fx";


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
    Check,
    Clock,
    Wallet,
} from "lucide-react";
import {
    LodgingMapDialog,
    LodgingValue,
} from "@/components/landing/LodgingMapDialog";

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
    currency: string;
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
    { key: "dest", label: "Where", icon: MapPin },
    { key: "dates", label: "When", icon: CalendarDays },
    { key: "budget", label: "Budget", icon: Footprints },
    { key: "interests", label: "Vibe", icon: Sparkles },
    { key: "pace", label: "Pace", icon: Clock },
    { key: "mode", label: "Travel", icon: Car },
    { key: "lodging", label: "Stay", icon: Users },
    { key: "review", label: "Ready", icon: Check },
] as const;

/* ================== Main Wizard ================== */
export default function TripWizard() {
    const sb = getSupabaseBrowser();
    const router = useRouter();

    const [step, setStep] = useState(0);
    const [busy, setBusy] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    const [state, setState] = useState<RequestBody>({
        destinations: [{ id: "", name: "" }],
        start_date: "",
        end_date: "",
        budget_daily: "",
        interests: ["culture", "food"],
        pace: "balanced",
        mode: "car",
        lodging: { name: "" },
        currency: "USD",
    });

    // ---------- helper: reset auth + localStorage when session is broken ----------
    const resetAuthAndStorage = React.useCallback(async () => {
        if (typeof window !== "undefined") {
            try {
                for (const key of Object.keys(window.localStorage)) {
                    if (
                        key.startsWith("sb-") || // supabase auth keys
                        key.startsWith("supabase.") ||
                        key.startsWith("itinero:")
                    ) {
                        window.localStorage.removeItem(key);
                    }
                }
            } catch (e) {
                console.error("[TripWizard resetAuthAndStorage] localStorage error:", e);
            }
        }

        try {
            await sb.auth.signOut();
        } catch (e) {
            console.error("[TripWizard resetAuthAndStorage] signOut error:", e);
        }

        // For this wizard, send them back to landing/home so they can start fresh
        router.replace("/");
    }, [router, sb]);

    const isTokenError = (err: unknown) => {
        const anyErr = err as { message?: string; status?: number; code?: number; name?: string };
        const msg: string = anyErr?.message ?? "";
        const status: number | undefined = anyErr?.status ?? anyErr?.code;

        return (
            status === 401 ||
            /jwt|token|expired|unauthorized/i.test(msg ?? "") ||
            anyErr?.name === "AuthSessionMissingError"
        );
    };

    // load preferred currency from localStorage (safe)
    React.useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const stored = window.localStorage.getItem("itinero:currency");
            const code = (stored || "USD").toUpperCase();
            setState((s) => ({ ...s, currency: s.currency ?? code }));
        } catch (e) {
            console.error("[TripWizard] reading itinero:currency failed:", e);
        }
    }, []);

    // Auth listener (wizard-specific)
    useEffect(() => {
        const { data: sub } = sb.auth.onAuthStateChange(async (evt) => {
            if (evt === "SIGNED_IN") {
                router.replace("/preview");
                router.refresh();
            }
        });
        return () => {
            sub?.subscription?.unsubscribe();
        };
    }, [sb, router]);



    const isValid = useMemo(() => {
        if (step === 0) return !!state.destinations[0]?.id;
        if (step === 1) return !!state.start_date && !!state.end_date;
        if (step === 2)
            return state.budget_daily === "" || Number(state.budget_daily) >= 0;
        if (step === 3) return state.interests.length > 0;
        return true;
    }, [step, state]);

    const goBack = () => setStep((s) => Math.max(0, s - 1));
    const jumpTo = (i: number) => setStep(i);

    const goNext = async () => {
        if (!isValid || busy) return;

        // Still handle steps normally
        if (step < STEPS.length - 1) {
            setStep((s) => s + 1);
            return;
        }

        setBusy(true);
        try {
            const payload = toPayload(state);

            // --- Currency Conversion Logic ---
            const destId = payload.destinations[0]?.id;
            if (destId) {
                try {
                    // 1. Get destination currency from a place in that destination
                    // We'll just grab one place that has a currency defined
                    const { data: placeData } = await sb
                        .schema("itinero")
                        .from("places")
                        .select("cost_currency")
                        .eq("destination_id", destId)
                        .not("cost_currency", "is", null)
                        .limit(1)
                        .maybeSingle();

                    const destCurrency = placeData?.cost_currency;

                    if (destCurrency && destCurrency !== state.currency) {
                        // 2. Get FX rates
                        const fx = await getLatestFxSnapshot("USD");

                        // 3. Convert budget
                        if (fx && payload.budget_daily > 0) {
                            const converted = convertUsingSnapshot(
                                fx,
                                payload.budget_daily,
                                state.currency,
                                destCurrency
                            );
                            if (converted) {
                                payload.budget_daily = Math.round(converted);
                                payload.currency = destCurrency;
                            } else {
                                toast.warning(`Could not convert budget to ${destCurrency}. Using ${state.currency}.`);
                                // If no budget or conversion failed, still switch currency context
                                // payload.currency = destCurrency; // <-- This was the bug? No, if I uncomment this, I force JPY.
                                // But if I force JPY with GHS budget, it's wrong.
                                // So I keep it commented or remove it.
                                // Actually, I should probably NOT switch currency if conversion fails.
                            }
                        } else {
                            // If no budget (0), we can safely switch to destination currency
                            payload.currency = destCurrency;
                        }
                    } else if (!destCurrency) {
                        // Optional: warn if we couldn't find destination currency
                        // toast.info("Could not determine destination currency.");
                    }
                } catch (e) {
                    console.error("[TripWizard] Currency conversion failed:", e);
                    // Fallback: proceed with original currency/budget
                }
            }

            const { data, error } = await sb.functions.invoke("build_preview_itinerary", {
                body: payload,
            });

            if (error) {
                console.error("[build_preview_itinerary] error:", error);

                // Only treat *real* token/JWT problems as fatal
                if (isTokenError(error)) {
                    await resetAuthAndStorage();
                    return;
                }

                throw error;
            }

            // --- store preview safely ---
            try {
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(
                        "itinero:latest_preview",
                        JSON.stringify(data)
                    );
                }
            } catch (e) {
                console.error(
                    "[TripWizard] localStorage.setItem(latest_preview) failed:",
                    e
                );
            }

            // --- try to get user; "no session" is NOT fatal ---
            let user = null;
            try {
                const { data: userData, error: userError } = await sb.auth.getUser();

                if (userError) {
                    // This one just means "anonymous user" – we *expect* this for logged-out trips
                    if ((userError as { name?: string }).name === "AuthSessionMissingError") {
                        console.info(
                            "[TripWizard auth.getUser] no active session; treating as anonymous user"
                        );
                    } else {
                        console.error("[TripWizard auth.getUser] error:", userError);

                        if (isTokenError(userError)) {
                            await resetAuthAndStorage();
                            return;
                        }
                    }
                }

                user = userData?.user ?? null;
            } catch (e) {
                console.error("[TripWizard auth.getUser] threw:", e);
                if (isTokenError(e)) {
                    await resetAuthAndStorage();
                    return;
                }
            }

            // --- decide what to do next based on user presence ---
            if (!user) {
                // No session is a *normal* path: open auth gate
                setAuthOpen(true);
                return;
            }

            // Logged in → go to preview
            router.push("/preview");
        } catch (e) {
            console.error("[TripWizard goNext] threw:", e);
            if (isTokenError(e)) {
                await resetAuthAndStorage();
            }
        } finally {
            setBusy(false);
        }
    };

    const handleRangeChange = (range: DateRangeValue) => {
        if (!range) {
            setState((s) => ({ ...s, start_date: "", end_date: "" }));
            return;
        }
        const from = range.from ? toDateOnlyString(range.from) : "";
        const to = range.to ? toDateOnlyString(range.to) : "";
        setState((s) => ({ ...s, start_date: from, end_date: to }));
    };

    const selectedRange: DateRangeValue = useMemo(() => {
        const from = parseDateOnlyString(state.start_date);
        const to = parseDateOnlyString(state.end_date);
        return from || to ? { from, to } : undefined;
    }, [state.start_date, state.end_date]);

    const dateDisplay =
        state.start_date && state.end_date
            ? `${fmtHuman(state.start_date)} - ${fmtHuman(state.end_date)}`
            : "Select dates";

    return (
        <div className="w-full bg-slate-50/50 px-4 pt-6 pb-12 text-slate-900 dark:bg-slate-950 dark:text-white">
            <div className="mx-auto w-full max-w-2xl">
                {/* Header / Progress */}
                <div className="mb-8 flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                            {step + 1}
                        </div>
                        <span
                            className="text-sm font-semibold text-slate-600 uppercase tracking-wide dark:text-slate-400">
                            {STEPS[step].label}
                        </span>
                    </div>

                    {/* Segmented Progress Bar */}
                    <div className="flex gap-1">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 w-4 sm:w-8 rounded-full transition-colors duration-300",
                                    i <= step
                                        ? "bg-blue-600 dark:bg-blue-500"
                                        : "bg-slate-200 dark:bg-slate-800"
                                )
                                } />
                        ))}
                    </div>
                </div>

                {/* Main Card */}
                <motion.div
                    layout
                    className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 flex flex-col dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
                >
                    <div className="p-4 md:p-8 flex-1">
                        <AnimatePresence mode="wait">
                            {/* STEP 0: DESTINATION */}
                            {step === 0 && (
                                <Slide key="dest">
                                    <FieldBlock label="Where do you want to go?" icon={MapPin}>
                                        <DestinationField
                                            value={state.destinations[0]}
                                            onChange={(d) =>
                                                setState((s) => ({ ...s, destinations: [d] }))
                                            }
                                        />
                                    </FieldBlock>
                                </Slide>
                            )}

                            {/* STEP 1: DATES */}
                            {step === 1 && (
                                <Slide key="dates">
                                    <FieldBlock
                                        label="When are you traveling?"
                                        icon={CalendarDays}
                                        hint={dateDisplay}
                                    >
                                        <div
                                            className="flex justify-center rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                                            <Calendar
                                                mode="range"
                                                selected={
                                                    selectedRange
                                                        ? {
                                                            from: selectedRange.from!,
                                                            to: selectedRange.to,
                                                        }
                                                        : undefined
                                                }
                                                onSelect={handleRangeChange}
                                                disabled={[{ before: new Date() }]}
                                                className="bg-transparent"
                                                classNames={{
                                                    months: "gap-4",
                                                    head_cell:
                                                        "text-slate-400 font-normal text-[0.8rem]",
                                                    day_selected:
                                                        "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-600 dark:bg-blue-600 dark:text-white",
                                                    day_today:
                                                        "bg-slate-100 text-slate-900 font-bold dark:bg-slate-800 dark:text-white",
                                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-md dark:hover:bg-slate-800 dark:text-slate-200",
                                                    caption:
                                                        "flex justify-center pt-1 relative items-center text-slate-900 dark:text-white font-medium",
                                                }}
                                            />
                                        </div>
                                    </FieldBlock>
                                </Slide>
                            )}

                            {/* STEP 2: BUDGET */}
                            {step === 2 && (
                                <Slide key="budget">
                                    <FieldBlock label="What's your daily budget?" icon={Wallet}>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="relative flex-1">
                                                <div
                                                    className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-slate-500 dark:text-slate-400">
                                                        {getCurrencyMeta(state.currency).symbol}
                                                    </span>
                                                </div>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    className="pl-8 h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                                    placeholder="150"
                                                    value={state.budget_daily}
                                                    onChange={(e) =>
                                                        setState((s) => ({
                                                            ...s,
                                                            budget_daily:
                                                                e.target.value === ""
                                                                    ? ""
                                                                    : Number(e.target.value),
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <CurrencySelect
                                                value={state.currency}
                                                onChange={(c) =>
                                                    setState((s) => ({ ...s, currency: c }))
                                                }
                                                className="h-12 w-full sm:w-[150px]"
                                            />
                                        </div>

                                        <div className="mt-6 flex flex-wrap gap-3">
                                            {[50, 150, 300, 500].map((amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() =>
                                                        setState((s) => ({ ...s, budget_daily: amt }))
                                                    }
                                                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-600 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:text-blue-500"
                                                >
                                                    {getCurrencyMeta(state.currency).symbol}
                                                    {amt}
                                                </button>
                                            ))}
                                        </div>
                                    </FieldBlock>
                                </Slide>
                            )}

                            {/* STEP 3: INTERESTS */}
                            {step === 3 && (
                                <Slide key="interests">
                                    <FieldBlock
                                        label="What are you into?"
                                        icon={Sparkles}
                                        hint="Select at least one"
                                    >
                                        <div className="flex flex-wrap gap-3">
                                            {DEFAULT_INTERESTS.map((tag) => {
                                                const active = state.interests.includes(tag);
                                                return (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => {
                                                            const set = new Set(state.interests);
                                                            if (set.has(tag)) set.delete(tag);
                                                            else set.add(tag);
                                                            setState((s) => ({
                                                                ...s,
                                                                interests: Array.from(set),
                                                            }));
                                                        }}
                                                        className={cn(
                                                            "rounded-full px-5 py-2.5 text-sm font-medium transition-all border",
                                                            active
                                                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 dark:shadow-none"
                                                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                                                        )}
                                                    >
                                                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </FieldBlock>
                                </Slide>
                            )}

                            {/* STEP 4: PACE */}
                            {step === 4 && (
                                <Slide key="pace">
                                    <FieldBlock label="Travel Pace" icon={Clock}>
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            {(["chill", "balanced", "packed"] as const).map((opt) => (
                                                <SelectionCard
                                                    key={opt}
                                                    label={opt}
                                                    selected={state.pace === opt}
                                                    onClick={() =>
                                                        setState((s) => ({ ...s, pace: opt }))
                                                    }
                                                    emoji={
                                                        opt === "chill"
                                                            ? "☕"
                                                            : opt === "balanced"
                                                                ? "⚖️"
                                                                : "⚡"
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </FieldBlock>
                                </Slide>
                            )}

                            {/* STEP 5: TRANSPORT */}
                            {step === 5 && (
                                <Slide key="mode">
                                    <FieldBlock label="Primary Transport" icon={Car}>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {(["car", "transit", "walk", "bike"] as const).map(
                                                (opt) => (
                                                    <SelectionCard
                                                        key={opt}
                                                        label={opt}
                                                        selected={state.mode === opt}
                                                        onClick={() =>
                                                            setState((s) => ({ ...s, mode: opt }))
                                                        }
                                                        emoji={
                                                            opt === "car"
                                                                ? "🚗"
                                                                : opt === "transit"
                                                                    ? "🚆"
                                                                    : opt === "walk"
                                                                        ? "👟"
                                                                        : "🚲"
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>
                                    </FieldBlock>
                                </Slide>
                            )}

                            {/* STEP 6: LODGING */}
                            {step === 6 && (
                                <Slide key="lodging">
                                    <FieldBlock
                                        label="Where are you staying?"
                                        icon={Users}
                                        hint="Optional - we'll optimize routes from here"
                                    >
                                        <div
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:bg-slate-800 dark:border-slate-700">
                                            <LodgingMapDialog
                                                value={state.lodging as LodgingValue | null}
                                                onChange={(v) =>
                                                    setState((s) => ({
                                                        ...s,
                                                        lodging: v
                                                            ? { name: v.name ?? "" }
                                                            : undefined,
                                                    }))
                                                }
                                                center={
                                                    state.destinations[0].lat
                                                        ? {
                                                            lat: state.destinations[0].lat!,
                                                            lng: state.destinations[0].lng!,
                                                        }
                                                        : undefined
                                                }
                                            />
                                        </div>
                                    </FieldBlock>
                                </Slide>
                            )}

                            {/* STEP 7: REVIEW */}
                            {step === 7 && (
                                <Slide key="review">
                                    <ReviewCard data={toPayload(state)} onEdit={jumpTo} />
                                </Slide>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    <div
                        className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 mt-auto dark:bg-slate-900 dark:border-slate-800">
                        <Button
                            variant="ghost"
                            onClick={goBack}
                            disabled={step === 0 || busy}
                            className="text-slate-500 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>

                        <Button
                            onClick={goNext}
                            disabled={!isValid || busy}
                            className={cn(
                                "min-w-[120px] rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all dark:shadow-none",
                                busy
                                    ? "opacity-80 bg-blue-700"
                                    : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5"
                            )}
                            size="lg"
                        >
                            {busy ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                </>
                            ) : step === STEPS.length - 1 ? (
                                <>
                                    Create Itinerary <Sparkles className="ml-2 h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    Next <ChevronRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </div>

            <AuthGateDialog
                open={authOpen}
                onOpenChange={setAuthOpen}
                title="Save your trip?"
                postLogin={() => {
                }}
            />
        </div>
    );
}

/* ================== Sub-components ================== */

function Slide({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full flex flex-col justify-center"
        >
            {children}
        </motion.div>
    );
}

function FieldBlock({
    label,
    icon: Icon,
    hint,
    children,
}: {
    label: string;
    icon: React.ElementType;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-6 w-full">
            <div className="flex items-center gap-3">
                <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {label}
                    </h2>
                    {hint && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {hint}
                        </p>
                    )}
                </div>
            </div>
            <div className="pt-2 w-full">{children}</div>
        </div>
    );
}

function SelectionCard({
    label,
    selected,
    onClick,
    emoji,
}: {
    label: string;
    selected: boolean;
    onClick: () => void;
    emoji: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 transition-all hover:scale-[1.02]",
                selected
                    ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-inner dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500"
                    : "border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
            )}
        >
            <span className="text-2xl">{emoji}</span>
            <span className="font-bold capitalize">{label}</span>
        </button>
    );
}

/* --- HELPERS --- */
function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

function getCountryName(countryCode: string) {
    try {
        return new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode);
    } catch {
        return countryCode;
    }
}

// --- ISO CODES FOR LOOKUP ---
const ISO_CODES = [
    "AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ",
    "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR",
    "IO", "BN", "BG", "BF", "BI", "CV", "KH", "CM", "CA", "KY", "CF", "TD", "CL", "CN", "CX", "CC",
    "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO",
    "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF",
    "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY",
    "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM",
    "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY",
    "LI", "LT", "LU", "MO", "MK", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT",
    "MX", "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ",
    "NI", "NE", "NG", "NU", "NF", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH",
    "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC",
    "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS",
    "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK",
    "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU",
    "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW"
];

function getCountryCodeByName(name: string): string | undefined {
    const normalized = name.trim().toLowerCase();
    // Use Intl.DisplayNames to find a match
    // This is a bit expensive to do every time, but for a search input it's fine
    // We could optimize by caching or using a pre-built map if needed
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

    for (const code of ISO_CODES) {
        try {
            const countryName = displayNames.of(code)?.toLowerCase();
            if (countryName === normalized || countryName?.includes(normalized)) {
                return code;
            }
        } catch {
            continue;
        }
    }
    return undefined;
}

// --- DESTINATION FIELD ---
function DestinationField({
    value,
    onChange,
}: {
    value: Destination;
    onChange: (d: Destination) => void;
}) {
    const sb = getSupabaseBrowser();
    const [q, setQ] = useState(value.name);
    const [rows, setRows] = useState<(Destination & { country_code?: string })[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let term = q.trim();
        if (!term) {
            setRows([]);
            return;
        }

        // If user types "City, Country", just search for "City"
        if (term.includes(",")) {
            term = term.split(",")[0].trim();
        }

        const t = setTimeout(async () => {
            try {
                // Try to find a country code for the search term
                const countryCode = getCountryCodeByName(term);

                let query = sb
                    .schema("itinero")
                    .from("destinations")
                    .select("id,name,lat,lng,country_code");

                if (countryCode) {
                    // If we found a country code, search for name match OR country code match
                    query = query.or(`name.ilike.%${term}%,country_code.eq.${countryCode}`);
                } else {
                    // Otherwise just search by name
                    query = query.ilike("name", `%${term}%`);
                }

                const { data, error } = await query.limit(5);

                if (error) {
                    console.error("[DestinationField] destinations query error:", error);
                    return;
                }

                if (data) {
                    setRows(data.map((r) => ({ ...r, id: String(r.id) })));
                }
            } catch (e) {
                console.error("[DestinationField] destinations query threw:", e);
            }
        }, 300);

        return () => clearTimeout(t);
    }, [q, sb]);

    return (
        <div className="relative w-full">
            <Input
                value={q}
                onChange={(e) => {
                    setQ(e.target.value);
                    setOpen(true);
                    onChange({ ...value, name: e.target.value, id: undefined });
                }}
                onFocus={() => setOpen(true)}
                className="h-14 w-full rounded-2xl border-slate-200 bg-slate-50 pl-4 text-lg shadow-sm focus-visible:ring-blue-600 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                placeholder="e.g. Tokyo, Paris..."
            />
            {open && rows.length > 0 && (
                <div
                    className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl dark:bg-slate-900 dark:border-slate-800 max-h-60 overflow-y-auto">
                    {rows.map((r) => {
                        const flag = r.country_code ? getFlagEmoji(r.country_code) : "🌍";
                        const countryName = r.country_code ? getCountryName(r.country_code) : "";

                        return (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => {
                                    const fullName = countryName ? `${r.name}, ${countryName}` : r.name;
                                    setQ(fullName);
                                    onChange({ ...r, name: fullName });
                                    setOpen(false);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <span className="text-2xl">{flag}</span>
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-white">
                                        {r.name}
                                    </div>
                                    {countryName && (
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {countryName}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// --- REVIEW CARD ---
function ReviewCard({
    data,
    onEdit,
}: {
    data: ReturnType<typeof toPayload>;
    onEdit: (i: number) => void;
}) {
    return (
        <div className="space-y-6 w-full">
            <div
                className="rounded-2xl bg-blue-50 p-6 text-center border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">
                    Ready to build?
                </h3>
                <p className="text-blue-700 text-sm mt-1 dark:text-blue-400">
                    Review your trip details below before we generate your itinerary.
                </p>
            </div>

            <div
                className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:divide-slate-800 dark:border-slate-800">
                <ReviewRow
                    label="Destination"
                    value={data.destinations[0]?.name || "Not set"}
                    onEdit={() => onEdit(0)}
                />
                <ReviewRow
                    label="Dates"
                    value={formatDateRange(data.start_date, data.end_date)}
                    onEdit={() => onEdit(1)}
                />
                <ReviewRow
                    label="Budget"
                    value={
                        data.budget_daily
                            ? `${data.currency} ${data.budget_daily}/day`
                            : "Not specified"
                    }
                    onEdit={() => onEdit(2)}
                />
                <ReviewRow
                    label="Vibe"
                    value={
                        data.interests.length > 0
                            ? data.interests
                                .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
                                .join(", ")
                            : "Not specified"
                    }
                    onEdit={() => onEdit(3)}
                />
                <ReviewRow
                    label="Pace"
                    value={data.pace.charAt(0).toUpperCase() + data.pace.slice(1)}
                    onEdit={() => onEdit(4)}
                />
                <ReviewRow
                    label="Mode"
                    value={data.mode.charAt(0).toUpperCase() + data.mode.slice(1)}
                    onEdit={() => onEdit(5)}
                />
                <ReviewRow
                    label="Lodging"
                    value={data.lodging?.name || "Not specified"}
                    onEdit={() => onEdit(6)}
                />
            </div>
        </div>
    );
}

function ReviewRow({
    label,
    value,
    onEdit,
}: {
    label: string;
    value: string;
    onEdit: () => void;
}) {
    return (
        <div className="flex items-start justify-between p-4">
            <div className="pr-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 dark:text-slate-500">
                    {label}
                </p>
                <p className="font-medium text-slate-900 leading-relaxed dark:text-slate-200">
                    {value}
                </p>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 text-blue-600 hover:text-blue-700 shrink-0 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
                Edit
            </Button>
        </div>
    );
}

// --- HELPERS (Payload & Formatting) ---
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
        lodging: s.lodging?.name ? { name: s.lodging.name } : undefined,
        currency: s.currency,
    };
}

function fmtHuman(s?: string) {
    return s
        ? new Date(s + "T00:00:00").toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        })
        : "—";
}

function formatDateRange(start?: string, end?: string) {
    if (!start || !end) return "Dates TBD";
    return `${fmtHuman(start)} - ${fmtHuman(end)}`;
}