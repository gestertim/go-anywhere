import Link from "next/link";
import type { ItineraryItem } from "@/types/domain";

const labels = { flight: "航班", accommodation: "住宿", transportation: "交通", attraction: "景點", restaurant: "餐廳", other: "其他" } as const;
export function ItineraryCard({ item }: { item: ItineraryItem }) {
  return <Link href={`/trips/${item.tripId}/items/${item.id}`}><article><p>{item.startTime ?? "待補時間"} · {labels[item.type]}</p><h3>{item.title || "未命名行程"}</h3><p>{item.place?.name || "尚未設定地點"}</p></article></Link>;
}
