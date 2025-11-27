// app/trips/PublicToggle.tsx
"use client";

import * as React from "react";
import {useState, useMemo} from "react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {setTripPublic} from "@/app/actions/trips";
import {Link as LinkIcon, Globe, Lock, Loader2} from "lucide-react";
import {cn} from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type SetTripPublicResult = {
    public_id: string | null;
    public_url?: string | null;
} | void;

export default function PublicToggle({
                                         tripId,
                                         publicId,
                                         className,
                                     }: {
    tripId: string;
    publicId?: string | null;
    className?: string;
}) {
    // Keep a local copy so UI can react immediately
    const [currentPublicId, setCurrentPublicId] = useState<string | null>(
        publicId ?? null
    );
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState(false);

    const isPublic = !!currentPublicId;

    const shareUrl = useMemo(() => {
        if (!isPublic || !currentPublicId) return "";
        if (typeof window === "undefined") return `/t/${currentPublicId}`;
        return `${window.location.origin}/t/${currentPublicId}`;
    }, [isPublic, currentPublicId]);

    async function handleToggle() {
        if (!tripId || busy) return;
        setBusy(true);

        try {
            const result = (await setTripPublic(
                tripId,
                !isPublic
            )) as SetTripPublicResult;

            if (result && "public_id" in result) {
                // Use the canonical value from the server
                setCurrentPublicId(result.public_id);
            } else {
                // Fallback: reload to pick up latest state from server
                if (typeof window !== "undefined") {
                    window.location.reload();
                }
            }
        } finally {
            setBusy(false);
        }
    }

    async function copy() {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            // Hide after 1.5s
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // optional: toast fallback
        }
    }

    return (
        <div>
            <div className="flex flex-col items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                    {isPublic ? (
                        <Badge className="gap-1" variant="secondary">
                            <Globe className="h-3.5 w-3.5"/>
                            Public
                        </Badge>
                    ) : (
                        <Badge className="gap-1" variant="outline">
                            <Lock className="h-3.5 w-3.5"/>
                            Private
                        </Badge>
                    )}

                    <div className="text-sm text-muted-foreground">
                        {isPublic
                            ? "Anyone with the link can view this trip."
                            : "Only you can view this trip."}
                    </div>
                </div>

                <Button onClick={handleToggle} disabled={busy} className="gap-1">
                    {busy ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin"/>
                            Saving…
                        </>
                    ) : isPublic ? (
                        "Make private"
                    ) : (
                        "Make public"
                    )}
                </Button>
            </div>
        </div>
    );
}