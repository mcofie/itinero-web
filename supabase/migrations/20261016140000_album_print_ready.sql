-- Photo positioning, printer-ready files and print settings. Idempotent.

-- Where each photo is anchored when cropped into its frame: 0 = left/top, 0.5 = centre, 1 = right/bottom.
alter table itinero.photobook_images
    add column if not exists focus_x numeric(4, 3) not null default 0.5 check (focus_x between 0 and 1),
    add column if not exists focus_y numeric(4, 3) not null default 0.5 check (focus_y between 0 and 1);

-- The printer-ready cover spread; pdf_path holds the interior pages.
alter table itinero.photobooks
    add column if not exists cover_pdf_path text;

-- Printer specification, in millimetres. Defaults suit a typical case-bound hardcover until a printer is chosen.
alter table itinero.album_settings
    add column if not exists print_spec jsonb not null default
        '{"interiorBleedMm": 3, "coverWrapMm": 15, "spineBaseMm": 4, "spinePerPageMm": 0.1}'::jsonb;
