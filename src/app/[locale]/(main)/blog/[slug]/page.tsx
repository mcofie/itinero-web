import { getBlogPost, getBlogPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";

interface Props {
    params: {
        slug: string;
    };
}

// Generate static params for all posts
export async function generateStaticParams() {
    const posts = getBlogPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props) {
    const post = getBlogPost(params.slug);
    if (!post) {
        return {
            title: "Post Not Found - Itinero",
        };
    }
    return {
        title: `${post.title} - Itinero Blog`,
        description: post.excerpt,
    };
}

export default function BlogPostPage({ params }: Props) {
    const post = getBlogPost(params.slug);

    if (!post) {
        notFound();
    }

    // Estimate read time (very rough: 200 words per minute)
    const wordCount = post.content.split(/\s+/g).length;
    const readTime = Math.ceil(wordCount / 200);

    return (
        <article className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
            {/* Header Image */}
            <div className="relative h-[50vh] min-h-[400px] w-full bg-slate-900">
                {post.coverImage && (
                    <>
                        <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover opacity-80"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                    </>
                )}

                <div className="absolute inset-0 flex items-end pb-12 sm:pb-24 px-6">
                    <div className="container mx-auto max-w-3xl">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors text-sm font-bold uppercase tracking-wider bg-black/20 backdrop-blur-sm py-2 px-4 rounded-full w-fit"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Blog
                        </Link>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-[1.1] drop-shadow-md">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-slate-300 font-medium text-sm sm:text-base">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-400" />
                                {format(new Date(post.date), "MMMM d, yyyy")}
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-emerald-400" />
                                {post.author}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-400" />
                                {readTime} min read
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-6 -mt-10 relative z-10">
                <div className="mx-auto max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 lg:p-16 shadow-xl border border-slate-100 dark:border-slate-800">
                    <div className="prose prose-lg prose-slate dark:prose-invert max-w-none 
                        prose-headings:font-bold prose-headings:tracking-tight 
                        prose-h1:text-3xl prose-h2:text-2xl 
                        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-2xl prose-img:shadow-lg
                        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                     ">
                        <MDXRemote source={post.content} />
                    </div>
                </div>
            </div>

        </article>
    );
}
