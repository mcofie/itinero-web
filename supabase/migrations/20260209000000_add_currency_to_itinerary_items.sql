-- Migration: Add cost_currency column to itinerary_items
-- Purpose: Store the currency code for each item's estimated cost
-- This enables proper currency conversion and future re-calculation

-- Add cost_currency column to itinerary_items
ALTER TABLE itinero.itinerary_items 
ADD COLUMN IF NOT EXISTS cost_currency TEXT;

-- Add comment for documentation
COMMENT ON COLUMN itinero.itinerary_items.cost_currency IS 'ISO 4217 currency code for est_cost (e.g., USD, EUR, GHS)';

-- Backfill existing rows with the trip's currency
-- This assumes existing costs are in the trip's currency
UPDATE itinero.itinerary_items ii
SET cost_currency = t.currency
FROM itinero.trips t
WHERE ii.trip_id = t.id
AND ii.cost_currency IS NULL
AND t.currency IS NOT NULL;

-- For any remaining nulls, default to USD
UPDATE itinero.itinerary_items
SET cost_currency = 'USD'
WHERE cost_currency IS NULL;

-- Set default for future rows
ALTER TABLE itinero.itinerary_items 
ALTER COLUMN cost_currency SET DEFAULT 'USD';
