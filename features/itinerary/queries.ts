import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ItineraryItem, ItineraryType, Place } from "@/types/domain";

function toItem(row: Record<string, unknown>): ItineraryItem {
  const place = row.place as Record<string, unknown> | null;
  const booking = row.booking as Record<string, unknown> | null;
  return {
    id: String(row.id), tripId: String(row.trip_id), type: row.type as ItineraryType,
    title: row.title as string | null, date: row.date as string | null,
    startTime: row.start_time as string | null, endTime: row.end_time as string | null,
    place: place ? { id: String(place.id), name: place.name as string | null, address: place.address as string | null, latitude: place.latitude as number | null, longitude: place.longitude as number | null } satisfies Place : null,
    notes: row.notes as string | null,
    booking: booking ? { id: String(booking.id), itineraryItemId: String(booking.itinerary_item_id), confirmationCode: booking.confirmation_code as string | null, providerName: booking.provider_name as string | null, referenceUrl: booking.reference_url as string | null, details: booking.details as string | null } : null,
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  };
}

export async function getItineraryItems(tripId: string): Promise<ItineraryItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("itinerary_items").select("*, place:places(*), booking:bookings(*)").eq("trip_id", tripId);
  if (error) throw error;
  return (data ?? []).map((row) => toItem(row as Record<string, unknown>));
}

export async function getItineraryItem(itemId: string): Promise<ItineraryItem | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("itinerary_items").select("*, place:places(*), booking:bookings(*)").eq("id", itemId).maybeSingle();
  if (error) throw error;
  return data ? toItem(data as Record<string, unknown>) : null;
}
