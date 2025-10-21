import {createServerClient, type CookieOptions} from "@supabase/ssr"
import {cookies} from "next/headers"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** Use in Server Components (no cookie mutations) */
export async function createClientServer() {
    const store = await cookies()
    return createServerClient(url, key, {
        cookies: {
            get(name: string) {
                return store.get(name)?.value
            },
            set() { /* no-op in RSC */
            },
            remove() { /* no-op in RSC */
            },
        },
    })
}

/** Use in Server Actions / Route Handlers (cookie mutations allowed) */
export async function createClientAction() {
    const store = await cookies()
    return createServerClient(url, key, {
        cookies: {
            get(name: string) {
                return store.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
                store.set({name, value, ...options})
            },
            remove(name: string, options: CookieOptions) {
                // delete by setting past expiry (next/cookies has no .delete)
                store.set({name, value: "", ...options, expires: new Date(0)})
            },
        },
    })
}