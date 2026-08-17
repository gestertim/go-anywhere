import Link from "next/link";
import { getTrips } from "@/features/trips/queries";
import styles from "./explore.module.css";

function PinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s6-5.4 6-10A6 6 0 0 0 6 11c0 4.6 6 10 6 10Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" /></svg>;
}

function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" /><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}

function CompassIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

export default async function ExplorePage() {
  const trips = await getTrips();
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headline}>
          <p className={styles.eyebrow}>Go Anywhere</p>
          <h1 className={styles.title}>探索你的下一站</h1>
          <p className={styles.subtitle}>挑一趟旅程，開始規劃你的行程。</p>
        </div>
        {trips.length ? <Link className={styles.createLink} href="/trips/new"><PlusIcon />建立旅程</Link> : null}
      </header>
      {trips.length ? (
        <div className={styles.grid}>
          {trips.map((trip) => (
            <Link key={trip.id} className={styles.card} href={`/trips/${trip.id}`}>
              <div className={styles.cardTop}>
                <span className={styles.dest}><PinIcon /><span className={styles.destName}>{trip.destination}</span></span>
                <span className={styles.datePill}>{trip.startDate} 至 {trip.endDate}</span>
              </div>
              <h2 className={styles.cardTitle}>{trip.title}</h2>
              <span className={styles.cardFoot}><CalendarIcon />查看行程</span>
            </Link>
          ))}
        </div>
      ) : (
        <section className={styles.empty} aria-live="polite">
          <span className={styles.emptyIcon}><CompassIcon /></span>
          <h2 className={styles.emptyTitle}>從一趟旅程開始</h2>
          <p className={styles.emptyText}>還沒有任何旅程。建立你的第一趟旅程，開始規劃目的地與行程。</p>
          <Link className={styles.emptyCta} href="/trips/new"><PlusIcon />建立旅程</Link>
        </section>
      )}
    </main>
  );
}
