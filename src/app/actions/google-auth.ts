"use server";

import { cookies } from "next/headers";
import { sendDiscordNotification, formatDiscordEmbed } from "@/lib/discord";

/**
 * Custom Google Sign-In handler that avoids using the Supabase Client SDK for the auth flow.
 * Uses Fetch to hit Supabase Auth REST API and update the Postgres database.
 */
export async function handleGoogleAuthAction(credential: string) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase URL or Anon Key is missing");
    }

    if (!credential) {
        throw new Error("Google credential is required");
    }
    console.log("Exchanging Google ID token for Supabase session. Token length:", credential.length);

    const idToken = credential.trim();
    if (!idToken) {
        throw new Error("Google ID token is empty");
    }

    console.log("Verifying Google ID token with Supabase. Length:", idToken.length);

    // 1. Decode ID Token manually for metadata (Faster than a network call)
    let googlePayload: any = {};
    try {
        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            Buffer.from(base64, 'base64')
                .toString()
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        googlePayload = JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode Google ID token:", e);
    }

    // 2. Exchange ID Token for a Supabase session using the /token endpoint
    console.log("Calling Supabase token exchange via /token?grant_type=id_token...");
    const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=id_token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": supabaseAnonKey,
        },
        body: JSON.stringify({
            id_token: idToken,
            provider: "google",
        }),
    });

    const responseText = await tokenRes.text();
    console.log("Supabase raw response:", responseText);

    if (!tokenRes.ok) {
        let errorMsg = "Unknown error";
        try {
            const err = JSON.parse(responseText);
            errorMsg = err.error_description || err.error || err.message || responseText || "Unknown error";
        } catch (e) {
            errorMsg = responseText || "Unknown error (json parse failed)";
        }
        throw new Error(`Auth failed: ${errorMsg}`);
    }

    const session = JSON.parse(responseText);
    const { access_token, refresh_token, user } = session;

    // 3. Use Supabase SDK to manage cookies correctly
    // This ensures chunking and naming conventions are handled by the library itself.
    const { createClientServerRoute } = await import("@/lib/supabase/server");
    const supabaseAction = await createClientServerRoute();

    const { error: sessionError } = await supabaseAction.auth.setSession({
        access_token,
        refresh_token: refresh_token || "",
    });

    if (sessionError) {
        console.error("Failed to set Supabase session:", sessionError);
        throw new Error(`Session setup failed: ${sessionError.message}`);
    }

    // 4. Sync user data to Itinero Postgres profiles table using SDK
    const fullName = googlePayload.name || user.user_metadata?.full_name || user.user_metadata?.name || "Explore User";
    const avatarUrl = googlePayload.picture || user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
    const username = (googlePayload.email || user.email || "user").split("@")[0] + "_" + Math.floor(Math.random() * 1000);

    console.log("Syncing profile for user:", user.id, { fullName, avatarUrl });

    const { error: syncError } = await supabaseAction
        .schema("itinero")
        .from("profiles")
        .upsert({
            id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
            username,
        }, { onConflict: 'id' });

    if (syncError) {
        console.warn("Profile sync warning (SDK):", syncError.message);
        // If RLS is blocking upsert, we might need the user to run SQL or check policies
    } else {
        console.log("Profile synchronized successfully via SDK");
    }

    // 5. Notify Discord
    const userEmail = googlePayload.email || user.email;
    console.log("Attempting to notify Discord for user:", userEmail);
    await sendDiscordNotification(
        `👤 User Activity`,
        formatDiscordEmbed(
            "User Session Started",
            `**Name:** ${fullName}\n**Email:** ${userEmail}\n**Method:** Google OAuth`,
            0x22c55e // green-500
        )
    );

    return { success: true };
}
