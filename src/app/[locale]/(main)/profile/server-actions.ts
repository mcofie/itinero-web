// app/profile/server-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClientServerRSC } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

/**
 * Submit a request to become a tour guide.
 */
export async function submitTourGuideRequestAction(formData: FormData) {
    const user_id = String(formData.get("user_id") || "");
    const country = String(formData.get("country") || "");
    const city = String(formData.get("city") || "");
    const available_times = String(formData.get("available_times") || "");

    if (!user_id || !country || !city || !available_times) {
        throw new Error("Missing required fields");
    }

    const sb = await createClientServerRSC();

    const {
        data: { user },
    } = await sb.auth.getUser();

    if (!user || user.id !== user_id) throw new Error("Not allowed");

    const { error } = await sb
        .schema("itinero")
        .from("tour_guide_requests")
        .insert({
            user_id,
            country,
            city,
            available_times,
            status: "pending"
        });

    if (error) {
        console.error("Failed to submit tour guide request:", error);
        throw new Error(error.message);
    }

    revalidatePath("/profile");
    revalidatePath("/(main)/profile", "layout");
    return { success: true };
}

/**
 * Update details for an existing approved/pending request
 */
export async function updateTourGuideDetailsAction(formData: FormData) {
    const user_id = String(formData.get("user_id") || "");
    const request_id = String(formData.get("request_id") || "");
    const available_times = String(formData.get("available_times") || "");
    const country = String(formData.get("country") || "");
    const city = String(formData.get("city") || "");

    if (!user_id || !request_id || !available_times || !country || !city) {
        throw new Error("Missing required fields");
    }

    const sb = await createClientServerRSC();
    const { data: { user } } = await sb.auth.getUser();
    if (!user || user.id !== user_id) throw new Error("Unauthorized");

    // Use admin client to bypass potential RLS restrictions on UPDATE
    const adminClient = createAdminClient();
    const sbAction = adminClient || sb;

    const { error } = await sbAction
        .schema("itinero")
        .from("tour_guide_requests")
        .update({
            available_times,
            country,
            city,
            status: "pending" // Reset status to pending for re-review
        })
        .eq("id", request_id)
        .eq("user_id", user_id); // Security: ensure user owns the request

    if (error) {
        console.error("Failed to update details:", error);
        throw new Error(error.message);
    }

    revalidatePath("/profile");
    revalidatePath("/(main)/profile", "layout");

    // Return flag to client to show different message
    return { success: true, status: "pending" };
}