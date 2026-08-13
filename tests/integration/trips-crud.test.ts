import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type TestUser = { id: string; email: string; password: string };

function createUserClient(user: TestUser): SupabaseClient {
  return createClient(supabaseUrl, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false, storageKey: `trips-crud-${user.id}` },
  });
}

async function createTestUser(admin: SupabaseClient): Promise<TestUser> {
  const user = {
    email: `trips-crud-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`,
    password: "local-trips-crud-password-123",
  };
  const { data, error } = await admin.auth.admin.createUser({ ...user, email_confirm: true });
  if (error || !data.user) throw error ?? new Error("測試帳號建立失敗");
  return { ...user, id: data.user.id };
}

describe.skipIf(!anonKey || !serviceRoleKey)("Trip CRUD integration", () => {
  it("persists owner changes and leaves cancelled deletion unchanged", async () => {
    const admin = createClient(supabaseUrl, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } });
    const user = await createTestUser(admin);

    try {
      const client = createUserClient(user);
      const { error: signInError } = await client.auth.signInWithPassword({ email: user.email, password: user.password });
      expect(signInError).toBeNull();

      const { data: created, error: createError } = await client
        .from("trips")
        .insert({ owner_id: user.id, title: "京都秋日", destination: "京都，日本", start_date: "2026-11-01", end_date: "2026-11-05" })
        .select("*")
        .single();
      expect(createError).toBeNull();
      expect(created?.title).toBe("京都秋日");

      const tripId = created!.id;
      const { data: reloaded, error: reloadError } = await client.from("trips").select("*").eq("id", tripId).single();
      expect(reloadError).toBeNull();
      expect(reloaded?.id).toBe(tripId);

      const { error: updateError } = await client
        .from("trips")
        .update({ title: "京都秋日改版", end_date: "2026-11-06" })
        .eq("id", tripId);
      expect(updateError).toBeNull();

      const { data: afterUpdate } = await client.from("trips").select("title, end_date").eq("id", tripId).single();
      expect(afterUpdate).toEqual({ title: "京都秋日改版", end_date: "2026-11-06" });

      const { data: afterCancel } = await client.from("trips").select("id").eq("id", tripId).single();
      expect(afterCancel?.id).toBe(tripId);

      const { error: deleteError } = await client.from("trips").delete().eq("id", tripId);
      expect(deleteError).toBeNull();

      const { data: afterDelete } = await client.from("trips").select("id").eq("id", tripId).maybeSingle();
      expect(afterDelete).toBeNull();
    } finally {
      await admin.auth.admin.deleteUser(user.id);
    }
  });
});