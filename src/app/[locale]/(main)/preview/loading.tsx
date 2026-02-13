import { Skeleton } from "@/components/ui/skeleton";

export default function PreviewLoading() {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
            {/* Hero Skeleton (Matches PreviewClient) */}
            <section className="relative h-[50vh] min-h-[400px] w-full bg-slate-200 dark:bg-slate-900 overflow-hidden">
                <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                <div className="absolute inset-0 flex items-end pb-12 md:pb-16">
                    <div className="mx-auto w-full max-w-5xl px-4 md:max-w-6xl space-y-4">
                        <Skeleton className="h-6 w-32 rounded-full bg-white/20" />
                        <Skeleton className="h-12 md:h-16 w-3/4 max-w-xl bg-white/20" />
                        <div className="flex gap-3">
                            <Skeleton className="h-8 w-40 rounded-lg bg-white/10" />
                            <Skeleton className="h-8 w-40 rounded-lg bg-white/10" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Skeleton */}
            <main className="mx-auto w-full max-w-5xl px-4 pb-20 md:max-w-6xl mt-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-8">
                        {/* Summary Card Skeleton */}
                        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-8">
                            <Skeleton className="h-8 w-48 mb-6" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 rounded-2xl" />
                                ))}
                            </div>
                        </div>

                        {/* Itinerary Container Skeleton */}
                        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-950/50 p-6 border-b border-slate-100 dark:border-slate-800">
                                <Skeleton className="h-6 w-32 mb-4" />
                                <div className="flex gap-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-10 w-16 rounded-lg" />
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-5 w-1/4" />
                                            <Skeleton className="h-4 w-1/2" />
                                            <Skeleton className="h-24 w-full rounded-2xl" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full rounded-3xl" />
                        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-20 w-full" />
                            <div className="space-y-2">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-6 w-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
