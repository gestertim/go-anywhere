import { BottomNavigation } from "@/components/navigation/BottomNavigation";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><div>{children}</div><BottomNavigation /></>;
}
