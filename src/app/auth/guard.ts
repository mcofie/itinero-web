// src/app/auth/guard.ts
import { redirect } from "next/navigation";
import { createClientServerRSC } from "@/lib/supabase/server";

/**
 * Ensures there is a signed-in user on the server.
 * Redirects to /login if not authenticated.
 */
export async function requireUser() {
    const sb = await createClientServerRSC();

    const {
        data: { user },
        error,
    } = await sb.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    return { sb, user };
}

/**
 * Returns `{ sb, user }` where user can be null (no redirect).
 * Useful for pages that render for both authed/anon users.
 */
export async function getUserOptional() {
    const sb = await createClientServerRSC();
    const {
        data: { user },
    } = await sb.auth.getUser();
    return { sb, user };
}