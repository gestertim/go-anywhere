import Link from "next/link";
import styles from "@/features/itinerary/timeline.module.css";

export function TimelineEmptyState({ tripId }: { tripId: string }) {
  return <section className={styles.empty}><h2>這天還沒有行程</h2><p>留一點空白，也可以從下一站開始。</p><Link href={`/trips/${tripId}/items/new`}>新增行程</Link></section>;
}
