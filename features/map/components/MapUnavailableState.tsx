import Link from "next/link";

export function MapUnavailableState({ tripId, date, reason = "目前無法載入地圖" }: { tripId: string; date: string; reason?: string }) {
  return <section role="alert"><h2>{reason}</h2><p>你的文字行程仍然可以使用。</p><Link href={`/trips/${tripId}?view=timeline&date=${date}`}>回到時間軸</Link></section>;
}
