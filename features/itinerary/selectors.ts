import type { ItineraryItem } from "@/types/domain";
import { compareItineraryItems, groupItineraryItemsByDate } from "@/lib/dates/sort";

export function getItemsForActiveDate(items: ItineraryItem[], activeDate: string | null): ItineraryItem[] {
  return items.filter((item) => item.date === activeDate).sort(compareItineraryItems);
}

export function resolveSelectedItemId(items: ItineraryItem[], selectedItemId: string | null): string | null {
  if (!selectedItemId) return null;
  return items.some((item) => item.id === selectedItemId) ? selectedItemId : null;
}

export { compareItineraryItems, groupItineraryItemsByDate };
