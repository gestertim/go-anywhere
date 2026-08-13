import Link from "next/link";
import type { ItineraryItem } from "@/types/domain";
import { getBookedItems } from "@/features/bookings/selectors";

export function BookingList({ items }: { items: ItineraryItem[] }) {
  const booked = getBookedItems(items);
  if (!booked.length) return <section><h2>還沒有預訂資訊</h2><p>有預訂資料的航班與住宿會出現在這裡。</p></section>;
  return <div>{booked.map((item) => <Link key={item.id} href={`/trips/${item.tripId}/items/${item.id}`}><article><p>{item.date || "待補日期"}</p><h2>{item.title || "未命名行程"}</h2><p>{item.booking?.providerName || "預訂資訊"}</p></article></Link>)}</div>;
}
