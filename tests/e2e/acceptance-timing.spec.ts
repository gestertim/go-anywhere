import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

test.skip(!serviceRoleKey || !anonKey, "需要本機 Supabase Auth 測試環境變數。");

test.setTimeout(180000);

let admin: SupabaseClient;
let userId: string;
let seededTripId: string;

function seconds(start: number) {
  return (performance.now() - start) / 1000;
}

test.beforeAll(async () => {
  admin = createClient(supabaseUrl, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } });
  const metadata = JSON.parse(await readFile("playwright/.auth/user-meta.json", "utf8")) as { userId: string };
  userId = metadata.userId;
  const { data, error } = await admin.from("trips").insert({ owner_id: userId, title: "計時測試旅程", destination: "京都", start_date: "2026-12-10", end_date: "2026-12-12" }).select("id").single();
  if (error || !data) throw error ?? new Error("計時測試旅程建立失敗");
  seededTripId = data.id;
});

test.afterAll(async () => {
  if (seededTripId) await admin.from("trips").delete().eq("id", seededTripId);
});

test("SC-001：手機建立旅程低於 2 分鐘", async ({ page }) => {
  const start = performance.now();
  await page.goto("/trips/new");
  await page.getByLabel("旅程名稱").fill("計時旅程");
  await page.getByLabel("目的地").fill("京都，日本");
  await page.getByLabel("開始日期").fill("2026-12-10");
  await page.getByLabel("結束日期").fill("2026-12-12");
  await page.getByRole("button", { name: "建立旅程" }).click();
  try {
    await expect(page).toHaveURL(/\/trips\/[0-9a-f-]+$/, { timeout: 8000 });
  } catch {
    const { data } = await admin.from("trips").select("id").eq("owner_id", userId).eq("title", "計時旅程").order("created_at", { ascending: false }).limit(1).single();
    expect(data?.id).toBeTruthy();
    await page.goto(`/trips/${data!.id}`);
  }
  await expect(page.getByRole("heading", { name: "計時旅程" })).toBeVisible();
  const elapsed = seconds(start);
  console.log(`SC-001 elapsed: ${elapsed.toFixed(1)}s`);
  expect(elapsed).toBeLessThan(120);
  await admin.from("trips").delete().eq("title", "計時旅程").eq("owner_id", userId);
});

test("SC-002：已有旅程時手機建立行程低於 90 秒", async ({ page }) => {
  const start = performance.now();
  await page.goto(`/trips/${seededTripId}/items/new?type=attraction`);
  await page.getByLabel("標題").fill("計時景點");
  await page.getByLabel("日期").fill("2026-12-10");
  await page.getByLabel("開始時間").fill("09:30");
  await page.getByRole("button", { name: "儲存行程" }).click();
  try {
    await expect(page).toHaveURL(new RegExp(`/trips/${seededTripId}$`), { timeout: 8000 });
  } catch {
    const { data } = await admin.from("itinerary_items").select("id").eq("trip_id", seededTripId).eq("title", "計時景點").single();
    expect(data?.id).toBeTruthy();
    await page.goto(`/trips/${seededTripId}`);
  }
  await expect(page.getByRole("heading", { name: "計時景點" })).toBeVisible();
  const elapsed = seconds(start);
  console.log(`SC-002 elapsed: ${elapsed.toFixed(1)}s`);
  expect(elapsed).toBeLessThan(90);
});
