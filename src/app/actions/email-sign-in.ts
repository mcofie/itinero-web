"use server";

import { headers } from "next/headers";
import { emailLayout, sendEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const COOLDOWN_MS = 45_000;
const IP_WINDOW_MS = 10 * 60_000;
const IP_LIMIT = 5;
// Best effort on a warm server instance: one code per address every 45 seconds, and a looser
// per-visitor limit, since many mobile customers share one IP address.
const lastSent = new Map<string, number>();
const ipSends = new Map<string, number[]>();

function tooSoon(email: string, ip: string, now: number) {
    const previous = lastSent.get(email);
    if (previous && now - previous < COOLDOWN_MS) return true;
    const recent = (ipSends.get(ip) ?? []).filter(at => now - at < IP_WINDOW_MS);
    if (recent.length >= IP_LIMIT) return true;
    lastSent.set(email, now);
    ipSends.set(ip, [...recent, now]);
    if (lastSent.size > 5000) for (const [key, at] of lastSent) if (now - at > COOLDOWN_MS) lastSent.delete(key);
    if (ipSends.size > 5000) for (const [key, times] of ipSends) if (times.every(at => now - at > IP_WINDOW_MS)) ipSends.delete(key);
    return false;
}

/**
 * Emails a 6-digit sign-in code. Supabase creates and later checks the code (new emails get an
 * account); we only deliver it, through Zend, so the email carries Itinero's own design.
 */
export async function sendSignInCode(rawEmail: string): Promise<{ ok: true } | { ok: false; error: string; useLink?: boolean }> {
    const email = String(rawEmail ?? "").trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email) || email.length > 254) return { ok: false, error: "Please enter a valid email address." };

    const now = Date.now();
    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (tooSoon(email, ip, now)) return { ok: false, error: "We just sent a code. Please wait a minute before asking for another." };

    const admin = createAdminClient();
    if (!admin) return { ok: false, error: "Sign-in by email isn’t available right now. Please use Google." };
    const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    const code = data?.properties?.email_otp;
    if (error || !code) {
        console.error("[sign-in] Could not create a sign-in code:", error?.message);
        lastSent.delete(email);
        return { ok: false, error: "We couldn’t create a sign-in code. Please try again." };
    }

    const text = `Here’s your code to sign in to Itinero:\n\n${code}\n\nEnter it on the sign-in page to pick up where you left off. The code works once and expires soon.\n\nIf you didn’t ask for this, you can ignore this email.`;
    const sent = await sendEmail({
        to: email,
        subject: `${code} is your Itinero sign-in code`,
        text,
        html: emailLayout("Here’s your code to sign in to Itinero. Enter it on the sign-in page to pick up where you left off.\n\nThe code works once and expires soon. If you didn’t ask for this, you can ignore this email.", { preheader: `Your sign-in code is ${code}`, highlight: code }),
    });
    if (!sent.ok) {
        console.error("[sign-in] Could not email the sign-in code:", sent.error);
        lastSent.delete(email);
        // Until Zend can send (domain verified, key set), fall back to Supabase's own sign-in link email.
        return { ok: false, useLink: true, error: "We couldn’t send the email just now. Please try again, or continue with Google." };
    }
    return { ok: true };
}
