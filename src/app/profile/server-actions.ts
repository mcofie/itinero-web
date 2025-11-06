// app/profile/server-actions.ts
"use server";

import {revalidatePath} from "next/cache";
import {createClientServer} from "@/lib/supabase/server";

/**
 * Update basic profile fields.
 * RLS should ensure auth.uid() = id in public.profiles.
 */
export async function saveProfileAction(formData: FormData) {
    const id = String(formData.get("id") || "");
    const full_name = String(formData.get("full_name") || "");
    const username = String(formData.get("username") || "");

    if (!id) throw new Error("Missing user id");

    const sb = await createClientServer();

    // optional: ensure the caller is the same user
    const {
        data: {user},
    } = await sb.auth.getUser();
    if (!user || user.id !== id) throw new Error("Not allowed");

    const {error} = await sb
        .schema('itinero')
        .from("profiles")
        .update({full_name, username})
        .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/profile");
}

/**
 * Create a top-up row.
 * Suggested RLS on itinero.points_ledger to allow insert when user_id = auth.uid()
 */
export async function topupPointsAction(formData: FormData) {
    const user_id = String(formData.get("user_id") || "");
    const amountRaw = String(formData.get("amount") || "");
    const amount = Number(amountRaw);

    if (!user_id || !Number.isFinite(amount) || amount <= 0) {
        throw new Error("Invalid topup");
    }

    const sb = await createClientServer();

    const {
        data: {user},
    } = await sb.auth.getUser();
    if (!user || user.id !== user_id) throw new Error("Not allowed");

    const {error} = await sb
        .schema("itinero")
        .from("points_ledger")
        .insert({
            user_id,
            delta: amount,
            reason: "manual_topup",
            source: "profile",
        });

    if (error) throw new Error(error.message);

    revalidatePath("/profile");
}