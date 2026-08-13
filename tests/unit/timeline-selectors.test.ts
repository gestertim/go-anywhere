import { describe, expect, it } from "vitest";
import { getItemsForActiveDate, groupItineraryItemsByDate } from "@/features/itinerary/selectors";
import type { ItineraryItem } from "@/types/domain";

const item = (id: string, date: string | null, startTime: string | null): ItineraryItem => ({
  id,
  tripId: "00000000-0000-4000-8000-000000000001",
  type: "attraction",
  title: id,
  date,
  startTime,
  endTime: null,
  place: null,
  notes: null,
  booking: null,
  createdAt: `2026-01-01T00:00:${id.padStart(2, "0")}Z`,
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("timeline selectors", () => {
  it("groups by date and keeps deterministic order", () => {
    const grouped = groupItineraryItemsByDate([
      item("2", "2026-06-16", "11:00"),
      item("1", "2026-06-16", "09:00"),
      item("3", "2026-06-17", null),
    ]);

    expect(grouped.get("2026-06-16")?.map((x) => x.id)).toEqual(["1", "2"]);
    expect(grouped.get("2026-06-17")?.map((x) => x.id)).toEqual(["3"]);
  });

  it("filters only active date items and puts no-time entries last", () => {
    const results = getItemsForActiveDate(
      [
        item("a", "2026-07-01", null),
        item("b", "2026-07-01", "08:00"),
        item("c", "2026-07-02", "09:00"),
      ],
      "2026-07-01",
    );

    expect(results.map((x) => x.id)).toEqual(["b", "a"]);
  });

  it("handles 100 items without dropping entries", () => {
    const items = Array.from({ length: 100 }, (_, index) =>
      item(String(index + 1), "2026-08-01", `${String(index % 24).padStart(2, "0")}:00`),
    );

    const results = getItemsForActiveDate(items, "2026-08-01");
    expect(results).toHaveLength(100);
  });
});