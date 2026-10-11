alter table itinero.photobooks
    add column if not exists cover_typeface text not null default 'bold',
    add column if not exists cover_text_color text not null default 'auto';

alter table itinero.photobooks drop constraint if exists photobooks_cover_typeface_check;
alter table itinero.photobooks add constraint photobooks_cover_typeface_check
    check (cover_typeface in ('bold', 'serif', 'handwritten'));

alter table itinero.photobooks drop constraint if exists photobooks_cover_text_color_check;
alter table itinero.photobooks add constraint photobooks_cover_text_color_check
    check (cover_text_color = 'auto' or cover_text_color ~ '^#[0-9a-fA-F]{6}$');
