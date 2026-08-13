import { describe, expect, it } from "vitest";
import { getMarkerItems } from "@/features/map/selectors";
import type { ItineraryItem } from "@/types/domain";

const item = (args: Partial<ItineraryItem> & Pick<ItineraryItem, "id">): ItineraryItem => ({
  id: args.id,
  tripId: "00000000-0000-4000-8000-000000000001",
  type: "attraction",
  title: args.title ?? args.id,
  date: args.date ?? "2026-06-16",
  startTime: args.startTime ?? null,
  endTime: args.endTime ?? null,
  place:
    args.place ??
    ({
      id: `place-${args.id}`,
      name: args.id,
      address: null,
      latitude: 35,
      longitude: 139,
    } as ItineraryItem["place"]),
  notes: null,
  booking: null,
  createdAt: args.createdAt ?? "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("map selectors", () => {
  it("filters by active date and excludes invalid coordinates", () => {
    const markers = getMarkerItems(
      [
        item({ id: "today" }),
        item({ id: "other-date", date: "2026-06-17" }),
        item({ id: "missing-coordinates", place: { id: "p1", name: null, address: null, latitude: null, longitude: null } }),
        item({ id: "out-of-range", place: { id: "p2", name: null, address: null, latitude: -91, longitude: 139 } }),
      ],
      "2026-06-16",
    );

    expect(markers.map((x) => x.id)).toEqual(["today"]);
  });

  it("returns deterministic marker order based on itinerary sort", () => {
    const markers = getMarkerItems(
      [item({ id: "late", startTime: "18:00" }), item({ id: "early", startTime: "08:00" })],
      "2026-06-16",
    );

    expect(markers.map((x) => `${x.order}:${x.id}`)).toEqual(["1:early", "2:late"]);
  });

  it("returns an empty list when no marker is available", () => {
    const markers = getMarkerItems([item({ id: "only-other-date", date: "2026-06-17" })], "2026-06-16");
    expect(markers).toEqual([]);
  });
});