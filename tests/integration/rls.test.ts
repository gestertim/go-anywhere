import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const canRun = Boolean(anonKey && serviceRoleKey);

type TestUser = { id: string; email: string; password: string };

function userClient(user: TestUser): SupabaseClient {
  return createClient(supabaseUrl, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false, storageKey: `rls-${user.id}` },
  });
}

async function createTestUser(admin: SupabaseClient, label: string): Promise<TestUser> {
  const user = {
    email: `rls-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`,
    password: "local-rls-test-password-123",
  };
  const { data, error } = await admin.auth.admin.createUser({ ...user, email_confirm: true });
  if (error || !data.user) throw error ?? new Error("Test user was not created");
  return { ...user, id: data.user.id };
}

describe.skipIf(!canRun)("Supabase RLS", () => {
  it("restricts all private tables to the authenticated owner", async () => {
    const admin = createClient(supabaseUrl, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } });
    const owner = await createTestUser(admin, "owner");
    const other = await createTestUser(admin, "other");

    try {
      const ownerClient = userClient(owner);
      const otherClient = userClient(other);
      await ownerClient.auth.signInWithPassword({ email: owner.email, password: owner.password });
      await otherClient.auth.signInWithPassword({ email: other.email, password: other.password });

      const { data: trip, error: tripError } = await ownerClient
        .from("trips")
        .insert({ owner_id: owner.id, title: "RLS 測試旅程", destination: "台北", start_date: "2026-08-13", end_date: "2026-08-14" })
        .select("id")
        .single();
      expect(tripError).toBeNull();
      expect(trip?.id).toBeTruthy();

      const tripId = trip!.id;
      const { data: hiddenTrip } = await otherClient.from("trips").select("id").eq("id", tripId).maybeSingle();
      expect(hiddenTrip).toBeNull();

      const { data: place, error: placeError } = await ownerClient
        .from("places")
        .insert({ trip_id: tripId, name: "測試地點", latitude: 25.03, longitude: 121.56 })
        .select("id")
        .single();
      expect(placeError).toBeNull();

      const { data: item, error: itemError } = await ownerClient
        .from("itinerary_items")
        .insert({ trip_id: tripId, type: "attraction", title: "測試景點", date: "2026-08-13", place_id: place!.id })
        .select("id")
        .single();
      expect(itemError).toBeNull();

      const { data: booking, error: bookingError } = await ownerClient
        .from("bookings")
        .insert({ itinerary_item_id: item!.id, provider_name: "測試供應商" })
        .select("id")
        .single();
      expect(bookingError).toBeNull();

      const { data: note, error: noteError } = await ownerClient
        .from("trip_notes")
        .insert({ trip_id: tripId, content: "私人筆記" })
        .select("id")
        .single();
      expect(noteError).toBeNull();

      for (const [table, id] of [
        ["places", place!.id],
        ["itinerary_items", item!.id],
        ["bookings", booking!.id],
        ["trip_notes", note!.id],
      ] as const) {
        const { data } = await otherClient.from(table).select("id").eq("id", id).maybeSingle();
        expect(data, `${table} should be hidden from another user`).toBeNull();
      }

      const { error: otherInsertError } = await otherClient
        .from("trips")
        .insert({ owner_id: owner.id, title: "冒用旅程", destination: "不可見", start_date: "2026-08-13", end_date: "2026-08-14" });
      expect(otherInsertError).not.toBeNull();
    } finally {
      await admin.auth.admin.deleteUser(owner.id);
      await admin.auth.admin.deleteUser(other.id);
    }
  });
});
