-- Admin-managed album pricing and Discord alert switches, plus the full price
-- breakdown on each order. Apply after 20261012130000_album_discounts.sql. Idempotent.

create table if not exists itinero.album_settings (
    id integer primary key default 1 check (id = 1),
    album_price numeric(10, 2) not null default 800 check (album_price > 0),
    delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
    tax_rate numeric(5, 2) not null default 0 check (tax_rate >= 0 and tax_rate <= 50),
    tax_label text not null default 'VAT',
    discord_alerts jsonb not null default '{}'::jsonb,
    updated_by text,
    updated_at timestamptz not null default now()
);
insert into itinero.album_settings (id) values (1) on conflict (id) do nothing;
alter table itinero.album_settings enable row level security;

-- `subtotal` is the album price; tax applies to price − discount + delivery.
alter table itinero.photobooks
    add column if not exists delivery_fee numeric(10, 2) not null default 0,
    add column if not exists tax_rate numeric(5, 2) not null default 0,
    add column if not exists tax_amount numeric(10, 2) not null default 0;
