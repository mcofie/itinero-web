# Country cover library

The current 144-country direction is specified in [flat-object-covers.md](./flat-object-covers.md), with one complete subject brief per country in [flat-object-cover-prompts.md](./flat-object-cover-prompts.md).

Each cover pairs one detailed painted object with the guide's exact solid background color. No lettering is baked into the artwork: the album builder, landing page, account pages, and PDF proof add the customer's title and year. The first 30% of the illustration is intentionally empty. The app's 4:5 crop keeps the whole subject inside the cover, while the source artwork remains 2:3 at 1024 × 1536.

Finished WebP artwork lives at `public/images/landing/covers/{id}.webp`. `src/lib/travel-covers.ts` lists the available countries and their background colors. `scripts/compose-flat-cover-art.mjs` places generated transparent subject art over the specified backgrounds. `scripts/optimize-album-cover-thumbnails.mjs` builds small picker images, and `scripts/optimize-landing-images.mjs` builds responsive landing-page variants. Each landing-page request samples six distinct covers from the full library.

The earlier scenic series based on Singapore, Ireland, and Tanzania is archived by this direction. Older text-baked prompts in [country-cover-generation-prompts.md](./country-cover-generation-prompts.md) and [travel-cover-prompts.md](./travel-cover-prompts.md) are retained as design history.
