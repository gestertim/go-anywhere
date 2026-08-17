import { notFound } from "next/navigation";
import { getItineraryItem } from "@/features/itinerary/queries";
import { EditItineraryForm } from "@/features/itinerary/components/EditItineraryForm";
import { getTrip } from "@/features/trips/queries";

export default async function EditItineraryPage({ params }: { params: Promise<{ tripId: string; itemId: string }> }) {
  const { tripId, itemId } = await params;
  const item = await getItineraryItem(itemId);
  if (!item || item.tripId !== tripId) notFound();
  const trip = await getTrip(tripId);
  return <main><h1>編輯行程</h1><EditItineraryForm item={item} destination={trip?.destination} /></main>;
}
