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
        return { ok: true, id: result._id ?? null };
    } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Network error" };
    }
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

const button = (label: string, href: string) =>
    `<a href="${href}" style="display:inline-block;padding:12px 22px;border:2px solid #423824;border-radius:16px;background:#fffcf9;color:#2b1a07;font-family:Georgia,serif;font-size:16px;text-decoration:none">${escapeHtml(label)}</a>`;

/**
 * Wraps plain-text content in the landing page's look: paper background, ink-outlined card, serif type.
 * Paragraphs are separated by blank lines; a paragraph shaped "Label: https://…" becomes a button.
 */
export function emailLayout(body: string, { preheader = "", highlight }: { preheader?: string; highlight?: string } = {}) {
    const paragraphs = body.split("\n\n").map(paragraph => {
        const action = paragraph.match(/^([^\n:]{2,60}):\s*(https?:\/\/\S+)$/);
        if (action) return `<p style="margin:24px 0">${button(action[1], action[2])}</p>`;
        const html = escapeHtml(paragraph).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#c16b36">$1</a>').replaceAll("\n", "<br>");
        return `<p style="margin:0 0 16px">${html}</p>`;
    }).join("");
    const code = highlight ? `<p style="margin:8px 0 24px;padding:16px;border:2px dashed #dfd6ce;border-radius:12px;text-align:center;font-family:Georgia,serif;font-size:34px;letter-spacing:10px;color:#2b1a07">${escapeHtml(highlight)}</p>` : "";
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#fdfbf9">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf9;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 4px 18px;font-family:Georgia,serif;font-size:28px;font-weight:bold;letter-spacing:-1px;color:#2b1a07">itinero<span style="color:#ed7936">.</span></td></tr>
<tr><td style="padding:28px 28px 12px;background:#fffcf9;border:2px solid #493b2a;border-radius:12px;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#2b1a07">${code}${paragraphs}</td></tr>
<tr><td style="padding:18px 4px 0;font-family:Arial,sans-serif;font-size:12px;line-height:1.5;color:#8a7d70">Itinero · printed travel albums, delivered in Accra · <a href="https://tryitinero.com" style="color:#8a7d70">tryitinero.com</a></td></tr>
</table></td></tr></table></body></html>`;
}
