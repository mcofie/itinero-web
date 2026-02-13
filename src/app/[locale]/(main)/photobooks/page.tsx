import * as React from "react";
import { Link } from "@/i18n/routing";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { createClientServerRSC } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
    Book,
    Plus,
    Clock,
    Sparkles,
    Image as ImageIcon,
    ChevronRight,
    ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Travel Photo Books",
};

export const dynamic = "force-dynamic";

type PhotobookRow = {
    id: string;
    user_id: string;
    title: string;
    cover_template_id: string;
    status: 'draft' | 'pending_payment' | 'paid' | 'processing' | 'shipped';
    total_cost: number;
    currency: string;
    created_at: string;
    image_count: number;
};

export default async function PhotobooksPage() {
    const sb = await createClientServerRSC();

    const { data: { user } } = await sb.auth.getUser();
    if (!user) redirect("/login");

    // Fetch photobooks with image counts
    // Note: In a real app we might use a view or a separate query for counts
    const { data: photobooks, error } = await sb
        .schema("itinero")
        .from("photobooks")
        .select(`
            *,
            images: photobook_images(count)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    const books = (photobooks || []).map(b => ({
        ...b,
        image_count: (b.images?.[0] as any)?.count || 0
    })) as PhotobookRow[];

    const hasBooks = books.length > 0;

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 selection:bg-blue-100 dark:selection:bg-blue-900">
            {/* Premium Header/Hero Section */}
            <div className="relative pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl dark:bg-blue-900/10 animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl dark:bg-indigo-900/10" />
                </div>

                <section className="mx-auto w-full max-w-7xl px-6 relative z-10">
                    <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-4 max-w-2xl">
                            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-100/50 text-blue-700 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md dark:bg-blue-950/30 dark:border-blue-900/30 dark:text-blue-400">
                                <Sparkles className="h-3 w-3 animate-pulse" />
                                Premium Keepsakes
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl dark:text-white leading-[1.1]">
                                Your Memories, <br />
                                <span className="text-blue-600">Tangible.</span>
                            </h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                Transform your digital adventures into professional-grade printed photobooks. Expertly curated, beautifully bound.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pb-2">
                            {hasBooks && (
                                <Button asChild size="lg" className="rounded-full bg-blue-600 px-8 font-bold shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all active:scale-95 group">
                                    <Link href="/photobooks/create">
                                        <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                                        Create New Book
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <section className="mx-auto w-full max-w-7xl px-6 py-12">
                {hasBooks ? (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {/* Apple Today Style Create Card */}
                        <Link
                            href="/photobooks/create"
                            className="group relative flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 p-8 text-center transition-all hover:bg-white hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:bg-slate-900 dark:hover:border-blue-500"
                        >
                            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-xl shadow-slate-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 dark:bg-slate-800 dark:shadow-none dark:ring-1 dark:ring-white/10">
                                <Plus className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="space-y-2">
                                <span className="block text-lg font-black text-slate-900 dark:text-white">
                                    Capture a Journey
                                </span>
                                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Start from a template
                                </span>
                            </div>
                        </Link>

                        {books.map((book) => (
                            <PhotobookCard key={book.id} book={book} />
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </section>
        </div>
    );
}

function PhotobookCard({ book }: { book: PhotobookRow }) {
    const statusColors = {
        draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
        pending_payment: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
        paid: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
        processing: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30",
        shipped: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30",
    };

    return (
        <Link
            href={`/photobooks/create?id=${book.id}`}
            className="group flex flex-col gap-4 rounded-[2.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-xl hover:scale-[1.02] dark:bg-slate-900 dark:ring-slate-800"
        >
            {/* Template Preview / Cover Placeholder */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-slate-800">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                    <Book className="h-16 w-16 text-slate-300 dark:text-slate-700 transition-transform group-hover:scale-110" />
                </div>

                {/* Image Count Badge */}
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-slate-900 shadow-sm backdrop-blur-sm dark:bg-slate-950/90 dark:text-white">
                    <ImageIcon className="h-3 w-3 text-blue-500" />
                    {book.image_count} Pages
                </div>

                {/* Status Badge */}
                <div className={cn(
                    "absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    statusColors[book.status]
                )}>
                    {book.status.replace('_', ' ')}
                </div>
            </div>

            <div className="px-2 pb-2">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate">
                        {book.title}
                    </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Last edited {new Date(book.created_at).toLocaleDateString()}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {book.total_cost > 0 ? `${book.currency} ${book.total_cost}` : "Starts at GHS 120"}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all uppercase tracking-widest">
                        Continue <ChevronRight className="h-3 w-3" />
                    </span>
                </div>
            </div>
        </Link>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white py-24 text-center shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 dark:bg-blue-900/30" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 ring-8 ring-blue-50/50 dark:bg-blue-900/20 dark:ring-blue-900/10">
                    <Book className="h-10 w-10" />
                </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                No photo books yet
            </h2>

            <p className="max-w-md text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-6">
                Your memories deserve a physical home. Create a beautiful, high-quality photobook of your favorite trips in just a few clicks.
            </p>

            <div className="mt-10">
                <Button asChild size="lg" className="rounded-full bg-blue-600 px-10 font-bold shadow-xl shadow-blue-600/20 hover:scale-105 transition-transform">
                    <Link href="/photobooks/create">Create Your First Book</Link>
                </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 grayscale opacity-50">
                <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Premium Print</span>
                </div>
                <div className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Global Shipping</span>
                </div>
            </div>
        </div>
    );
}
