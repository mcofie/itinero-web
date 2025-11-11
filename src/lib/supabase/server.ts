// src/lib/supabase/server.ts
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Use this inside Server Components (e.g. page.tsx, layout.tsx) and generateMetadata.
 * It MUST NOT write cookies, so set/remove are no-ops.
 */
export function createClientServerRSC() {
    const cookieStore = cookies();
    return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            // No-ops in RSC (mutations are not allowed)
            set(_name: string, _value: string, _options: CookieOptions) {},
            remove(_name: string, _options: CookieOptions) {},
        },
    });
}

/**
 * Use this only inside Server Actions ("use server") and Route Handlers (app/api/*).
 * It can read/write cookies.
 */
export function createClientServerAction() {
    const cookieStore = cookies();
    return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
                cookieStore.set({ name, value, ...options });
            },
            remove(name: string, _options: CookieOptions) {
                // Next 15 supports delete(); either is fine.
                cookieStore.delete(name);
            },
        },
    });
}