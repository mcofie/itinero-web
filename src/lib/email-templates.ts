import { ALBUM_FORMAT } from "@/lib/album-order";
import { FULFILMENT_PATH, formatOrderNumber, isOrderStatus, STATUS_INFO, type OrderStatus } from "@/lib/album-fulfilment";
import { formatGhs } from "@/lib/album-pricing";
import { orderMessage, orderTrackingUrl, type OrderMessageInput } from "@/lib/order-messages";

/**
 * Customer emails in the landing page's look: paper background, ink-outlined card, serif type,
 * hand-lettered notes (pre-rendered images, see scripts/make-email-assets.mjs) and the orange footer.
 * Plain tables and inline styles, so they hold up in Gmail, Outlook and Apple Mail.
 */

const INK = "#2b1a07";
const MUTED = "#6d5c4b";
const FAINT = "#a89a8a";
const ORANGE = "#ed7936";
const SERIF = "Gelica, Georgia, 'Times New Roman', serif";
const SANS = "Arial, Helvetica, sans-serif";

/** Hand-lettered notes, at their display size (the PNGs are twice this). */
const NOTES = {
    "welcome-back": { alt: "welcome back!", width: 200 },
    "thank-you": { alt: "thank you!", width: 157 },
    "one-small-thing": { alt: "one small thing…", width: 234 },
    printing: { alt: "warming up the press", width: 291 },
    "on-its-way": { alt: "it’s on its way!", width: 207 },
    delivered: { alt: "it’s home!", width: 146 },
    cancelled: { alt: "so sorry", width: 121 },
} as const;
type NoteKey = keyof typeof NOTES;

export type OrderEmailInput = OrderMessageInput & {
    coverId: string | null;
    albumYear: string | null;
    coverTypeface: string | null;
    coverTextColor: string | null;
    coverColor: string | null;
    pageCount: number | null;
    subtotal: number | null;
    discountCode: string | null;
    discountAmount: number | null;
    deliveryFee: number | null;
    taxRate: number | null;
    taxAmount: number | null;
    totalCost: number | null;
    address: { fullName?: string; street?: string; area?: string; landmark?: string; phone?: string } | null;
};

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
const e = (value: string | number | null | undefined) => escapeHtml(String(value ?? ""));

function note(site: string, key: NoteKey) {
    const { alt, width } = NOTES[key];
    return `<img src="${site}/images/email/note-${key}.png" width="${width}" height="53" alt="${e(alt)}" style="display:block;border:0;margin:0 0 2px -4px;color:${ORANGE};font:22px ${SERIF}">`;
}

const heading = (text: string) => `<h1 style="margin:0 0 18px;font:400 32px/1.15 ${SERIF};letter-spacing:-0.5px;color:${INK}">${e(text)}</h1>`;
const paragraph = (html: string, color = INK) => `<p style="margin:0 0 16px;font:17px/1.6 ${SERIF};color:${color}">${html}</p>`;
const label = (text: string) => `<p style="margin:0 0 8px;font:bold 11px/1.2 ${SANS};letter-spacing:2px;text-transform:uppercase;color:#a2602f">${e(text)}</p>`;
const rule = `<tr><td style="padding:26px 0 0"><div style="border-top:2px dashed #dfd6ce;font-size:0;line-height:0">&nbsp;</div></td></tr>`;

