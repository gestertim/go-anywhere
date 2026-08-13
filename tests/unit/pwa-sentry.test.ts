import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { scrubEvent } from "@/lib/sentry/scrub";
import { staticAssets, staticCacheName } from "@/service-worker";

describe("PWA and privacy safeguards", () => {
  it("defines a Traditional Chinese installable shell", () => {
    const result = manifest();
    expect(result.lang).toBe("zh-Hant");
    expect(result.display).toBe("standalone");
    expect(result.icons).toHaveLength(1);
    expect(staticCacheName).toContain("go-anywhere");
    expect(staticAssets).not.toContain("/api/trips");
  });

  it("removes sensitive event fields before reporting", () => {
    const scrubbed = scrubEvent({ title: "私人旅程", notes: "敏感筆記", requestId: "req-1" });
    expect(scrubbed).toEqual({ requestId: "req-1" });
  });
});
