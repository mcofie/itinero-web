/** Customer email, sent through Zend (tryzend.com). The sender's domain must be verified in Zend under Email → Domains. */
const ZEND_EMAIL_URL = "https://api.tryzend.com/email/send";
const DEFAULT_FROM = "Itinero <hello@tryitinero.com>";

export type EmailResult = { ok: true; id: string | null } | { ok: false; error: string; skipped?: boolean };

export const emailConfigured = () => !!process.env.ZEND_API_KEY;

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }): Promise<EmailResult> {
    const key = process.env.ZEND_API_KEY;
    if (!key) return { ok: false, skipped: true, error: "Email sending is not set up yet (ZEND_API_KEY is missing)." };
    try {
        const response = await fetch(ZEND_EMAIL_URL, {
            method: "POST",
            headers: { "x-api-key": key, "Content-Type": "application/json" },
            body: JSON.stringify({ from: process.env.EMAIL_FROM || DEFAULT_FROM, to, subject, html, text }),
            cache: "no-store",
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            const message = Array.isArray(result.message) ? result.message.join("; ") : result.message;
            return { ok: false, error: String(message || `Zend responded ${response.status}`).slice(0, 300) };
        }
        return { ok: true, id: result.id ?? result._id ?? null };
    } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Network error" };
    }
}
