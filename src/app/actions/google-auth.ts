"use server";

import { cookies } from "next/headers";

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

    // 1. Verify token with Google (optional but good for metadata)
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    let googlePayload: any = {};
    if (googleRes.ok) {
        googlePayload = await googleRes.json();
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

    // 4. Sync user data to Itinero Postgres profiles table using REST API (Direct Database interaction)
    // We use the itinero schema as seen in other server actions.
    const syncRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": supabaseAnonKey,
            "Authorization": `Bearer ${access_token}`,
            "Content-Profile": "itinero", // Specify the schema if possible, or use the default
            "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify({
            id: user.id,
            full_name: googlePayload.name || "Explore User",
            avatar_url: googlePayload.picture || null,
            username: (googlePayload.email || "user").split("@")[0] + "_" + Math.floor(Math.random() * 1000),
        }),
    });

    if (!syncRes.ok) {
        console.warn("Profile sync warning:", await syncRes.text());
        // We don't throw here to avoid failing the whole login if just the profile sync has an issue
    }

    return { success: true };
}
