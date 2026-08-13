import Link from "next/link";
import type { Trip } from "@/types/domain";

export function TripCard({ trip }: { trip: Trip }) {
  return <Link href={`/trips/${trip.id}`}><article><p>{trip.startDate} 至 {trip.endDate}</p><h2>{trip.title}</h2><p>{trip.destination}</p></article></Link>;
}
