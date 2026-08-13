import type { ItineraryItem } from "@/types/domain";
import { ItineraryCard } from "@/features/itinerary/components/ItineraryCard";
import { compareItineraryItems } from "@/lib/dates/sort";
export function ItineraryList({ items }: { items: ItineraryItem[] }) { return <div>{[...items].sort(compareItineraryItems).map((item) => <ItineraryCard key={item.id} item={item} />)}</div>; }
