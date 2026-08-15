import type { ItineraryItem } from "@/types/domain";
import { ItineraryList } from "@/features/itinerary/components/ItineraryList";
import { TimelineEmptyState } from "@/features/itinerary/components/TimelineEmptyState";

export function Timeline({ tripId, items, activeDate }: { tripId: string; items: ItineraryItem[]; activeDate: string | null }) {
  const visibleItems = items.filter((item) => item.date === activeDate || (item.type === "accommodation" && item.date && item.endDate && activeDate && item.date <= activeDate && activeDate <= item.endDate));
  return visibleItems.length ? <ItineraryList items={visibleItems} /> : <TimelineEmptyState tripId={tripId} />;
}
