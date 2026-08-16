import styles from "@/features/itinerary/timeline.module.css";

export function DaySummary({ activeDate, itemCount }: { activeDate: string; itemCount: number }) {
  return <header className={styles.daySummary}><div className={styles.daySummaryText}><p>行程時間軸</p><h2>{activeDate}</h2></div><span className={styles.dayCount}>{itemCount} 個行程</span></header>;
}
