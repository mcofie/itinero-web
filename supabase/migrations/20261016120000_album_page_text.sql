-- Customer text for the opening page, closing page and back cover:
-- { "openingTitle", "openingNote", "closingNote", "backNote" }. Idempotent.
alter table itinero.photobooks
    add column if not exists page_text jsonb not null default '{}'::jsonb;
