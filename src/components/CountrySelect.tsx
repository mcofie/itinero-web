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
    CommandList,
} from "@/components/ui/command";

import { cn } from "@/lib/utils";
import {
    WORLD_COUNTRIES,
    getCountryMeta,
} from "@/lib/country-data";

type Props = {
    value?: string | null;
    onChange: (label: string) => void;
    className?: string;
};

export function CountrySelect({ value, onChange, className }: Props) {
    const [open, setOpen] = React.useState(false);
    const selected = getCountryMeta(value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        "w-full justify-between rounded-xl border-slate-200 bg-slate-50 hover:bg-white transition-all dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900",
                        className
                    )}
                >
                    <span className="flex items-center gap-2 truncate">
                        {selected ? (
                            <>
                                <span className="text-lg leading-none">{selected.flag}</span>
                                <span className="text-sm font-medium truncate">
                                    {selected.label}
                                </span>
                            </>
                        ) : (
                            <span className="text-sm text-slate-400">Select country...</span>
                        )}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[300px] p-0 border-slate-200 dark:border-slate-800" align="start">
                <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList>
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-auto">
                            {WORLD_COUNTRIES.map((country) => (
                                <CommandItem
                                    key={country.code}
                                    value={country.label}
                                    onSelect={() => {
                                        onChange(country.label);
                                        setOpen(false);
                                    }}
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-lg leading-none">{country.flag}</span>
                                        <span className="text-sm font-medium truncate">
                                            {country.label}
                                        </span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === country.label ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
