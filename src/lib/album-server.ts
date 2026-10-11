import { createAdminClient } from "@/lib/supabase/admin";
import { createClientServerRoute } from "@/lib/supabase/server";

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function albumServerContext() {
    const sessionClient = await createClientServerRoute();
    const { data: { user } } = await sessionClient.auth.getUser();
    const admin = createAdminClient();
    return { user, admin, sessionClient };
}

export async function isAlbumAdmin(userId: string, email: string | undefined) {
    const allowed = (process.env.ADMIN_EMAIL ?? "").split(",").map(item => item.trim().toLowerCase());
    if (!email || !allowed.includes(email.toLowerCase())) return false;
    const admin = createAdminClient();
    if (!admin) return false;
    const { data } = await admin.schema("itinero").from("profiles").select("role").eq("id", userId).maybeSingle();
    return data?.role === "admin";
}
