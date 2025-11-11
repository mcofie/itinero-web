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

export default function PublicToggle({
                                         tripId,
                                         publicId,
                                         className,
                                     }: {
    tripId: string;
    publicId?: string | null;
    className?: string;
}) {
    const [busy, setBusy] = useState(false);
    const isPublic = !!publicId;

    const shareUrl = useMemo(() => {
        if (!isPublic) return "";
        if (typeof window === "undefined") return `/t/${publicId}`;
        return `${window.location.origin}/t/${publicId}`;
    }, [isPublic, publicId]);

    async function handleToggle() {
        if (!tripId || busy) return;
        setBusy(true);
        try {
            await setTripPublic(tripId, !isPublic);
        } finally {
            setBusy(false);
            // hard-reload to pick updated public_id
            // if (typeof window !== "undefined") window.location.reload();
        }
    }

    async function copy() {
        try {
            await navigator.clipboard.writeText(shareUrl);
        } catch {
        }
    }

    return (
        <div
            className={cn(
                "rounded-2xl backdrop-blur-sm p-4",
                className
            )}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
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
                    <div className="text-sm text-gray-300 dark:text-muted-foreground">
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

            {isPublic && (
                <div className="mt-4 space-y-2">
                    <Label htmlFor="public-link" className="text-xs text-muted-foreground">
                        Share link
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input id="public-link" className={"light: text-gray-300 border-dashed border-gray-400"} readOnly value={shareUrl}/>
                        <Button type="button" variant="secondary" onClick={copy} className="gap-1">
                            <LinkIcon className="h-4 w-4"/>
                            Copy
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}