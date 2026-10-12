-- Discount codes for album orders. Apply after 20261012120000_album_fulfilment.sql. Idempotent.
-- Codes are managed in the orders admin and checked by the checkout route with
-- the service role; customers have no direct access.

create table if not exists itinero.album_discounts (
    id uuid primary key default gen_random_uuid(),
    code text not null,
    description text,
    kind text not null check (kind in ('percent', 'fixed')),
    value numeric(10, 2) not null check (value > 0),
    starts_at timestamptz,
    ends_at timestamptz,
    max_uses integer check (max_uses is null or max_uses > 0),
    once_per_customer boolean not null default true,
    active boolean not null default true,
    created_by text,
    created_at timestamptz not null default now(),
    constraint album_discounts_percent_range check (kind <> 'percent' or value <= 100),
    constraint album_discounts_code_format check (code ~ '^[A-Z0-9-]{3,24}$')
);
create unique index if not exists album_discounts_code_unique on itinero.album_discounts(code);
alter table itinero.album_discounts enable row level security;

-- `total_cost` stays the amount charged; `subtotal` is the price before discount.
alter table itinero.photobooks
    add column if not exists subtotal numeric(10, 2),
    add column if not exists discount_id uuid references itinero.album_discounts on delete set null,
    add column if not exists discount_code text,
    add column if not exists discount_amount numeric(10, 2) not null default 0;

update itinero.photobooks set subtotal = total_cost where subtotal is null;
create index if not exists photobooks_discount_idx on itinero.photobooks(discount_id) where discount_id is not null;
create index if not exists photobooks_paid_at_idx on itinero.photobooks(paid_at) where paid_at is not null;
