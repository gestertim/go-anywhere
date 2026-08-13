create type public.itinerary_type as enum (
  'flight', 'accommodation', 'transportation', 'attraction', 'restaurant', 'other'
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  destination text not null check (char_length(trim(destination)) between 1 and 120),
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_date_range check (end_date >= start_date)
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text,
  address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  constraint places_coordinate_pair check ((latitude is null and longitude is null) or (latitude is not null and longitude is not null)),
  constraint places_latitude_range check (latitude is null or latitude between -90 and 90),
  constraint places_longitude_range check (longitude is null or longitude between -180 and 180)
);

create table public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  type public.itinerary_type not null,
  title text,
  date date,
  start_time time,
  end_time time,
  place_id uuid references public.places(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint itinerary_time_range check (start_time is null or end_time is null or end_time >= start_time)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  itinerary_item_id uuid not null unique references public.itinerary_items(id) on delete cascade,
  confirmation_code text,
  provider_name text,
  reference_url text,
  details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trip_notes (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null unique references public.trips(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index itinerary_items_trip_date_time_idx on public.itinerary_items (trip_id, date, start_time, end_time, created_at, id);
create index places_trip_idx on public.places (trip_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.trips, public.places, public.itinerary_items, public.bookings, public.trip_notes to anon, authenticated, service_role;

alter table public.trips enable row level security;
alter table public.places enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.bookings enable row level security;
alter table public.trip_notes enable row level security;

create policy "owners manage trips" on public.trips for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners manage places" on public.places for all using (exists (select 1 from public.trips where trips.id = places.trip_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.trips where trips.id = places.trip_id and trips.owner_id = auth.uid()));
create policy "owners manage itinerary" on public.itinerary_items for all using (exists (select 1 from public.trips where trips.id = itinerary_items.trip_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.trips where trips.id = itinerary_items.trip_id and trips.owner_id = auth.uid()));
create policy "owners manage bookings" on public.bookings for all using (exists (select 1 from public.itinerary_items join public.trips on trips.id = itinerary_items.trip_id where itinerary_items.id = bookings.itinerary_item_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.itinerary_items join public.trips on trips.id = itinerary_items.trip_id where itinerary_items.id = bookings.itinerary_item_id and trips.owner_id = auth.uid()));
create policy "owners manage notes" on public.trip_notes for all using (exists (select 1 from public.trips where trips.id = trip_notes.trip_id and trips.owner_id = auth.uid())) with check (exists (select 1 from public.trips where trips.id = trip_notes.trip_id and trips.owner_id = auth.uid()));