function button(text: string, href: string) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 4px"><tr><td style="border:2px solid #423824;border-radius:16px;background:#fffcf9;box-shadow:0 0 0 4px #fdfbf9">
<a href="${href}" style="display:inline-block;padding:13px 24px;font:17px/1.2 ${SERIF};color:${INK};text-decoration:none">${e(text)}</a></td></tr></table>`;
}

function coverImageUrl(order: OrderEmailInput) {
    const params = new URLSearchParams({ c: order.coverId ?? "", t: order.title, y: order.albumYear ?? "", f: order.coverTypeface ?? "", tc: order.coverTextColor ?? "", bg: order.coverColor ?? "" });
    return `${order.siteUrl}/api/email/cover?${params}`;
}

/** The customer's cover beside the album details. */
function albumBlock(order: OrderEmailInput, extra = "") {
    const details = [ALBUM_FORMAT, order.pageCount ? `${order.pageCount} pages` : ""].filter(Boolean).join(" · ");
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0"><tr>
<td width="128" valign="top" style="padding:0 20px 0 0"><img src="${coverImageUrl(order)}" width="128" height="160" alt="${e(order.title)} album cover" style="display:block;border:0;border-radius:3px 7px 7px 3px;box-shadow:4px 6px 12px rgba(43,26,7,.18);background:#eadfce"></td>
<td valign="top" style="font:15px/1.5 ${SANS};color:${MUTED}">
<p style="margin:2px 0 4px;font:400 22px/1.2 ${SERIF};color:${INK}">${e(order.title)}</p>
<p style="margin:0">${e(details)}</p>
<p style="margin:0">Order ${e(formatOrderNumber(order.orderNumber))}</p>${extra}
</td></tr></table>`;
}

function priceLines(order: OrderEmailInput) {
    const row = (name: string, value: string, strong = false) => `<tr><td style="padding:5px 0;font:${strong ? "bold " : ""}15px ${SANS};color:${strong ? INK : MUTED}">${name}</td><td align="right" style="padding:5px 0;font:${strong ? "bold " : ""}15px ${SANS};color:${INK}">${value}</td></tr>`;
    const lines = [row("Album", e(formatGhs(Number(order.subtotal ?? order.totalCost ?? 0))))];
    if (Number(order.discountAmount) > 0) lines.push(row(`Discount${order.discountCode ? ` (${e(order.discountCode)})` : ""}`, `− ${e(formatGhs(Number(order.discountAmount)))}`));
    lines.push(row("Delivery in Accra", Number(order.deliveryFee) > 0 ? e(formatGhs(Number(order.deliveryFee))) : "Included"));
    if (Number(order.taxAmount) > 0) lines.push(row(`Tax (${Number(order.taxRate)}%)`, e(formatGhs(Number(order.taxAmount)))));
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0">${lines.join("")}
<tr><td colspan="2" style="padding:6px 0 0"><div style="border-top:2px dashed #dfd6ce;font-size:0;line-height:0">&nbsp;</div></td></tr>
${row("Total paid", e(formatGhs(Number(order.totalCost ?? 0))), true)}</table>`;
}

/** The same six-step journey as the order page. */
function journey(status: OrderStatus) {
    const at = FULFILMENT_PATH.indexOf(status === "changes_requested" ? "in_review" : status);
    if (at < 0) return "";
    const steps = FULFILMENT_PATH.map((step, index) => {
        const done = index < at || (status === "delivered" && index === at);
        const current = index === at && status !== "delivered";
        const dot = done ? `background:${ORANGE};border:2px solid #423824;color:#ffffff` : current ? `background:#fff2d8;border:2px solid #423824;color:${INK}` : `background:#fffcf9;border:2px solid #dfd6ce;color:#b3a594`;
        return `<td width="16.66%" valign="top" align="center" style="padding:0 2px">
<div style="width:26px;height:26px;line-height:26px;border-radius:50%;${dot};font:bold 12px/26px ${SANS};text-align:center;margin:0 auto">${done ? "&#10003;" : index + 1}</div>
<p style="margin:8px 0 0;font:12px/1.3 ${SANS};color:${done || current ? INK : FAINT}">${e(STATUS_INFO[step].customerLabel)}</p></td>`;
    }).join("");
    return `${rule}<tr><td style="padding:22px 0 0">${label("Your album’s journey")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px"><tr>${steps}</tr></table></td></tr>`;
}

