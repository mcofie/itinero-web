import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https' as const,
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https' as const,
                hostname: 'images.pexels.com',
            },
            {
                protocol: 'https' as const,
                hostname: 'i.pravatar.cc',
            },
            {
                protocol: 'https' as const,
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https' as const,
                hostname: '*.googleusercontent.com',
            },
        ],
    },
    poweredByHeader: false,
    async headers() {
        return [{
            source: '/images/landing/optimized/:path*',
            headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
        }];
    },
    async rewrites() {
        return [
            {
                source: '/ingest/static/:path*',
                destination: 'https://us-assets.i.posthog.com/static/:path*',
            },
            {
                source: '/ingest/:path*',
                destination: 'https://us.i.posthog.com/:path*',
            },
        ];
    },
    skipTrailingSlashRedirect: true,
};

export default withNextIntl(nextConfig);
