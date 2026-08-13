import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Trip } from "@/types/domain";

function toTrip(row: Record<string, unknown>): Trip {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    title: String(row.title),
    destination: String(row.destination),
    startDate: String(row.start_date),
    endDate: String(row.end_date),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function getTrips(): Promise<Trip[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("trips").select("*").order("start_date", { ascending: true });
  return (data ?? []).map((row) => toTrip(row as Record<string, unknown>));
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("trips").select("*").eq("id", tripId).maybeSingle();
  return data ? toTrip(data as Record<string, unknown>) : null;
}
