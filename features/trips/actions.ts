"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createTripSchema } from "@/features/trips/schemas";

export type TripActionState = { error?: string };

export async function createTripAction(_previous: TripActionState, formData: FormData): Promise<TripActionState> {
  const parsed = createTripSchema.safeParse({
    title: formData.get("title"),
    destination: formData.get("destination"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "請檢查旅程資料。" };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "請先登入後繼續。" };
  const tripId = crypto.randomUUID();
  const tripsTable = supabase.from("trips") as unknown as {
    insert: (values: { id: string; owner_id: string; title: string; destination: string; start_date: string; end_date: string }) => Promise<{ error: unknown }>;
  };
  const { error } = await tripsTable.insert({
    id: tripId,
    title: parsed.data.title,
    destination: parsed.data.destination,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
    owner_id: user.id,
  });
  if (error) return { error: "儲存失敗，你的輸入內容仍保留。" };
  revalidatePath("/explore");
  revalidatePath("/trips");
  redirect(`/trips/${tripId}`);
}

export async function deleteTripAction(tripId: string) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("trips").delete().eq("id", tripId);
  revalidatePath("/explore");
  revalidatePath("/trips");
  redirect("/trips");
}

export async function updateTripAction(_previous: TripActionState, formData: FormData): Promise<TripActionState> {
  const parsed = createTripSchema.safeParse({
    title: formData.get("title"),
    destination: formData.get("destination"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
  const id = String(formData.get("id") ?? "");
  if (!parsed.success || !id) return { error: parsed.error?.issues[0]?.message ?? "找不到這趟旅程。" };
  const supabase = await createSupabaseServerClient();
  const tripsTable = supabase.from("trips") as unknown as {
    update: (values: { title: string; destination: string; start_date: string; end_date: string }) => {
      eq: (column: string, value: string) => Promise<{ error: unknown }>;
    };
  };
  const { error } = await tripsTable.update({
    title: parsed.data.title,
    destination: parsed.data.destination,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
  }).eq("id", id);
  if (error) return { error: "儲存失敗，你的輸入內容仍保留。" };
  revalidatePath(`/trips/${id}`);
  revalidatePath("/trips");
  redirect(`/trips/${id}`);
}
