"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * Generates a magic link on the server using the service role key,
 * bypassing Supabase's default email sending logic.
 *
 * This allows you to:
 * 1. Customize the email template per app (since Supabase only supports one template per project).
 * 2. Send the email using your own provider (Resend, Postmark, AWS SES, etc).
 */
export async function sendMagicLink({ email, redirectTo }: { email: string; redirectTo: string }) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var");
        return { error: "Server configuration error: Missing Service Role Key" };
    }

    // Initialize admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    // Generate the link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
            redirectTo,
        },
    });

    if (error) {
        console.error("Error generating magic link:", error);
        return { error: error.message };
    }

    const { action_link } = data.properties;

    // TODO: Send this link via your email provider (Resend, Postmark, etc)
    // For now, we log it to the server console so you can test locally.
    console.log("---------------------------------------------------");
    console.log("MAGIC LINK GENERATED FOR:", email);
    console.log(action_link);
    console.log("---------------------------------------------------");

    // Example integration with Resend (commented out):
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Itinero <login@itinero.app>',
      to: email,
      subject: 'Sign in to Itinero',
      html: `<p>Click here to sign in: <a href="${action_link}">Sign In</a></p>`
    });
    */

    return { success: true };
}
