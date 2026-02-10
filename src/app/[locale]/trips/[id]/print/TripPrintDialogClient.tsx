"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, ExternalLink } from "lucide-react";

type TripPrintDialogClientProps = {
    tripId: string;
};

export function TripPrintDialogClient({ tripId }: TripPrintDialogClientProps) {
    const iframeId = React.useId();
    const [loading, setLoading] = React.useState(true);

    const src = `/trips/${encodeURIComponent(tripId)}/print`;

    const handlePrint = () => {
        const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
        if (!iframe || !iframe.contentWindow) {
            console.warn("[TripPrintDialogClient] iframe not ready");
            return;
        }

        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (e) {
            console.error("[TripPrintDialogClient] print() failed:", e);
        }
    };

    const handleOpenNewTab = () => {
        window.open(src, "_blank", "noopener,noreferrer");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="cursor-pointer">
                    <Printer className="mr-2 h-4 w-4" />
                    Print itinerary
                </Button>
            </DialogTrigger>

            <DialogContent
                className="
      w-full
      max-w-5xl        /* ↓↓↓ reduced from 6xl / 7xl */
      md:max-w-4xl     /* even cleaner on medium screens */
      h-[80vh]          /* slightly reduced height */
      flex flex-col gap-3
      bg-background
      border-border
      rounded-2xl
      shadow-lg
    "
            >
                <DialogHeader className="space-y-1">
                    <DialogTitle className="flex items-center justify-between gap-3 text-lg">
                        <span>Print preview</span>
                        <span
                            className="
            rounded-full border border-border px-3 py-1
            text-xs font-medium text-muted-foreground bg-muted/40
          "
                        >
                            Draft view — final look may vary
                        </span>
                    </DialogTitle>

                    <DialogDescription className="text-xs sm:text-sm">
                        This is the printable version of your itinerary. Use the print button to
                        send it to your printer or save as PDF.
                    </DialogDescription>
                </DialogHeader>

                {/* Iframe container */}
                <div
                    className="
        relative flex-1
        rounded-xl
        border border-border
        bg-muted/40
        overflow-hidden
      "
                >
                    <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/60" />

                    {loading && (
                        <div
                            className="
            absolute inset-0 z-10
            flex flex-col items-center justify-center gap-2
            text-xs text-muted-foreground
            bg-background/70 backdrop-blur-sm
          "
                        >
                            <div
                                className="
              h-8 w-8 animate-spin rounded-full
              border-2 border-muted border-t-transparent
            "
                            />
                            <span>Loading print view…</span>
                        </div>
                    )}

                    <iframe
                        id={iframeId}
                        src={src}
                        className="
          relative z-0
          w-full h-full
          bg-white dark:bg-slate-950
        "
                        onLoad={() => setLoading(false)}
                    />
                </div>

                <DialogFooter
                    className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="text-[11px] sm:text-xs text-muted-foreground space-y-1">
                        <p>
                            Pro tip: choose <span className="font-semibold">“Save as PDF”</span> in your
                            browser’s print dialog to export a crisp PDF.
                        </p>
                        <p className="hidden sm:block">
                            If the preview looks off, open the print page in a full tab.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleOpenNewTab}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in new tab
                        </Button>

                        <Button type="button" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}