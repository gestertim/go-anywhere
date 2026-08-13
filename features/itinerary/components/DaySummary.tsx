export function DaySummary({ activeDate, itemCount }: { activeDate: string; itemCount: number }) {
  return <header><p>目前日期</p><h2>{activeDate}</h2><p>{itemCount} 個行程</p></header>;
}
