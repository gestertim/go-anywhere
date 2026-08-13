import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

export default async function globalTeardown() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return;

  try {
    const metadata = JSON.parse(await readFile("playwright/.auth/user-meta.json", "utf8")) as { userId: string };
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    await admin.auth.admin.deleteUser(metadata.userId);
  } catch {
    // The fixture may not have created a user when setup was skipped.
  }
}
