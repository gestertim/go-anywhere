import Link from "next/link";
import { getTrips } from "@/features/trips/queries";
import styles from "./trips.module.css";

function PinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s6-5.4 6-10A6 6 0 0 0 6 11c0 4.6 6 10 6 10Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" /></svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function CompassIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

export default async function TripsPage() {
  const trips = await getTrips();
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headline}>
          <p className={styles.eyebrow}>你的旅程</p>
          <h1 className={styles.title}>行程</h1>
          <p className={styles.subtitle}>{trips.length ? `共 ${trips.length} 趟旅程，點選任一趟查看行程。` : "建立你的第一趟旅程，開始規劃行程。"}</p>
        </div>
        {trips.length ? <Link className={styles.createLink} href="/trips/new"><PlusIcon />建立旅程</Link> : null}
      </header>
      {trips.length ? (
        <div className={styles.grid}>
          {trips.map((trip) => (
            <Link key={trip.id} className={styles.card} href={`/trips/${trip.id}`}>
              <div className={styles.cardHead}>
                <span className={styles.dest}><PinIcon /><span className={styles.destName}>{trip.destination}</span></span>
                <span className={styles.arrow} aria-hidden="true"><ArrowIcon /></span>
              </div>
              <h2 className={styles.cardTitle}>{trip.title}</h2>
              <div className={styles.dates}>
                <span className={styles.dateNode}><span className={styles.dateLabel}>出發</span><span className={styles.dateValue}>{trip.startDate}</span></span>
                <span className={styles.dateConnector} aria-hidden="true" />
                <span className={styles.dateNode}><span className={styles.dateLabel}>回程</span><span className={styles.dateValue}>{trip.endDate}</span></span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <section className={styles.empty} aria-live="polite">
          <span className={styles.emptyIcon}><CompassIcon /></span>
          <h2 className={styles.emptyTitle}>還沒有旅程</h2>
          <p className={styles.emptyText}>建立你的第一趟旅程，開始規劃目的地與每日行程。</p>
          <Link className={styles.emptyCta} href="/trips/new"><PlusIcon />建立第一趟旅程</Link>
        </section>
      )}
    </main>
  );
}
