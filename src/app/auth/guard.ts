// lib/auth/guard.ts
import { redirect } from "next/navigation";
import { createClientServer } from "@/lib/supabase/server";

export async function requireUser() {
    const sb = createClientServer();
    const { data: { user } } = await (await sb).auth.getUser();
    if (!user) redirect("/login");
    return { sb, user };
}