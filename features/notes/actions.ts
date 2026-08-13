"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { noteDraftCookieName } from "@/lib/notes/drafts";

export type NoteActionState = { error?: string; success?: boolean; content?: string };

export async function saveTripNoteAction(_previous: NoteActionState, formData: FormData): Promise<NoteActionState> {
  const tripId = String(formData.get("tripId") ?? "");
  const content = String(formData.get("content") ?? "");
  let cookieStore: Awaited<ReturnType<typeof cookies>> | undefined;
  try {
    cookieStore = await cookies();
    if (cookieStore.get("e2e-fail-note-once")?.value === "1") {
      cookieStore.delete("e2e-fail-note-once");
      cookieStore.set(noteDraftCookieName(tripId), content);
      return { error: "儲存失敗，你的筆記仍保留。", content };
    }
  } catch {
    // Unit tests can call the action without a Next request scope.
  }

  const supabase = await createSupabaseServerClient();
  const notes = supabase.from("trip_notes") as unknown as { upsert: (values: Record<string, string>, options: { onConflict: string }) => Promise<{ error: unknown }> };
  const { error } = await notes.upsert({ trip_id: tripId, content }, { onConflict: "trip_id" });
  if (error) {
    cookieStore?.set(noteDraftCookieName(tripId), content);
    return { error: "儲存失敗，你的筆記仍保留。", content };
  }
  cookieStore?.delete(noteDraftCookieName(tripId));
  revalidatePath(`/trips/${tripId}`);
  return { success: true };
}
