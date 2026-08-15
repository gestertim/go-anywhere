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
    <main>
      <Link href="/trips">返回行程</Link>
      <p>{trip.destination}</p>
      <h1>{trip.title}</h1>
      <p>{trip.startDate} 至 {trip.endDate}</p>
      <nav aria-label="旅程檢視"><Link href={withView("timeline")}>時間軸</Link><Link href={withView("map")}>地圖</Link><Link href={withView("bookings")}>預訂</Link><Link href={withView("notes")}>筆記</Link></nav>
        {view === "timeline" ? <><DateSwitcher tripId={trip.id} startDate={trip.startDate} endDate={trip.endDate} activeDate={activeDate ?? trip.startDate} /><DaySummary activeDate={activeDate ?? trip.startDate} itemCount={items.filter((item) => item.date === (activeDate ?? trip.startDate) || (item.type === "accommodation" && item.date && item.endDate && item.date <= (activeDate ?? trip.startDate) && (activeDate ?? trip.startDate) <= item.endDate)).length} /><Timeline tripId={trip.id} items={items} activeDate={activeDate ?? trip.startDate} /></> : view === "map" ? <><DateSwitcher tripId={trip.id} startDate={trip.startDate} endDate={trip.endDate} activeDate={activeDate ?? trip.startDate} /><MapView tripId={trip.id} date={activeDate ?? trip.startDate} items={items} /></> : view === "bookings" ? <BookingList items={items} /> : view === "notes" ? <NoteEditor tripId={trip.id} content={note?.content ?? ""} /> : <section><h2>找不到這個檢視</h2><Link href={`/trips/${trip.id}?view=timeline&date=${activeDate ?? trip.startDate}`}>回到時間軸</Link></section>}
      <Link href={`/trips/${trip.id}/items/new`}>新增行程</Link>
      <Link href={`/trips/${trip.id}/settings`}>編輯旅程</Link>
      <DeleteTripButton tripId={trip.id} title={trip.title} />
    </main>
  );
}
