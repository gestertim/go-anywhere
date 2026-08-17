import Link from "next/link";
import { ItineraryTypePicker } from "@/features/itinerary/components/ItineraryTypePicker";
import { ItineraryForm } from "@/features/itinerary/components/ItineraryForm";
import { getTrip } from "@/features/trips/queries";
import { itineraryTypes, type ItineraryType } from "@/types/domain";

export default async function NewItineraryPage({ params, searchParams }: { params: Promise<{ tripId: string }>; searchParams: Promise<{ type?: string }> }) {
  const { tripId } = await params;
  const { type } = await searchParams;
  const selected = itineraryTypes.includes(type as ItineraryType) ? type as ItineraryType : null;
  const trip = await getTrip(tripId);
  return <main><Link href={`/trips/${tripId}`}>返回旅程</Link><h1>新增行程</h1>{selected ? <ItineraryForm tripId={tripId} type={selected} destination={trip?.destination} /> : <><p>先選擇行程類型</p><ItineraryTypePicker tripId={tripId} /></>}</main>;
}
