
create table if not exists itinero.tour_guide_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  country text not null,
  city text not null,
  available_times text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table itinero.tour_guide_requests enable row level security;

create policy "Users can insert their own requests"
  on itinero.tour_guide_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own requests"
  on itinero.tour_guide_requests for select
  using (auth.uid() = user_id);
  
-- Allow admins (service_role) full access implicitly, but if we have an admin role check we can add it.
-- For now, user specific RLS is enough for the user side. Admin dashboard usually bypasses RLS or has specific policies.
