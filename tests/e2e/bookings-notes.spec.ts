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
  const { data: trip, error: tripError } = await admin.from("trips").insert({ owner_id: userId, title: "預訂筆記測試", destination: "台北", start_date: "2026-12-01", end_date: "2026-12-02" }).select("id").single();
  if (tripError || !trip) throw tripError ?? new Error("Booking/Note E2E 旅程建立失敗");
  tripId = trip.id;
  const { data: item, error: itemError } = await admin.from("itinerary_items").insert({ trip_id: tripId, type: "accommodation", title: "測試住宿", date: "2026-12-01" }).select("id").single();
  if (itemError || !item) throw itemError ?? new Error("Booking/Note E2E 行程建立失敗");
  itemId = item.id;
  const { error: bookingError } = await admin.from("bookings").insert({ itinerary_item_id: itemId, provider_name: "測試旅宿", confirmation_code: "E2E-123" });
  if (bookingError) throw bookingError;
  const { error: noteError } = await admin.from("trip_notes").insert({ trip_id: tripId, content: "初始私人筆記" });
  if (noteError) throw noteError;
});

test.afterAll(async () => {
  if (tripId) await admin.from("trips").delete().eq("id", tripId);
});

test("預訂可返回詳情，筆記可讀取並重新載入恢復", async ({ page }) => {
  await page.goto("/bookings");
  await expect(page.getByRole("heading", { name: "測試住宿" })).toBeVisible();
  expect((await page.request.get(`/trips/${tripId}/items/${itemId}`)).status()).toBe(200);
  await page.goto(`/trips/${tripId}/items/${itemId}`);
  await expect(page).toHaveURL(new RegExp(`/trips/${tripId}/items/${itemId}$`));
  await expect(page.getByText("測試旅宿")).toBeVisible();

  expect((await page.request.get(`/trips/${tripId}/notes`)).status()).toBe(200);
  await page.goto(`/trips/${tripId}/notes`);
  await expect(page.getByRole("textbox", { name: "旅程筆記" })).toHaveValue("初始私人筆記");
  const { error: updateError } = await admin.from("trip_notes").update({ content: "重新整理後的私人筆記" }).eq("trip_id", tripId);
  expect(updateError).toBeNull();
  await page.reload();
  await expect(page.getByRole("textbox", { name: "旅程筆記" })).toHaveValue("重新整理後的私人筆記");
});