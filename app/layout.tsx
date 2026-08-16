import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-tc",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Go Anywhere",
  description: "整理旅程，輕鬆出發",
};

export const viewport: Viewport = {
  themeColor: "#2b7cf6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" className={notoSansTC.variable}>
      <body><ServiceWorkerRegistration />{children}</body>
    </html>
  );
}
