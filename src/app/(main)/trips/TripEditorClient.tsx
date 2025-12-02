"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { useRouter } from "next/navigation";


type UUID = string;

type Item = {
    id: UUID;
    date: string | null;
    order_index: number;
    when: "morning" | "afternoon" | "evening";
    title: string;
    est_cost: number | null;
    duration_min: number | null;
    travel_min_from_prev: number | null;
    notes: string | null;
};

export default function TripEditorClient({
    itemsByDate,
}: {
    itemsByDate: Record<string, Item[]>;
}) {
    const sb = getSupabaseBrowser();
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [draft, setDraft] = React.useState<Partial<Item>>({});
    const [busy, setBusy] = React.useState(false);

    const router = useRouter();

    async function updateItem(_id: string, _patch: Partial<Item>) {
        // ... supabase update ...
        router.refresh(); // ✅
    }

    async function deleteAnItem(_id: string) {
        // ... supabase delete ...
        router.refresh(); // ✅
    }

    async function addItem(_dayKey: string, _payload: Partial<Item>) {
        // ... supabase insert ...
        router.refresh(); // ✅
    }

    function beginEdit(item: Item) {
        setEditingId(item.id);
        setDraft(item);
    }

    type ItemUpdate = {
        when?: Item["when"];
        title?: string;
        est_cost?: number | null;
        duration_min?: number | null;
        travel_min_from_prev?: number | null;
        notes?: string | null;
    };

    async function saveEdit() {
        if (!editingId) return;
        setBusy(true);
        try {
            const patch: ItemUpdate = {
                when: draft.when,
                title: draft.title,
                est_cost: draft.est_cost ?? null,
                duration_min: draft.duration_min ?? null,
                travel_min_from_prev: draft.travel_min_from_prev ?? null,
                notes: draft.notes ?? null,
            };
            const { error } = await sb
                .schema("itinero")
                .from("itinerary_items")
                .update(patch)
                .eq("id", editingId);
            if (error) throw error;
            setEditingId(null);
        } finally {
            setBusy(false);
        }
    }

    async function deleteItem(id: string) {
        if (!confirm("Delete this item?")) return;
        setBusy(true);
        try {
            const { error } = await sb.schema("itinero").from("itinerary_items").delete().eq("id", id);
            if (error) throw error;
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="space-y-6">
            {Object.entries(itemsByDate).map(([date, items]) => (
                <div key={date} className="rounded-xl border bg-card/60 p-3 md:p-4">
                    <div className="mb-3 text-sm font-semibold">{date}</div>
                    <ul className="divide-y">
                        {items.map((it) => {
                            const active = editingId === it.id;
                            return (
                                <li key={it.id}
                                    className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                                    {/* left */}
                                    <div className="flex-1">
                                        {!active ? (
                                            <>
                                                <div className="text-sm font-medium">{it.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {it.when} • {it.duration_min ?? 0} min • ${it.est_cost ?? 0}
                                                    {it.notes ? ` — ${it.notes}` : ""}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="grid gap-2 sm:grid-cols-4">
                                                <select
                                                    className="h-9 rounded-md border bg-background px-2 text-sm"
                                                    value={draft.when ?? it.when}
                                                    onChange={(e) => setDraft((d) => ({
                                                        ...d,
                                                        when: e.target.value as Item["when"]
                                                    }))}
                                                >
                                                    <option value="morning">Morning</option>
                                                    <option value="afternoon">Afternoon</option>
                                                    <option value="evening">Evening</option>
                                                </select>
                                                <Input
                                                    value={draft.title ?? it.title}
                                                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                                                    placeholder="Title"
                                                />
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={String(draft.duration_min ?? it.duration_min ?? 0)}
                                                    onChange={(e) => setDraft((d) => ({
                                                        ...d,
                                                        duration_min: Number(e.target.value || 0)
                                                    }))}
                                                    placeholder="Duration (min)"
                                                />
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={String(draft.est_cost ?? it.est_cost ?? 0)}
                                                    onChange={(e) => setDraft((d) => ({
                                                        ...d,
                                                        est_cost: Number(e.target.value || 0)
                                                    }))}
                                                    placeholder="Cost"
                                                />
                                                <Input
                                                    className="sm:col-span-4"
                                                    value={draft.notes ?? it.notes ?? ""}
                                                    onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                                                    placeholder="Notes"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* right */}
                                    <div className="flex items-center gap-2">
                                        {!active ? (
                                            <>
                                                <Button size="sm" variant="outline" onClick={() => beginEdit(it)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </Button>
                                                <Button size="sm" variant="destructive"
                                                    onClick={() => deleteItem(it.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="sm" onClick={saveEdit} disabled={busy}>
                                                    <Save className="mr-2 h-4 w-4" /> Save
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                                                    disabled={busy}>
                                                    <X className="mr-2 h-4 w-4" /> Cancel
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}