function infoBox(title: string, html: string, dashed = true) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 4px"><tr><td style="padding:18px 20px;border:2px ${dashed ? "dashed #dfd6ce" : "solid #493b2a"};border-radius:12px;background:#fdfbf9">
${label(title)}<div style="font:16px/1.6 ${SERIF};color:${INK}">${html}</div></td></tr></table>`;
}

const nl2br = (text: string) => e(text).replaceAll("\n", "<br>");

function layout({ site, preheader, orderNumber, body }: { site: string; preheader: string; orderNumber?: number | null; body: string }) {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<style>@font-face{font-family:Gelica;src:url(${site}/fonts/landing/gelica-regular.woff2) format("woff2")}
@media (max-width:620px){.card{padding:28px 22px!important}.footer{padding:28px 22px!important}}</style></head>
<body style="margin:0;padding:0;background:#fdfbf9;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#fdfbf9">${e(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf9"><tr><td align="center" style="padding:28px 14px 36px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px">
<tr><td style="padding:0 6px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td><a href="${site}"><img src="${site}/images/email/mark.png" width="72" height="37" alt="Itinero" style="display:block;border:0"></a></td>
${orderNumber ? `<td align="right" style="font:bold 11px ${SANS};letter-spacing:2px;text-transform:uppercase;color:#a2602f">Order ${e(formatOrderNumber(orderNumber))}</td>` : ""}
</tr></table></td></tr>
<tr><td class="card" style="padding:34px 36px 36px;background:#fffcf9;border:2px solid #493b2a;border-radius:12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>${body}</td></tr></table></td></tr>
<tr><td style="height:22px;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td class="footer" style="padding:30px 32px;background:${ORANGE};border-radius:24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="top" style="font:400 22px/1.25 ${SERIF};color:#ffffff">Making books that<br>bring trips back.</td>
<td align="right" valign="top"><img src="${site}/images/email/mark-white.png" width="60" height="31" alt="" style="display:inline-block;border:0"></td></tr>
<tr><td colspan="2" style="padding-top:20px;font:13px/1.9 ${SANS};color:#ffffff">
<a href="${site}/photobooks" style="color:#ffffff;text-decoration:underline">My albums</a> &nbsp;·&nbsp;
<a href="${site}/make-album" style="color:#ffffff;text-decoration:underline">Make an album</a> &nbsp;·&nbsp;
<a href="${site}" style="color:#ffffff;text-decoration:underline">tryitinero.com</a><br>
<span style="color:#fff3e8">Printed travel albums, delivered in Accra. Questions? Just reply to this email.</span></td></tr></table></td></tr>
</table></td></tr></table></body></html>`;
}

/** Wraps rows of the card body (each a full <tr>), after the intro content. */
const rows = (intro: string, ...extra: string[]) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>${intro}</td></tr>${extra.join("")}</table>`;

export function signInCodeEmail({ code, siteUrl }: { code: string; siteUrl: string }) {
    const subject = `${code} is your Itinero sign-in code`;
    const text = `Here’s your code to sign in to Itinero:\n\n${code}\n\nEnter it on the sign-in page to pick up where you left off. The code works once and expires soon.\n\nIf you didn’t ask for this, you can ignore this email.`;
    const body = `${note(siteUrl, "welcome-back")}${heading("Your sign-in code")}
