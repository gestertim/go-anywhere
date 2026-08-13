"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createItineraryItemSchema } from "@/features/itinerary/schemas";

export type ItineraryActionState = { error?: string };

type Table = { insert: (values: Record<string, unknown>) => { select: (columns: string) => { single: () => Promise<{ data: Record<string, unknown> | null; error: unknown }> } }; update: (values: Record<string, unknown>) => { eq: (column: string, value: string) => Promise<{ error: unknown }> }; delete: () => { eq: (column: string, value: string) => Promise<{ error: unknown }> } };
type UpsertTable = { upsert: (values: Record<string, unknown>) => Promise<{ error: unknown }> };

function readPlace(formData: FormData) {
  return {
    name: formData.get("placeName") || null,
    address: formData.get("address") || null,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
  };
}

function readBooking(formData: FormData) {
  return {
    providerName: formData.get("providerName") || null,
    confirmationCode: formData.get("confirmationCode") || null,
    referenceUrl: formData.get("referenceUrl") || null,
    details: formData.get("bookingDetails") || null,
  };
}

export async function createItineraryAction(_previous: ItineraryActionState, formData: FormData): Promise<ItineraryActionState> {
  const parsed = createItineraryItemSchema.safeParse({
    type: formData.get("type"), title: formData.get("title") || null, date: formData.get("date") || null,
    startTime: formData.get("startTime") || null, endTime: formData.get("endTime") || null,
    place: readPlace(formData),
    notes: formData.get("notes") || null,
  });
  const tripId = String(formData.get("tripId") ?? "");
  if (!parsed.success || !tripId) return { error: parsed.error?.issues[0]?.message ?? "請檢查行程資料。" };
  const supabase = await createSupabaseServerClient();
  const places = supabase.from("places") as unknown as Table;
  const items = supabase.from("itinerary_items") as unknown as Table;
  const result = await items.insert({ trip_id: tripId, type: parsed.data.type, title: parsed.data.title ?? null, date: parsed.data.date ?? null, start_time: parsed.data.startTime ?? null, end_time: parsed.data.endTime ?? null, place_id: null, notes: parsed.data.notes ?? null }).select("id").single();
  if (result.error || !result.data) return { error: "儲存失敗，你的輸入內容仍保留。" };
  const itemId = String(result.data.id);
  if (parsed.data.place && (parsed.data.place.name || parsed.data.place.address || parsed.data.place.latitude != null)) {
    const placeResult = await places.insert({ trip_id: tripId, name: parsed.data.place.name ?? null, address: parsed.data.place.address ?? null, latitude: parsed.data.place.latitude ?? null, longitude: parsed.data.place.longitude ?? null }).select("id").single();
    if (placeResult.error || !placeResult.data) return { error: "地點儲存失敗，你的行程已保留，可稍後補上地點。" };
    const placeId = String(placeResult.data.id);
    const updateResult = await items.update({ place_id: placeId }).eq("id", itemId);
    if (updateResult.error) return { error: "地點關聯失敗，你的行程已保留，可稍後補上地點。" };
  }
  const booking = readBooking(formData);
  if (booking.providerName || booking.confirmationCode || booking.referenceUrl || booking.details) {
    const bookings = supabase.from("bookings") as unknown as Table;
    const bookingResult = await bookings.insert({ itinerary_item_id: itemId, provider_name: booking.providerName, confirmation_code: booking.confirmationCode, reference_url: booking.referenceUrl, details: booking.details }).select("id").single();
    if (bookingResult.error) return { error: "預訂資訊儲存失敗，你的輸入內容仍保留。" };
  }
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

export async function deleteItineraryAction(itemId: string, tripId: string) {
  const supabase = await createSupabaseServerClient();
  const items = supabase.from("itinerary_items") as unknown as Table;
  await items.delete().eq("id", itemId);
  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}

export async function updateItineraryAction(_previous: ItineraryActionState, formData: FormData): Promise<ItineraryActionState> {
  const itemId = String(formData.get("itemId") ?? "");
  const tripId = String(formData.get("tripId") ?? "");
  const parsed = createItineraryItemSchema.safeParse({
    type: "other",
    title: formData.get("title") || null,
    date: formData.get("date") || null,
    startTime: formData.get("startTime") || null,
    endTime: formData.get("endTime") || null,
    place: readPlace(formData),
    notes: formData.get("notes") || null,
  });
  if (!parsed.success || !itemId || !tripId) return { error: parsed.error?.issues[0]?.message ?? "請檢查行程資料。" };
  const supabase = await createSupabaseServerClient();
  const place = parsed.data.place;
  const places = supabase.from("places") as unknown as Table;
  const current = await getCurrentPlaceId(itemId, supabase);
  let placeId = current;
  if (place && (place.name || place.address || place.latitude != null)) {
    if (current) {
      const placeResult = await places.update({ name: place.name ?? null, address: place.address ?? null, latitude: place.latitude ?? null, longitude: place.longitude ?? null }).eq("id", current);
      if (placeResult.error) return { error: "地點儲存失敗，你的輸入內容仍保留。" };
    } else {
      const placeResult = await places.insert({ trip_id: tripId, name: place.name ?? null, address: place.address ?? null, latitude: place.latitude ?? null, longitude: place.longitude ?? null }).select("id").single();
      if (placeResult.error || !placeResult.data) return { error: "地點儲存失敗，你的輸入內容仍保留。" };
      placeId = String(placeResult.data.id);
    }
  }
  const items = supabase.from("itinerary_items") as unknown as Table;
  const { error } = await items.update({ title: parsed.data.title ?? null, date: parsed.data.date ?? null, start_time: parsed.data.startTime ?? null, end_time: parsed.data.endTime ?? null, place_id: placeId, notes: parsed.data.notes ?? null }).eq("id", itemId);
  if (error) return { error: "儲存失敗，你的輸入內容仍保留。" };
  const booking = readBooking(formData);
  if (booking.providerName || booking.confirmationCode || booking.referenceUrl || booking.details) {
    const bookings = supabase.from("bookings") as unknown as UpsertTable;
    const bookingResult = await bookings.upsert({ itinerary_item_id: itemId, provider_name: booking.providerName, confirmation_code: booking.confirmationCode, reference_url: booking.referenceUrl, details: booking.details });
    if (bookingResult.error) return { error: "預訂資訊儲存失敗，你的輸入內容仍保留。" };
  }
  revalidatePath(`/trips/${tripId}`);
  revalidatePath(`/trips/${tripId}/items/${itemId}`);
  redirect(`/trips/${tripId}/items/${itemId}`);
}

async function getCurrentPlaceId(itemId: string, supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const items = supabase.from("itinerary_items") as unknown as { select: (columns: string) => { eq: (column: string, value: string) => { maybeSingle: () => Promise<{ data: { place_id: string | null } | null }> } } };
  const { data } = await items.select("place_id").eq("id", itemId).maybeSingle();
  return data?.place_id ?? null;
}
