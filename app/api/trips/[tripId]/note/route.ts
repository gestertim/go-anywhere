import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { noteDraftCookieName } from "@/lib/notes/drafts";

export async function POST(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const body = (await request.json()) as { content?: string };
  const content = String(body.content ?? "");
  const cookieStore = await cookies();
  if (cookieStore.get("e2e-fail-note-once")?.value === "1") {
    cookieStore.delete("e2e-fail-note-once");
    const response = NextResponse.json({ error: "儲存失敗，你的筆記仍保留。" }, { status: 503 });
    response.cookies.delete("e2e-fail-note-once");
    return response;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("note save rejected: no authenticated user in route handler");
    return NextResponse.json({ error: "請先登入後繼續。" }, { status: 401 });
  }

  const notes = supabase.from("trip_notes") as unknown as { upsert: (values: Record<string, string>, options: { onConflict: string }) => Promise<{ error: unknown }> };
  const { error } = await notes.upsert({ trip_id: tripId, content }, { onConflict: "trip_id" });
  if (error) {
    console.error("note upsert failed", error);
    cookieStore.set(noteDraftCookieName(tripId), content);
    return NextResponse.json({ error: "儲存失敗，你的筆記仍保留。" }, { status: 503 });
  }

  cookieStore.delete(noteDraftCookieName(tripId));
  return NextResponse.json({ success: true });
}
