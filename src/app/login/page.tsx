"use client";

import * as React from "react";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {createClientBrowser} from "@/lib/supabase/browser";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {toast} from "sonner";
import {Loader2, Plane} from "lucide-react";

export default function LoginPage() {
    const sb = createClientBrowser();
    const router = useRouter();

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [busy, setBusy] = useState(false);

    // If already signed-in, bounce to /preview
    useEffect(() => {
        (async () => {
            const {data} = await sb.auth.getSession();
            if (data.session) {
                router.replace("/preview");
                router.refresh();
            }
        })();

        const {data: sub} = sb.auth.onAuthStateChange((evt) => {
            if (evt === "SIGNED_IN") {
                router.replace("/preview");
                router.refresh();
            }
        });
        return () => sub.subscription.unsubscribe();
    }, [sb, router]);

    async function handleEmail() {
        setBusy(true);
        try {
            const result =
                mode === "login"
                    ? await sb.auth.signInWithPassword({email, password: pwd})
                    : await sb.auth.signUp({email, password: pwd});

            if (result.error) throw result.error;

            toast.success(mode === "login" ? "Signed in" : "Account created");
            router.replace("/trips");
            router.refresh();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Authentication failed", {description: msg});
        } finally {
            setBusy(false);
        }
    }

    async function handleGoogle() {
        setBusy(true);
        try {
            const {error} = await sb.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {prompt: "consent", access_type: "offline"}
                },

            });
            if (error) throw error;
            // Redirect handled by OAuth; no-op here.
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Google sign-in failed", {description: msg});
            setBusy(false);
        }
    }

    return (
        <main className="grid min-h-screen place-items-center bg-background">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Plane className="h-5 w-5"/>
                    <h1 className="text-lg font-semibold">Sign in to Itinero</h1>
                </div>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
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

                    <div className="flex flex-col gap-2 pt-1">
                        <Button onClick={handleEmail} disabled={busy}>
                            {busy ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Working…
                                </>
                            ) : mode === "login" ? (
                                "Sign in"
                            ) : (
                                "Sign up"
                            )}
                        </Button>

                        <Button variant="outline" onClick={handleGoogle} disabled={busy}>
                            Continue with Google
                        </Button>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    By continuing you agree to the Terms & Privacy Policy.
                </p>
            </div>
        </main>
    );
}