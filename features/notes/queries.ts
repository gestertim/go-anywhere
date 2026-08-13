import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getTripNote(tripId: string) {
  const supabase = await createSupabaseServerClient();
  const notes = supabase.from("trip_notes") as unknown as {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: { id: string; trip_id: string; content: string | null } | null }>;
      };
    };
  };
  const { data } = await notes.select("*").eq("trip_id", tripId).maybeSingle();
  return data ? { id: data.id, tripId: data.trip_id, content: data.content ?? "" } : null;
}
