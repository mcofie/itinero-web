-- Customer-chosen cover colour: 'auto' keeps the illustration's own background. Idempotent.
alter table itinero.photobooks
    add column if not exists cover_color text not null default 'auto';

alter table itinero.photobooks drop constraint if exists photobooks_cover_color_check;
alter table itinero.photobooks add constraint photobooks_cover_color_check
    check (cover_color = 'auto' or cover_color ~ '^#[0-9a-fA-F]{6}$');
