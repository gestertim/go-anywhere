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
    .insert({ owner_id: userId, title: "旅程狀態測試", destination: "花蓮", start_date: "2026-12-20", end_date: "2026-12-24" })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("旅程狀態測試資料建立失敗");
  tripId = data.id;
});

test.afterAll(async () => {
  if (tripId) await admin.from("trips").delete().eq("id", tripId);
});

test("編輯表單與刪除取消狀態可用，重新載入可恢復更新資料", async ({ page }) => {
  await page.goto(`/trips/${tripId}`);
  await expect(page.getByRole("heading", { name: "旅程狀態測試" })).toBeVisible();

  await page.getByRole("link", { name: "編輯旅程" }).click();
  await expect(page).toHaveURL(new RegExp(`/trips/${tripId}/settings$`));
  await expect(page.getByLabel("旅程名稱")).toHaveValue("旅程狀態測試");

  await page.goto(`/trips/${tripId}`);
  await page.getByRole("button", { name: "刪除旅程" }).click();
  const confirmation = page.getByRole("group", { name: "刪除確認" });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button", { name: "取消" }).click();
  await expect(page.getByRole("heading", { name: "旅程狀態測試" })).toBeVisible();

  const { error: updateError } = await admin.from("trips").update({ title: "旅程狀態測試已更新" }).eq("id", tripId);
  expect(updateError).toBeNull();
  await page.reload();
  await expect(page.getByRole("heading", { name: "旅程狀態測試已更新" })).toBeVisible();
});