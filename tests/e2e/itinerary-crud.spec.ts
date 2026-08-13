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
  const { data, error } = await admin.from("trips").insert({ owner_id: userId, title: "行程 CRUD 測試", destination: "京都", start_date: "2026-12-10", end_date: "2026-12-12" }).select("id").single();
  if (error || !data) throw error ?? new Error("行程 CRUD 旅程建立失敗");
  tripId = data.id;
});

test.afterAll(async () => {
  if (tripId) await admin.from("trips").delete().eq("id", tripId);
});

test("可新增景點、編輯並取消或確認刪除", async ({ page }) => {
  await page.goto(`/trips/${tripId}/items/new?type=attraction`);
  expect((await page.request.get(`/trips/${tripId}`)).status()).toBe(200);
  await page.getByLabel("標題").fill("清水寺");
  await page.getByLabel("日期").fill("2026-12-10");
  await page.getByLabel("開始時間").fill("09:30");
  await page.getByLabel("地點名稱").fill("清水寺");
  await page.getByLabel("地址").fill("京都市東山區");
  await page.getByLabel("備註", { exact: true }).fill("提早抵達");
  await page.getByRole("button", { name: "儲存行程" }).click();
  await expect(page).toHaveURL(new RegExp(`/trips/${tripId}$`));
  await expect(page.getByRole("heading", { name: "清水寺" })).toBeVisible();
  const { data: created } = await admin.from("itinerary_items").select("id").eq("trip_id", tripId).eq("title", "清水寺").single();
  expect(created?.id).toBeTruthy();
  const itemId = created!.id;

  await page.goto(`/trips/${tripId}/items/new?type=attraction`);
  await expect(page.getByText("類型：景點")).toBeVisible();
  expect((await page.request.get(`/trips/${tripId}/items/${itemId}/edit`)).status()).toBe(200);
  await page.goto(`/trips/${tripId}/items/${itemId}/edit`);
  await expect(page.getByLabel("標題")).toHaveValue("清水寺");
  expect((await page.request.get(`/trips/${tripId}/items/${itemId}`)).status()).toBe(200);
  await page.goto(`/trips/${tripId}/items/${itemId}`);
  await page.getByRole("button", { name: /刪除/ }).click();
  const confirmation = page.getByRole("group", { name: "刪除行程確認" });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button", { name: "取消" }).click();
  await expect(page.getByRole("heading", { name: "清水寺" })).toBeVisible();
});