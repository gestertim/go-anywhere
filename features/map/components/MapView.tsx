"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type mapboxgl from "mapbox-gl";
import { getMarkerItems } from "@/features/map/selectors";
import { getMapboxToken, isMapboxAvailable } from "@/features/map/mapbox-client";
import { MapUnavailableState } from "@/features/map/components/MapUnavailableState";
import type { ItineraryItem } from "@/types/domain";

export function MapView({ tripId, date, items }: { tripId: string; date: string; items: ItineraryItem[] }) {
  if (!isMapboxAvailable()) return <MapUnavailableState tripId={tripId} date={date} reason="地圖服務尚未設定" />;
  const markers = getMarkerItems(items, date);
  if (!markers.length) return <MapUnavailableState tripId={tripId} date={date} reason="這天沒有可定位的行程" />;
  return <InteractiveMap tripId={tripId} date={date} markers={markers} />;
}

function InteractiveMap({ tripId, date, markers }: { tripId: string; date: string; markers: ReturnType<typeof getMarkerItems>; }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let map: mapboxgl.Map | undefined;
    let cancelled = false;
    if (!("WebGLRenderingContext" in window)) {
      setFailed(true);
      return () => { cancelled = true; };
    }
    void import("mapbox-gl").then(({ default: mapbox }) => {
      if (cancelled || !mapContainer.current) return;
      mapbox.accessToken = getMapboxToken() ?? "";
      map = new mapbox.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [markers[0].longitude, markers[0].latitude],
        zoom: 11,
      });
      map.on("error", () => setFailed(true));
      markers.forEach((marker) => {
        const link = document.createElement("a");
        link.href = `/trips/${tripId}/items/${marker.id}`;
        link.textContent = `${marker.order}. ${marker.title} · ${marker.time}`;
        const popup = new mapbox.Popup({ offset: 20 }).setDOMContent(link);
        new mapbox.Marker().setLngLat([marker.longitude, marker.latitude]).setPopup(popup).addTo(map!);
      });
    }).catch(() => setFailed(true));
    return () => { cancelled = true; map?.remove(); };
  }, [markers, tripId]);

  if (failed) return <MapUnavailableState tripId={tripId} date={date} reason="地圖載入失敗" />;
  return <section aria-label="地圖"><div ref={mapContainer} style={{ minHeight: 420 }} />{markers.map((marker) => <Link key={marker.id} href={`/trips/${tripId}/items/${marker.id}`}><span>{marker.order}. {marker.time} · {marker.title}</span></Link>)}</section>;
}
