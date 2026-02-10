
"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Send, MapPin, CalendarDays, Globe, ChevronDown, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitTourGuideRequestAction, updateTourGuideDetailsAction } from "./server-actions";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { countries } from "@/lib/countries";
import { Availability, AvailabilityPicker, formatAvailability } from "./AvailabilityPicker";

export function TourGuideRequestForm({
    userId,
    defaultCountry,
    existingRequest
}: {
    userId: string | null,
    defaultCountry?: string | null,
    existingRequest?: { id: string, status: string, country?: string, city?: string, available_times?: string } | null
}) {
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [country, setCountry] = useState<string | undefined>(undefined);
    const [city, setCity] = useState<string>("");

    const [availability, setAvailability] = useState<Availability>({
        Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: []
    });

    // Edit mode for approved guides
    const [isEditing, setIsEditing] = useState(false);

    // Local state to track if we show the existing request or the fresh form (for re-applying)
    const [showingExisting, setShowingExisting] = useState(true);

    const isExistingPending = existingRequest?.status === 'pending';
    const isExistingRejected = existingRequest?.status === 'rejected';
    const isExistingApproved = existingRequest?.status === 'approved';

    // Effective state handling: if we have an existing request and we are showing it, use its status. 
    // Otherwise act as if no request exists (for re-applying).
    const activeRequest = showingExisting ? existingRequest : null;

    const isPendingStatus = activeRequest?.status === 'pending';
    const isRejectedStatus = activeRequest?.status === 'rejected';
    const isApprovedStatus = activeRequest?.status === 'approved';

    React.useEffect(() => {
        if (defaultCountry && !country) {
            const found = countries.find(c => c.label === defaultCountry || c.value === defaultCountry);
            if (found) setCountry(found.value);
        }
    }, [defaultCountry]);

    // If there is an existing pending request, parse values to show them
    React.useEffect(() => {
        if (activeRequest && (activeRequest.status === 'pending' || activeRequest.status === 'approved')) {
            if (activeRequest.country) {
                const found = countries.find(c => c.label === activeRequest.country || c.value === activeRequest.country);
                if (found) setCountry(found.value);
            }
            if (activeRequest.city) {
                setCity(activeRequest.city);
            }
            if (activeRequest.available_times) {
                try {
                    const parsed = JSON.parse(activeRequest.available_times);
                    setAvailability(parsed);
                } catch (e) {
                    // ignore legacy format
                }
            }
        }
    }, [activeRequest])


    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        if (!userId) {
            toast.error("You must be logged in.");
            return;
        }

        // Validate availability
        const hasAvailability = Object.values(availability).some(slots => slots.length > 0);
        if (!hasAvailability) {
            toast.error("Please select at least one available time slot.");
            return;
        }

        formData.append("user_id", userId);
        formData.set("available_times", formatAvailability(availability));

        startTransition(async () => {
            try {
                await submitTourGuideRequestAction(formData);
                toast.success("Request submitted successfully! We will review it shortly.");
                // We don't reset form fully here because we rely on server revalidation to switch this to 'pending' state
                // But specifically for client feel, we can close it
                setIsOpen(false);
            } catch (err) {
                console.error(err);
                toast.error("Failed to submit request. Please try again.");
            }
        });
    }

    async function onUpdateDetails() {
        if (!userId || !existingRequest?.id) return;

        if (!country || !city) {
            toast.error("Please fill in country and city.");
            return;
        }

        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("request_id", existingRequest.id);
        formData.append("country", country);
        formData.append("city", city);
        formData.append("available_times", formatAvailability(availability));

        startTransition(async () => {
            try {
                await updateTourGuideDetailsAction(formData);
                toast.success("Profile updated and submitted for review.");
                setIsEditing(false);
                // Status will change to pending on re-render
            } catch (err) {
                console.error(err);
                toast.error("Failed to update details.");
            }
        });
    }

    const isReadOnly = isPendingStatus || isApprovedStatus;

    if (isApprovedStatus) {
        return (
            <Card className="border-emerald-200 bg-white shadow-sm dark:bg-emerald-900/10 dark:border-emerald-900/50 rounded-3xl overflow-hidden">
                <CardHeader className="px-6 py-5 bg-emerald-50/50 border-b border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                <Check className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                    You are a Local Guide
                                </h3>
                                <p className="text-xs text-slate-500 font-medium dark:text-slate-400 mt-0.5">
                                    Your application has been approved.
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-500/20">
                            Active
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {(activeRequest?.country || activeRequest?.city) && (() => {
                        // Inline computation for country object
                        const cObj = countries.find(c => c.value === activeRequest.country);
                        return (
                            <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 border-dashed">
                                <div>
                                    <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                                        <Globe className="h-3 w-3" /> Country
                                    </Label>
                                    <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="text-xl">{cObj?.flag}</span>
                                        <span>{cObj?.label || activeRequest.country}</span>
                                    </div>
                                </div>
                                <div>
                                    <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                                        <MapPin className="h-3 w-3" /> City
                                    </Label>
                                    <div className="font-medium text-slate-900 dark:text-white">
                                        {activeRequest.city}
                                    </div>
                                </div>
                            </div>
                        )
                    })()}

                    <div className="flex items-center justify-between mb-4">
                        <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                            <CalendarDays className="h-3 w-3" /> Current Availability
                        </Label>
                        {!isEditing && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                className="h-8 text-xs bg-white hover:bg-slate-50 border-slate-200"
                            >
                                Edit Schedule
                            </Button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="country" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                            <MapPin className="h-3 w-3" /> Country
                                        </Label>
                                        <Select
                                            name="country"
                                            value={country}
                                            onValueChange={setCountry}
                                            disabled={isPending}
                                        >
                                            <SelectTrigger className="bg-white dark:bg-slate-900 h-9 text-sm">
                                                <SelectValue placeholder="Select a country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries.map((c) => (
                                                    <SelectItem key={c.value} value={c.value}>
                                                        <span className="flex items-center gap-2">
                                                            <span className="text-lg leading-none">{c.flag}</span>
                                                            <span>{c.label}</span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                            <MapPin className="h-3 w-3" /> City / Region
                                        </Label>
                                        <Input
                                            id="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="e.g. Tokyo"
                                            disabled={isPending}
                                            className="bg-white dark:bg-slate-900 h-9 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                                        <CalendarDays className="h-3 w-3" /> Availability
                                    </Label>
                                    <AvailabilityPicker
                                        value={availability}
                                        onChange={setAvailability}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset to original values
                                        if (activeRequest) {
                                            if (activeRequest.country) {
                                                const found = countries.find(c => c.label === activeRequest.country || c.value === activeRequest.country);
                                                if (found) setCountry(found.value);
                                            }
                                            if (activeRequest.city) setCity(activeRequest.city);
                                            if (activeRequest.available_times) {
                                                try {
                                                    setAvailability(JSON.parse(activeRequest.available_times));
                                                } catch (e) { }
                                            }
                                        }
                                    }}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={onUpdateDetails}
                                    disabled={isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:bg-slate-900/50 dark:border-slate-800">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm">
                                {Object.entries(availability).filter(([_, slots]) => slots.length > 0).map(([day, slots]) => (
                                    <div key={day} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0 border-dashed dark:border-slate-800">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300 w-12">{day}</span>
                                        <span className="text-slate-600 dark:text-slate-400">{slots.join(", ")}</span>
                                    </div>
                                ))}
                                {Object.values(availability).every(slots => slots.length === 0) && (
                                    <p className="text-slate-400 italic text-sm">No availability set.</p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn(
            "border-slate-200 bg-white shadow-sm dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-md",
            isRejectedStatus ? "dark:bg-slate-900" : "dark:bg-slate-900"
        )}>
            <Collapsible open={isOpen || isPendingStatus || isRejectedStatus} onOpenChange={setIsOpen} disabled={isPendingStatus || isRejectedStatus}>
                {/* Default Trigger when Open to Apply */}
                {!isPendingStatus && !isRejectedStatus && (
                    <CollapsibleTrigger asChild>
                        <CardHeader className="border-b border-transparent bg-white px-6 py-5 dark:bg-slate-900 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 data-[state=open]:border-slate-100 dark:data-[state=open]:border-slate-800 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                            Become a Local Guide
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium dark:text-slate-400 mt-0.5">
                                            Earn money by showing travelers your city.
                                        </p>
                                    </div>
                                </div>
                                <div className={cn("transition-transform duration-300 transform", isOpen ? "rotate-180" : "")}>
                                    <ChevronDown className="h-5 w-5 text-slate-400" />
                                </div>
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                )}

                {/* Pending Header */}
                {isPendingStatus && (
                    <CardHeader className="border-b border-slate-100 bg-white px-6 py-5 dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                        Application Under Review
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium dark:text-slate-400 mt-0.5">
                                        We are currently reviewing your application.
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-500/20">
                                Pending
                            </span>
                        </div>
                    </CardHeader>
                )}

                {/* Rejected Header */}
                {isRejectedStatus && (
                    <CardHeader className="border-b border-rose-100 bg-rose-50/30 px-6 py-5 dark:bg-rose-900/10 dark:border-rose-900/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                                    <Info className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                        Application Not Approved
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium dark:text-slate-400 mt-0.5">
                                        Unfortunately, we couldn't approve your request.
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-500/20">
                                Declined
                            </span>
                        </div>
                    </CardHeader>
                )}

                <CollapsibleContent className="animate-in slide-in-from-top-2 fade-in duration-300">
                    <CardContent className="p-5 bg-slate-50/30 dark:bg-slate-950/30">
                        {/* Pending Info */}
                        {isPendingStatus && (
                            <div className="rounded-xl bg-amber-50/50 p-4 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20 flex gap-3 items-start mb-5">
                                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                                    <p className="font-semibold mb-1">Status: Pending Review</p>
                                    <p className="opacity-90">
                                        Your application to become a Local Guide has been received. Our team typically reviews applications within 48 hours.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Rejected Actions */}
                        {isRejectedStatus && (
                            <div className="mb-6 space-y-4">
                                <div className="rounded-xl bg-white p-4 border border-rose-100 shadow-sm dark:bg-slate-900 dark:border-rose-900/20">
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        Our team has reviewed your application and decided not to proceed at this time. You can update your details and try again.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => {
                                        setShowingExisting(false);
                                        setCountry(undefined);
                                        setCity("");
                                        setAvailability({ Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] });
                                        // Force open the form state
                                        setIsOpen(true);
                                    }}
                                    variant="outline"
                                    className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Start New Application
                                </Button>
                            </div>
                        )}

                        {/* The Actual Form (Hide if Rejected - show only if applying fresh or pending view) */}
                        {(!isRejectedStatus) && (
                            <form onSubmit={onSubmit} className="space-y-5">
                                {!isPendingStatus && (
                                    <div className="rounded-xl bg-blue-50/50 p-3.5 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20 flex gap-3 items-start">
                                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                            <p className="font-semibold mb-1">Join our Local Guide Program</p>
                                            <p className="opacity-90">
                                                Share your local knowledge and earn rewards. Fill out the details below and our team will review your application within 48 hours.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="country" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                            <MapPin className="h-3 w-3" /> Country
                                        </Label>
                                        <Select
                                            name="country"
                                            value={country}
                                            onValueChange={setCountry}
                                            disabled={isReadOnly}
                                            required
                                        >
                                            <SelectTrigger className="bg-white dark:bg-slate-900 h-10">
                                                <SelectValue placeholder="Select a country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries.map((c) => (
                                                    <SelectItem key={c.value} value={c.value}>
                                                        <span className="flex items-center gap-2">
                                                            <span className="text-lg leading-none">{c.flag}</span>
                                                            <span>{c.label}</span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                            <MapPin className="h-3 w-3" /> City / Region
                                        </Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            placeholder="e.g. Tokyo"
                                            required
                                            disabled={isReadOnly}
                                            defaultValue={activeRequest?.city || ''}
                                            className="bg-white dark:bg-slate-900 h-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                                        <CalendarDays className="h-3 w-3" /> Weekly Availability
                                    </Label>
                                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 dark:bg-slate-950 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {isPendingStatus ? 'Your Submitted Availability' : 'Select your typical free times'}
                                        </div>
                                        <div className="p-4">
                                            <AvailabilityPicker
                                                value={availability}
                                                onChange={setAvailability}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                    {!isPendingStatus && (
                                        <p className="text-[10px] text-slate-400 font-medium px-1">
                                            Select days and times you are generally available to guide. You can adjust specific dates later.
                                        </p>
                                    )}
                                </div>

                                {!isPendingStatus && (
                                    <Button
                                        type="submit"
                                        disabled={isPending}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] text-base"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Application <Send className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </form>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
