import Link from "next/link";

function dateRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

const weekdays = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"] as const;

export function DateSwitcher({ tripId, startDate, endDate, activeDate }: { tripId: string; startDate: string; endDate: string; activeDate: string }) {
  return <nav aria-label="旅程日期">{dateRange(startDate, endDate).map((date, index) => {
    const weekday = weekdays[new Date(`${date}T00:00:00Z`).getUTCDay()];
    return <Link key={date} aria-label={`第 ${index + 1} 天 ${date} ${weekday}`} aria-current={date === activeDate ? "date" : undefined} href={`/trips/${tripId}?view=timeline&date=${date}`}><span className="ds-md">{date.slice(5).replace("-", "/")}</span><span className="ds-wd">{weekday}</span></Link>;
  })}</nav>;
}
