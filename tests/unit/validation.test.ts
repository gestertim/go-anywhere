import { describe, expect, it } from "vitest";
import { itineraryItemSchema, tripSchema } from "@/lib/validation/schemas";

describe("domain validation", () => {
  it("accepts a valid trip date range", () => {
    expect(
      tripSchema.safeParse({
        title: "京都散步",
        destination: "京都",
        startDate: "2026-06-16",
        endDate: "2026-06-20",
      }).success,
    ).toBe(true);
  });

  it("rejects a trip whose end date is before its start date", () => {
    expect(
      tripSchema.safeParse({
        title: "旅程",
        destination: "台北",
        startDate: "2026-06-20",
        endDate: "2026-06-16",
      }).success,
    ).toBe(false);
  });

  it("allows partially completed itinerary items", () => {
    expect(itineraryItemSchema.safeParse({ type: "attraction" }).success).toBe(true);
  });
});
