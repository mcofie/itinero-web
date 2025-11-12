// app/api/trips/[id]/pdf/route.ts
import {NextRequest, NextResponse} from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";
import {setTimeout as sleep} from "timers/promises"; // 👈 tiny, reliable delay

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

const isProd = () => !!process.env.VERCEL;
const isDev = () => process.env.NODE_ENV !== "production";

export async function GET(
    req: NextRequest,
    ctx: { params: Promise<{ id: string }> } // Next 15: params is a Promise
) {
    const {id} = await ctx.params;
    const origin = new URL(req.url).origin;
    const targetUrl = `${origin}/trips/${id}/print`;

    let browser: Awaited<ReturnType<typeof puppeteerCore.launch>> | null = null;

    try {
        // Resolve Chrome executable path
        let executablePath: string | undefined;
        if (isProd()) {
            executablePath = await chromium.executablePath();
            console.log("[PDF] Prod chromium exec:", executablePath);
        } else {
            if (process.env.PUPPETEER_EXECUTABLE_PATH) {
                executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
                console.log("[PDF] Dev exec from env:", executablePath);
            } else {
                const puppeteerDev = await import("puppeteer");
                executablePath = puppeteerDev.executablePath();
                console.log("[PDF] Dev exec from puppeteer bundled Chrome:", executablePath);
            }
        }

        // Launch
        browser = await puppeteerCore.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath,
            headless: true,
        });

        const page = await browser.newPage();

        if (isDev()) {
            page.on("console", (msg) => console.log("[PDF][page.console]", msg.type(), msg.text()));
            page.on("pageerror", (err) => console.error("[PDF][page.error]", err));
            page.on("requestfailed", (r) =>
                console.error("[PDF][request.failed]", r.failure()?.errorText, "=>", r.url())
            );
        }

        // Forward cookies (auth)
        const cookiesHeader = req.headers.get("cookie");
        if (cookiesHeader) {
            const cookies = cookiesHeader.split(";").map((c) => {
                const [name, ...rest] = c.trim().split("=");
                return {name, value: rest.join("="), domain: new URL(origin).hostname, path: "/"};
            });
            await page.setCookie(...cookies);
        }

        // Go to print page
        await page.goto(targetUrl, {waitUntil: "networkidle2", timeout: 60_000});

        // Auth guard
        if (page.url().includes("/login")) {
            throw new Error("Auth redirect detected. Ensure cookies/session are valid.");
        }

        // Wait for hero-ready flag set by the print page’s hidden image probe
        await page.waitForSelector("html[data-hero-ready='1']", {timeout: 5000}).catch(() => {
            console.warn("[PDF] hero-ready flag not seen before timeout; continuing.");
        });

        // Tiny extra paint delay (replacement for page.waitForTimeout)
        await sleep(150);

        // PDF
        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {top: "16mm", right: "16mm", bottom: "16mm", left: "16mm"},
        });

        await browser.close();
        browser = null;

        return new NextResponse(pdf, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="trip-${id}.pdf"`,
                "Cache-Control": "private, no-store",
            },
        });
    } catch (err: any) {
        console.error("[PDF] ERROR:", err?.stack || err);
        if (isDev()) {
            return NextResponse.json(
                {
                    error: "Failed to generate PDF (dev)",
                    message: String(err?.message || err),
                    hint:
                        "Common causes: auth redirect, blocked/signed image URLs, strict CSP, or missing Chrome executable.",
                },
                {status: 500}
            );
        }
        return NextResponse.json({error: "Failed to generate PDF"}, {status: 500});
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch {
            }
        }
    }
}