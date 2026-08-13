import type { ItineraryItem } from "@/types/domain";

export function getBookedItems(items: ItineraryItem[]) {
  return items.filter((item) => item.booking != null);
}
