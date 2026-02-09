"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LayoutDashboard } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin Error:", error);
    }, [error]);

    return (
        <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Admin Panel Error
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Something went wrong while loading the admin panel.
                    </p>
                    {error.digest && (
                        <p className="text-xs text-slate-400 mt-2 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
                    {process.env.NODE_ENV === "development" && (
                        <pre className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs text-left overflow-auto max-h-40 text-red-600 dark:text-red-400">
                            {error.message}
                        </pre>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => reset()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Try Again
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/admin/itinero">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
