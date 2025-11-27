// app/profile/ProfileForm.tsx
"use client";

import * as React from "react";
import {useTransition} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {saveProfileAction} from "@/app/profile/server-actions";
import {PreferredCurrencyField} from "@/app/profile/PreferredCurrencyField";
import {User, AtSign, Loader2, Wallet} from "lucide-react";
import {cn} from "@/lib/utils";

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
                        window.location.reload();
                    }
                })
            }
            className="space-y-8 max-w-lg"
        >
            <input type="hidden" name="id" value={userId}/>

            {/* --- Personal Info Section --- */}
            <div className="space-y-5">
                <div className="space-y-2">
                    <Label
                        htmlFor="full_name"
                        className="text-sm font-semibold text-slate-900 dark:text-slate-200"
                    >
                        Display Name
                    </Label>
                    <div className="relative group">
                        <div
                            className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                            <User className="h-4 w-4"/>
                        </div>
                        <Input
                            id="full_name"
                            name="full_name"
                            defaultValue={fullName ?? ""}
                            placeholder="e.g. Maxwell Cofie"
                            className="pl-9 h-10 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:bg-slate-900 dark:placeholder:text-slate-600"
                        />
                    </div>
                    <p className="text-[0.8rem] text-slate-500 dark:text-slate-400">
                        This is how your name will appear on shared itineraries.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label
                        htmlFor="username"
                        className="text-sm font-semibold text-slate-900 dark:text-slate-200"
                    >
                        Username
                    </Label>
                    <div className="relative group">
                        <div
                            className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                            <AtSign className="h-4 w-4"/>
                        </div>
                        <Input
                            id="username"
                            name="username"
                            defaultValue={username ?? ""}
                            placeholder="username"
                            className="pl-9 h-10 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 transition-all dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:bg-slate-900 dark:placeholder:text-slate-600"
                        />
                    </div>
                </div>
            </div>

            {/* --- Preferences Section --- */}
            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-slate-400 dark:text-slate-500"/>
                        Preferred Currency
                    </Label>

                    {/* Custom Field Styling Wrapper */}
                    <div className="
            [&_button]:h-10
            [&_button]:bg-slate-50 [&_button]:border-slate-200 [&_button]:text-slate-900
            [&_button:hover]:bg-white [&_button:hover]:border-blue-300
            dark:[&_button]:bg-slate-950 dark:[&_button]:border-slate-800 dark:[&_button]:text-slate-100
            dark:[&_button:hover]:bg-slate-900 dark:[&_button:hover]:border-slate-700
          ">
                        <PreferredCurrencyField initialCurrency={preferredCurrency ?? null}/>
                    </div>

                    <p className="text-[0.8rem] text-slate-500 dark:text-slate-400">
                        We will use this currency to estimate costs across your trips.
                    </p>
                </div>
            </div>

            {/* --- Action --- */}
            <div className="flex items-center justify-end pt-4">
                <Button
                    type="submit"
                    disabled={pending}
                    className={cn(
                        "min-w-[140px] rounded-full font-semibold transition-all shadow-md hover:shadow-lg",
                        pending
                            ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                            : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
                    )}
                >
                    {pending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>
        </form>
    );
}