"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    onConfirm: () => Promise<void> | void;
    onOpenChange: (open: boolean) => void;
};

export function ConfirmDialog({
                                  open,
                                  title = "Are you sure?",
                                  description,
                                  confirmText = "Delete",
                                  cancelText = "Cancel",
                                  loading = false,
                                  onConfirm,
                                  onOpenChange,
                              }: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {description ? (
                    <p className="text-sm text-muted-foreground">{description}</p>
                ) : null}

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
                        {cancelText}
                    </Button>
                    <Button variant="destructive" onClick={() => onConfirm()} disabled={loading}>
                        {loading ? "Deleting..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}