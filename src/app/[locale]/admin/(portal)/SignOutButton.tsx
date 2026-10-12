"use client";

import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";

export default function SignOutButton() {
    const signOut = async () => {
        await getSupabaseBrowser().auth.signOut();
        window.location.assign("/");
    };
    return <button type="button" onClick={() => void signOut()} className="rounded-lg border border-[#e2d6c7] px-3 py-1.5 font-semibold text-[#5e4a38] transition hover:bg-[#f3ebe0]">Sign out</button>;
}
