"use client";

import * as React from "react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, Chrome } from "lucide-react";

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
    const sb = getSupabaseBrowser();
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
                    redirectTo:
                        typeof window !== "undefined"
                            ? `${window.location.origin}/auth/callback`
                            : undefined,
                },
            });
            if (error) throw error;

            // Supabase redirects for OAuth; if it doesn't (popup flow), rely on onAuthStateChange
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
            <DialogContent
                className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-3xl border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-2xl">

                {/* Header Section */}
                <div
                    className="bg-slate-50 border-b border-slate-100 px-6 py-8 flex flex-col items-center text-center dark:bg-slate-950/50 dark:border-slate-800">
                    <div
                        className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-sm dark:bg-blue-900/30 dark:text-blue-400">
                        <Lock className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        {title}
                    </DialogTitle>
                    <p className="text-xs text-slate-500 mt-2 max-w-[240px] mx-auto leading-relaxed dark:text-slate-400">
                        {mode === "login"
                            ? "Welcome back! Sign in to continue your journey."
                            : "Create a free account to save your itinerary and access it anywhere."}
                    </p>
                </div>

                {/* Form Section */}
                <div className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email"
                                className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Email Address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="pwd"
                                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Password
                                </Label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                                <Input
                                    id="pwd"
                                    type="password"
                                    autoComplete={
                                        mode === "login" ? "current-password" : "new-password"
                                    }
                                    placeholder="••••••••"
                                    value={pwd}
                                    onChange={(e) => setPwd(e.target.value)}
                                    className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <Button
                            onClick={handleEmail}
                            disabled={busy}
                            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md dark:bg-blue-600 dark:hover:bg-blue-500"
                        >
                            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === "login" ? "Sign In" : "Create Account"}
                        </Button>

                        <div className="relative py-1">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-100 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-400 dark:bg-slate-900 dark:text-slate-600">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleGoogle}
                            disabled={busy}
                            className="w-full h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-medium dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <Chrome className="mr-2 h-4 w-4" />
                            Google
                        </Button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            className="text-xs text-slate-500 hover:text-blue-600 transition-colors hover:underline dark:text-slate-400 dark:hover:text-blue-400"
                            onClick={() =>
                                setMode((m) => (m === "login" ? "signup" : "login"))
                            }
                        >
                            {mode === "login"
                                ? "New here? Create an account"
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}