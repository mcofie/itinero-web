// app/api/trips/[id]/pdf/route.ts
import {NextRequest, NextResponse} from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";
import {setTimeout as sleep} from "timers/promises";

export const runtime = "nodejs";          // use Node runtime (not edge)
export const dynamic = "force-dynamic";   // always run server-side
export const maxDuration = 60;            // Vercel function limit (adjust per plan)

const BLOCKED = /(google-analytics|gtag|hotjar|facebook|segment|intercom|fullstory|clarity)/i;

const isProd = () => !!process.env.VERCEL;
const isDev = () => process.env.NODE_ENV !== "production";

function toError(e: unknown): Error {
    if (e instanceof Error) return e;
    if (e && typeof e === "object" && "message" in e) {
        return new Error(String((e as { message: unknown }).message));
    }
    return new Error(String(e));
}

export async function GET(
    req: NextRequest,
    ctx: { params: Promise<{ id: string }> } // Next 15: params is a Promise
) {
    const {id} = await ctx.params;
    const origin = new URL(req.url).origin;

    // Optional: support one-time access tokens to bypass strict auth on print route
    const token = new URL(req.url).searchParams.get("token") ?? "";

    // Use a dedicated print mode to disable analytics/maps/etc.
    const targetUrl = `${origin}/trips/${id}/print?print=1${token ? `&token=${encodeURIComponent(token)}` : ""}`;

    let browser: Awaited<ReturnType<typeof puppeteerCore.launch>> | null = null;

    try {
        // Resolve Chrome executable path
        let executablePath: string | undefined;
        if (isProd()) {
            executablePath = await chromium.executablePath();
        } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
            executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        } else {
            const puppeteerDev = await import("puppeteer");
            executablePath = puppeteerDev.executablePath();
        }

        browser = await puppeteerCore.launch({
            args: chromium.args,
            executablePath,
            headless: true,
            defaultViewport: {width: 1200, height: 800, deviceScaleFactor: 2},
        });

        const page = await browser.newPage();

        // Make layout deterministic & print-friendly
        await page.setUserAgent(
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome Safari/537.36"
        );
        await page.emulateMediaType("print");

        if (isDev()) {
            page.on("console", (msg) => console.log("[PDF][console]", msg.type(), msg.text()));
            page.on("pageerror", (err) => console.error("[PDF][pageerror]", err));
            page.on("requestfailed", (r) =>
                console.warn("[PDF][requestfailed]", r.failure()?.errorText, "=>", r.url())
            );
        }

        // Forward cookies for auth’d pages
        const cookiesHeader = req.headers.get("cookie");
        if (cookiesHeader) {
            const cookies = cookiesHeader.split(";").map((c) => {
                const [name, ...rest] = c.trim().split("=");
                return {
                    name,
                    value: rest.join("="),
                    domain: new URL(origin).hostname,
                    path: "/",
                };
            });
            await page.setCookie(...cookies);
        }

        // Block trackers to prevent "networkidle" hangs
        await page.setRequestInterception(true);
        page.on("request", (r) => {
            const u = r.url();
            if (BLOCKED.test(u)) return r.abort();
            r.continue();
        });

        // Navigate with resilience: try networkidle2, fall back to domcontentloaded
        const nav = page.goto(targetUrl, {waitUntil: "networkidle2", timeout: 45_000});
        const fallback = (async () => {
            await sleep(10_000);
            // If still spinning, switch to a lighter wait
            try {
                await page.goto(targetUrl, {waitUntil: "domcontentloaded", timeout: 20_000});
            } catch {
            }
        })();
        await Promise.race([nav, fallback]);

        // Detect auth redirect
        if (page.url().includes("/login")) {
            throw new Error("Auth redirect detected. Ensure cookies/session or token are valid.");
        }

        // Extra print safety (tables, images)
        await page.addStyleTag({
            content: `
        @media print {
          tr, td, th { break-inside: avoid; page-break-inside: avoid; }
          table { page-break-inside: auto; }
          img { max-width: 100%; }
        }
      `,
        });

        // Wait for your custom "ready" flag (set by the print page)
        await page.waitForSelector("html[data-hero-ready='1']", {timeout: 5000}).catch(() => {
            if (isDev()) console.warn("[PDF] hero-ready flag not seen; continuing...");
        });

        // Give fonts/images a moment to settle
        await sleep(150);

        // If you want a branded header/footer, uncomment below and add to pdf() options
        // const headerTemplate = `
        // <style>
        //   .hdr { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; font-size:10px; width:100%; padding:0 12mm; }
        //   .row { display:flex; justify-content:space-between; align-items:center; }
        //   .muted { color:#666; }
        // </style>
        // <div class="hdr">
        //   <div class="row">
        //     <div><strong>Itinero</strong> — Trip ${id}</div>
        //     <div class="muted">${new Date().toLocaleDateString()}</div>
        //   </div>
        // </div>`;
        // const footerTemplate = `
        // <style>
        //   .ftr { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; font-size:10px; width:100%; padding:0 12mm; }
        //   .row { display:flex; justify-content:space-between; align-items:center; }
        //   .muted { color:#666; }
        // </style>
        // <div class="ftr">
        //   <div class="row">
        //     <div class="muted">Generated by Itinero</div>
        //     <div class="muted">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
        //   </div>
        // </div>`;

        const pdfBytes = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {top: "16mm", right: "16mm", bottom: "16mm", left: "16mm"},
            // displayHeaderFooter: true,
            // headerTemplate,
            // footerTemplate,
        });

        await browser.close();
        browser = null;

        // Convert to ArrayBuffer for NextResponse
        const ab = pdfBytes.buffer.slice(
            pdfBytes.byteOffset,
            pdfBytes.byteOffset + pdfBytes.byteLength
        ) as ArrayBuffer;

        return new NextResponse(ab, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="trip-${id}.pdf"`,
                "Cache-Control": "private, no-store",
            },
        });
    } catch (err: unknown) {
        const e = toError(err);
        console.error("[PDF] ERROR:", e.stack || e);
        return NextResponse.json(
            {error: "Failed to generate PDF", message: isDev() ? String(e.message || e) : undefined},
            {status: 500}
        );
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch {
            }
        }
    }
}