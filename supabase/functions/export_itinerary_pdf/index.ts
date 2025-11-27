// supabase/functions/export_itinerary_pdf/index.ts
// Keep this file as the entrypoint (required by Supabase).
// It just imports the real handler which calls Deno.serve.

import "./handler.tsx";

// Ensure this file has at least one export so Deno doesn’share treat it as a script in some contexts.
export {};