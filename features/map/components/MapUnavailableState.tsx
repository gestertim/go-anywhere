import Link from "next/link";
import styles from "@/features/map/components/map-view.module.css";

export function MapUnavailableState({ tripId, date, reason = "目前無法載入地圖", detail }: { tripId: string; date: string; reason?: string; detail?: string }) {
  return (
    <section className={styles.fallback} role="alert">
      <span className={styles.fallbackIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 21s6-5.4 6-10A6 6 0 0 0 6 11c0 4.6 6 10 6 10Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" /></svg>
      </span>
      <h2 className={styles.fallbackTitle}>{reason}</h2>
      <p className={styles.fallbackText}>你的文字行程仍然可以使用。</p>
      {detail ? <p className={styles.fallbackDetail}>詳細資訊：{detail}</p> : null}
      <Link className={styles.fallbackLink} href={`/trips/${tripId}?view=timeline&date=${date}`}>回到時間軸</Link>
    </section>
  );
}
