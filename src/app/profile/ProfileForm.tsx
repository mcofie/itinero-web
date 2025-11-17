// app/profile/ProfileForm.tsx
"use client";

import * as React from "react";
import {useTransition} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {saveProfileAction} from "@/app/profile/server-actions";
import {PreferredCurrencyField} from "@/app/profile/PreferredCurrencyField";

type Props = {
    userId: string;
    fullName: string | null;
    username: string | null;
    preferredCurrency: string | null;
};

export function ProfileForm({
                                userId,
                                fullName,
                                username,
                                preferredCurrency,
                            }: Props) {
    const [pending, startTransition] = useTransition();

    return (
        <form
            action={(formData) =>
                startTransition(async () => {
                    const res = await saveProfileAction(formData);
                    if (res?.success) {
                        // ✅ client-side, safe to reload
                        window.location.reload();
                    }
                })
            }
            className="mt-2 grid gap-3"
        >
            <input type="hidden" name="id" value={userId}/>

            <div className="space-y-1">
                <Label
                    className="text-xs font-medium text-muted-foreground"
                    htmlFor="full_name"
                >
                    Full name
                </Label>
                <Input
                    id="full_name"
                    name="full_name"
                    defaultValue={fullName ?? ""}
                    placeholder="How should we call you?"
                />
            </div>

            <div className="space-y-1">
                <Label
                    className="text-xs font-medium text-muted-foreground"
                    htmlFor="username"
                >
                    Username
                </Label>
                <Input
                    id="username"
                    name="username"
                    defaultValue={username ?? ""}
                    placeholder="Optional @username"
                />
            </div>

            {/* Preferred currency selector (uses the currency-data.ts approach) */}
            <PreferredCurrencyField initialCurrency={preferredCurrency ?? null}/>

            <div className="flex justify-end pt-1">
                <Button size="sm" type="submit" disabled={pending}>
                    {pending ? "Saving…" : "Save profile"}
                </Button>
            </div>
        </form>
    );
}