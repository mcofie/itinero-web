// supabase/functions/generate-pdf/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PDF_BUCKET = Deno.env.get("PDF_BUCKET") ?? "pdfs";

// Host that serves the print page (your Next.js app)
const PRINT_HOST = Deno.env.get("PRINT_HOST")!; // e.g. https://your-site.vercel.app

// PDF microservice endpoint (must be full /api/pdf)
const VERCEL_PDF_URL = Deno.env.get("VERCEL_PDF_URL")!; // e.g. https://pdf-service.vercel.app/api/pdf

// Optional Bearer for microservice
const VERCEL_PDF_TOKEN = Deno.env.get("VERCEL_PDF_TOKEN") ?? "";

// Optional Vercel deployment protection bypass token
const VERPROT_BYPASS = Deno.env.get("VERCEL_BYPASS_TOKEN") ?? "";

serve(async (req) => {
    try {
        // Basic auth: require a Supabase JWT (anon or user)
        const authHeader = req.headers.get("authorization") ?? "";
        if (!authHeader.toLowerCase().startsWith("bearer ")) {
            return json({ error: "Missing authorization header" }, 401);
        }

        const supabase = createClient(SUPABASE_URL, SRK, {
            global: { headers: { Authorization: authHeader } },
        });

        let body: { tripId?: string };
        try {
            body = (await req.json()) as { tripId?: string };
        } catch {
            return json({ error: "Invalid JSON body" }, 400);
        }

        const tripId = body.tripId;
        if (!tripId) return json({ error: "Missing tripId" }, 400);

        // 1) Load trip + pdf_version
        const { data: trip, error: tripErr } = await supabase
            .schema("itinero")
            .from("trips")
            .select("id, pdf_version")
            .eq("id", tripId)
            .single();

        if (tripErr || !trip) {
            console.error("[generate-pdf] trip error", tripErr);
            return json({ error: "TRIP_NOT_FOUND" }, 404);
        }

        const version: number = (trip as any).pdf_version ?? 1;

        // 2) Check for cached export
        const { data: cached } = await supabase
            .schema("itinero")
            .from("pdf_exports")
            .select("path, byte_size, created_at")
            .eq("trip_id", tripId)
            .eq("version", version)
            .maybeSingle();

        if (cached?.path) {
            const signed = await sign(supabase, cached.path);
            return json({
                ok: true,
                cached: true,
                url: signed,
                size: cached.byte_size,
            });
        }

        // 3) Build print URL
        // NOTE: this hits your Next.js route: /trips/[id]/print
        const printUrl =
            `${PRINT_HOST}/trips/${encodeURIComponent(tripId)}/print?print=1` +
            (VERPROT_BYPASS
                ? `&x-vercel-protection-bypass=${encodeURIComponent(VERPROT_BYPASS)}`
                : "");

        // 4) Call PDF microservice: /api/pdf?url=<printUrl>
        const serviceUrl = `${VERCEL_PDF_URL}?url=${encodeURIComponent(printUrl)}`;

        const headers: HeadersInit = {
            "User-Agent": "Supabase-EdgeFetch/1.0",
        };
        if (VERCEL_PDF_TOKEN) {
            headers["Authorization"] = `Bearer ${VERCEL_PDF_TOKEN}`;
        }
        if (VERPROT_BYPASS) {
            headers["Cookie"] = `__vercel_protection_bypass=${VERPROT_BYPASS}`;
        }

        console.log("[generate-pdf] calling pdf service", serviceUrl);

        const r = await fetch(serviceUrl, { headers, redirect: "follow" });

        if (!r.ok) {
            const detail = await r.text();
            console.error(
                "[generate-pdf] pdf service error",
                r.status,
                detail.slice(0, 300),
            );
            return json(
                { error: "PDF_SERVICE_FAILED", status: r.status, detail },
                502,
            );
        }

        const buf = await r.arrayBuffer();
        const pdf = new Uint8Array(buf);

        // 5) Upload to storage
        const path = `trips/${tripId}/v${version}/${crypto.randomUUID()}.pdf`;
        const { error: upErr } = await supabase.storage
            .from(PDF_BUCKET)
            .upload(path, pdf, {
                contentType: "application/pdf",
                upsert: true,
            });

        if (upErr) {
            console.error("[generate-pdf] upload error", upErr);
            return json(
                { error: "UPLOAD_FAILED", detail: upErr.message },
                500,
            );
        }

        // 6) Insert cache record
        const { error: insErr } = await supabase
            .schema("itinero")
            .from("pdf_exports")
            .insert({
                trip_id: tripId,
                version,
                path,
                byte_size: pdf.byteLength,
            });

        if (insErr) {
            console.warn("[generate-pdf] cache insert failed", insErr);
            // Non-fatal
        }

        const signed = await sign(supabase, path);
        return json({
            ok: true,
            cached: false,
            url: signed,
            size: pdf.byteLength,
        });
    } catch (e) {
        console.error("[generate-pdf] unexpected", e);
        return json(
            { error: "UNEXPECTED", detail: (e as Error)?.message },
            500,
        );
    }
});

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

async function sign(client: ReturnType<typeof createClient>, path: string) {
    const { data, error } = await client.storage
        .from(PDF_BUCKET)
        .createSignedUrl(path, 60 * 60);
    if (error) throw new Error("SIGN_FAILED: " + error.message);
    return data.signedUrl;
}