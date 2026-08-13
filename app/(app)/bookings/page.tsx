import { EmptyState } from "@/components/feedback/EmptyState";
import { getTrips } from "@/features/trips/queries";
import { getItineraryItems } from "@/features/itinerary/queries";
import { BookingList } from "@/features/bookings/components/BookingList";

export default async function BookingsPage() {
	const trips = await getTrips();
	if (!trips.length) return <main><h1>預訂</h1><EmptyState title="還沒有旅程" /></main>;
	const items = (await Promise.all(trips.map((trip) => getItineraryItems(trip.id)))).flat();
	return <main><h1>預訂</h1><BookingList items={items} /></main>;
}
