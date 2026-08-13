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
  const { data, error } = await admin.from("trips").insert({ owner_id: userId, title: "產品狀態測試", destination: "宜蘭", start_date: "2026-12-20", end_date: "2026-12-21" }).select("id").single();
  if (error || !data) throw error ?? new Error("產品狀態測試旅程建立失敗");
  tripId = data.id;
});

test.afterAll(async () => {
  if (tripId) await admin.from("trips").delete().eq("id", tripId);
});

test("空旅程、地圖不可用與刪除取消狀態清楚可操作", async ({ page }) => {
  await page.goto(`/trips/${tripId}?view=timeline&date=2026-12-20`);
  await expect(page.getByRole("heading", { name: "這天還沒有行程" })).toBeVisible();

  expect((await page.request.get(`/trips/${tripId}?view=map&date=2026-12-20`)).status()).toBe(200);
  await page.goto(`/trips/${tripId}?view=map&date=2026-12-20`);
  await expect(page.getByRole("alert")).toContainText("地圖服務尚未設定");
  await page.getByRole("link", { name: "回到時間軸" }).click();
  await expect(page).toHaveURL(new RegExp(`/trips/${tripId}\\?view=timeline&date=2026-12-20$`));

  await page.getByRole("button", { name: "刪除旅程" }).click();
  await expect(page.getByRole("group", { name: "刪除確認" })).toBeVisible();
  await page.getByRole("group", { name: "刪除確認" }).getByRole("button", { name: "取消" }).click();
  await expect(page.getByRole("heading", { name: "產品狀態測試" })).toBeVisible();
});

test("筆記儲存失敗會保留輸入並可重試成功", async ({ page }) => {
  expect((await page.request.post("/api/test/failure", { headers: { "x-e2e-auth-secret": process.env.E2E_AUTH_SECRET! } })).ok()).toBe(true);
  expect((await admin.from("trip_notes").upsert({ trip_id: tripId, content: "原始筆記" })).error).toBeNull();
  await page.goto(`/trips/${tripId}/notes`);
  await expect(page.locator("form[data-hydrated='true']")).toBeVisible();
  const editor = page.locator("textarea[name='content']");
  await expect(editor).toBeEditable();
  await editor.fill("失敗後仍保留的筆記");
  await expect(editor).toHaveValue("失敗後仍保留的筆記");
  await page.getByRole("button", { name: "儲存筆記" }).click();
  await expect(page.locator("main p[role='alert']")).toHaveText("儲存失敗，你的筆記仍保留。");
  await expect(editor).toHaveValue("失敗後仍保留的筆記");
  await page.context().clearCookies({ name: "e2e-fail-note-once" });
  await page.getByRole("button", { name: "重試儲存" }).click();
  await expect(page.getByRole("status")).toHaveText("筆記已儲存。");
  await page.reload();
  await expect(editor).toHaveValue("失敗後仍保留的筆記");
});