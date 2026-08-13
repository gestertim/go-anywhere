import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type TestUser = { id: string; email: string; password: string };

function createUserClient(user: TestUser): SupabaseClient {
  return createClient(supabaseUrl, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false, storageKey: `itinerary-crud-${user.id}` },
  });
}

async function createTestUser(admin: SupabaseClient): Promise<TestUser> {
  const user = {
    email: `itinerary-crud-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`,
    password: "local-itinerary-crud-password-123",
  };
  const { data, error } = await admin.auth.admin.createUser({ ...user, email_confirm: true });
  if (error || !data.user) throw error ?? new Error("行程測試帳號建立失敗");
  return { ...user, id: data.user.id };
}

describe.skipIf(!anonKey || !serviceRoleKey)("Itinerary CRUD integration", () => {
  it("persists partial items, Place and Booking relations, updates, and deletion", async () => {
    const admin = createClient(supabaseUrl, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } });
    const user = await createTestUser(admin);

    try {
      const client = createUserClient(user);
      const { error: signInError } = await client.auth.signInWithPassword({ email: user.email, password: user.password });
      expect(signInError).toBeNull();

      const { data: trip, error: tripError } = await client
        .from("trips")
        .insert({ owner_id: user.id, title: "行程關聯測試", destination: "台南", start_date: "2026-12-01", end_date: "2026-12-03" })
        .select("id")
        .single();
      expect(tripError).toBeNull();

      const { data: partialItem, error: partialError } = await client
        .from("itinerary_items")
        .insert({ trip_id: trip!.id, type: "attraction" })
        .select("*")
        .single();
      expect(partialError).toBeNull();
      expect(partialItem?.title).toBeNull();
      expect(partialItem?.date).toBeNull();

      const { data: place, error: placeError } = await client
        .from("places")
        .insert({ trip_id: trip!.id, name: "赤崁樓", address: "台南市中西區", latitude: 22.997, longitude: 120.202 })
        .select("id")
        .single();
      expect(placeError).toBeNull();

      const { error: updateError } = await client
        .from("itinerary_items")
        .update({ title: "赤崁樓參觀", date: "2026-12-01", start_time: "09:00", end_time: "11:00", notes: "記得帶水", place_id: place!.id })
        .eq("id", partialItem!.id);
      expect(updateError).toBeNull();

      const { data: booking, error: bookingError } = await client
        .from("bookings")
        .insert({ itinerary_item_id: partialItem!.id, provider_name: "測試導覽", confirmation_code: "T-123" })
        .select("id")
        .single();
      expect(bookingError).toBeNull();

      const { data: reloaded, error: reloadError } = await client
        .from("itinerary_items")
        .select("*, place:places(*), booking:bookings(*)")
        .eq("id", partialItem!.id)
        .single();
      expect(reloadError).toBeNull();
      expect(reloaded?.title).toBe("赤崁樓參觀");
      expect(reloaded?.place).toMatchObject({ name: "赤崁樓", latitude: 22.997 });
      expect(reloaded?.booking).toMatchObject({ provider_name: "測試導覽", confirmation_code: "T-123" });

      const { error: deleteError } = await client.from("itinerary_items").delete().eq("id", partialItem!.id);
      expect(deleteError).toBeNull();

      const { data: deletedItem } = await client.from("itinerary_items").select("id").eq("id", partialItem!.id).maybeSingle();
      const { data: deletedBooking } = await client.from("bookings").select("id").eq("id", booking!.id).maybeSingle();
      expect(deletedItem).toBeNull();
      expect(deletedBooking).toBeNull();
    } finally {
      await admin.auth.admin.deleteUser(user.id);
    }
  });
});