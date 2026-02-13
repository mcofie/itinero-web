import { Skeleton } from "@/components/ui/skeleton";

export default function TripMakerLoading() {
    return (
        <div className="relative isolate min-h-[101svh] bg-background">
            <header className="mx-auto w-full max-w-4xl px-4 pt-10 sm:pt-12 space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-center">
                    <Skeleton className="h-10 w-3/4 max-w-lg" />
                </div>
                <div className="flex justify-center">
                    <Skeleton className="h-5 w-1/2 max-w-md" />
                </div>
            </header>

            <main className="mx-auto grid min-h-[65svh] w-full max-w-4xl place-items-start px-4 pt-6 sm:pt-10">
                <div className="w-full flex flex-col items-center justify-start">
                    <div className="w-full max-w-3xl rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm backdrop-blur-sm sm:p-6 md:p-8 space-y-8">
                        {/* Skeleton for TripWizard form steps */}
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-24 rounded-xl" />
                            ))}
                        </div>
                        <div className="flex justify-end pt-4">
                            <Skeleton className="h-10 w-24 rounded-full" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
