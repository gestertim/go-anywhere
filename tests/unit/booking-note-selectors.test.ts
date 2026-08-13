import { describe, expect, it } from "vitest";
import { getBookedItems } from "@/features/bookings/selectors";
import { getNoteDraftState } from "@/features/notes/selectors";
import type { ItineraryItem } from "@/types/domain";

const item = (id: string, hasBooking = false): ItineraryItem => ({
  id,
  tripId: "00000000-0000-4000-8000-000000000001",
  type: "flight",
  title: id,
  date: "2026-09-01",
  startTime: "09:00",
  endTime: null,
  place: null,
  notes: null,
  booking: hasBooking
    ? {
        id: `booking-${id}`,
        itineraryItemId: id,
        confirmationCode: "ABC123",
        providerName: "航空公司",
        referenceUrl: null,
        details: null,
      }
    : null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("booking and note selectors", () => {
  it("aggregates only itinerary items with booking", () => {
    const booked = getBookedItems([item("a", true), item("b", false), item("c", true)]);
    expect(booked.map((x) => x.id)).toEqual(["a", "c"]);
  });

  it("returns empty booking state when no booking exists", () => {
    expect(getBookedItems([item("a"), item("b")])).toEqual([]);
  });

  it("derives note draft state from saved content", () => {
    expect(getNoteDraftState("", "")).toEqual({ isEmpty: true, isDirty: false });
    expect(getNoteDraftState("已改內容", "原始內容")).toEqual({ isEmpty: false, isDirty: true });
    expect(getNoteDraftState("  原始內容  ", "原始內容")).toEqual({ isEmpty: false, isDirty: false });
  });
});