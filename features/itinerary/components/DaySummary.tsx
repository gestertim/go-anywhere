export function DaySummary({ activeDate, itemCount }: { activeDate: string; itemCount: number }) {
  return <header className="day-summary"><div><p>行程時間軸</p><h2>{activeDate}</h2></div><span className="day-count">{itemCount} 個行程</span></header>;
}
