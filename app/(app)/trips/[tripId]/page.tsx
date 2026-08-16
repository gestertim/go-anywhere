import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrip } from "@/features/trips/queries";
import { getItineraryItems } from "@/features/itinerary/queries";
import { ItineraryList } from "@/features/itinerary/components/ItineraryList";
import { Timeline } from "@/features/itinerary/components/Timeline";
import { DateSwitcher } from "@/features/itinerary/components/DateSwitcher";
import { DaySummary } from "@/features/itinerary/components/DaySummary";
import { MapView } from "@/features/map/components/MapView";
import { BookingList } from "@/features/bookings/components/BookingList";
import { NoteEditor } from "@/features/notes/components/NoteEditor";
import { getTripNote } from "@/features/notes/queries";
import { DeleteTripButton } from "@/features/trips/components/DeleteTripButton";
import styles from "@/features/itinerary/timeline.module.css";

function TimelineTabIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="7" r="2" stroke="currentColor" strokeWidth="1.8" /><circle cx="6" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" /><path d="M6 9v6M11 7h8M11 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function MapTabIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 4v14M15 6v14" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

function BookingsTabIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4 2 2 0 0 1 0-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M14 6v12" stroke="currentColor" strokeWidth="1.8" strokeDasharray="2 2" /></svg>;
}

function NotesTabIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M14 3v5h5M8.5 13h7M8.5 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

export default async function TripWorkspacePage({ params, searchParams }: { params: Promise<{ tripId: string }>; searchParams: Promise<{ view?: string; date?: string }> }) {
  const { tripId } = await params;
  const { view = "timeline", date } = await searchParams;
  const activeDate = date ?? null;
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  const items = await getItineraryItems(tripId);
  const note = view === "notes" ? await getTripNote(tripId) : null;
  const withView = (nextView: string) => {
    const params = new URLSearchParams({ view: nextView });
    if (activeDate) params.set("date", activeDate);
    return `/trips/${trip.id}?${params.toString()}`;
  };
  return (
    <main className={styles.page}>
      <Link className={styles.backLink} href="/trips">返回行程</Link>
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroDest}>{trip.destination}</p>
          <h1 className={styles.heroTitle}>{trip.title}</h1>
          <p className={styles.heroDates}>{trip.startDate} 至 {trip.endDate}</p>
        </div>
      </header>
      <nav className={styles.viewTabs} aria-label="旅程檢視">
        <Link aria-current={view === "timeline" ? "page" : undefined} href={withView("timeline")}><TimelineTabIcon /><span>時間軸</span></Link>
        <Link aria-current={view === "map" ? "page" : undefined} href={withView("map")}><MapTabIcon /><span>地圖</span></Link>
        <Link aria-current={view === "bookings" ? "page" : undefined} href={withView("bookings")}><BookingsTabIcon /><span>預訂</span></Link>
        <Link aria-current={view === "notes" ? "page" : undefined} href={withView("notes")}><NotesTabIcon /><span>筆記</span></Link>
      </nav>
        {view === "timeline" ? <><DateSwitcher tripId={trip.id} startDate={trip.startDate} endDate={trip.endDate} activeDate={activeDate ?? trip.startDate} /><DaySummary activeDate={activeDate ?? trip.startDate} itemCount={items.filter((item) => item.date === (activeDate ?? trip.startDate) || (item.type === "accommodation" && item.date && item.endDate && item.date <= (activeDate ?? trip.startDate) && (activeDate ?? trip.startDate) <= item.endDate)).length} /><Timeline tripId={trip.id} items={items} activeDate={activeDate ?? trip.startDate} /></> : view === "map" ? <><DateSwitcher tripId={trip.id} startDate={trip.startDate} endDate={trip.endDate} activeDate={activeDate ?? trip.startDate} /><MapView tripId={trip.id} date={activeDate ?? trip.startDate} items={items} /></> : view === "bookings" ? <BookingList items={items} /> : view === "notes" ? <NoteEditor tripId={trip.id} content={note?.content ?? ""} /> : <section className={styles.fallback}><h2>找不到這個檢視</h2><Link href={`/trips/${trip.id}?view=timeline&date=${activeDate ?? trip.startDate}`}>回到時間軸</Link></section>}
      <div className={styles.actions}>
        <Link className={styles.actionPrimary} href={`/trips/${trip.id}/items/new`}>新增行程</Link>
        <Link className={styles.actionSecondary} href={`/trips/${trip.id}/settings`}>編輯旅程</Link>
        <DeleteTripButton tripId={trip.id} title={trip.title} />
      </div>
    </main>
  );
}
