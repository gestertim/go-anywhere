import { beforeEach, describe, expect, it } from "vitest";
import { getSentryOptions, scrubValue } from "@/lib/sentry/config";

describe("Sentry configuration and privacy", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = "https://public@example.test/1";
    process.env.SENTRY_ENVIRONMENT = "test";
    process.env.SENTRY_RELEASE = "go-anywhere@test-release";
  });

  it("provides environment and release without server secrets", () => {
    expect(getSentryOptions()).toEqual({ dsn: "https://public@example.test/1", environment: "test", release: "go-anywhere@test-release" });
    expect(getSentryOptions()).not.toHaveProperty("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("scrubs nested itinerary and booking data", () => {
    expect(scrubValue({ contexts: { trip: { title: "私人旅程", notes: "私人筆記" } }, items: [{ confirmationCode: "SECRET" }], requestId: "req-1" })).toEqual({ contexts: { trip: {} }, items: [{}], requestId: "req-1" });
  });
});