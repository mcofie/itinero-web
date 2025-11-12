// app/actions/trips.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClientServerRSC } from "@/lib/supabase/server";

/** Narrowest shape we rely on from Supabase/PostgREST errors */
type PostgrestLikeError = {
    message?: string;
    code?: string;
    details?: string | null;
    hint?: string | null;
};

type Supa = Awaited<ReturnType<typeof createClientServerRSC>>;

/** Minimal row used for lookups in this file */
type TripLookupRow = {
    id: string;
    user_id: string;
    public_id: string | null;
};

// ───────────────────────── helpers ─────────────────────────

/** Random, unambiguous slug */
function makeSlug(len = 8) {
    const abc = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const buf = new Uint8Array(len);
    crypto.getRandomValues(buf);
    let s = "";
    for (let i = 0; i < len; i++) s += abc[buf[i] % abc.length];
    return s;
}

async function uniquePublicId(sb: Supa, tries = 6) {
    for (let i = 0; i < tries; i++) {
        const id = makeSlug();
        const { data, error } = await sb
            .schema("itinero")
            .from("trips")
            .select("id")
            .eq("public_id", id)
            .maybeSingle();

        if (error) throw new Error(`[check-id] ${error.message}`);
        if (!data) return id;
    }
    throw new Error("Could not generate a unique public id; please try again.");
}

/** Type guard: does the value look like a PostgREST/Supabase error? */
function isPostgrestLikeError(e: unknown): e is PostgrestLikeError {
    return typeof e === "object" && e !== null && ("message" in e || "code" in e);
}

/** Nicely format Supabase errors without using `any` */
function formatPgErr(prefix: string, e: unknown) {
    if (!isPostgrestLikeError(e)) return prefix;
    const parts = [prefix, e.message];
    if (e.code) parts.push(`code=${e.code}`);
    if (e.details) parts.push(`details=${e.details}`);
    if (e.hint) parts.push(`hint=${e.hint}`);
    return parts.filter(Boolean).join(" | ");
}

/** Type guard: check for a specific Postgres error code (e.g. 23505 unique_violation) */
function hasPgCode(e: unknown, code: string): boolean {
    return isPostgrestLikeError(e) && e.code === code;
}

// ───────────────────────── actions ─────────────────────────

export async function setTripPublic(tripId: string, makePublic: boolean) {
    const sb = await createClientServerRSC();

    // 1) AUTH
    const { data: auth, error: authErr } = await sb.auth.getUser();
    if (authErr) throw new Error(formatPgErr("Auth error", authErr));
    if (!auth?.user?.id) throw new Error("Not signed in (no user id in server action).");

    const userId = auth.user.id;

    // 2) FETCH + OWNERSHIP
    const { data: row, error: selErr } = await sb
        .schema("itinero")
        .from("trips")
        .select("id,user_id,public_id")
        .eq("id", tripId)
        .maybeSingle<TripLookupRow>();

    if (selErr) throw new Error(formatPgErr("Select trip failed", selErr));
    if (!row) throw new Error("Trip not found");
    if (row.user_id !== userId) throw new Error("You do not have access to this trip");

    const oldPublicId = row.public_id ?? null;
    let finalPublicId: string | null = null;

    // 3) UPDATE (atomic .select() + retry on 23505)
    if (makePublic) {
        let candidate = oldPublicId ?? (await uniquePublicId(sb));
        for (let attempt = 0; attempt < 5; attempt++) {
            const { data: updated, error: upErr } = await sb
                .schema("itinero")
                .from("trips")
                .update({ public_id: candidate })
                .eq("id", tripId)
                .select("public_id")
                .maybeSingle<{ public_id: string | null }>();

            if (!upErr) {
                finalPublicId = updated?.public_id ?? candidate;
                break;
            }

            // unique violation → try a fresh id
            if (hasPgCode(upErr, "23505")) {
                candidate = await uniquePublicId(sb);
                continue;
            }

            throw new Error(formatPgErr("Update public_id failed", upErr));
        }

        if (!finalPublicId) {
            throw new Error("Could not assign a unique public id after retries.");
        }
    } else {
        const { data: updated, error: upErr } = await sb
            .schema("itinero")
            .from("trips")
            .update({ public_id: null })
            .eq("id", tripId)
            .select("public_id")
            .maybeSingle<{ public_id: string | null }>();

        if (upErr) throw new Error(formatPgErr("Clear public_id failed", upErr));
        finalPublicId = updated?.public_id ?? null;
    }

    // 4) REVALIDATE
    revalidatePath(`/trips/${tripId}`);
    if (oldPublicId && oldPublicId !== finalPublicId) revalidatePath(`/t/${oldPublicId}`);
    if (finalPublicId) revalidatePath(`/t/${finalPublicId}`);

    return {
        public_id: finalPublicId,
        public_url: finalPublicId ? `/t/${finalPublicId}` : null,
    };
}