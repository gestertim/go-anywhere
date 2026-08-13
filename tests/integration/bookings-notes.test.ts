import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { getBookedItems } from "@/features/bookings/selectors";
import { getNoteDraftState } from "@/features/notes/selectors";
import type { ItineraryItem } from "@/types/domain";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type TestUser = { id: string; email: string; password: string };

function createUserClient(user: TestUser): SupabaseClient {
  return createClient(supabaseUrl, anonKey!, { auth: { autoRefreshToken: false, persistSession: false, storageKey: `bookings-notes-${user.id}` } });
}

async function createTestUser(admin: SupabaseClient, label: string): Promise<TestUser> {
  const user = { email: `bookings-notes-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`, password: "local-bookings-notes-password-123" };
  const { data, error } = await admin.auth.admin.createUser({ ...user, email_confirm: true });
  if (error || !data.user) throw error ?? new Error("Booking/Note 測試帳號建立失敗");
  return { ...user, id: data.user.id };
}

const item = (id: string, hasBooking = false): ItineraryItem => ({
  id,
  tripId: "trip-1",
  type: "accommodation",
  title: id,
  date: "2026-10-01",
  startTime: null,
  endTime: null,
  place: null,
  notes: null,
  booking: hasBooking
    ? {
        id: `booking-${id}`,
        itineraryItemId: id,
        confirmationCode: "CODE",
        providerName: "旅宿",
        referenceUrl: null,
        details: null,
      }
    : null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("bookings and notes integration", () => {
  it("shows only existing booking-backed itinerary items and tracks note drafts", () => {
    expect(getBookedItems([item("one", true), item("two", false)]).map((item) => item.id)).toEqual(["one"]);
    expect(getBookedItems([item("two")])).toEqual([]);
    expect(getNoteDraftState("晚餐改到 20:00", "晚餐改到 19:30")).toEqual({ isEmpty: false, isDirty: true });
  });

  it.skipIf(!anonKey || !serviceRoleKey)("persists Booking and Note and hides them from another user", async () => {
    const admin = createClient(supabaseUrl, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } });
    const owner = await createTestUser(admin, "owner");
    const other = await createTestUser(admin, "other");
    try {
      const ownerClient = createUserClient(owner);
      const otherClient = createUserClient(other);
      expect((await ownerClient.auth.signInWithPassword({ email: owner.email, password: owner.password })).error).toBeNull();
      expect((await otherClient.auth.signInWithPassword({ email: other.email, password: other.password })).error).toBeNull();
      const { data: trip } = await ownerClient.from("trips").insert({ owner_id: owner.id, title: "Booking Note 測試", destination: "台北", start_date: "2026-10-01", end_date: "2026-10-02" }).select("id").single();
      const { data: itinerary } = await ownerClient.from("itinerary_items").insert({ trip_id: trip!.id, type: "accommodation", title: "測試住宿" }).select("id").single();
      const { data: booking, error: bookingError } = await ownerClient.from("bookings").insert({ itinerary_item_id: itinerary!.id, provider_name: "測試旅宿", confirmation_code: "SECRET-CODE" }).select("*").single();
      expect(bookingError).toBeNull();
      const { error: noteError } = await ownerClient.from("trip_notes").upsert({ trip_id: trip!.id, content: "私人筆記" });
      expect(noteError).toBeNull();
      const { data: reloadedBooking } = await ownerClient.from("bookings").select("*").eq("id", booking!.id).single();
      const { data: reloadedNote } = await ownerClient.from("trip_notes").select("*").eq("trip_id", trip!.id).single();
      expect(reloadedBooking).toMatchObject({ provider_name: "測試旅宿", confirmation_code: "SECRET-CODE" });
      expect(reloadedNote).toMatchObject({ content: "私人筆記" });
      expect((await ownerClient.from("bookings").update({ provider_name: "更新後旅宿" }).eq("id", booking!.id)).error).toBeNull();
      expect((await ownerClient.from("trip_notes").update({ content: "更新後私人筆記" }).eq("trip_id", trip!.id)).error).toBeNull();
      const { data: updatedBooking } = await ownerClient.from("bookings").select("provider_name").eq("id", booking!.id).single();
      const { data: updatedNote } = await ownerClient.from("trip_notes").select("content").eq("trip_id", trip!.id).single();
      expect(updatedBooking?.provider_name).toBe("更新後旅宿");
      expect(updatedNote?.content).toBe("更新後私人筆記");
      const { data: hiddenBooking } = await otherClient.from("bookings").select("id").eq("id", booking!.id).maybeSingle();
      const { data: hiddenNote } = await otherClient.from("trip_notes").select("id").eq("trip_id", trip!.id).maybeSingle();
      expect(hiddenBooking).toBeNull();
      expect(hiddenNote).toBeNull();
    } finally {
      await admin.auth.admin.deleteUser(owner.id);
      await admin.auth.admin.deleteUser(other.id);
    }
  });
});