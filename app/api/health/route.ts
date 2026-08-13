import { NextResponse } from "next/server";

export function GET() {
  const mapboxAvailable = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
  return NextResponse.json({
    status: mapboxAvailable ? "ok" : "degraded",
    service: "go-anywhere",
    dependencies: {
      mapbox: {
        status: mapboxAvailable ? "available" : "unavailable",
        recoverable: !mapboxAvailable,
      },
    },
  });
}
