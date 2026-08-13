import type { ItineraryItem } from "@/types/domain";
import { getMapItemsForDate } from "@/lib/dates/sort";

export function getMarkerItems(items: ItineraryItem[], activeDate: string) {
  return getMapItemsForDate(items, activeDate).map((item, index) => ({
    id: item.id,
    order: index + 1,
    title: item.title || "未命名行程",
    time: item.startTime || "待補時間",
    latitude: item.place!.latitude!,
    longitude: item.place!.longitude!,
  }));
}
