import Link from "next/link";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TripList } from "@/features/trips/components/TripList";
import { getTrips } from "@/features/trips/queries";

export default async function TripsPage() {
  const trips = await getTrips();
  return <main><p>你的旅程</p><h1>行程</h1>{trips.length ? <TripList trips={trips} /> : <EmptyState title="還沒有旅程" action={<Link href="/trips/new">建立第一趟旅程</Link>} />}</main>;
}
