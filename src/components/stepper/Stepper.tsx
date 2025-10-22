"use client";

import * as React from "react";
import clsx from "clsx";

type Step = {
    key: string;
    label: string;
    optional?: boolean;
};

export function StepperHeader({
                                  steps,
                                  activeIndex,
                                  onStepClick,
                                  className,
                              }: {
    steps: Step[];
    activeIndex: number;
    onStepClick?: (i: number) => void;
    className?: string;
}) {
    const pct = steps.length > 1 ? (activeIndex / (steps.length - 1)) * 100 : 0;

    return (
        <div className={clsx("w-full", className)}>
            {/* progress rail */}
            <div className="relative h-1 rounded bg-muted">
                <div
                    className="absolute left-0 top-0 h-1 rounded bg-primary transition-all"
                    style={{width: `${pct}%`}}
                />
            </div>

            {/* numbered pills */}
            <div className="mt-4 grid grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                {steps.map((s, i) => {
                    const isActive = i === activeIndex;
                    const isDone = i < activeIndex;
                    return (
                        <button
                            key={s.key}
                            onClick={() => onStepClick?.(i)}
                            className={clsx(
                                "group flex items-center gap-2 rounded-full border px-3 py-1.5 transition",
                                isActive
                                    ? "border-primary/60 bg-primary/10"
                                    : isDone
                                        ? "border-emerald-400/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                                        : "border-transparent hover:bg-muted"
                            )}
                        >
              <span
                  className={clsx(
                      "grid h-6 w-6 place-items-center rounded-full text-xs font-semibold",
                      isActive
                          ? "bg-primary text-primary-foreground"
                          : isDone
                              ? "bg-emerald-500 text-white"
                              : "bg-muted text-muted-foreground"
                  )}
              >
                {isDone ? "✓" : i + 1}
              </span>
                            <span
                                className={clsx(
                                    "text-sm",
                                    isActive ? "text-foreground" : "text-muted-foreground"
                                )}
                            >
                {s.label}
                                {s.optional && (
                                    <span className="ml-1 text-xs text-muted-foreground/70">
                    (optional)
                  </span>
                                )}
              </span>
                        </button>
                    );
                })}
            </div>

            {/* mobile dots */}
            <div className="mt-3 flex items-center justify-center gap-2 sm:hidden">
                {steps.map((_, i) => (
                    <span
                        key={i}
                        className={clsx(
                            "h-1.5 w-4 rounded-full transition-all",
                            i === activeIndex ? "bg-primary w-6" : "bg-muted"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

export function StepperActions({
                                   canBack,
                                   canNext,
                                   onBack,
                                   onNext,
                                   nextLabel = "Next",
                                   finishLabel = "Finish",
                                   isLast,
                                   busy,
                               }: {
    canBack: boolean;
    canNext: boolean;
    onBack: () => void;
    onNext: () => void;
    nextLabel?: string;
    finishLabel?: string;
    isLast: boolean;
    busy?: boolean;
}) {
    return (
        <div className="mt-6 flex items-center justify-between">
            <button
                type="button"
                onClick={onBack}
                disabled={!canBack || busy}
                className={clsx(
                    "rounded-md border px-4 py-2 text-sm",
                    canBack ? "hover:bg-muted" : "opacity-50"
                )}
            >
                Back
            </button>
            <button
                type="button"
                onClick={onNext}
                disabled={!canNext || busy}
                className={clsx(
                    "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                    canNext ? "hover:opacity-95" : "opacity-50"
                )}
            >
                {busy ? "Working…" : isLast ? finishLabel : nextLabel}
            </button>
        </div>
    );
}