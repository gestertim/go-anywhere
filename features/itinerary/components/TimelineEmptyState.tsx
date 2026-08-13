import Link from "next/link";

export function TimelineEmptyState() {
  return <section><h2>這天還沒有行程</h2><p>留一點空白，也可以從下一站開始。</p><Link href="#add-itinerary">新增行程</Link></section>;
}
