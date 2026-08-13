import { expect, test } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

test("登入頁在手機上保留清楚的核心操作", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "回到你的旅程" })).toBeVisible();
  await expect(page.getByLabel("電子信箱")).toHaveAttribute("type", "email");
  await expect(page.getByLabel("密碼")).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "登入" })).toHaveCSS("min-height", "48px");
});

test("登入後手機工作區保留導航、日期與長繁中內容", async ({ page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
  const admin: SupabaseClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  const { userId } = JSON.parse(await readFile("playwright/.auth/user-meta.json", "utf8")) as { userId: string };
  const { data: trip, error: tripError } = await admin.from("trips").insert({ owner_id: userId, title: "這是一個很長的繁體中文旅程標題用來驗證手機版面不會重疊或溢出", destination: "台北市信義區與周邊景點", start_date: "2026-12-10", end_date: "2026-12-12" }).select("id").single();
  expect(tripError).toBeNull();
  const { error: itemError } = await admin.from("itinerary_items").insert({ trip_id: trip!.id, type: "attraction", title: "這是一個很長的景點名稱用來驗證時間軸卡片在手機寬度下仍然可以閱讀", date: "2026-12-10", start_time: "10:00" });
  expect(itemError).toBeNull();

  try {
    await page.goto(`/trips/${trip!.id}?view=timeline&date=2026-12-10`);
    const primaryNavigation = page.getByRole("navigation", { name: "主要導航" });
    for (const label of ["探索", "行程", "新增", "預訂", "我的"]) await expect(primaryNavigation.getByRole("link", { name: label, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /很長的繁體中文旅程標題/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /很長的景點名稱/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /第 1 天/ })).toHaveAttribute("aria-current", "date");

    const viewport = page.viewportSize();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewport!.width);
    for (const link of await page.locator('nav[aria-label="主要導航"] a, nav[aria-label="旅程日期"] a, button, input, textarea').all()) {
      const box = await link.boundingBox();
      if (box) expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    }
  } finally {
    await admin.from("trips").delete().eq("id", trip!.id);
  }
});
