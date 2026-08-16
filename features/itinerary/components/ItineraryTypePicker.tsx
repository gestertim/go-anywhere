import Link from "next/link";
import { itineraryTypes, type ItineraryType } from "@/types/domain";

const labels: Record<ItineraryType, string> = { flight: "航班", accommodation: "住宿", transportation: "交通", attraction: "景點", restaurant: "餐廳", other: "其他" };
export function ItineraryTypePicker({ tripId }: { tripId: string }) {
  return <div className="type-picker">{itineraryTypes.map((type) => <Link key={type} href={`/trips/${tripId}/items/new?type=${type}`}>{labels[type]}</Link>)}</div>;
}
