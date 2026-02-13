import { Skeleton } from "@/components/ui/skeleton";

export default function TripDetailsLoading() {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 selection:text-blue-900">
            {/* Hero Header Skeleton */}
            <div className="relative h-[65vh] min-h-[500px] w-full bg-slate-200 dark:bg-slate-900 overflow-hidden">
                <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl p-8 md:p-12 pb-32 md:pb-40 space-y-6">
                    <div className="space-y-4">
                        <Skeleton className="h-16 md:h-20 w-3/4 max-w-2xl bg-white/20" />
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
                            <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
                            <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Skeleton className="h-10 w-40 rounded-full bg-white/10" />
                        <Skeleton className="h-10 w-40 rounded-full bg-white/10" />
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="relative z-10 -mt-20 mx-auto w-full max-w-6xl px-4 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Itinerary */}
                    <div className="lg:col-span-8 space-y-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-10 w-48 rounded-2xl" />
                                <div className="space-y-4">
                                    {[...Array(2)].map((_, j) => (
                                        <div key={j} className="flex gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                                            <Skeleton className="h-24 w-24 rounded-2xl shrink-0" />
                                            <div className="flex-1 space-y-2 py-2">
                                                <Skeleton className="h-6 w-1/3" />
                                                <Skeleton className="h-4 w-2/3" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-3xl p-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-32 w-full rounded-2xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