${paragraph("Enter this code on the sign-in page to pick up where your trip left off.", MUTED)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 22px"><tr><td align="center" style="padding:20px 10px;border:2px dashed #dfd6ce;border-radius:12px;background:#fdfbf9;font:400 40px/1 ${SERIF};letter-spacing:12px;color:${INK}">${e(code)}</td></tr></table>
<p style="margin:0;font:14px/1.6 ${SANS};color:${FAINT}">The code works once and expires soon. If you didn’t ask for it, you can ignore this email; nobody can sign in without it.</p>`;
    return { subject, text, html: layout({ site: siteUrl, preheader: `Your code is ${code}. It works once and expires soon.`, body }) };
}

/** The email for an order update, or null when the status doesn't email the customer. */
export function orderEmail(status: OrderStatus, order: OrderEmailInput) {
    const message = orderMessage(status, order);
    if (!message || !isOrderStatus(status)) return null;
    const site = order.siteUrl.replace(/\/$/, "");
    const track = orderTrackingUrl(site, order.id);
    const firstName = order.customerName?.trim().split(/\s+/)[0];
    const hi = firstName ? `Hi ${e(firstName)},` : "Hi,";
    const album = `<em>${e(order.title)}</em>`;
    const date = order.deliveryDate ? new Date(`${order.deliveryDate}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) : null;
    const where = order.address?.area ? `<p style="margin:0">Delivering to ${e(order.address.area)}, Accra</p>` : "";

    let body: string;
    switch (status) {
        case "paid": {
            const next = [
                ["We check every page", "Photos, layout and print quality, before anything is printed."],
                ["We print and bind it", "A hardcover, made to last."],
                ["We bring it to you", "Delivered to your door in Accra."],
            ].map(([title, copy], index) => `<tr><td width="34" valign="top" style="padding:0 0 14px"><div style="width:24px;height:24px;border-radius:50%;border:2px solid #423824;background:#fff2d8;font:bold 12px/24px ${SANS};text-align:center;color:${INK}">${index + 1}</div></td>
<td valign="top" style="padding:2px 0 14px;font:15px/1.5 ${SANS};color:${MUTED}"><span style="font:400 17px ${SERIF};color:${INK}">${title}</span><br>${copy}</td></tr>`).join("");
            body = rows(`${note(site, "thank-you")}${heading("We’ve got your order")}
${paragraph(`${hi} thank you for ordering your album ${album}. Your payment came through, and your book is now in our queue.`)}
${albumBlock(order, where)}${priceLines(order)}`,
                `${rule}<tr><td style="padding:22px 0 0">${label("What happens next")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">${next}</table>${button("Follow your order", track)}</td></tr>`);
            break;
        }
        case "changes_requested":
            body = rows(`${note(site, "one-small-thing")}${heading("A quick change before we print")}
${paragraph(`${hi} we’re getting your album ${album} ready for print, and spotted something we’d like you to look at first.`)}
${infoBox("A note from us", nl2br(order.customerMessage?.trim() || "Please review your photos."))}
${button("Update your album", track)}
<p style="margin:14px 0 0;font:14px/1.6 ${SANS};color:${FAINT}">Once you send it back, we’ll pick up right where we left off.</p>`);
            break;
        case "printing":
            body = rows(`${note(site, "printing")}${heading("Your album is being printed")}
${paragraph(`${hi} good news: every page checked out, and your album ${album} is now being printed and bound.`)}
${albumBlock(order)}`, journey(status), `<tr><td>${button("Follow your order", track)}</td></tr>`);
            break;
        case "out_for_delivery": {
            const details = [
                order.courierName ? `Your rider: <strong style="font-weight:400">${e(order.courierName)}</strong>${order.courierPhone ? ` · <a href="tel:${e(order.courierPhone.replace(/\s+/g, ""))}" style="color:#a2602f">${e(order.courierPhone)}</a>` : ""}` : "",
                date ? `Expected: ${e(date)}` : "",
                order.address?.street ? `To: ${e(order.address.street)}${order.address.area ? `, ${e(order.address.area)}` : ""}` : "",
            ].filter(Boolean).join("<br>");
            body = rows(`${note(site, "on-its-way")}${heading("Your album is on its way")}
${paragraph(`${hi} your album ${album} has left the studio and is heading to you.`)}
${details ? infoBox("Delivery", details, false) : ""}`, journey(status), `<tr><td>${button("Follow your order", track)}</td></tr>`);
            break;
        }
        case "delivered":
            body = rows(`${note(site, "delivered")}${heading("Your album has arrived")}
${paragraph(`${hi} your album ${album} has been delivered. We hope you love holding your trip in your hands.`)}
${albumBlock(order)}`, journey(status), `<tr><td>${paragraph("Thank you for making it with Itinero. Got another trip waiting in your camera roll?", MUTED)}${button("Make another album", `${site}/make-album`)}</td></tr>`);
            break;
        case "cancelled":
            body = rows(`${note(site, "cancelled")}${heading("Your order was cancelled")}
${paragraph(`${hi} your album order ${e(formatOrderNumber(order.orderNumber))} for ${album} has been cancelled.`)}
${paragraph("If you have any questions, or this wasn’t expected, just reply to this email and we’ll help.", MUTED)}
${button("View your order", track)}`);
            break;
        default:
            return null;
    }
    return { subject: message.subject, text: message.body, html: layout({ site, preheader: STATUS_INFO[status].customerDescription, orderNumber: order.orderNumber, body }) };
}
