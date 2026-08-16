"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconProps = { className?: string };

function CompassIcon(_props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </svg>
  );
}

function SuitcaseIcon(_props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M12 11v5" />
    </svg>
  );
}

function PlusIcon(_props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TicketIcon(_props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" />
      <path d="M14 6v12" strokeDasharray="1.5 2.5" />
    </svg>
  );
}

function UserIcon(_props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

type NavLink = { label: string; href: string; Icon: (props: IconProps) => React.JSX.Element; accent?: boolean };

const links: NavLink[] = [
  { label: "探索", href: "/explore", Icon: CompassIcon },
  { label: "行程", href: "/trips", Icon: SuitcaseIcon },
  { label: "新增", href: "/trips/new", Icon: PlusIcon, accent: true },
  { label: "預訂", href: "/bookings", Icon: TicketIcon },
  { label: "帳戶", href: "/settings", Icon: UserIcon },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/trips/new") return pathname === "/trips/new";
  if (href === "/trips") return pathname === "/trips" || (pathname.startsWith("/trips/") && pathname !== "/trips/new");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="主要導航">
      {links.map(({ label, href, Icon, accent }) => (
        <Link
          key={href}
          href={href}
          data-active={isActive(pathname, href) ? "true" : undefined}
          data-accent={accent ? "true" : undefined}
          aria-current={isActive(pathname, href) ? "page" : undefined}
        >
          <Icon />
          {label}
        </Link>
      ))}
    </nav>
  );
}
