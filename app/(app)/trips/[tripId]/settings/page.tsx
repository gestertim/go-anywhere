import { notFound } from "next/navigation";
import { getTrip } from "@/features/trips/queries";
import { EditTripForm } from "@/features/trips/components/EditTripForm";

export default async function TripSettingsPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const trip = await getTrip(tripId);
  if (!trip) notFound();
  return <main><h1>編輯旅程</h1><EditTripForm trip={trip} /></main>;
}
