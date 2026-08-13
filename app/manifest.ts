import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Go Anywhere",
    short_name: "Go Anywhere",
    description: "整理旅程與下一站的私人行程空間",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f2eb",
    theme_color: "#1f4e5f",
    lang: "zh-Hant",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
