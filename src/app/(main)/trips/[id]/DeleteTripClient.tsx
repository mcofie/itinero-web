// app/trips/[id]/DeleteTripClient.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteTripClient({
    tripId,
    title,
}: {
    tripId: string;
    title?: string | null;
}) {
    const router = useRouter();
    const sb = getSupabaseBrowser();
    const [open, setOpen] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [err, setErr] = React.useState<string | null>(null);

    async function handleDelete() {
        setBusy(true);
        setErr(null);

        try {
            const { data: auth } = await sb.auth.getUser();
            if (!auth?.user?.id) {
                setErr("You must be signed in to delete a trip.");
                setBusy(false);
                return;
            }

            // Remove children first (if your FK doesn’share cascade)
            await sb.schema("itinero").from("itinerary_items").delete().eq("trip_id", tripId);
            await sb.schema("itinero").from("trip_day_routes").delete().eq("trip_id", tripId);

            const { error: delErr } = await sb.schema("itinero").from("trips").delete().eq("id", tripId);
            if (delErr) {
                setErr(delErr.message ?? "Failed to delete trip.");
                setBusy(false);
                return;
            }

            router.replace("/trips");
            setTimeout(() => setOpen(false), 50);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Something went wrong.");
            setBusy(false);
        }
    }

    return (
        <>
            {/* Muted button with icon */}
            <div className="flex items-center justify-center">
                <Button
                    variant="outline"
                    onClick={() => setOpen(true)}
                    className="gap-2 border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Delete trip"
                >
                    <Trash2 className="h-4 w-4" />
                    Delete trip
                </Button>
            </div>

            <Dialog open={open} onOpenChange={(v) => (!busy ? setOpen(v) : null)}>
                <DialogContent
                    className="sm:max-w-md rounded-2xl border bg-card text-foreground shadow-xl ring-1 ring-border">
                    <DialogHeader>
                        <div className="mb-1 inline-flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">
                                Irreversible action
                            </span>
                        </div>
                        <DialogTitle>Delete this trip?</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            You’re about to permanently delete{" "}
                            <span className="font-medium">{title ?? "this trip"}</span>.
                            This will remove the trip, all days and activities, and any day routes.
                            <br />
                            <strong>This cannot be undone.</strong>
                        </DialogDescription>
                    </DialogHeader>

                    {err && (
                        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                            {err}
                        </p>
                    )}

                    <DialogFooter className="gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={busy}
                            className="border-border bg-background/60 text-foreground hover:bg-background"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={busy}
                            className="min-w-[110px]"
                        >
                            {busy ? "Deleting…" : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}