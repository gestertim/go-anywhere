"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type mapboxgl from "mapbox-gl";
import { getMarkerItems } from "@/features/map/selectors";
import { getMapboxToken, isMapboxAvailable } from "@/features/map/mapbox-client";
import { MapUnavailableState } from "@/features/map/components/MapUnavailableState";
import type { ItineraryItem } from "@/types/domain";
import styles from "@/features/map/components/map-view.module.css";

export function MapView({ tripId, date, items }: { tripId: string; date: string; items: ItineraryItem[] }) {
  if (!isMapboxAvailable()) return <MapUnavailableState tripId={tripId} date={date} reason="地圖服務尚未設定" />;
  const markers = getMarkerItems(items, date);
  if (!markers.length) return <MapUnavailableState tripId={tripId} date={date} reason="這天沒有可定位的行程" />;
  return <InteractiveMap tripId={tripId} date={date} markers={markers} />;
}

function InteractiveMap({ tripId, date, markers }: { tripId: string; date: string; markers: ReturnType<typeof getMarkerItems>; }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [reason, setReason] = useState<string>("地圖載入失敗");
  const [detail, setDetail] = useState<string | undefined>(undefined);

  useEffect(() => {
    let map: mapboxgl.Map | undefined;
    let cancelled = false;
    if (!("WebGLRenderingContext" in window)) {
      setReason("此裝置或瀏覽器不支援 WebGL");
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
      // Localize labels only after the map has finished its first render so a
      // bad layer expression can never block the initial tile requests.
      map.once("idle", () => {
        map?.getStyle().layers?.forEach((layer) => {
          if (layer.type !== "symbol" || !layer.layout?.["text-field"]) return;
          try {
            map?.setLayoutProperty(layer.id, "text-field", [
              "coalesce",
              ["get", "name_zh-Hant"],
              ["get", "name_zh"],
              ["get", "name"],
            ]);
          } catch (labelError) {
            console.warn("mapbox label localization skipped for layer", layer.id, labelError);
          }
        });
      });
      map.on("error", (event) => {
        const rawError = event.error as (Error & { status?: number }) | undefined;
        const status = rawError?.status;
        const message = String(rawError?.message ?? rawError ?? "");
        if (status === 401 || status === 403 || /401|403|unauthorized|forbidden|access token|not authorized|domain|origin/i.test(message)) {
          setReason("地圖權限設定錯誤，請檢查 Mapbox token 的網域限制");
        } else {
          setReason("地圖載入失敗");
        }
        setDetail(status ? `HTTP ${status}${message ? ` - ${message}` : ""}` : message || undefined);
        console.error("mapbox load error", status, message || rawError);
        setFailed(true);
      });
      markers.forEach((marker) => {
        const link = document.createElement("a");
        link.href = `/trips/${tripId}/items/${marker.id}`;
        link.textContent = `${marker.order}. ${marker.title} · ${marker.time}`;
        const popup = new mapbox.Popup({ offset: 20 }).setDOMContent(link);
        new mapbox.Marker().setLngLat([marker.longitude, marker.latitude]).setPopup(popup).addTo(map!);
      });
    }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error("mapbox module import failed", error);
      setReason("地圖模組載入失敗");
      setDetail(message);
      setFailed(true);
    });
    return () => { cancelled = true; map?.remove(); };
  }, [markers, tripId]);

  if (failed) return <MapUnavailableState tripId={tripId} date={date} reason={reason} detail={detail} />;
  return (
    <section className={styles.mapView} aria-label="地圖">
      <div className={styles.summary}>
        <div className={styles.summaryText}>
          <p className={styles.summaryKicker}>地圖模式</p>
          <p className={styles.summaryDate}>{date}</p>
        </div>
        <span className={styles.summaryCount}><PinIcon />{markers.length} 個定位行程</span>
      </div>
      <div className={styles.mapShell}>
        <div ref={mapContainer} className={styles.mapCanvas} />
      </div>
      <ol className={styles.list}>
        {markers.map((marker) => (
          <li key={marker.id}>
            <Link className={styles.listItem} href={`/trips/${tripId}/items/${marker.id}`}>
              <span className={styles.order}>{marker.order}</span>
              <span className={styles.itemBody}>
                <span className={styles.itemTime}>{marker.time}</span>
                <span className={styles.itemTitle}>{marker.title}</span>
              </span>
              <span className={styles.chevron} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.summaryPin}><path d="M12 21s6-5.4 6-10A6 6 0 0 0 6 11c0 4.6 6 10 6 10Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" /></svg>;
}
