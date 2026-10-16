-- Create photobooks table
create table if not exists itinero.photobooks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    title text not null default 'My Travel Photo Book',
    cover_template_id text not null default 'classic',
    status text not null default 'draft' check (status in ('draft', 'pending_payment', 'paid', 'processing', 'shipped')),
    total_cost numeric(10, 2) default 0.00,
    currency text default 'GHS',
    shipping_address jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create photobook_images table
create table if not exists itinero.photobook_images (
    id uuid primary key default gen_random_uuid(),
    photobook_id uuid references itinero.photobooks on delete cascade not null,
    storage_path text not null,
    order_index int not null default 0,
    caption text,
    created_at timestamptz default now()
);

-- Add RLS
alter table itinero.photobooks enable row level security;
alter table itinero.photobook_images enable row level security;

create policy "Users can view their own photobooks"
    on itinero.photobooks for select
    using (auth.uid() = user_id);

create policy "Users can insert their own photobooks"
    on itinero.photobooks for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own photobooks"
    on itinero.photobooks for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own photobooks"
    on itinero.photobooks for delete
    using (auth.uid() = user_id);

-- Images policies
create policy "Users can view images of their photobooks"
    on itinero.photobook_images for select
    using (exists (
        select 1 from itinero.photobooks
        where photobooks.id = photobook_images.photobook_id
        and photobooks.user_id = auth.uid()
    ));

create policy "Users can insert images to their photobooks"
    on itinero.photobook_images for insert
    with check (exists (
        select 1 from itinero.photobooks
        where photobooks.id = photobook_images.photobook_id
        and photobooks.user_id = auth.uid()
    ));

create policy "Users can update images of their photobooks"
    on itinero.photobook_images for update
    using (exists (
        select 1 from itinero.photobooks
        where photobooks.id = photobook_images.photobook_id
        and photobooks.user_id = auth.uid()
    ));

create policy "Users can delete images of their photobooks"
    on itinero.photobook_images for delete
    using (exists (
        select 1 from itinero.photobooks
        where photobooks.id = photobook_images.photobook_id
        and photobooks.user_id = auth.uid()
    ));

-- Create photobooks storage bucket
insert into storage.buckets (id, name, public) 
values ('photobooks', 'photobooks', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload their own photobook images"
on storage.objects for insert
with check (
    bucket_id = 'photobooks' 
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can view their own photobook images"
on storage.objects for select
using (
    bucket_id = 'photobooks' 
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own photobook images"
on storage.objects for update
using (
    bucket_id = 'photobooks' 
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own photobook images"
on storage.objects for delete
using (
    bucket_id = 'photobooks' 
    and (storage.foldername(name))[1] = auth.uid()::text
);
