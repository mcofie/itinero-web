-- Marking an order paid assigns its order number from itinero.photobook_order_number_seq through a trigger.
-- The sequence was created without privileges for the app's roles, so the trigger failed and the payment
-- update rolled back. Grant the roles access, and run the trigger as its owner. Idempotent.
grant usage, select, update on sequence itinero.photobook_order_number_seq to service_role;

create or replace function itinero.assign_photobook_order_number() returns trigger
language plpgsql
security definer
set search_path = itinero, pg_temp
as $$
begin
    if new.status = 'paid' and new.order_number is null then
        new.order_number := nextval('itinero.photobook_order_number_seq');
    end if;
    return new;
end;
$$;
