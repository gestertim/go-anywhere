import { describe, expect, it } from "vitest";
import { createTripSchema, updateTripSchema } from "@/features/trips/schemas";

describe("trip schemas", () => {
  it("accepts a complete trip with valid date range", () => {
    const result = createTripSchema.safeParse({
      title: "關西散步",
      destination: "大阪",
      startDate: "2026-10-01",
      endDate: "2026-10-05",
    });

    expect(result.success).toBe(true);
  });

  it("returns traditional chinese date-range error", () => {
    const result = createTripSchema.safeParse({
      title: "錯誤日期",
      destination: "東京",
      startDate: "2026-10-05",
      endDate: "2026-10-01",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("結束日期不可早於開始日期");
    }
  });

  it("allows partial updates but enforces id format", () => {
    expect(
      updateTripSchema.safeParse({
        id: "00000000-0000-4000-8000-000000000123",
        title: "只改標題",
      }).success,
    ).toBe(true);

    expect(
      updateTripSchema.safeParse({
        id: "not-a-uuid",
        title: "無效",
      }).success,
    ).toBe(false);
  });
});