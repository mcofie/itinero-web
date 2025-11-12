// src/lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** For RSC / Server Components — cookie mutations are no-ops */
export async function createClientServerRSC() {
    const cookieStore = await cookies();
    return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(_name: string, _value: string, _options: CookieOptions) {},
            remove(_name: string, _options: CookieOptions) {},
        },
    });
}

/** For Route Handlers (/app/api/**) — cookie mutations allowed */
export async function createClientServerRoute() {
    const cookieStore = await cookies();
    return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
                cookieStore.set({ name, value: "", ...options });
            },
        },
    });
}

export const createClientServer = (cookieStore = cookies()) =>
    createServerComponentClient({ cookies: () => cookieStore });