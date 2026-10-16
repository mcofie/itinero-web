-- Album drafts and orders are written by authenticated server routes. Customers
-- retain read access to their own rows; photos live in a private bucket.
alter table itinero.photobooks
    add column if not exists destination_id text,
    add column if not exists album_year text,
    add column if not exists layout text default 'editorial',
    add column if not exists page_count integer default 0,
    add column if not exists pdf_path text,
    add column if not exists payment_reference text,
    add column if not exists payment_url text,
    add column if not exists quoted_at timestamptz,
    add column if not exists submitted_at timestamptz;

alter table itinero.photobooks drop constraint if exists photobooks_status_check;
alter table itinero.photobooks add constraint photobooks_status_check
    check (status in ('draft', 'quote_requested', 'pending_payment', 'paid', 'processing', 'shipped'));
create unique index if not exists photobooks_payment_reference_unique
    on itinero.photobooks(payment_reference) where payment_reference is not null;

alter table itinero.photobook_images
    add column if not exists original_name text,
    add column if not exists width integer,
    add column if not exists height integer;

drop policy if exists "Users can insert their own photobooks" on itinero.photobooks;
drop policy if exists "Users can update their own photobooks" on itinero.photobooks;
drop policy if exists "Users can delete their own photobooks" on itinero.photobooks;
drop policy if exists "Users can insert images to their photobooks" on itinero.photobook_images;
drop policy if exists "Users can update images of their photobooks" on itinero.photobook_images;
drop policy if exists "Users can delete images of their photobooks" on itinero.photobook_images;

update storage.buckets set public = false where id = 'photobooks';

-- Keep submitted originals and proofs immutable. Draft uploads can precede the
-- album row, so reject writes only when that album has left draft status.
drop policy if exists "Users can upload their own photobook images" on storage.objects;
drop policy if exists "Users can update their own photobook images" on storage.objects;
drop policy if exists "Users can delete their own photobook images" on storage.objects;

create policy "Users can upload draft photobook files" on storage.objects for insert
with check (
    bucket_id = 'photobooks'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
        select 1 from itinero.photobooks
        where photobooks.id::text = (storage.foldername(name))[2]
          and photobooks.status <> 'draft'
    )
);
create policy "Users can update draft photobook files" on storage.objects for update
using (
    bucket_id = 'photobooks'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
        select 1 from itinero.photobooks
        where photobooks.id::text = (storage.foldername(name))[2]
          and photobooks.status <> 'draft'
    )
)
with check (
    bucket_id = 'photobooks'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
        select 1 from itinero.photobooks
        where photobooks.id::text = (storage.foldername(name))[2]
          and photobooks.status <> 'draft'
    )
);
create policy "Users can delete draft photobook files" on storage.objects for delete
using (
    bucket_id = 'photobooks'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
        select 1 from itinero.photobooks
        where photobooks.id::text = (storage.foldername(name))[2]
          and photobooks.status <> 'draft'
    )
);
