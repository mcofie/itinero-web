# Album ordering

The customer flow uses a standard 8 × 10 inch portrait hardcover album. The album price, Accra delivery fee and tax are set by the admin in Settings (GHS 800, delivery included, no tax by default). Customers sign in with Google, save up to 40 original photos to their private album, review every page in the watermarked preview, enter an Accra address, and pay through Paystack. Orders are run from the orders admin at `/admin/orders`, described below.

## Production configuration

- Google is enabled in Supabase Auth. The redirect allow list includes local development and `https://tryitinero.com/auth/callback` (also `www`).
- The SQL in `supabase/migrations/20261011000000_album_orders.sql` was applied to the linked production Supabase project on 2026-10-11 through the SQL editor. It makes the `photobooks` bucket private and adds order fields. The migration is idempotent for subsequent CLI use.
- `supabase/migrations/20261011183500_album_cover_style.sql` adds the cover typeface and font color fields. Apply it before deploying the cover style UI. Existing albums default to the original bold typeface and automatic contrast color. This migration has not yet been applied to the linked production project.
- A pending order keeps its original Paystack checkout URL and reference, so returning to payment does not create another unmatched charge.
- Storage policies allow a customer to write files only while the album is a draft. Submitted originals remain fixed for print review, except while changes are requested.
- `supabase/migrations/20261012120000_album_fulfilment.sql` adds order numbers, the fulfilment statuses, delivery fields and the order timeline, and renames existing `processing` orders to `printing` and `shipped` orders to `out_for_delivery`. It has not been applied to production yet. Apply it after the cover style migration and **before** deploying the orders admin: payment confirmation and checkout write the new columns.
- `supabase/migrations/20261012130000_album_discounts.sql` adds discount codes and the order price breakdown (`subtotal`, `discount_code`, `discount_amount`; `total_cost` stays the amount charged). Apply it before deploying: checkout and the admin read these columns.
- `supabase/migrations/20261012140000_album_settings.sql` adds the settings row (prices; its `discord_alerts` column is unused) and the delivery and tax amounts on each order. Applied to production on 2026-10-12, as were the fulfilment and discounts migrations.
- `supabase/migrations/20261016120000_album_page_text.sql` adds `page_text` (opening title and note, closing note, back cover line). Apply it before deploying: saving an album writes this column.
- `supabase/migrations/20261016130000_album_cover_color.sql` adds `cover_color` (`auto` or a hex colour). Apply it before deploying: the builder, My Albums, the order page and the admin read this column.
- `supabase/migrations/20261016140000_album_print_ready.sql` adds photo positions (`focus_x`, `focus_y`), the cover spread path (`cover_pdf_path`) and the print specification setting. Saving albums writes the photo positions, so apply it before deploying.
- From here on, migrations deploy through GitHub; see [database-migrations.md](./database-migrations.md).
- The app needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, and `ADMIN_EMAIL` in its deployment environment. Do not expose the service-role or Paystack secret to the browser.
- Set `NEXT_PUBLIC_SITE_URL=https://tryitinero.com` so customer emails and WhatsApp messages link to the right order page.
- Paystack should deliver `charge.success` webhooks to `/api/paystack/webhook`. The existing points flow and the album flow share this endpoint.
- The application changes are in this local checkout and still need deployment with those environment variables. Supabase schema and Google redirect changes are already live.

## Print handoff

Customers never get a printable file. The builder shows a screen-resolution, watermarked page preview; there is no PDF download, and checkout no longer uploads one. Print files are built only in the orders admin: **Build print files** on a paid order fetches the original photos through short-lived links, draws the pages in the admin's browser with the same code as the preview, and uploads two files to the private `photobooks` bucket, replacing older ones:

- **Interior** (`interior-<timestamp>.pdf`): opening page, photo pages and closing page at 8 × 10 in and 300 dpi, plus bleed on every edge.
- **Cover spread** (`cover-<timestamp>.pdf`): back cover, spine and front cover side by side, with a wrap margin for the hardcover case. The spine is the spine allowance plus a thickness per interior page; title and year run down spines 5 mm or wider.

Bleed, wrap and spine measurements are in Settings → Print specification (defaults: 3 mm bleed, 15 mm wrap, 4 mm + 0.1 mm per page). Colour is sRGB JPEG without an embedded profile; confirm the printer accepts that. Asking the customer for changes clears both files, so they are rebuilt after the customer resubmits. The PDF code loads only on that admin button, not on `/make-album`.

### Print-resolution cover art

The web covers are 1024 × 1280 px. For print, `npm run covers:upscale` upscales them with Real-ESRGAN (`realesrgan-x4plus`) to 2400 × 3000 px into `print-assets/print-covers/` (not committed; set `REALESRGAN_BIN` and `REALESRGAN_MODELS` to the downloaded release), `npm run covers:print-cutouts` makes their transparent cut-outs, and `npm run covers:upload-print` uploads both to the private `print-assets` Supabase bucket. The admin build uses that art when it exists and falls back to the web image otherwise (the success message says so).

