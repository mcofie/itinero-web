-- Fix missing relationship between profiles and trips to allow PostgREST joins
-- This is required for the "trips(count)" select in the creators page.

ALTER TABLE itinero.trips
DROP CONSTRAINT IF EXISTS trips_user_id_fkey;

ALTER TABLE itinero.trips
ADD CONSTRAINT trips_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES itinero.profiles(id)
ON DELETE CASCADE;

-- Also ensure points_ledger has a relationship to profiles if not already there
ALTER TABLE itinero.points_ledger
DROP CONSTRAINT IF EXISTS points_ledger_user_id_fkey;

ALTER TABLE itinero.points_ledger
ADD CONSTRAINT points_ledger_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES itinero.profiles(id)
ON DELETE CASCADE;
