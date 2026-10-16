-- Optimizations for itinero schema
-- Target: Foreign keys, common WHERE/ORDER BY patterns

-- 1. Foreign Key Indexes (Postgres doesn't do these by default)
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON itinero.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_destination_id ON itinero.trips(destination_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_trip_id ON itinero.itinerary_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_media_place_id ON itinero.media(place_id);
CREATE INDEX IF NOT EXISTS idx_destination_history_dest_id ON itinero.destination_history(destination_id);
CREATE INDEX IF NOT EXISTS idx_places_destination_id ON itinero.places(destination_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_item_alternatives_item_id ON itinero.itinerary_item_alternatives(item_id);

-- 2. Composite Indexes for specific page patterns
-- Trip Details Page: Items ordered by date and index
CREATE INDEX IF NOT EXISTS idx_itinerary_items_ordered 
ON itinero.itinerary_items (trip_id, date, order_index);

-- Trip List / Dashboard: User's trips ordered by creation date
CREATE INDEX IF NOT EXISTS idx_trips_user_created 
ON itinero.trips (user_id, created_at DESC);

-- 3. Search Optimizations
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_destinations_name_trgm ON itinero.destinations USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_places_name_trgm ON itinero.places USING gin (name gin_trgm_ops);

-- 4. JSONB Indexing
CREATE INDEX IF NOT EXISTS idx_trips_inputs_gin ON itinero.trips USING gin (inputs);
