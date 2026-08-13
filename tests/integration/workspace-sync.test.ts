import { describe, expect, it } from "vitest";
import { getItemsForActiveDate, resolveSelectedItemId } from "@/features/itinerary/selectors";
import { getMarkerItems } from "@/features/map/selectors";
import type { ItineraryItem } from "@/types/domain";

const item = (id: string, date: string, hasCoordinates = true): ItineraryItem => ({
  id,
  tripId: "trip-1",
  type: "attraction",
  title: id,
  date,
  startTime: "09:00",
  endTime: null,
  place: hasCoordinates ? { id: `place-${id}`, name: id, address: null, latitude: 35, longitude: 139 } : null,
  notes: null,
  booking: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("workspace sync integration", () => {
  it("keeps timeline and map derived from same itinerary ids", () => {
    const items = [item("a", "2026-10-01"), item("b", "2026-10-01", false), item("c", "2026-10-02")];
    const timelineIds = getItemsForActiveDate(items, "2026-10-01").map((x) => x.id);
    const mapIds = getMarkerItems(items, "2026-10-01").map((x) => x.id);

    expect(timelineIds).toEqual(["a", "b"]);
    expect(mapIds).toEqual(["a"]);
  });

  it("changes active date without leaking previous date items", () => {
    const items = [item("d1", "2026-10-01"), item("d2", "2026-10-02")];
    expect(getItemsForActiveDate(items, "2026-10-01").map((x) => x.id)).toEqual(["d1"]);
    expect(getItemsForActiveDate(items, "2026-10-02").map((x) => x.id)).toEqual(["d2"]);
  });

  it("clears selection when selected item no longer exists", () => {
    const items = [item("keep", "2026-10-01")];
    expect(resolveSelectedItemId(items, "keep")).toBe("keep");
    expect(resolveSelectedItemId(items, "deleted")).toBeNull();
  });
});