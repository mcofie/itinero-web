// app/profile/server-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClientServerRSC } from "@/lib/supabase/server";

/**
 * Update basic profile fields.
 * RLS should ensure auth.uid() = id in itinero.profiles.
 */
export async function saveProfileAction(formData: FormData) {
    const id = String(formData.get("id") || "");
    const full_name = String(formData.get("full_name") || "");
    const username = String(formData.get("username") || "");

    const preferredRaw = formData.get("preferred_currency");
    const preferred_currency =
        typeof preferredRaw === "string" && preferredRaw.trim().length > 0
            ? preferredRaw.trim().toUpperCase()
            : null;

    if (!id) throw new Error("Missing user id");

    const sb = await createClientServerRSC();

    const {
        data: { user },
    } = await sb.auth.getUser();
    if (!user || user.id !== id) throw new Error("Not allowed");

    const { error } = await sb
        .schema("itinero")
        .from("profiles")
        .update({
            full_name,
            username,
            preferred_currency,
        })
        .eq("id", id);

    if (error) throw new Error(error.message);

    // Make sure the /profile RSC is fresh
    revalidatePath("/profile");

    // ✅ allow the client to know it succeeded
    return { success: true };
}

/**
 * Create a top-up row.
 */
export async function topupPointsAction(formData: FormData) {
    const user_id = String(formData.get("user_id") || "");
    const amountRaw = String(formData.get("amount") || "");
    const amount = Number(amountRaw);

    if (!user_id || !Number.isFinite(amount) || amount <= 0) {
        throw new Error("Invalid topup");
    }

    const sb = await createClientServerRSC();

    const {
        data: { user },
    } = await sb.auth.getUser();
    if (!user || user.id !== user_id) throw new Error("Not allowed");

    const { error } = await sb
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