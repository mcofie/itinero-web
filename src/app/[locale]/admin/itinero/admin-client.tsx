
"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addPointsAction } from "./server-actions";

export function AddPointsDialog({ userId, userName }: { userId: string, userName: string }) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        formData.append("user_id", userId);

        startTransition(async () => {
            try {
                await addPointsAction(formData);
                toast.success(`Successfully added points to ${userName}`);
                setOpen(false);
            } catch (e: any) {
                toast.error(e.message || "Failed to add points");
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                    <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Credit Points
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Credit User Balance</DialogTitle>
                        <DialogDescription>
                            Manually add points to {userName}&apos;s account.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="points" className="text-right text-sm font-medium">
                                Amount
                            </label>
                            <Input
                                id="points"
                                name="points"
                                type="number"
                                required
                                min={1}
                                className="col-span-3"
                                placeholder="e.g. 500"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="reason" className="text-right text-sm font-medium">
                                Reason
                            </label>
                            <Input
                                id="reason"
                                name="reason"
                                className="col-span-3"
                                placeholder="e.g. Refund or Bonus"
                                defaultValue="manual_topup"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Process Credit
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


