import Link from "next/link";

const links = [
  ["探索", "/explore"],
  ["行程", "/trips"],
  ["新增", "/trips/new"],
  ["預訂", "/bookings"],
  ["我的", "/settings"],
] as const;

export function BottomNavigation() {
  return (
    <nav aria-label="主要導航">
      {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
    </nav>
  );
}
