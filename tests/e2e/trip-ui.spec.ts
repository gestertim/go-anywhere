import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

test.skip(!serviceRoleKey || !anonKey, "需要本機 Supabase Auth 測試環境變數。");

let admin: SupabaseClient;
let userId: string;
let tripId: string;

test.beforeAll(async () => {
  admin = createClient(supabaseUrl, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } });
  const metadata = JSON.parse(await readFile("playwright/.auth/user-meta.json", "utf8")) as { userId: string };
  userId = metadata.userId;
  const { data, error } = await admin
    .from("trips")
    .insert({ owner_id: userId, title: "預先建立的京都旅程", destination: "京都，日本", start_date: "2026-11-01", end_date: "2026-11-05" })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("UI 測試旅程建立失敗");
  tripId = data.id;
});

test.afterAll(async () => {
  if (tripId) await admin.from("trips").delete().eq("id", tripId);
});

test("已登入使用者可查看旅程並在重新載入後恢復資料", async ({ page }) => {
  await page.goto("/trips");
  await expect(page.getByRole("heading", { name: "預先建立的京都旅程" })).toBeVisible();

  const tripResponse = await page.request.get(`/trips/${tripId}`);
  expect(tripResponse.status()).toBe(200);
  await page.goto(`/trips/${tripId}`);
  await expect(page).toHaveURL(new RegExp(`/trips/${tripId}$`));
  await expect(page.getByRole("heading", { name: "預先建立的京都旅程" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "預先建立的京都旅程" })).toBeVisible();
  await expect(page.getByText("京都，日本")).toBeVisible();
});