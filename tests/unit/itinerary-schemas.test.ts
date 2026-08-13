import { describe, expect, it } from "vitest";
import { bookingSchema, createItineraryItemSchema, itinerarySchemas } from "@/features/itinerary/schemas";
import { itineraryTypes } from "@/types/domain";

describe("itinerary schemas", () => {
  it("supports all six itinerary types", () => {
    for (const type of itineraryTypes) {
      expect(createItineraryItemSchema.safeParse({ type }).success).toBe(true);
      expect(itinerarySchemas[type].safeParse({ type }).success).toBe(true);
    }
  });

  it("rejects a type-specific schema with a different type", () => {
    expect(itinerarySchemas.flight.safeParse({ type: "restaurant" }).success).toBe(false);
    expect(itinerarySchemas.attraction.safeParse({ type: "flight" }).success).toBe(false);
  });

  it("validates optional booking fields without making them required", () => {
    expect(bookingSchema.safeParse({}).success).toBe(true);
    expect(bookingSchema.safeParse({ referenceUrl: "not-a-url" }).success).toBe(false);
    expect(bookingSchema.safeParse({ providerName: "航空公司", confirmationCode: "ABC123" }).success).toBe(true);
  });

  it("accepts partially completed items", () => {
    expect(
      createItineraryItemSchema.safeParse({
        type: "attraction",
        title: null,
        date: null,
      }).success,
    ).toBe(true);
  });

  it("rejects end time before start time", () => {
    const result = createItineraryItemSchema.safeParse({
      type: "restaurant",
      date: "2026-12-24",
      startTime: "19:00",
      endTime: "18:00",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("結束時間不可早於開始時間");
    }
  });

  it("requires coordinate pairs within valid ranges", () => {
    expect(
      createItineraryItemSchema.safeParse({
        type: "attraction",
        place: { latitude: 25.03, longitude: 121.56 },
      }).success,
    ).toBe(true);

    expect(
      createItineraryItemSchema.safeParse({
        type: "attraction",
        place: { latitude: 25.03 },
      }).success,
    ).toBe(false);

    expect(
      createItineraryItemSchema.safeParse({
        type: "attraction",
        place: { latitude: 95, longitude: 121.56 },
      }).success,
    ).toBe(false);
  });
});