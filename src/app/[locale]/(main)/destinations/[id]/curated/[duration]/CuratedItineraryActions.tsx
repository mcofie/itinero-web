"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";
import { toast } from "sonner";

export default function CuratedItineraryActions() {
    const handleShare = () => {
        if (typeof navigator !== "undefined") {
            navigator.clipboard.writeText(window.location.href)
                .then(() => toast.success("Link copied to clipboard"))
                .catch(() => toast.error("Failed to copy link"));
        }
    };

    const handleExport = () => {
        window.print();
    };

    return (
        <div className="flex flex-wrap gap-3">
            <Button
                variant="outline"
                onClick={handleShare}
                className="rounded-xl border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
            >
                <Share2 className="h-4 w-4 mr-2" /> Share
            </Button>
            <Button
                onClick={handleExport}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
                <Download className="h-4 w-4 mr-2" /> Export PDF
            </Button>
        </div>
    );
}
