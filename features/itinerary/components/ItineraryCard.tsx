import Link from "next/link";
import type { ItineraryItem, ItineraryType } from "@/types/domain";

const labels: Record<ItineraryType, string> = { flight: "航班", accommodation: "住宿", transportation: "交通", attraction: "景點", restaurant: "餐廳", other: "其他" };

function TypeIcon({ type }: { type: ItineraryType }) {
  switch (type) {
    case "flight":
      return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.3 13.4 3.6 15l.9-2.2 4.3-1.6L6.6 7l1.7-.3 3.6 3.9 4.5-1.3a1.5 1.5 0 1 1 .8 2.9l-4.5 1.3-1 4.9-1.6.5-.3-4.2Z" fill="currentColor" /></svg>;
    case "accommodation":
      return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8v9M4 13h12a3 3 0 0 1 3 3v1M8 12h3.5a2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
    case "transportation":
      return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="5" width="14" height="11" rx="2.4" stroke="currentColor" strokeWidth="1.8" /><path d="M5 11h14M8.5 19l1-3M15.5 19l-1-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
    case "attraction":
      return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5 5.5 8v1h13V8L12 3.5ZM7 11v6M11 11v6M15 11v6M4.5 19h15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case "restaurant":
      return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.5 3.5v7M5.5 3.5v3.5a2 2 0 0 0 4 0V3.5M7.5 10.5v10M16.5 3.5c-1.4 1-2 3-2 5s.6 2.7 2 2.7v9.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
    default:
      return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="currentColor" /></svg>;
  }
}

function PinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="tl-pin"><path d="M12 21s6-5.4 6-10A6 6 0 0 0 6 11c0 4.6 6 10 6 10Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.7" /></svg>;
}

export function ItineraryCard({ item }: { item: ItineraryItem }) {
  const hasBooking = Boolean(item.booking && (item.booking.providerName || item.booking.confirmationCode || item.booking.referenceUrl || item.booking.details));
  return (
    <li className="tl-item" data-type={item.type}>
      <div className="tl-rail">
        <div className="tl-times">
          <span className="tl-start">{item.startTime ?? "待補"}</span>
          {item.endTime ? <span className="tl-end">{item.endTime}</span> : null}
        </div>
        <span className="tl-marker"><TypeIcon type={item.type} /></span>
      </div>
      <Link className="tl-card" href={`/trips/${item.tripId}/items/${item.id}`}>
        <div className="tl-card-top">
          <span className="tl-type">{labels[item.type]}</span>
          {hasBooking ? <span className="tl-badge">已預訂</span> : null}
        </div>
        <h3>{item.title || "未命名行程"}</h3>
        {item.booking?.providerName ? <p className="tl-provider">{item.booking.providerName}</p> : null}
        <p className="tl-place"><PinIcon />{item.place?.name || "尚未設定地點"}</p>
        {item.place?.address ? <p className="tl-addr">{item.place.address}</p> : null}
      </Link>
    </li>
  );
}
