import { createAdminClient } from "@/lib/supabase/admin";
import { createClientServerRoute } from "@/lib/supabase/server";

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function albumServerContext() {
    const sessionClient = await createClientServerRoute();
    const { data: { user } } = await sessionClient.auth.getUser();
    const admin = createAdminClient();
    return { user, admin, sessionClient };
}

/** The admin portal's access rule: the signed-in email is listed in ADMIN_EMAIL. */
export function isAlbumAdmin(email: string | undefined) {
    const allowed = (process.env.ADMIN_EMAIL ?? "").split(",").map(item => item.trim().toLowerCase()).filter(Boolean);
    return !!email && allowed.includes(email.toLowerCase());
}
