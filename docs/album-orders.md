# Album ordering

The customer flow uses a standard 8 × 10 inch portrait hardcover album. The price is a flat GHS 800, including delivery within Accra. Customers sign in with Google, save up to 40 original photos to their private album, review an 8 × 10 inch PDF, enter an Accra address, and pay through Paystack. The admin order view provides the PDF, original photos, delivery details, and printing/shipped status controls.

## Production configuration

- Google is enabled in Supabase Auth. The redirect allow list includes local development and `https://tryitinero.com/auth/callback` (also `www`).
- The SQL in `supabase/migrations/20261011_album_orders.sql` was applied to the linked production Supabase project on 2026-10-11 through the SQL editor. It makes the `photobooks` bucket private and adds order fields. The migration is idempotent for subsequent CLI use.
- `supabase/migrations/20261011183500_album_cover_style.sql` adds the cover typeface and font color fields. Apply it before deploying the cover style UI. Existing albums default to the original bold typeface and automatic contrast color. This migration has not yet been applied to the linked production project.
- A pending order keeps its original Paystack checkout URL and reference, so returning to payment does not create another unmatched charge.
- Storage policies allow a customer to write files only while the album is a draft. Submitted originals and the PDF proof remain fixed for print review.
- The app needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, and `ADMIN_EMAIL` in its deployment environment. Do not expose the service-role or Paystack secret to the browser.
- Paystack should deliver `charge.success` webhooks to `/api/paystack/webhook`. The existing points flow and the album flow share this endpoint.
- The application changes are in this local checkout and still need deployment with those environment variables. Supabase schema and Google redirect changes are already live.

## Print handoff

The customer PDF is a high-resolution **proof**, with 8 × 10 inch pages at 300 pixels per inch. It does not include supplier-specific bleed, a complete back-cover/spine spread, or a press color profile. Before printing, review the original photos and prepare the cover and interior files to the chosen printer's exact specifications. The admin view links to both the PDF and each original photo.

The source cover illustrations are 1024 × 1536 pixels. They should be recreated or upscaled from original artwork before final print production to avoid soft covers at 8 × 10 inches.
