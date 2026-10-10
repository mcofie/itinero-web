# Landing page performance

## Image delivery

- Artwork originals remain unchanged for future editing.
- The landing page uses pre-encoded WebP images with responsive source sets. Phones request smaller files; high-density screens can use the full original dimensions.
- Generated filenames contain a content hash and receive a one-year immutable cache header. Changing an image produces a new URL.
- Images are encoded ahead of time, so first visitors do not wait for an image optimizer.
- The active hero cover has high fetch priority. Mobile-only hero covers use a transparent local data source on desktop, and the desktop hero does the same on mobile.
- Gallery, overhead, and footer photographs are lazy-loaded. Only the randomly selected overhead photograph is rendered.

The initial conversion processed 43 source images: **61,174,325 bytes of PNGs → 5,072,986 bytes of full-size WebPs (91.7% smaller)**. This compares the complete processed asset collection, not the network transfer for a single page. Smaller responsive variants reduce individual downloads further.

After adding or changing artwork, run:

```sh
npm run optimize:landing
```

Commit the generated files in `public/images/landing/optimized/` and `src/lib/landing-images.json` with the source change.

## Fonts, scripts, and rendering

- Landing fonts use Next's local font loading with preloads, hashed font URLs, and swap rendering.
- The headline paints immediately; its entrance animation moves the letters without hiding them.
- Motion uses `LazyMotion` with the smaller `domAnimation` feature set. Layout/drag animation features are not needed by this page.
- Landing links do not prefetch the heavier album editor or account pages.
- Geometry updates bail out when measurements have not changed. Scroll movement continues through motion values instead of React state updates per frame.
- The public landing route bypasses Supabase session refresh in middleware. Other routes retain their existing authentication handling.
- Per-request country selection remains on the server to avoid hydration reshuffling.

## Measurement scope

Asset sizes were measured during encoding. No production load-time, Lighthouse, or Core Web Vitals benchmark was run. Production performance depends on hosting, cache state, network, and device. Development-mode timings include Next.js compilation and are not representative of production.
