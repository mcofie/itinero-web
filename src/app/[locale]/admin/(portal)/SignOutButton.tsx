"use client";

import ui from "@/components/album/album-ui.module.css";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";

export default function SignOutButton() {
    const signOut = async () => {
        await getSupabaseBrowser().auth.signOut();
        window.location.assign("/");
    };
    return <button type="button" onClick={() => void signOut()} className={`${ui.button} ${ui.buttonSmall}`}>Sign out</button>;
}
