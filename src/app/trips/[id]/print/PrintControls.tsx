// app/trips/[id]/print/PrintControls.tsx
"use client";

import * as React from "react";
import {useEffect} from "react";
import {useSearchParams} from "next/navigation";

export function PrintControls() {
    const searchParams = useSearchParams();
    const auto = searchParams.get("print") === "1";

    useEffect(() => {
        if (!auto) return;
        if (typeof window === "undefined") return;

        // small delay so fonts/images/hero can settle if needed
        const id = setTimeout(() => {
            window.print();
        }, 400);

        return () => clearTimeout(id);
    }, [auto]);

    function handlePrint() {
        if (typeof window !== "undefined") {
            window.print();
        }
    }

    return (
        <div
            className="no-print"
            style={{
                position: "fixed",
                top: 12,
                right: 12,
                zIndex: 50,
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 12,
                background: "rgba(15,23,42,0.95)",
                color: "white",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
            }}
            onClick={handlePrint}
        >
            <span aria-hidden>⬇️</span>
            <span>Download / Print PDF</span>
        </div>
    );
}