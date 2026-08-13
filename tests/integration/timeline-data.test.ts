import { beforeEach, describe, expect, it, vi } from "vitest";
import { getItineraryItems } from "@/features/itinerary/queries";

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();
const mockClient = { from: mockFrom };

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => mockClient),
}));

describe("timeline data integration", () => {
  beforeEach(() => {
    mockSelect.mockReset();
    mockEq.mockReset();
    mockFrom.mockReset();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
  });

  it("maps persisted itinerary rows for timeline usage", async () => {
    mockEq.mockResolvedValue({
      data: [
        {
          id: "item-1",
          trip_id: "trip-1",
          type: "attraction",
          title: "晴空塔",
          date: "2026-12-01",
          start_time: "10:00",
          end_time: null,
          notes: null,
          place: { id: "place-1", name: "東京", address: null, latitude: 35.7, longitude: 139.8 },
          booking: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ],
      error: null,
    });

    const items = await getItineraryItems("trip-1");
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("item-1");
    expect(items[0]?.place?.name).toBe("東京");
  });

  it("throws on load error instead of pretending empty", async () => {
    mockEq.mockResolvedValue({ data: null, error: new Error("db-failed") });
    await expect(getItineraryItems("trip-1")).rejects.toThrow("db-failed");
  });
});