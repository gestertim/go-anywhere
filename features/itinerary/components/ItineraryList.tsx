import type { ItineraryItem } from "@/types/domain";
import { ItineraryCard } from "@/features/itinerary/components/ItineraryCard";
import { compareItineraryItems } from "@/lib/dates/sort";
import styles from "@/features/itinerary/timeline.module.css";
export function ItineraryList({ items }: { items: ItineraryItem[] }) { return <ol className={styles.timeline}>{[...items].sort(compareItineraryItems).map((item) => <ItineraryCard key={item.id} item={item} />)}</ol>; }
