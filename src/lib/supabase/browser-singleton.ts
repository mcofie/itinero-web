// lib/supabase/browser-singleton.ts
import { createClientBrowser } from "@/lib/supabase/browser";

// Keep exactly one instance of the browser client for the entire app.
let _client: ReturnType<typeof createClientBrowser> | null = null;

export function getSupabaseBrowser() {
    if (_client) return _client;
    _client = createClientBrowser();
    return _client;
}

// Reset the cached client to force recreation
// Use this when the client enters a corrupted state (e.g., after tab backgrounding)
export function resetSupabaseClient() {
    _client = null;
}