The print file's pages are: front cover, opening page (title, place and year, optional dedication), the photo pages, closing page (optional note and a travel stamp), and back cover (cover colour, a round crop of the illustration, place and year, an optional line, and the Itinero mark). Customers can also pick a cover colour, used on the front and back covers. Every cover has a flat background, so `npm run covers:cutouts` (`scripts/make-cover-cutouts.mjs`) makes a transparent copy of each illustration in `public/images/landing/cover-objects/`; a custom colour draws that colour with the cut-out on top, and the default (`auto`) uses the original image. Re-run the script after adding or changing a print cover. Customers reorder photos by dragging, drag a photo inside the page preview to choose its crop (stored as a 0–1 anchor and used for print), see a "Low res" badge on photos under 2400 px, and, when signed in, have photos uploaded in the background as they add them. They can sign in with Google or an emailed link (Supabase's built-in email, which is rate-limited; set up custom SMTP such as Resend before launch). Customers edit the opening, closing and back cover text on the Pages step, and the builder preview pages through all of them. Each page is drawn twice to the same 1800-unit grid: as HTML for the preview (`AlbumBuilder.tsx`) and on canvas for print (`album-pdf.ts`); change both together.

The print file does not include supplier-specific bleed, a complete back-cover/spine spread, or a press color profile. Before printing, review the original photos and prepare the cover and interior files to the chosen printer's exact specifications.

The source cover illustrations are 1024 × 1536 pixels. They should be recreated or upscaled from original artwork before final print production to avoid soft covers at 8 × 10 inches.

## Orders admin

The admin portal at `/admin` signs in with email and password at `/admin/login`, and is open to the accounts listed in `ADMIN_EMAIL`.

- **Overview (`/admin`):** revenue, orders, discounts given and paid-to-delivered time for the last 7, 30 or 90 days against the previous period; orders and revenue per day; the current work queue with overdue orders and unpaid checkouts; top destinations, codes used and recent activity.
- **Settings (`/admin/settings`):** album price, delivery fee in Accra and tax rate with its name, with a preview of what the customer pays. Discounts come off the album price; tax is charged on the album after discount plus delivery. New prices apply to checkouts from then on: each order stores its price, discount, delivery, tax and total, and a checkout already open in Paystack keeps its price.
- **Discounts (`/admin/discounts`):** codes for a percentage or a fixed GHS amount off, with optional start and end dates, a usage limit and a once-per-customer rule. Codes can be paused, and deleted while unused. A code and its amount can't change after creation. A code that covers the full price places the order without Paystack, with a `free-` payment reference. Uses count orders waiting for payment, so an abandoned checkout holds a use until it is cleared. Two customers using the last use of a limited code at the same moment can both succeed.

- **Orders (`/admin/orders`):** tabs by stage (To do, Waiting on customer, Printing, Out for delivery, Delivered, On hold, Cancelled, Awaiting payment, All), search by order number, name, email, phone or Paystack reference, paid-date filter, sorting, and an overdue flag when an order has sat in a stage too long (`STALE_AFTER_DAYS` in `src/lib/album-fulfilment.ts`). Selected orders can be moved forward together or exported as a print list CSV.
- **Order page:** next-step actions, print PDF (built on demand) and original photos with low-resolution warnings, customer and Accra address with call, WhatsApp and map links, rider and delivery date, Paystack check, and a timeline of status changes, notes and customer emails.
- **Statuses:** paid → in review → printing → ready → out for delivery → delivered. From review, the admin can ask for changes; the customer edits the album and resends it without paying again. Orders can be put on hold (they resume where they were) or cancelled. Moving back a step, holding and cancelling need a reason. The allowed moves live in `allowedMoves()` in `src/lib/album-fulfilment.ts`.
- **Refunds** happen in the Paystack dashboard. Cancel the order in the admin and record the refund in the reason.

### Customer updates

Customers follow their order at `/photobooks/{id}`. On payment, a change request, printing, out for delivery, delivered and cancelled, the app emails the customer through [Zend](https://tryzend.com). Email sign-in codes go out the same way. Settings:

- `ZEND_API_KEY`, with the `email:send` scope
- `EMAIL_FROM` (optional), defaults to `Itinero <hello@tryitinero.com>`. The domain must be verified in Zend under Email → Domains (SPF and DKIM records), or Zend refuses to send.

Without the key, or while the domain is unverified, order emails are skipped or fail and the order timeline says why (a failure also posts a Discord alert). Sign-in falls back to Supabase's own sign-in link email. Message text is in `src/lib/order-messages.ts`; the email design is in `src/lib/email.ts`.

WhatsApp updates are sent from the order page: **Send WhatsApp update** opens WhatsApp with the message for the current status, ready to send. Automatic WhatsApp messages need the WhatsApp Business Platform with approved message templates and are not set up.

### Discord alerts

Order alerts post to the existing `DISCORD_WEBHOOK_URL` webhook whenever their trigger happens, each linking to the order in the admin:

- New paid order, free order placed, checkout started
- Payment problem: Paystack reports a successful payment that doesn't match its order, so it isn't marked paid
- Customer sent changes, order cancelled, and every other status change
- Customer email failed, discount code used up, prices changed, and new album saved

Alerts are sent by `sendOrderAlert()` in `src/lib/order-alerts.ts`, which never interrupts the order flow if Discord is unreachable. A daily digest of overdue orders would need a scheduled job and isn't set up.
