import { notFound } from "next/navigation";
import { getItineraryItem } from "@/features/itinerary/queries";
import { EditItineraryForm } from "@/features/itinerary/components/EditItineraryForm";

export default async function EditItineraryPage({ params }: { params: Promise<{ tripId: string; itemId: string }> }) {
  const { tripId, itemId } = await params;
  const item = await getItineraryItem(itemId);
  if (!item || item.tripId !== tripId) notFound();
  return <main><h1>編輯行程</h1><EditItineraryForm item={item} /></main>;
}
