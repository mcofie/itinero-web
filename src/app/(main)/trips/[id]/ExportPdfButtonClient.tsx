// src/app/trips/[id]/ExportPdfButtonClient.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export default function ExportPdfButtonClient({ tripId }: { tripId: string }) {
    const [loading, setLoading] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);

    async function onClick() {
        setErr(null);
        setLoading(true);
        try {
            const res = await fetch(
                `https://ziglffbvcexvwguqopqm.supabase.co/functions/v1/export_itinerary_pdf?trip_id=${encodeURIComponent(
                    tripId
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    },
                }
            );

            if (!res.ok) {
                // Try to extract a JSON error shape, but keep it typed as unknown and narrow
                let msg = `HTTP ${res.status}`;
                try {
                    const j: unknown = await res.json();
                    if (
                        j &&
                        typeof j === "object" &&
                        ("error" in j || "message" in j)
                    ) {
                        const maybeMsg =
                            (typeof (j as { error?: unknown }).error === "string" &&
                                (j as { error: string }).error) ||
                            (typeof (j as { message?: unknown }).message === "string" &&
                                (j as { message: string }).message);
                        if (maybeMsg) msg = maybeMsg;
                    }
                } catch {
                    // ignore parse errors, keep status text
                }
                throw new Error(msg);
            }

            const blob = await res.blob();
            const filename = parseFilename(res.headers) || "itinerary.pdf";
            triggerDownload(blob, filename);
        } catch (e: unknown) {
            // Narrow unknown error to a message
            const message =
                e instanceof Error ? e.message : typeof e === "string" ? e : "Unknown error";
            console.error(e);
            setErr(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Button onClick={onClick} disabled={loading} className="inline-flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                {loading ? "Preparing…" : "Download PDF"}
            </Button>
            {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
        </div>
    );
}

/* ---------- helpers ---------- */
function parseFilename(headers: Headers): string | null {
    const cd = headers.get("Content-Disposition");
    if (!cd) return null;
    const m = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(cd);
    if (!m) return null;
    try {
        return decodeURIComponent(m[1].replace(/\"/g, ""));
    } catch {
        return m[1].replace(/\"/g, "");
    }
}

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}