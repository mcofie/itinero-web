"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/browser-singleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plane, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const sb = getSupabaseBrowser();
    const router = useRouter();

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [busy, setBusy] = useState(false);

    // If already signed-in, bounce to /preview
    useEffect(() => {
        (async () => {
            const { data } = await sb.auth.getSession();
            if (data.session) {
                router.replace("/preview");
                router.refresh();
            }
        })();

        const { data: sub } = sb.auth.onAuthStateChange((evt) => {
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
                    ? await sb.auth.signInWithPassword({ email, password: pwd })
                    : await sb.auth.signUp({ email, password: pwd });

            if (result.error) throw result.error;

            toast.success(mode === "login" ? "Signed in" : "Account created");
            router.replace("/trips");
            router.refresh();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Authentication failed", { description: msg });
        } finally {
            setBusy(false);
        }
    }

    async function handleGoogle() {
        setBusy(true);
        try {
            const { error } = await sb.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: { prompt: "consent", access_type: "offline" }
                },

            });
            if (error) throw error;
            // Redirect handled by OAuth; no-op here.
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            toast.error("Google sign-in failed", { description: msg });
            setBusy(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900">

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl tracking-tight text-blue-600 mb-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                        <Plane className="h-5 w-5" />
                    </span>
                    Itinero
                </Link>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {mode === "login" ? "Welcome back" : "Start your journey"}
                </h2>
                <p className="mt-2 text-sm text-slate-600 max-w-xs mx-auto">
                    {mode === "login"
                        ? "Sign in to access your saved trips and plans."
                        : "Create an account to build, save, and share itineraries."}
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-[400px]">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/60 sm:rounded-3xl sm:px-10 border border-slate-100">
                    <div className="space-y-6">

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email" className="text-slate-700 font-semibold mb-1.5 block">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="pwd" className="text-slate-700 font-semibold mb-1.5 block">Password</Label>
                                <Input
                                    id="pwd"
                                    type="password"
                                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                                    value={pwd}
                                    onChange={(e) => setPwd(e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-600"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleEmail}
                                disabled={busy}
                                className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-base shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                            >
                                {busy ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</>
                                ) : mode === "login" ? (
                                    <>Sign in <ArrowRight className="ml-2 h-4 w-4 opacity-80" /></>
                                ) : (
                                    "Create account"
                                )}
                            </Button>

                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleGoogle}
                                disabled={busy}
                                className="h-11 rounded-xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:text-slate-900"
                            >
                                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                                Google
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="relative flex justify-center text-sm">
                                <button
                                    type="button"
                                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                    onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
                                >
                                    {mode === "login"
                                        ? "Don'share have an account? Sign up"
                                        : "Already have an account? Sign in"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-slate-400">
                    By continuing, you agree to Itinero's <Link href="/terms" className="underline hover:text-slate-600">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}