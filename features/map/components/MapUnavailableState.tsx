import Link from "next/link";

export function MapUnavailableState({ tripId, date, reason = "目前無法載入地圖", detail }: { tripId: string; date: string; reason?: string; detail?: string }) {
  return (
    <section role="alert">
      <h2>{reason}</h2>
      <p>你的文字行程仍然可以使用。</p>
      {detail ? <p style={{ fontSize: 12, opacity: 0.7 }}>詳細資訊：{detail}</p> : null}
      <Link href={`/trips/${tripId}?view=timeline&date=${date}`}>回到時間軸</Link>
    </section>
  );
}
