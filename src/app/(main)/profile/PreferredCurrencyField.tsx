"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { getCurrencyMeta } from "@/lib/currency-data";
import { CurrencySelect } from "@/components/CurrencySelect";

type Props = {
    initialCurrency?: string | null;
};

export function PreferredCurrencyField({ initialCurrency }: Props) {
    const initial = (initialCurrency || "USD").toUpperCase();
    const [value, setValue] = React.useState(initial);

    const meta = getCurrencyMeta(value);

    return (
        <div className="space-y-1.5">
            <Label
                htmlFor="preferred_currency"
                className="text-xs font-medium text-muted-foreground"
            >
                Preferred currency
            </Label>

            {/* Hidden input so the server action receives it */}
            <input
                type="hidden"
                id="preferred_currency"
                name="preferred_currency"
                value={value}
            />

            <div className="flex items-center gap-3">
                <CurrencySelect value={value} onChange={setValue} />

                <div className="text-xs text-muted-foreground">
                    <div className="font-medium">
                        {meta.symbol} {value}
                    </div>
                    <div className="text-[11px]">
                        Used for price hints, FX previews, and trip budgets.
                    </div>
                </div>
            </div>
        </div>
    );
}