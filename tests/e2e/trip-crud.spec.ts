import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

test.skip(!serviceRoleKey || !anonKey, "需要本機 Supabase Auth 測試環境變數。");

let admin: SupabaseClient;
let userId: string;

test.beforeAll(async () => {
  admin = createClient(supabaseUrl, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } });
  const metadata = JSON.parse(await readFile("playwright/.auth/user-meta.json", "utf8")) as { userId: string };
  userId = metadata.userId;
});

test("登入後可建立、重新載入、編輯並確認刪除旅程", async ({ page }) => {
  await page.goto("/trips/new");
  expect((await page.request.get("/trips/new")).status()).toBe(200);
  await page.getByLabel("旅程名稱").fill("E2E 京都測試");
  await page.getByLabel("目的地").fill("京都，日本");
  await page.getByLabel("開始日期").fill("2026-11-01");
  await page.getByLabel("結束日期").fill("2026-11-05");
  await page.getByRole("button", { name: "建立旅程" }).click();
  await expect(page).toHaveURL(/\/trips\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: "E2E 京都測試" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "E2E 京都測試" })).toBeVisible();

  await page.getByRole("link", { name: "編輯旅程" }).click();
  await page.getByLabel("旅程名稱").fill("E2E 京都測試已更新");
  await page.getByRole("button", { name: "儲存變更" }).click();
  await expect(page).toHaveURL(/\/trips\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: "E2E 京都測試已更新" })).toBeVisible();

  await page.getByRole("button", { name: "刪除旅程" }).click();
  const confirmation = page.getByRole("group", { name: "刪除確認" });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button", { name: "取消" }).click();
  await expect(page.getByRole("heading", { name: "E2E 京都測試已更新" })).toBeVisible();

  await page.getByRole("button", { name: "刪除旅程" }).click();
  await page.getByRole("group", { name: "刪除確認" }).getByRole("button", { name: "確認刪除" }).click();
  await expect(page).toHaveURL(/\/trips$/);
  await expect(page.getByRole("heading", { name: "E2E 京都測試已更新" })).toHaveCount(0);
});