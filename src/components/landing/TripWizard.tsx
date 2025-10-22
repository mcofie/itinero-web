"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthGateDialog from "@/components/auth/AuthGateDialog";
import { createClientBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

/** ---------- types ---------- */
type TripState = {
    destination: string;
    when: string; // ISO date or free text for now
    who: "solo" | "group" | "family";
    budget: number | "";
    vibe: "relax" | "adventure" | "culture" | "mixed";
};

const steps = [
    { key: "destination", label: "Destination" },
    { key: "when", label: "Dates" },
    { key: "who", label: "Who’s coming" },
    { key: "budget", label: "Budget" },
    { key: "vibe", label: "Travel vibe" },
] as const;

/** ---------- component ---------- */
export default function TripWizard() {
    const sb = createClientBrowser();

    const [step, setStep] = useState(0);
    const [busy, setBusy] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    const [state, setState] = useState<TripState>({
        destination: "",
        when: "",
        who: "solo",
        budget: "",
        vibe: "mixed",
    });

    const isValid = useMemo(() => {
        if (step === 0) return state.destination.trim().length > 1;
        if (step === 1) return state.when.trim().length > 0;
        if (step === 2) return Boolean(state.who);
        if (step === 3) return state.budget === "" || Number(state.budget) >= 0;
        if (step === 4) return Boolean(state.vibe);
        return true;
    }, [step, state]);

    const goBack = () => setStep((s) => Math.max(0, s - 1));
    const jumpTo = (i: number) => setStep(i);

    const goNext = async () => {
        if (!isValid || busy) return;

        // Not the last step → advance
        if (step < steps.length - 1) {
            setStep((s) => s + 1);
            return;
        }

        // Last step → require auth to save/share
        setBusy(true);
        try {
            const { data: { user } } = await sb.auth.getUser();
            if (!user) {
                setAuthOpen(true);
                return;
            }
            // Already signed in → proceed to planner (wire up when your /plan route is ready)
            // e.g. router.push(`/plan?dest=${encodeURIComponent(state.destination)}&when=${encodeURIComponent(state.when)}...`)
            // For now we just log:
            // console.log("Plan for:", user.id, state);
        } finally {
            setBusy(false);
        }
    };

    async function afterLogin() {
        // Called when email or Google auth succeeds
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;
        // Persist a draft trip or jump to planner here if desired.
        // console.log("Authenticated, proceed to plan:", state);
    }

    return (
        <div className="w-full">
            <StepperHeader steps={steps.map(s => s.label)} activeIndex={step} onStepClick={jumpTo} />

            <div className="mt-6 rounded-xl border bg-card p-4 md:p-6">
                {/* step panels */}
                {step === 0 && (
                    <FieldBlock
                        label="Where are you headed?"
                        hint="City, region, or country"
                    >
                        <Input
                            placeholder="e.g., Accra, Ghana"
                            value={state.destination}
                            onChange={(e) => setState((s) => ({ ...s, destination: e.target.value }))}
                        />
                    </FieldBlock>
                )}

                {step === 1 && (
                    <FieldBlock
                        label="When are you going?"
                        hint="Pick an approximate start date (you can refine later)"
                    >
                        <Input
                            type="date"
                            value={state.when}
                            onChange={(e) => setState((s) => ({ ...s, when: e.target.value }))}
                        />
                    </FieldBlock>
                )}

                {step === 2 && (
                    <FieldBlock
                        label="Who’s coming with you?"
                        hint="We’ll tailor activities and pacing"
                    >
                        <div className="flex flex-wrap gap-2">
                            {(["solo", "group", "family"] as const).map((opt) => (
                                <ChoiceChip
                                    key={opt}
                                    active={state.who === opt}
                                    onClick={() => setState((s) => ({ ...s, who: opt }))}
                                    label={opt === "solo" ? "Solo" : opt === "group" ? "Group" : "Family"}
                                />
                            ))}
                        </div>
                    </FieldBlock>
                )}

                {step === 3 && (
                    <FieldBlock
                        label="What’s your budget?"
                        hint="Optional — helps pick the right stays & activities"
                    >
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min={0}
                                placeholder="e.g., 800"
                                value={String(state.budget)}
                                onChange={(e) =>
                                    setState((s) => ({
                                        ...s,
                                        budget: e.target.value === "" ? "" : Number(e.target.value),
                                    }))
                                }
                            />
                            <span className="text-sm text-muted-foreground">USD (approx.)</span>
                        </div>
                    </FieldBlock>
                )}

                {step === 4 && (
                    <FieldBlock
                        label="What’s your travel vibe?"
                        hint="We’ll personalize your picks"
                    >
                        <div className="flex flex-wrap gap-2">
                            {(["relax", "adventure", "culture", "mixed"] as const).map((opt) => (
                                <ChoiceChip
                                    key={opt}
                                    active={state.vibe === opt}
                                    onClick={() => setState((s) => ({ ...s, vibe: opt }))}
                                    label={
                                        opt === "relax"
                                            ? "Relax"
                                            : opt === "adventure"
                                                ? "Adventure"
                                                : opt === "culture"
                                                    ? "Culture"
                                                    : "Mixed"
                                    }
                                />
                            ))}
                        </div>

                        <p className="mt-4 text-xs text-muted-foreground">
                            You’ll need an account to save or share your trip. We’ll prompt you to sign in next.
                        </p>
                    </FieldBlock>
                )}

                <StepperActions
                    canBack={step > 0}
                    canNext={isValid}
                    onBack={goBack}
                    onNext={goNext}
                    isLast={step === steps.length - 1}
                    finishLabel="Start planning"
                    busy={busy}
                />
            </div>

            {/* Auth dialog (last step) */}
            <AuthGateDialog
                open={authOpen}
                onOpenChange={setAuthOpen}
                title="Sign in to save & share your trip"
                postLogin={afterLogin}
            />
        </div>
    );
}

/** ---------- local UI bits (simple, dependency-light) ---------- */

function StepperHeader({
                           steps,
                           activeIndex,
                           onStepClick,
                       }: {
    steps: string[];
    activeIndex: number;
    onStepClick?: (i: number) => void;
}) {
    return (
        <div className="flex items-center gap-3 overflow-x-auto">
            {steps.map((label, i) => {
                const active = i === activeIndex;
                return (
                    <button
                        key={label}
                        type="button"
                        onClick={() => onStepClick?.(i)}
                        className={cn(
                            "inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm",
                            active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted hover:bg-accent"
                        )}
                    >
            <span className={cn(
                "grid place-items-center h-5 w-5 rounded-full text-[11px] font-medium",
                active ? "bg-primary-foreground text-primary" : "bg-background"
            )}>
              {i + 1}
            </span>
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

function StepperActions({
                            canBack,
                            canNext,
                            onBack,
                            onNext,
                            isLast,
                            finishLabel = "Finish",
                            busy,
                        }: {
    canBack: boolean;
    canNext: boolean;
    onBack: () => void;
    onNext: () => void;
    isLast?: boolean;
    finishLabel?: string;
    busy?: boolean;
}) {
    return (
        <div className="mt-6 flex items-center justify-between">
            <Button type="button" variant="ghost" onClick={onBack} disabled={!canBack || busy}>
                Back
            </Button>
            <Button type="button" onClick={onNext} disabled={!canNext || busy}>
                {busy ? "Working…" : isLast ? finishLabel : "Next"}
            </Button>
        </div>
    );
}

function FieldBlock({
                        label,
                        hint,
                        children,
                    }: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <div>
                <Label className="text-base">{label}</Label>
                {hint && <div className="text-sm text-muted-foreground mt-1">{hint}</div>}
            </div>
            {children}
        </div>
    );
}

function ChoiceChip({
                        active,
                        onClick,
                        label,
                    }: {
    active: boolean;
    onClick: () => void;
    label: string;
}) {
    return (
        <Button
            type="button"
            variant={active ? "default" : "secondary"}
            size="sm"
            className={cn("rounded-full", active && "ring-2 ring-ring")}
            onClick={onClick}
        >
            {label}
        </Button>
    );
}