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
    .insert({ owner_id: userId, title: "行程類型測試", destination: "高雄", start_date: "2026-12-10", end_date: "2026-12-12" })
    .select("id")
    .single();
  if (error || !data) throw error ?? new Error("行程類型測試旅程建立失敗");
  tripId = data.id;
});

test.afterAll(async () => {
  if (tripId) await admin.from("trips").delete().eq("id", tripId);
});

test("新增行程先選擇六種類型，再呈現分流表單", async ({ page }) => {
  await page.goto(`/trips/${tripId}/items/new`);
  for (const label of ["航班", "住宿", "交通", "景點", "餐廳", "其他"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
  await expect(page.getByLabel("標題")).toHaveCount(0);

  await page.getByRole("link", { name: "景點" }).click();
  await expect(page).toHaveURL(new RegExp(`/trips/${tripId}/items/new\\?type=attraction$`));
  await expect(page.getByText("類型：景點")).toBeVisible();
  await expect(page.getByLabel("標題")).toBeVisible();
  await expect(page.getByLabel("地點名稱")).toBeVisible();
  await expect(page.getByLabel("緯度")).toBeVisible();
  await expect(page.getByLabel("經度")).toBeVisible();
});