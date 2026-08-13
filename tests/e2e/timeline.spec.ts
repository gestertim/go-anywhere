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
let itemId: string;

test.beforeAll(async () => {
  admin = createClient(supabaseUrl, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } });
  const metadata = JSON.parse(await readFile("playwright/.auth/user-meta.json", "utf8")) as { userId: string };
  userId = metadata.userId;
  const { data: trip, error: tripError } = await admin.from("trips").insert({ owner_id: userId, title: "時間軸測試", destination: "台中", start_date: "2026-12-10", end_date: "2026-12-12" }).select("id").single();
  if (tripError || !trip) throw tripError ?? new Error("時間軸測試旅程建立失敗");
  tripId = trip.id;
  const { data: item, error: itemError } = await admin.from("itinerary_items").insert({ trip_id: tripId, type: "attraction", title: "國家歌劇院", date: "2026-12-10", start_time: "10:30" }).select("id").single();
  if (itemError || !item) throw itemError ?? new Error("時間軸測試行程建立失敗");
  itemId = item.id;
});

test.afterAll(async () => {
  if (tripId) await admin.from("trips").delete().eq("id", tripId);
});

test("手機時間軸可切換日期、顯示空狀態並開啟詳情", async ({ page }) => {
  await page.goto(`/trips/${tripId}?view=timeline&date=2026-12-10`);
  await expect(page.getByRole("heading", { name: "時間軸測試" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "2026-12-10" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "國家歌劇院" })).toBeVisible();
  await expect(page.getByText(/10:30.*景點/)).toBeVisible();

  expect((await page.request.get(`/trips/${tripId}?view=timeline&date=2026-12-11`)).status()).toBe(200);
  await page.goto(`/trips/${tripId}?view=timeline&date=2026-12-11`);
  await expect(page.getByRole("heading", { name: "2026-12-11" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "這天還沒有行程" })).toBeVisible();

  expect((await page.request.get(`/trips/${tripId}/items/${itemId}`)).status()).toBe(200);
  await page.goto(`/trips/${tripId}/items/${itemId}`);
  await expect(page.getByRole("heading", { name: "國家歌劇院" })).toBeVisible();
});