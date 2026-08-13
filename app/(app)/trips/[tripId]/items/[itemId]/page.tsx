import Link from "next/link";
import { notFound } from "next/navigation";
import { getItineraryItem } from "@/features/itinerary/queries";
import { DeleteItineraryButton } from "@/features/itinerary/components/DeleteItineraryButton";

export default async function ItineraryDetailPage({ params }: { params: Promise<{ tripId: string; itemId: string }> }) {
  const { tripId, itemId } = await params;
  const item = await getItineraryItem(itemId);
  if (!item || item.tripId !== tripId) notFound();
  return <main><Link href={`/trips/${tripId}`}>返回時間軸</Link><p>{item.type}</p><h1>{item.title || "未命名行程"}</h1><p>{item.date || "待補日期"} · {item.startTime || "待補時間"}</p><p>{item.place?.name || "尚未設定地點"}</p>{item.place?.address ? <p>{item.place.address}</p> : null}{item.booking ? <section><h2>預訂資訊</h2><p>{item.booking.providerName || "預訂供應商"}</p>{item.booking.confirmationCode ? <p>確認碼：{item.booking.confirmationCode}</p> : null}</section> : null}{item.notes ? <p>{item.notes}</p> : null}<Link href={`/trips/${tripId}/items/${itemId}/edit`}>編輯</Link><DeleteItineraryButton itemId={itemId} tripId={tripId} title={item.title || "未命名行程"} /></main>;
}
