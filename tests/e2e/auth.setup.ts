import { createClient } from "@supabase/supabase-js";
import { expect, test as setup } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

setup.skip(!serviceRoleKey || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !process.env.E2E_AUTH_SECRET, "需要本機 Supabase Auth 測試環境變數。");

setup("建立已登入的瀏覽器狀態", async ({ page }) => {
  const admin = createClient(supabaseUrl, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } });
  const authClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  const email = `trip-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
  const password = "local-trip-e2e-password-123";
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw error ?? new Error("E2E 測試帳號建立失敗");
  let setupSucceeded = false;
  try {
    const { data: sessionData, error: signInError } = await authClient.auth.signInWithPassword({ email, password });
    if (signInError || !sessionData.session) throw signInError ?? new Error("E2E session 建立失敗");
    const bridge = await page.request.post("/api/test/auth", {
      headers: { "x-e2e-auth-secret": process.env.E2E_AUTH_SECRET! },
      data: sessionData.session,
    });
    expect(bridge.ok()).toBe(true);
    await page.goto("/explore");
    await expect(page).toHaveURL(/\/explore$/);
    await mkdir("playwright/.auth", { recursive: true });
    await page.context().storageState({ path: "playwright/.auth/user.json" });
    await writeFile("playwright/.auth/user-meta.json", JSON.stringify({ userId: data.user.id }), "utf8");
    setupSucceeded = true;
  } finally {
    if (!setupSucceeded) await admin.auth.admin.deleteUser(data.user.id);
  }
});