"use client";

import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandInput,
    CommandEmpty,
} from "@/components/ui/command";

import { cn } from "@/lib/utils";
import {
    WORLD_CURRENCIES,
    getCurrencyMeta,
    CurrencyCode,
} from "@/lib/currency-data";

type Props = {
    value?: CurrencyCode | null;
    onChange: (code: CurrencyCode) => void;
    className?: string;
};

export function CurrencySelect({ value, onChange, className }: Props) {
    const [open, setOpen] = React.useState(false);
    const selected = getCurrencyMeta(value ?? "USD");

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                        "w-[150px] justify-between rounded-full border-border bg-background/60",
                        className
                    )}
                >
          <span className="flex items-center gap-2">
            <span className="text-lg leading-none">{selected.flag}</span>
            <span className="text-xs font-medium">
              {selected.code} · {selected.symbol}
            </span>
          </span>
                    <ChevronsUpDown className="ml-1 h-3 w-3 opacity-60" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[260px] p-0 border-border" align="start">
                <Command>
                    <CommandInput placeholder="Search currency..." />
                    <CommandEmpty>No currency found.</CommandEmpty>
                    <CommandGroup heading="Popular currencies">
                        {WORLD_CURRENCIES.map((cur) => (
                            <CommandItem
                                key={cur.code}
                                value={`${cur.code} ${cur.label}`}
                                onSelect={() => {
                                    onChange(cur.code);
                                    setOpen(false);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg leading-none">{cur.flag}</span>
                                    <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {cur.code} · {cur.symbol}
                    </span>
                                        <span className="text-[11px] text-muted-foreground">
                      {cur.label}
                    </span>
                                    </div>
                                </div>
                                <Check
                                    className={cn(
                                        "ml-auto h-4 w-4",
                                        value?.toUpperCase() === cur.code ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}