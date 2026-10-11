# Country cover library

## Direction

All 70 destinations use the same premium illustrated travel-poster language established by the Singapore, Ireland, and Tanzania covers: layered gouache scenery, subtle screenprint grain, confident silhouettes, atmospheric depth, and a restrained saturated palette. The compositions vary deliberately. Some feature a place; others bring a distinctive local object, food, animal, craft, or vehicle into the foreground of a real setting. This keeps the collection cohesive without repeating the same landmark formula.

Artwork contains no fixed lettering. The upper portion stays visually quiet so the app can add a customer's title, year, chosen typeface, and text color. The landing page also renders country names over the same artwork. The 2:3 source images are cropped to 4:5 for the album proof and print export.

## Selection and assets

The first 30 destinations were chosen from widely visited countries. The next 20 broadened the regional mix, and the latest 20 add Côte d’Ivoire, Togo, Benin, Uganda, Namibia, Mauritius, Tunisia, Sweden, Finland, Iceland, Belgium, Hungary, Jordan, Qatar, Sri Lanka, Nepal, Taiwan, Costa Rica, the Dominican Republic, and Ecuador. This is an editorial cover library, not a current travel ranking.

`src/lib/travel-covers.ts` is the source of truth for destination names, artwork paths, and title contrast colors. Finished artwork is in `public/images/landing/covers/{id}.webp`; small picker images are in `public/images/landing/covers/thumbs/{id}.webp`. `scripts/optimize-landing-images.mjs` builds responsive landing-page variants. A landing page request samples six distinct covers from the full library and downloads only the selected artwork.

## Shared artwork brief

Portrait 1024 × 1536, edge-to-edge illustration. Match the Singapore, Ireland, and Tanzania covers in painterly mid-century poster style. Give the destination a clear focal point and layered setting, with the upper 28–30% relatively uncluttered for live lettering. Use place-specific details thoughtfully. No baked-in text, numbers, logos, borders, album mockups, or photographs.

The earlier flat, text-baked prompts in `country-cover-generation-prompts.md` describe an archived direction and are not used for the current collection.
