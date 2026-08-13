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

export function DateSwitcher({ tripId, startDate, endDate, activeDate }: { tripId: string; startDate: string; endDate: string; activeDate: string }) {
  return <nav aria-label="旅程日期">{dateRange(startDate, endDate).map((date, index) => <Link key={date} aria-current={date === activeDate ? "date" : undefined} href={`/trips/${tripId}?view=timeline&date=${date}`}>第 {index + 1} 天<br />{date.slice(5)}</Link>)}</nav>;
}
