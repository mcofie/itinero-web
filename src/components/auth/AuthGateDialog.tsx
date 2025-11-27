// components/auth/AuthGateDialog.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClientBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export default function AuthGateDialog({
                                           open,
                                           onOpenChange,
                                           title = "Sign in to save & share",
                                           postLogin,
                                       }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    title?: string;
    postLogin?: () => Promise<void> | void;
}) {
    const sb = createClientBrowser();
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleEmail() {
        try {
            setBusy(true);

            const { error } =
                mode === "login"
                    ? await sb.auth.signInWithPassword({ email, password: pwd })
                    : await sb.auth.signUp({ email, password: pwd });
            if (error) throw error;

            // ensure the session is available to the client before we navigate
            await sb.auth.getSession();

            toast.success(mode === "login" ? "Signed in" : "Account created");
            onOpenChange(false);

            if (postLogin) {
                await postLogin();
            } else {
                try {
                    router.replace("/preview");
                    router.refresh();
                } finally {
                    // hard fallback (rare, but handles stuck router)
                    setTimeout(() => (window.location.href = "/preview"), 100);
                }
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Authentication failed", { description: msg });
        } finally {
            setBusy(false);
        }
    }

    async function handleGoogle() {
        try {
            setBusy(true);
            const { error } = await sb.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
                },
            });
            if (error) throw error;

            // Supabase redirects for OAuth; if it doesn'share (popup flow), rely on onAuthStateChange (see step 2)
            onOpenChange(false);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Google sign-in failed", { description: msg });
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="pwd">Password</Label>
                        <Input
                            id="pwd"
                            type="password"
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <button
                            type="button"
                            className="underline underline-offset-2 hover:text-foreground"
                            onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
                        >
                            {mode === "login" ? "Create an account" : "Have an account? Sign in"}
                        </button>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleGoogle} disabled={busy}>
                        Continue with Google
                    </Button>
                    <Button onClick={handleEmail} disabled={busy}>
                        {busy ? "Working…" : mode === "login" ? "Sign in" : "Sign up"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}