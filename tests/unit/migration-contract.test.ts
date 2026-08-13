import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/202608130001_initial.sql"), "utf8");

describe("database migration contract", () => {
  it("defines the five private domain tables", () => {
    for (const table of ["trips", "places", "itinerary_items", "bookings", "trip_notes"]) {
      expect(migration).toContain(`create table public.${table}`);
    }
  });

  it("defines itinerary ordering fields and owner policies", () => {
    expect(migration).toContain("start_time time");
    expect(migration).toContain("end_time time");
    expect(migration).toContain("itinerary_items_trip_date_time_idx");
    expect(migration.match(/enable row level security/g)).toHaveLength(5);
    expect(migration.match(/create policy/g)).toHaveLength(5);
    expect(migration).toContain("grant select, insert, update, delete on public.trips, public.places, public.itinerary_items, public.bookings, public.trip_notes to anon, authenticated, service_role;");
  });
});
