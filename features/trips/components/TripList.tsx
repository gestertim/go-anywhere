import type { Trip } from "@/types/domain";
import { TripCard } from "@/features/trips/components/TripCard";

export function TripList({ trips }: { trips: Trip[] }) {
  return <div>{trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}</div>;
}
