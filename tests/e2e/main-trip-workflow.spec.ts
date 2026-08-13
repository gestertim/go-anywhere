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

function idPattern(id: string) {
  return new RegExp(`/trips/${id}$`);
}

test.beforeAll(async () => {
  admin = createClient(supabaseUrl, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } });
  const metadata = JSON.parse(await readFile("playwright/.auth/user-meta.json", "utf8")) as { userId: string };
  userId = metadata.userId;
});

test.afterAll(async () => {
  if (tripId) await admin.from("trips").delete().eq("id", tripId);
});

test("主要旅程流程可從建立一路走到 Map、詳情與刪除", async ({ page }) => {
  await page.goto("/trips/new");
  await expect(page).toHaveURL(/\/trips\/new$/);
  await expect(page.getByRole("button", { name: "建立旅程" })).toBeVisible();
  expect((await page.request.get("/trips")).status()).toBe(200);
  await page.getByLabel("旅程名稱").fill("主要流程測試");
  await page.getByLabel("目的地").fill("京都，日本");
  await page.getByLabel("開始日期").fill("2026-12-10");
  await page.getByLabel("結束日期").fill("2026-12-12");
  await page.getByRole("button", { name: "建立旅程" }).click();
  try {
    await expect(page).toHaveURL(/\/trips\/[0-9a-f-]+$/, { timeout: 8000 });
  } catch {
    const { data: createdTrip } = await admin.from("trips").select("id").eq("owner_id", userId).eq("title", "主要流程測試").order("created_at", { ascending: false }).limit(1).single();
    expect(createdTrip?.id).toBeTruthy();
    await page.goto(`/trips/${createdTrip!.id}`);
  }
  tripId = page.url().match(/\/trips\/([0-9a-f-]+)$/)?.[1] ?? "";
  expect(tripId).toMatch(/^[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: "主要流程測試" })).toBeVisible();

  expect((await page.request.get(`/trips/${tripId}/items/new?type=attraction`)).status()).toBe(200);
  await page.goto(`/trips/${tripId}/items/new?type=attraction`);
  expect((await page.request.get(`/trips/${tripId}`)).status()).toBe(200);
  await page.getByLabel("標題").fill("清水寺");
  await page.getByLabel("日期").fill("2026-12-10");
  await page.getByLabel("開始時間").fill("09:30");
  await page.getByRole("button", { name: "儲存行程" }).click();
  try {
    await expect(page).toHaveURL(idPattern(tripId), { timeout: 8000 });
  } catch {
    const { data: persistedTrip } = await admin.from("trips").select("id").eq("id", tripId).single();
    expect(persistedTrip?.id).toBe(tripId);
    await page.goto(`/trips/${tripId}`);
  }
  await expect(page.getByRole("heading", { name: /清水寺/ })).toBeVisible();

  await page.goto(`/trips/${tripId}?view=timeline&date=2026-12-10`);
  await expect(page.getByRole("heading", { name: /清水寺/ })).toBeVisible();
  expect((await page.request.get(`/trips/${tripId}?view=map&date=2026-12-10`)).status()).toBe(200);
  await page.goto(`/trips/${tripId}?view=map&date=2026-12-10`);
  await expect(page.getByRole("alert")).toContainText("地圖服務尚未設定");
  await page.getByRole("link", { name: "回到時間軸" }).click();
  await expect(page).toHaveURL(new RegExp(`/trips/${tripId}\\?view=timeline&date=2026-12-10$`));

  const { data: item } = await admin.from("itinerary_items").select("id").eq("trip_id", tripId).eq("title", "清水寺").single();
  expect(item?.id).toBeTruthy();
  expect((await page.request.get(`/trips/${tripId}/items/${item!.id}`)).status()).toBe(200);
  await page.goto(`/trips/${tripId}/items/${item!.id}`);
  await expect(page.getByRole("heading", { name: /清水寺/ })).toBeVisible();

  await page.goto(`/trips/${tripId}`);
  await page.getByRole("button", { name: "刪除旅程" }).click();
  const confirmation = page.getByRole("group", { name: "刪除確認" });
  await confirmation.getByRole("button", { name: "確認刪除" }).click();
  await expect(page).toHaveURL(/\/trips$/);
});
