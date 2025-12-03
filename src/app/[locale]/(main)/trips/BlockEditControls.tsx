"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/app/[locale]/(main)/trips/ConfirmDialog";

type UUID = string;

export type ItemRowLite = {
    id: UUID;
    trip_id: UUID;
    date: string | null;              // yyyy-mm-dd
    order_index: number;
    when: "morning" | "afternoon" | "evening";
    place_id: string | null;
    title: string;
    est_cost: number | null;
    duration_min: number | null;
    travel_min_from_prev: number | null;
    notes: string | null;
};

type When = ItemRowLite["when"];

function WhenSelect({
    value,
    onValueChange,
}: {
    value: When;
    onValueChange: (v: When) => void;
}) {
    return (
        <Select value={value} onValueChange={(v) => onValueChange(v as When)}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="When" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
            </SelectContent>
        </Select>
    );
}

/* =========================
   Edit / Delete per block
   ========================= */
export function BlockActions({
    item,
}: {
    item: ItemRowLite;
}) {
    const router = useRouter();
    const sb = getSupabaseBrowser();

    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [busy, setBusy] = useState(false);

    const [title, setTitle] = useState(item.title);
    const [when, setWhen] = useState<When>(item.when);
    const [estCost, setEstCost] = useState<string>(item.est_cost?.toString() ?? "");
    const [durationMin, setDurationMin] = useState<string>(item.duration_min?.toString() ?? "");
    const [notes, setNotes] = useState<string>(item.notes ?? "");

    async function onSave() {
        setBusy(true);
        try {
            const { error } = await sb
                .schema("itinero")
                .from("itinerary_items")
                .update({
                    title: title.trim() || "Untitled",
                    when,
                    est_cost: estCost === "" ? null : Number(estCost),
                    duration_min: durationMin === "" ? null : Number(durationMin),
                    notes: notes.trim() || null,
                })
                .eq("id", item.id);

            if (error) throw error;
            setOpen(false);
            router.refresh();
        } finally {
            setBusy(false);
        }
    }

    async function onDelete() {
        setBusy(true);
        try {
            const { error } = await sb
                .schema("itinero")
                .from("itinerary_items")
                .delete()
                .eq("id", item.id);

            if (error) throw error;
            setDeleteOpen(false);
            setBusy(false);
            router.refresh();
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mt-2 flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /></Button>

            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                loading={busy}
                title="Delete this item?"
                description={
                    "This item will be permanently removed from your itinerary. This action cannot be undone."
                }
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={onDelete}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit item</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-3">
                        <div className="grid gap-1.5">
                            <Label>Title</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>When</Label>
                                <WhenSelect value={when} onValueChange={setWhen} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Estimated cost</Label>
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="e.g. 25"
                                    value={estCost}
                                    onChange={(e) => setEstCost(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label>Duration (min)</Label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                placeholder="e.g. 120"
                                value={durationMin}
                                onChange={(e) => setDurationMin(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label>Notes</Label>
                            <Textarea
                                rows={3}
                                placeholder="Optional notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                            Cancel
                        </Button>
                        <Button onClick={onSave} disabled={busy}>
                            {busy ? "Saving…" : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

