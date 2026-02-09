"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";
import { CountrySelect } from "@/components/CountrySelect";
import { getCountryMeta } from "@/lib/country-data";

type Props = {
    initialValue?: string | null;
};

export function PassportCountryField({ initialValue }: Props) {
    const [value, setValue] = React.useState(initialValue || "");
    const selected = getCountryMeta(value);

    return (
        <div className="space-y-2">
            <Label
                htmlFor="passport_country"
                className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2"
            >
                <Flag className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                Passport Holder
            </Label>

            {/* Hidden input so the server action receives it */}
            <input
                type="hidden"
                id="passport_country"
                name="passport_country"
                value={value}
            />

            <CountrySelect
                value={value}
                onChange={setValue}
            />

            <p className="text-[0.8rem] text-slate-500 dark:text-slate-400 leading-relaxed">
                We'll use this to show you visa requirements for your destinations.
                {selected && (
                    <span className="block mt-1 text-blue-600 dark:text-blue-400 font-medium">
                        Using {selected.label} {selected.flag} for visa checks.
                    </span>
                )}
            </p>
        </div>
    );
}
