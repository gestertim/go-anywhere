import { describe, expect, it } from "vitest";
import { getMarkerItems } from "@/features/map/selectors";
import { getBookedItems } from "@/features/bookings/selectors";
import type { ItineraryItem } from "@/types/domain";

const baseItem = (id: string, date: string, withCoordinates = true): ItineraryItem => ({
  id,
  tripId: "00000000-0000-4000-8000-000000000001",
  type: "attraction",
  title: id,
  date,
  startTime: "09:00",
  endTime: null,
  place: withCoordinates ? { id: `place-${id}`, name: id, address: null, latitude: 35, longitude: 139 } : null,
  notes: null,
  booking: id === "booked" ? { id: "booking-1", itineraryItemId: id, confirmationCode: "ABC", providerName: "供應商", referenceUrl: null, details: null } : null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("map and booking selectors", () => {
  it("filters map markers by active date and valid coordinates", () => {
    expect(getMarkerItems([baseItem("today", "2026-06-16"), baseItem("other-day", "2026-06-17"), baseItem("no-place", "2026-06-16", false)], "2026-06-16").map((item) => item.id)).toEqual(["today"]);
  });

  it("derives bookings from existing itinerary items", () => {
    expect(getBookedItems([baseItem("booked", "2026-06-16"), baseItem("plain", "2026-06-16")]).map((item) => item.id)).toEqual(["booked"]);
  });
});
