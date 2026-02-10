"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plane, Calendar as CalendarIcon, MapPin, ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import { getAirportCodeOrSlug, AIRPORT_OPTIONS } from "@/lib/airports";

interface FlightSearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    destinationCity: string;
    startDate?: string;
    endDate?: string;
}

export function FlightSearchDialog({
    open,
    onOpenChange,
    destinationCity,
    startDate,
    endDate,
}: FlightSearchDialogProps) {
    const [origin, setOrigin] = React.useState("");
    const [destination, setDestination] = React.useState(destinationCity);
    const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
        from: startDate ? new Date(startDate) : undefined,
        to: endDate ? new Date(endDate) : undefined,
    });

    // Update local state when props change
    React.useEffect(() => {
        setDestination(destinationCity);
        setDateRange({
            from: startDate ? new Date(startDate) : undefined,
            to: endDate ? new Date(endDate) : undefined,
        });
    }, [destinationCity, startDate, endDate, open]);

    const handleSearch = () => {
        if (!origin || !destination || !dateRange.from) return;

        const formatDate = (d: Date) => format(d, "yyMMdd");

        const originSlug = getAirportCodeOrSlug(origin);
        const destSlug = getAirportCodeOrSlug(destination);
        const startStr = formatDate(dateRange.from);
        const endStr = dateRange.to ? formatDate(dateRange.to) : "";

        let url = `https://www.skyscanner.net/transport/flights/${originSlug.toLowerCase()}/${destSlug.toLowerCase()}/${startStr}`;
        if (endStr) {
            url += `/${endStr}`;
        }

        url += `/?adultsv2=1&cabinclass=economy&childrenv2=&ref=home&rtn=${endStr ? 1 : 0}&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false`;

        window.open(url, "_blank");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl shadow-lg border-none overflow-hidden p-0 gap-0 bg-white dark:bg-slate-900">
                <div className="bg-blue-600 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white">
                            <Plane className="h-6 w-6" />
                            Find Flights
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Search for the best deals on Skyscanner
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid gap-4">
                        <AirportCombobox
                            label="From (Origin)"
                            value={origin}
                            onChange={setOrigin}
                            placeholder="Select origin..."
                            iconClass="text-slate-400"
                            autoFocus
                        />

                        <div className="flex justify-center -my-2 relative z-10">
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-1.5 border-2 border-white dark:border-slate-900">
                                <ArrowRight className="h-4 w-4 text-slate-400 rotate-90" />
                            </div>
                        </div>

                        <AirportCombobox
                            label="To (Destination)"
                            value={destination}
                            onChange={setDestination}
                            placeholder="Select destination..."
                            iconClass="text-blue-500"
                        />

                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Dates</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "justify-start text-left font-normal rounded-xl border-slate-200 bg-slate-50 h-11 dark:border-slate-800 dark:bg-slate-950",
                                            !dateRange.from && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                        {dateRange.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-xl" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange.from}
                                        selected={dateRange}
                                        onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                        numberOfMonths={2}
                                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0">
                    <Button
                        onClick={handleSearch}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-md shadow-blue-600/20"
                        disabled={!origin || !destination || !dateRange.from}
                    >
                        Search on Skyscanner
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AirportCombobox({
    value,
    onChange,
    label,
    placeholder,
    iconClass,
    autoFocus
}: {
    value: string;
    onChange: (val: string) => void;
    label: string;
    placeholder: string;
    iconClass?: string;
    autoFocus?: boolean;
}) {
    const [open, setOpen] = React.useState(false);

    // Find label if value matches an option code or city
    const selectedOption = AIRPORT_OPTIONS.find(
        (opt) => opt.value === value.toLowerCase() || opt.code === value
    );

    // If we have a selected option, show its label. Otherwise show the raw value.
    const displayValue = selectedOption ? selectedOption.label : (value || placeholder);

    return (
        <div className="grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between h-11 rounded-xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 font-normal px-3",
                            !value && "text-muted-foreground"
                        )}
                        autoFocus={autoFocus}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <MapPin className={cn("h-4 w-4 shrink-0", iconClass)} />
                            <span className="truncate">{selectedOption ? selectedOption.label : (value || placeholder)}</span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl" align="start">
                    <Command
                        filter={(value, search) => {
                            if (value.includes(search.toLowerCase())) return 1;
                            return 0;
                        }}
                    >
                        <CommandInput placeholder="Search city or airport..." />
                        <CommandList>
                            <CommandEmpty>No airport found.</CommandEmpty>
                            <CommandGroup heading="Suggestions">
                                {AIRPORT_OPTIONS.map((airport) => (
                                    <CommandItem
                                        key={airport.value}
                                        value={airport.value} // value is lowercase city name
                                        onSelect={(currentValue) => {
                                            // When selected, set the city name or code? 
                                            // Let's set the city name as the state, but we know the code from the option.
                                            // Actually, the parent expects 'origin' state to be a string. 
                                            // We'll set the city name (value) because the URL builder looks up code by city name.
                                            // Or we can set the code directly ???
                                            // The getAirportCodeOrSlug handles direct code too.
                                            // Let's set the Option Value (city name lowercase) so the input looks clean? 
                                            // No, let's set the proper formatted City Name or we can just set the city name.
                                            // AIRPORT_OPTIONS value is lowercase city.
                                            onChange(airport.city);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value.toLowerCase() === airport.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{airport.city}</span>
                                            <span className="text-xs text-muted-foreground font-bold">{airport.code}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
