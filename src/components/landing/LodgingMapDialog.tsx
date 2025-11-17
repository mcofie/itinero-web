"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {MapPin, LocateFixed} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

const LodgingPickerMap = dynamic(() => import("./LodgingPickerMap"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Loading map…
        </div>
    ),
});

export type LodgingValue = {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
};

type LodgingMapDialogProps = {
    value: LodgingValue | null;
    onChange: (value: LodgingValue | null) => void;
    center?: { lat: number; lng: number }; // default: Accra
    trigger?: React.ReactNode;
};

export function LodgingMapDialog({
                                     value,
                                     onChange,
                                     center,
                                     trigger,
                                 }: LodgingMapDialogProps) {
    const [open, setOpen] = React.useState(false);
    const [localValue, setLocalValue] = React.useState<LodgingValue | null>(value);

    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const effectiveCenter =
        center ??
        ({
            lat: 5.6037,
            lng: -0.1870,
        } as const); // Accra fallback

    const handleSave = () => {
        onChange(localValue && (localValue.name || localValue.lat || localValue.lng) ? localValue : null);
        setOpen(false);
    };

    const handleClear = () => {
        setLocalValue(null);
        onChange(null);
    };

    const currentCoords =
        localValue?.lat != null && localValue?.lng != null
            ? {lat: localValue.lat, lng: localValue.lng}
            : null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Trigger */}
            <div onClick={() => setOpen(true)}>
                {trigger ?? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="inline-flex items-center gap-2 border-dashed"
                    >
                        <MapPin className="h-4 w-4 text-muted-foreground"/>
                        {value?.name
                            ? `Lodging: ${value.name}`
                            : "Add lodging (map + name)"}
                    </Button>
                )}
            </div>

            <DialogContent
                className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-border/70 bg-background/95 backdrop-blur">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-4 w-4"/>
            </span>
                        Choose your lodging
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        We’ll try to start and end each day near this location so your
                        travel time stays reasonable.
                    </DialogDescription>
                </DialogHeader>

                {/* Main layout */}
                <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                    {/* Left: map */}
                    <div className="space-y-2">
                        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Pick on map
                        </div>

                        <div
                            className="relative h-64 w-full overflow-hidden rounded-2xl border border-border/70 bg-muted sm:h-72 md:h-80">
                            <LodgingPickerMap
                                center={effectiveCenter}
                                value={currentCoords}
                                onChange={(coords) =>
                                    setLocalValue((prev) => ({
                                        ...(prev ?? {}),
                                        lat: coords.lat,
                                        lng: coords.lng,
                                    }))
                                }
                            />
                        </div>

                        <p className="text-[11px] text-muted-foreground">
                            This is a simple approximate picker, not a full map. Click near
                            where you’re staying and we’ll use it as an anchor for routing.
                        </p>
                    </div>

                    {/* Right: details */}
                    <div className="space-y-3 rounded-2xl border border-border/60 bg-card/60 p-3 sm:p-4">
                        <div className="space-y-2">
                            <Label htmlFor="lodging-name" className="text-xs text-muted-foreground">
                                Lodging name
                            </Label>
                            <Input
                                id="lodging-name"
                                placeholder="e.g., Labadi Beach Hotel"
                                value={localValue?.name ?? ""}
                                onChange={(e) =>
                                    setLocalValue((prev) => ({
                                        ...(prev ?? {}),
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lodging-address" className="text-xs text-muted-foreground">
                                Address / notes
                            </Label>
                            <Input
                                id="lodging-address"
                                placeholder="Street, area, or any landmark"
                                value={localValue?.address ?? ""}
                                onChange={(e) =>
                                    setLocalValue((prev) => ({
                                        ...(prev ?? {}),
                                        address: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div
                            className="space-y-1 rounded-xl border border-dashed border-border/70 bg-background/60 px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Coordinates
                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground"
                                    disabled
                                    title="Auto-detect not implemented yet"
                                >
                                    <LocateFixed className="h-3.5 w-3.5"/>
                                </Button>
                            </div>

                            {currentCoords ? (
                                <p className="font-mono text-xs text-foreground">
                                    {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
                                </p>
                            ) : (
                                <p className="text-xs text-muted-foreground">
                                    Click on the map to set latitude & longitude.
                                </p>
                            )}
                        </div>

                        {localValue?.name && (
                            <div className="mt-1 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                                We’ll treat{" "}
                                <span className="font-medium text-foreground">
                  {localValue.name}
                </span>{" "}
                                as your base. Activities will try to stay within a soft radius
                                unless you ask for day trips.
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        className="justify-start text-xs text-muted-foreground"
                        onClick={handleClear}
                    >
                        Clear lodging
                    </Button>

                    <div className="flex items-center gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="button" onClick={handleSave}>
                            Save lodging
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}