-- Order fulfilment for the orders admin: readable order numbers, the full
-- fulfilment status set, delivery details, and an order timeline.
-- Apply after 20261011183500_album_cover_style.sql. Idempotent.

create sequence if not exists itinero.photobook_order_number_seq start 1001;

alter table itinero.photobooks
    add column if not exists order_number bigint,
    add column if not exists customer_email text,
    add column if not exists customer_name text,
    add column if not exists paid_at timestamptz,
    add column if not exists status_changed_at timestamptz,
    add column if not exists held_from_status text,
    add column if not exists customer_message text,
    add column if not exists courier_name text,
    add column if not exists courier_phone text,
    add column if not exists delivery_date date,
    add column if not exists delivered_at timestamptz;

create unique index if not exists photobooks_order_number_unique
    on itinero.photobooks(order_number) where order_number is not null;

-- Rename the old fulfilment statuses before tightening the constraint.
alter table itinero.photobooks drop constraint if exists photobooks_status_check;
update itinero.photobooks set status = 'printing' where status = 'processing';
update itinero.photobooks set status = 'out_for_delivery' where status = 'shipped';
alter table itinero.photobooks add constraint photobooks_status_check
    check (status in ('draft', 'quote_requested', 'pending_payment', 'paid', 'in_review', 'changes_requested',
        'printing', 'ready', 'out_for_delivery', 'delivered', 'on_hold', 'cancelled'));

-- Snapshot customer details so orders can be searched without auth lookups.
update itinero.photobooks p
set customer_email = coalesce(p.customer_email, u.email),
    customer_name = coalesce(p.customer_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', p.shipping_address->>'fullName')
from auth.users u
where u.id = p.user_id and p.status <> 'draft';

update itinero.photobooks
set status_changed_at = coalesce(status_changed_at, updated_at, created_at),
    paid_at = case when status not in ('draft', 'quote_requested', 'pending_payment')
        then coalesce(paid_at, submitted_at, updated_at) else paid_at end;

-- Number existing placed orders in the order they were paid.
with numbered as (
    select id from itinero.photobooks
    where order_number is null and status not in ('draft', 'quote_requested', 'pending_payment')
    order by coalesce(paid_at, created_at)
)
update itinero.photobooks p set order_number = nextval('itinero.photobook_order_number_seq')
from numbered where p.id = numbered.id;

-- New orders get a number the moment they are paid.
create or replace function itinero.assign_photobook_order_number() returns trigger
language plpgsql as $$
begin
    if new.status = 'paid' and new.order_number is null then
        new.order_number := nextval('itinero.photobook_order_number_seq');
    end if;
    return new;
end;
$$;

drop trigger if exists photobooks_assign_order_number on itinero.photobooks;
create trigger photobooks_assign_order_number
    before insert or update of status on itinero.photobooks
    for each row execute function itinero.assign_photobook_order_number();

-- Timeline of status changes, internal notes and customer notifications.
-- Server routes write and read it with the service role; customers see only
-- status entries, through the order page.
create table if not exists itinero.photobook_order_events (
    id uuid primary key default gen_random_uuid(),
    photobook_id uuid not null references itinero.photobooks on delete cascade,
    kind text not null check (kind in ('status', 'note', 'notification', 'delivery')),
    from_status text,
    to_status text,
    message text,
    actor text not null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);
create index if not exists photobook_order_events_photobook_idx
    on itinero.photobook_order_events(photobook_id, created_at);
alter table itinero.photobook_order_events enable row level security;

create index if not exists photobooks_status_changed_idx on itinero.photobooks(status, status_changed_at);

-- Customers may edit files while a draft, or when changes were requested.
drop policy if exists "Users can upload draft photobook files" on storage.objects;
drop policy if exists "Users can update draft photobook files" on storage.objects;
drop policy if exists "Users can delete draft photobook files" on storage.objects;

create policy "Users can upload draft photobook files" on storage.objects for insert
with check (
    bucket_id = 'photobooks'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
        select 1 from itinero.photobooks
        where photobooks.id::text = (storage.foldername(name))[2]
          and photobooks.status not in ('draft', 'changes_requested')
    )
);
create policy "Users can update draft photobook files" on storage.objects for update
using (
    bucket_id = 'photobooks'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
        select 1 from itinero.photobooks
        where photobooks.id::text = (storage.foldername(name))[2]
          and photobooks.status not in ('draft', 'changes_requested')
    )
)
with check (
    bucket_id = 'photobooks'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
        select 1 from itinero.photobooks
        where photobooks.id::text = (storage.foldername(name))[2]
          and photobooks.status not in ('draft', 'changes_requested')
    )
);
create policy "Users can delete draft photobook files" on storage.objects for delete
using (
    bucket_id = 'photobooks'
    and (storage.foldername(name))[1] = auth.uid()::text
    and not exists (
        select 1 from itinero.photobooks
        where photobooks.id::text = (storage.foldername(name))[2]
          and photobooks.status not in ('draft', 'changes_requested')
    )
);
