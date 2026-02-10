
"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { approveTourGuideRequestAction, rejectTourGuideRequestAction } from "./server-actions";

export function TourGuideActions({ requestId }: { requestId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleAction = (action: 'approve' | 'reject') => {
        startTransition(async () => {
            try {
                if (action === 'approve') {
                    await approveTourGuideRequestAction(requestId);
                    toast.success("Request approved successfully.");
                } else {
                    await rejectTourGuideRequestAction(requestId);
                    toast.warning("Request rejected.");
                }
            } catch (err: any) {
                console.error(err);
                toast.error("Action failed.");
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => handleAction('reject')}
                disabled={isPending}
            >
                <X className="h-4 w-4" />
            </Button>
            <Button
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20"
                onClick={() => handleAction('approve')}
                disabled={isPending}
            >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
        </div>
    );
}
