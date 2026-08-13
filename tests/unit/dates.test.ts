import { describe, expect, it } from "vitest";
import { compareItineraryItems, getMapItemsForDate, groupItineraryItemsByDate } from "@/lib/dates/sort";
import type { ItineraryItem } from "@/types/domain";

const item = (id: string, date: string | null, startTime: string | null, latitude: number | null = null): ItineraryItem => ({
  id,
  tripId: "00000000-0000-4000-8000-000000000001",
  type: "attraction",
  title: id,
  date,
  startTime,
  endTime: null,
  place: latitude == null ? null : { id: `place-${id}`, name: id, address: null, latitude, longitude: 139.7 },
  notes: null,
  booking: null,
  createdAt: `2026-01-01T00:00:0${id}Z`,
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("itinerary date utilities", () => {
  it("groups and orders items deterministically", () => {
    const grouped = groupItineraryItemsByDate([item("2", "2026-06-16", "15:00"), item("1", "2026-06-16", "09:00"), item("3", null, null)]);
    expect(grouped.get("2026-06-16")?.map(({ id }) => id)).toEqual(["1", "2"]);
    expect([...grouped.keys()]).toEqual(["2026-06-16", null]);
  });

  it("filters map items by date and usable coordinates", () => {
    const items = [item("1", "2026-06-16", "09:00", 35.0), item("2", "2026-06-17", "09:00", 35.1), item("3", "2026-06-16", "10:00")];
    expect(getMapItemsForDate(items, "2026-06-16").map(({ id }) => id)).toEqual(["1"]);
  });

  it("keeps equal-time ordering stable through the ID tie-breaker", () => {
    expect(compareItineraryItems(item("a", "2026-06-16", "09:00"), item("b", "2026-06-16", "09:00"))).toBeLessThan(0);
  });
});
