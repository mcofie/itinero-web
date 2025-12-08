import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the directory where blog posts are stored
const postsDirectory = path.join(process.cwd(), 'content/blog');

export type BlogPost = {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    author: string;
    coverImage: string;
    content: string;
};

// Get all blog posts sorted by date
export function getBlogPosts(): BlogPost[] {
    // Return empty array if directory doesn't exist to prevent crashes during build/dev
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith('.mdx'))
        .map((fileName) => {
            const slug = fileName.replace(/\.mdx$/, '');
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            // Use gray-matter to parse the post metadata section
            const { data, content } = matter(fileContents);

            return {
                slug,
                content,
                ...(data as { title: string; date: string; excerpt: string; author: string; coverImage: string }),
            };
        });

    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

// Get a single blog post by slug
export function getBlogPost(slug: string): BlogPost | null {
    try {
        const fullPath = path.join(postsDirectory, `${slug}.mdx`);

        if (!fs.existsSync(fullPath)) {
            return null;
        }

        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
            slug,
            content,
            ...(data as { title: string; date: string; excerpt: string; author: string; coverImage: string }),
        };
    } catch (e) {
        return null;
    }
}
