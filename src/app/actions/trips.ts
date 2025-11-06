// app/actions/trips.ts
"use server";

import {revalidatePath} from "next/cache";
import {createClientServer} from "@/lib/supabase/server";

/** Crypto-safe short id like: 8g5xkz2a */
function makeShortId(length = 8): string {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    // Use Web Crypto on the server (Node >=18 in Next)
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let id = "";
    for (let i = 0; i < length; i++) {
        id += alphabet[bytes[i] % alphabet.length];
    }
    return id;
}

/** Try to generate a unique id, retrying to avoid collisions. */
async function getUniquePublicId(sb: ReturnType<typeof createClientServer> extends Promise<infer C> ? C : never) {
    const MAX_TRIES = 5;
    for (let i = 0; i < MAX_TRIES; i++) {
        const candidate = makeShortId(8);
        const {data: clash, error} = await sb
            .schema("itinero")
            .from("trips")
            .select("id")
            .eq("public_id", candidate)
            .maybeSingle();

        if (error) {
            // If this is a 'no rows' shape it's fine; otherwise bubble up
            // Supabase returns null data + null error when no match (with maybeSingle())
        }
        if (!clash) return candidate;
    }
    throw new Error("Could not generate a unique public id; please try again.");
}

/**
 * Toggle public visibility by setting/clearing trips.public_id.
 * Returns the current public URL (or null if disabled).
 */
export async function setTripPublic(tripId: string, makePublic: boolean) {
    const sb = await createClientServer();

    // Ensure caller is signed in + ownership (RLS should also enforce)
    const {data: auth} = await sb.auth.getUser();
    const userId = auth?.user?.id ?? null;
    if (!userId) throw new Error("Not signed in");

    const {data: row, error: getErr} = await sb
        .schema("itinero")
        .from("trips")
        .select("id, user_id, public_id")
        .eq("id", tripId)
        .maybeSingle();

    if (getErr) throw new Error(getErr.message);
    if (!row) throw new Error("Trip not found");
    if (row.user_id !== userId) throw new Error("You do not have access to this trip");

    const oldPublicId = row.public_id as string | null;

    let newPublicId: string | null = null;

    if (makePublic) {
        // Keep existing id if present; otherwise generate a new unique one
        newPublicId = oldPublicId || (await getUniquePublicId(sb));

        const {error: upErr} = await sb
            .schema("itinero")
            .from("trips")
            .update({public_id: newPublicId})
            .eq("id", tripId);

        if (upErr) throw new Error(upErr.message);
    } else {
        // Make private: clear the id
        const {error: upErr} = await sb
            .schema("itinero")
            .from("trips")
            .update({public_id: null})
            .eq("id", tripId);

        if (upErr) throw new Error(upErr.message);
    }

    // Revalidate private page
    revalidatePath(`/trips/${tripId}`);

    // Revalidate public pages
    if (oldPublicId) revalidatePath(`/t/${oldPublicId}`); // will 404 after removal
    if (newPublicId) revalidatePath(`/t/${newPublicId}`);

    // Return a friendly payload for the UI
    return {
        public_id: newPublicId,
        public_url: newPublicId ? `/t/${newPublicId}` : null,
    };
}