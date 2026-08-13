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
let mappedItemId: string;

test.beforeAll(async () => {
  admin = createClient(supabaseUrl, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } });
  const metadata = JSON.parse(await readFile("playwright/.auth/user-meta.json", "utf8")) as { userId: string };
  userId = metadata.userId;
  const { data: trip, error: tripError } = await admin.from("trips").insert({ owner_id: userId, title: "地圖同步測試", destination: "台北", start_date: "2026-12-10", end_date: "2026-12-11" }).select("id").single();
  if (tripError || !trip) throw tripError ?? new Error("地圖同步旅程建立失敗");
  tripId = trip.id;
  const { data: place, error: placeError } = await admin.from("places").insert({ trip_id: tripId, name: "台北 101", address: "台北市信義區", latitude: 25.034, longitude: 121.564 }).select("id").single();
  if (placeError || !place) throw placeError ?? new Error("地圖同步地點建立失敗");
  const { data: mappedItem, error: mappedError } = await admin.from("itinerary_items").insert({ trip_id: tripId, type: "attraction", title: "台北 101", date: "2026-12-10", start_time: "10:00", place_id: place.id }).select("id").single();
  if (mappedError || !mappedItem) throw mappedError ?? new Error("地圖同步座標行程建立失敗");
  mappedItemId = mappedItem.id;
  const { error: plainError } = await admin.from("itinerary_items").insert({ trip_id: tripId, type: "other", title: "無座標備註", date: "2026-12-10", start_time: "12:00" });
  if (plainError) throw plainError;
});

test.afterAll(async () => {
  if (tripId) await admin.from("trips").delete().eq("id", tripId);
});

test("Timeline 與 Map 保留日期，無座標行程不會消失", async ({ page }) => {
  await page.goto(`/trips/${tripId}?view=timeline&date=2026-12-10`);
  await expect(page.getByRole("heading", { name: "台北 101" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "無座標備註" })).toBeVisible();

  expect((await page.request.get(`/trips/${tripId}?view=map&date=2026-12-10`)).status()).toBe(200);
  await page.goto(`/trips/${tripId}?view=map&date=2026-12-10`);
  await expect(page).toHaveURL(new RegExp(`/trips/${tripId}\\?view=map&date=2026-12-10$`));
  await expect(page.getByText("回到時間軸")).toBeVisible();

  const markerLink = page.locator(`a[href="/trips/${tripId}/items/${mappedItemId}"]`);
  if (await markerLink.count()) {
    await markerLink.click();
    await expect(page).toHaveURL(new RegExp(`/trips/${tripId}/items/${mappedItemId}$`));
    await expect(page.getByRole("heading", { name: "台北 101" })).toBeVisible();
  } else {
    await page.getByRole("link", { name: "回到時間軸" }).click();
    await expect(page.getByRole("heading", { name: "台北 101" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "無座標備註" })).toBeVisible();
  }
});