"use client";

import * as React from "react";
import { Suspense } from "react";
import VerifyTopupPage from "./VerifyTopupPage"; // ← move your existing component into this file

export default function Page() {
    return (
        <Suspense fallback={<VerifyFallback />}>
            <VerifyTopupPage />
        </Suspense>
    );
}

function VerifyFallback() {
    return (
        <div className="mx-auto w-full max-w-md px-4 py-10">
            <div className="rounded-xl border bg-card p-4">
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="mt-3 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
                </div>
            </div>
        </div>
    );
}