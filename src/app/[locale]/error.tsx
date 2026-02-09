"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Page Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Something went wrong
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        We encountered an error while loading this page. Please try again.
                    </p>
                    {error.digest && (
                        <p className="text-xs text-slate-400 mt-2 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => reset()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
