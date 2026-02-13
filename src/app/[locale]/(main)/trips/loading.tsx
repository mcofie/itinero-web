import { Skeleton } from "@/components/ui/skeleton";

export default function TripsLoading() {
    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 dark:bg-slate-950 dark:text-white">
            <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 lg:py-16">
                {/* Header Skeleton */}
                <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-6 w-64" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Add Card Placeholder */}
                    <Skeleton className="min-h-[320px] rounded-[2rem]" />

                    {/* Trip Card Skeletons */}
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-3 rounded-[2rem] bg-white p-3 shadow-sm dark:bg-slate-900">
                            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                            <div className="px-2 pb-2 space-y-3">
                                <Skeleton className="h-5 w-3/4" />
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <div className="flex justify-between pt-4">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
