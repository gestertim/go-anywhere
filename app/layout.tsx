import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistration } from "@/components/layout/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: "Go Anywhere",
  description: "整理旅程，輕鬆出發",
};

export const viewport: Viewport = {
  themeColor: "#1f4e5f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body><ServiceWorkerRegistration />{children}</body>
    </html>
  );
}
