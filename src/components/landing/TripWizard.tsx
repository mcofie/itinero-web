"use client";

import * as React from "react";
import {useState, useMemo} from "react";
import {StepperHeader, StepperActions} from "@/components/stepper/Stepper";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils";

type TripState = {
    destination: string;
    when: string; // ISO date or free text
    who: "solo" | "group" | "family";
    budget: number | ""; // per trip
    vibe: "relax" | "adventure" | "culture" | "mixed";
};

const steps = [
    {key: "destination", label: "Destination"},
    {key: "when", label: "Dates"},
    {key: "who", label: "Who’s coming"},
    {key: "budget", label: "Budget"},
    {key: "vibe", label: "Travel vibe"},
];

export default function TripWizard() {
    const [step, setStep] = useState(0);
    const [busy, setBusy] = useState(false);
    const [state, setState] = useState<TripState>({
        destination: "",
        when: "",
        who: "solo",
        budget: "",
        vibe: "mixed",
    });

    // basic per-step validation
    const isValid = useMemo(() => {
        if (step === 0) return state.destination.trim().length > 1;
        if (step === 1) return state.when.trim().length > 0;
        if (step === 2) return Boolean(state.who);
        if (step === 3) return state.budget === "" || Number(state.budget) >= 0;
        if (step === 4) return Boolean(state.vibe);
        return true;
    }, [step, state]);

    const goNext = async () => {
        if (!isValid || busy) return;
        if (step < steps.length - 1) {
            setStep((s) => s + 1);
            return;
        }
        // last step → maybe prompt auth or start planning
        setBusy(true);
        try {
            // TODO: route user to /plan or open signup modal
            // e.g., router.push(`/plan?dest=${encodeURIComponent(state.destination)}...`)
            console.log("Submit trip:", state);
        } finally {
            setBusy(false);
        }
    };

    const goBack = () => setStep((s) => Math.max(0, s - 1));
    const jumpTo = (i: number) => setStep(i);

    return (
        <div className="w-full">
            <StepperHeader steps={steps} activeIndex={step} onStepClick={jumpTo}/>

            <div className="mt-6 rounded-xl border bg-card p-4 md:p-6">
                {step === 0 && (
                    <FieldBlock title="Where to?" desc="City, region, or country.">
                        <Input
                            placeholder="e.g., Lisbon, Portugal"
                            value={state.destination}
                            onChange={(e) =>
                                setState((s) => ({...s, destination: e.target.value}))
                            }
                        />
                    </FieldBlock>
                )}

                {step === 1 && (
                    <FieldBlock title="When are you going?" desc="Pick a date or range.">
                        <Input
                            type="text"
                            placeholder="e.g., 12–20 Dec 2025"
                            value={state.when}
                            onChange={(e) => setState((s) => ({...s, when: e.target.value}))}
                        />
                    </FieldBlock>
                )}

                {step === 2 && (
                    <FieldBlock title="Who’s coming?" desc="Solo, group, or family.">
                        <ChoiceRow
                            options={[
                                {key: "solo", label: "Solo"},
                                {key: "group", label: "Group"},
                                {key: "family", label: "Family"},
                            ]}
                            value={state.who}
                            onChange={(v) => setState((s) => ({...s, who: v as TripState["who"]}))}
                        />
                    </FieldBlock>
                )}

                {step === 3 && (
                    <FieldBlock
                        title="Budget"
                        desc="Ballpark for the whole trip (USD or your local currency)."
                    >
                        <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            placeholder="e.g., 1500"
                            value={String(state.budget)}
                            onChange={(e) =>
                                setState((s) => ({
                                    ...s,
                                    budget: e.target.value === "" ? "" : Number(e.target.value),
                                }))
                            }
                        />
                    </FieldBlock>
                )}

                {step === 4 && (
                    <FieldBlock title="What’s your travel vibe?" desc="We’ll tailor suggestions.">
                        <ChoiceRow
                            options={[
                                {key: "relax", label: "Relax"},
                                {key: "adventure", label: "Adventure"},
                                {key: "culture", label: "Culture"},
                                {key: "mixed", label: "Mixed"},
                            ]}
                            value={state.vibe}
                            onChange={(v) =>
                                setState((s) => ({...s, vibe: v as TripState["vibe"]}))
                            }
                        />

                        {/* upsell / login hint */}
                        <div className="mt-4 text-sm text-muted-foreground">
                            Save & share requires an account. You’ll be prompted to log in next.
                        </div>
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
        </div>
    );
}

/* ——— small presentational helpers ——— */

function FieldBlock({
                        title,
                        desc,
                        children,
                    }: {
    title: string;
    desc?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <div>
                <Label className="text-base">{title}</Label>
                {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
            </div>
            {children}
        </div>
    );
}

function ChoiceRow<T extends string>({
                                         options,
                                         value,
                                         onChange,
                                     }: {
    options: { key: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((o) => {
                const active = o.key === value;
                return (
                    <button
                        key={o.key}
                        type="button"
                        onClick={() => onChange(o.key)}
                        className={cn(
                            "rounded-full border px-3 py-1.5 text-sm transition",
                            active
                                ? "border-primary/60 bg-primary/10"
                                : "border-transparent hover:bg-muted"
                        )}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}