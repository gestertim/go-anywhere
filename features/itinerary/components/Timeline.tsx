import type { ItineraryItem } from "@/types/domain";
import { ItineraryList } from "@/features/itinerary/components/ItineraryList";
import { TimelineEmptyState } from "@/features/itinerary/components/TimelineEmptyState";

export function Timeline({ items, activeDate }: { items: ItineraryItem[]; activeDate: string | null }) {
  const visibleItems = items.filter((item) => item.date === activeDate);
  return visibleItems.length ? <ItineraryList items={visibleItems} /> : <TimelineEmptyState />;
}
