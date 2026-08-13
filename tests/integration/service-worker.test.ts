import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { staticAssets, staticCacheName } from "@/service-worker";

const serviceWorker = readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8");

describe("service worker cache contract", () => {
  it("uses a versioned static shell cache", () => {
    expect(staticCacheName).toMatch(/^go-anywhere-shell-v\d+$/);
    expect(staticAssets).toContain("/");
    expect(staticAssets).toContain("/manifest.webmanifest");
    expect(staticAssets.some((asset) => asset.startsWith("/api/"))).toBe(false);
  });

  it("only handles GET requests for explicit static assets", () => {
    expect(serviceWorker).toContain("request.method !== \"GET\"");
    expect(serviceWorker).toContain("!STATIC_ASSETS.includes(url.pathname)");
    expect(serviceWorker).not.toMatch(/mutation|offline.*queue|queue.*offline/i);
  });

  it("does not cache private API paths", () => {
    expect(serviceWorker).not.toContain("/api/trips");
    expect(serviceWorker).not.toContain("/rest/v1");
    expect(serviceWorker).not.toContain("supabase");
  });
});