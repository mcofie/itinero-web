import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PDF_BUCKET = Deno.env.get("PDF_BUCKET") ?? "pdfs";

// Host that serves the print page (your Next.js app)
const PRINT_HOST = Deno.env.get("PRINT_HOST")!; // e.g. https://your-next-app.vercel.app

// PDF microservice endpoint (must be full /api/pdf)
const VERPDF = Deno.env.get("VERCEL_PDF_URL")!; // e.g. https://pdf-service-xxxxx.vercel.app/api/pdf

// Optional Bearer for microservice
const VERPDF_TOKEN = Deno.env.get("VERCEL_PDF_TOKEN") ?? "";

// Vercel Deployment Protection bypass token (used for BOTH hosts)
const BYPASS = Deno.env.get("VERCEL_BYPASS_TOKEN") || "";

serve(async (req) => {
    try {
        const { tripId } = await req.json();
        if (!tripId) return json({ error: "Missing tripId" }, 400);

        const admin = createClient(SUPABASE_URL, SRK);

        // read current version
        const { data: t, error: tErr } = await admin
            .schema("itinero")
            .from("trips")
            .select("id,pdf_version")
            .eq("id", tripId)
            .single();

        if (tErr || !t) return json({ error: "TRIP_NOT_FOUND" }, 404);
        const version = t.pdf_version ?? 1;

        // cache hit?
        const { data: cached } = await admin
            .from("pdf_exports")
            .select("path,byte_size,created_at")
            .eq("trip_id", tripId)
            .eq("version", version)
            .maybeSingle();

        if (cached?.path) {
            const signed = await sign(admin, cached.path);
            return json({ ok: true, cached: true, url: signed, size: cached.byte_size });
        }

        // Build the absolute print URL (with print mode + protection bypass)
        const printUrl =
            `${PRINT_HOST}/trips/${encodeURIComponent(tripId)}/print?print=1` +
            (BYPASS ? `&x-vercel-protection-bypass=${encodeURIComponent(BYPASS)}` : "");

        // Call the microservice: /api/pdf?url=<printUrl>
        const serviceUrl = `${VERPDF}?url=${encodeURIComponent(printUrl)}`;

        // Minimal diagnostics
        console.log("[generate_pdf] serviceUrl:", serviceUrl);

        const r = await fetch(serviceUrl, {
            headers: {
                ...(VERPDF_TOKEN ? { Authorization: `Bearer ${VERPDF_TOKEN}` } : {}),
                ...(BYPASS ? { Cookie: `__vercel_protection_bypass=${BYPASS}` } : {}),
                "User-Agent": "Supabase-EdgeFetch/1.0",
            },
            redirect: "follow",
        });

        if (!r.ok) {
            const detail = await r.text();
            console.error("[generate_pdf] service error", r.status, detail.slice(0, 500));
            return json({ error: "PDF_SERVICE_FAILED", detail }, 502);
        }

        const pdf = new Uint8Array(await r.arrayBuffer());

        const path = `trips/${tripId}/v${version}/${crypto.randomUUID()}.pdf`;
        const { error: upErr } = await admin.storage
            .from(PDF_BUCKET)
            .upload(path, pdf, { contentType: "application/pdf", upsert: true });

        if (upErr) return json({ error: "UPLOAD_FAILED", detail: upErr.message }, 500);

        const { error: insErr } = await admin.from("pdf_exports").insert({
            trip_id: tripId,
            version,
            path,
            byte_size: pdf.byteLength,
        });
        if (insErr) console.warn("[generate_pdf] cache insert failed", insErr);

        const signed = await sign(admin, path);
        return json({ ok: true, cached: false, url: signed, size: pdf.byteLength });
    } catch (e) {
        return json({ error: "UNEXPECTED", detail: (e as Error)?.message }, 500);
    }
});

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

async function sign(admin: ReturnType<typeof createClient>, path: string) {
    const { data, error } = await admin.storage
        .from(PDF_BUCKET)
        .createSignedUrl(path, 60 * 60);
    if (error) throw new Error("SIGN_FAILED: " + error.message);
    return data.signedUrl;
}