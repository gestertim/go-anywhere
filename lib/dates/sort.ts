import type { ItineraryItem } from "@/types/domain";

export function compareItineraryItems(left: ItineraryItem, right: ItineraryItem): number {
  const date = (left.date ?? "9999-12-31").localeCompare(right.date ?? "9999-12-31");
  if (date !== 0) return date;

  const missingTime = Number(left.startTime == null) - Number(right.startTime == null);
  if (missingTime !== 0) return missingTime;

  const start = (left.startTime ?? "99:99").localeCompare(right.startTime ?? "99:99");
  if (start !== 0) return start;

  const end = (left.endTime ?? "99:99").localeCompare(right.endTime ?? "99:99");
  if (end !== 0) return end;

  const created = left.createdAt.localeCompare(right.createdAt);
  return created !== 0 ? created : left.id.localeCompare(right.id);
}

export function groupItineraryItemsByDate(items: ItineraryItem[]): Map<string | null, ItineraryItem[]> {
  const grouped = new Map<string | null, ItineraryItem[]>();
  for (const item of [...items].sort(compareItineraryItems)) {
    const group = grouped.get(item.date) ?? [];
    group.push(item);
    grouped.set(item.date, group);
  }
  return grouped;
}

export function getMapItemsForDate(items: ItineraryItem[], activeDate: string): ItineraryItem[] {
  return items
    .filter(
      (item) =>
        item.date === activeDate &&
        item.place?.latitude != null &&
        item.place.longitude != null &&
        item.place.latitude >= -90 &&
        item.place.latitude <= 90 &&
        item.place.longitude >= -180 &&
        item.place.longitude <= 180,
    )
    .sort(compareItineraryItems);
}
