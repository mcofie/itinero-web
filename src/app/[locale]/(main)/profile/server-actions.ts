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
    const passport_country = String(formData.get("passport_country") || "");

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

    console.log("[saveProfileAction] Updating profile for:", id, {
        full_name,
        username,
        preferred_currency,
        passport_country,
    });

    // Verify row exists first (to distinguish between RLS violation and missing row)
    const { data: existing } = await sb
        .schema("itinero")
        .from("profiles")
        .select("id")
        .eq("id", id)
        .maybeSingle();

    if (!existing) {
        throw new Error("Profile record not found in database. Please contact support or try logging out and back in.");
    }

    const { error } = await sb
        .schema("itinero")
        .from("profiles")
        .update({
            full_name,
            username,
            preferred_currency,
            passport_country,
        })
        .eq("id", id);

    if (error) {
        console.error("[saveProfileAction] Error:", error);
        throw new Error(error.message);
    }

    console.log("[saveProfileAction] Success");

    // Revalidate multiple paths just to be safe
    revalidatePath("/profile");
    revalidatePath("/(main)/profile", "layout");

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