import { getBlogPosts } from "@/lib/blog";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Blog - Itinero",
    description: "Travel tips, guides, and updates from the Itinero team.",
};

export default function BlogIndexPage() {
    const posts = getBlogPosts();

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-24 px-6 mb-16">
                <div className="mx-auto max-w-5xl text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        The Itinero Blog
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Stories from the <span className="text-blue-600 dark:text-blue-400">Road</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Travel tips, local insights, and product updates to help you explore the world with confidence.
                    </p>
                </div>
            </div>

            {/* Post Grid */}
            <div className="px-6 container mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {posts.map((post) => (
                        <article
                            key={post.slug}
                            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-800 flex flex-col h-full"
                        >
                            <Link href={`/blog/${post.slug}`} className="block group relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                                {post.coverImage ? (
                                    <Image
                                        src={post.coverImage}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">
                                        No Image
                                    </div>
                                )}
                            </Link>

                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {format(new Date(post.date), "MMMM d, yyyy")}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5" />
                                        {post.author}
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    <Link href={`/blog/${post.slug}`}>
                                        {post.title}
                                    </Link>
                                </h2>

                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {post.excerpt}
                                </p>

                                <div className="mt-auto">
                                    <Button asChild variant="link" className="p-0 h-auto font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1">
                                            Read Article <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
