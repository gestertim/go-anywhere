import Link from "next/link";
import { EmptyState } from "@/components/feedback/EmptyState";
import { TripList } from "@/features/trips/components/TripList";
import { getTrips } from "@/features/trips/queries";

export default async function ExplorePage() {
  const trips = await getTrips();
  return <main><p>Go Anywhere</p><h1>探索你的下一站</h1>{trips.length ? <TripList trips={trips} /> : <EmptyState title="從一趟旅程開始" action={<Link href="/trips/new">建立旅程</Link>} />}</main>;
}
