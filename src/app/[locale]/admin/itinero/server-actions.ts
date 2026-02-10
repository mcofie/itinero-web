
"use server";

import { createClientServerRSC } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Helper to get admin client or standard client based on config
// Assuming standard user (Admin) should have RLS if admin client fails, but better to use admin client if possible
async function getSupabaseForAdminAction() {
    const adminClient = createAdminClient();
    if (adminClient) return adminClient;

    // Fallback to user client if no service key (dev mode?)
    // But this might fail on RLS if user is not properly setup in policies
    console.warn("Using user client for admin action (missing service key)");
    return await createClientServerRSC();
}

export async function addPointsAction(formData: FormData) {
    const userId = formData.get("user_id") as string;
    const points = Number(formData.get("points"));
    const reason = (formData.get("reason") as string) || "manual_topup";
    if (!userId || !points) {
        throw new Error("Missing user_id or points");
    }

    // Ensure user is authenticated first (security check)
    const sbAuth = await createClientServerRSC();
    const { data: { user } } = await sbAuth.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const sb = await getSupabaseForAdminAction();

    const { error } = await sb.schema("itinero").from("points_ledger").insert({
        user_id: userId,
        delta: points,
        reason,
        ref_type: "admin",
        meta: { source: "Admin" }
    });

    if (error) {
        console.error("Failed to add points:", error);
        throw new Error(error.message);
    }

    // New: Sync points_balance to profiles table manually if no trigger exists
    const { data: agg } = await sb
        .schema("itinero")
        .from("points_ledger")
        .select("delta")
        .eq("user_id", userId);

    if (agg) {
        const total = agg.reduce((acc, curr) => acc + (curr.delta || 0), 0);
        await sb.schema("itinero")
            .from("profiles")
            .update({ points_balance: total })
            .eq("id", userId);
    }

    // Revalidate layout to cover /admin/itinero/*
    revalidatePath("/admin/itinero", "layout");
    return { success: true };
}

export async function approveTourGuideRequestAction(requestId: string) {
    // 1. Auth check
    const sbAuth = await createClientServerRSC();
    const { data: { user } } = await sbAuth.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 2. Perform act with admin privileges
    const sb = await getSupabaseForAdminAction();

    const { error } = await sb.schema("itinero")
        .from("tour_guide_requests")
        .update({ status: "approved" })
        .eq("id", requestId);

    if (error) {
        console.error("Approve Action Error:", error);
        throw new Error(error.message);
    }

    revalidatePath("/admin/itinero", "layout");
    return { success: true };
}

export async function rejectTourGuideRequestAction(requestId: string) {
    // 1. Auth check
    const sbAuth = await createClientServerRSC();
    const { data: { user } } = await sbAuth.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 2. Perform act with admin privileges
    const sb = await getSupabaseForAdminAction();

    const { error } = await sb.schema("itinero")
        .from("tour_guide_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

    if (error) {
        console.error("Reject Action Error:", error);
        throw new Error(error.message);
    }

    revalidatePath("/admin/itinero", "layout");
    return { success: true };
}
