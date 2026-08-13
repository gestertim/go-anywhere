import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("health endpoint", () => {
  it("reports a recoverable Mapbox outage without exposing secrets", async () => {
    const originalToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "degraded",
      service: "go-anywhere",
      dependencies: { mapbox: { status: "unavailable", recoverable: true } },
    });
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = originalToken;
  });

  it("reports the core service as healthy when Mapbox is configured", async () => {
    const originalToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = "public-token-for-test";
    const response = await GET();
    expect(await response.json()).toEqual({
      status: "ok",
      service: "go-anywhere",
      dependencies: { mapbox: { status: "available", recoverable: false } },
    });
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = originalToken;
  });
});
