import { expect, test } from "@playwright/test";

test("首頁與 PWA manifest 可用", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Go Anywhere" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant");

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).lang).toBe("zh-Hant");
});
