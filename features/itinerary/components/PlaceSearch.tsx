"use client";

import { useEffect, useState, type RefObject } from "react";
import { searchPlaces, type GeocodeResult } from "@/features/map/geocoding";

export function PlaceSearch({
  placeNameRef,
  addressRef,
  latitudeRef,
  longitudeRef,
  destination,
}: {
  placeNameRef: RefObject<HTMLInputElement | null>;
  addressRef: RefObject<HTMLInputElement | null>;
  latitudeRef: RefObject<HTMLInputElement | null>;
  longitudeRef: RefObject<HTMLInputElement | null>;
  destination?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [autoStatus, setAutoStatus] = useState<string | null>(null);

  async function handleSearch() {
    setSearching(true);
    const found = await searchPlaces(query, { destination });
    setResults(found);
    setSearching(false);
  }

  function applyResult(result: GeocodeResult) {
    if (placeNameRef.current) placeNameRef.current.value = result.name;
    if (addressRef.current) addressRef.current.value = result.placeName;
    if (latitudeRef.current) latitudeRef.current.value = String(result.latitude);
    if (longitudeRef.current) longitudeRef.current.value = String(result.longitude);
    setResults([]);
    setAutoStatus(null);
  }

  // Users can type a name or address directly (no search dropdown needed) and
  // never have to type latitude/longitude by hand — we geocode it silently
  // once they leave the field, as long as coordinates aren't already set.
  useEffect(() => {
    const placeNameEl = placeNameRef.current;
    const addressEl = addressRef.current;
    if (!placeNameEl && !addressEl) return;

    async function autoGeocode(value: string) {
      const trimmed = value.trim();
      const hasCoords = Boolean(latitudeRef.current?.value) && Boolean(longitudeRef.current?.value);
      if (!trimmed || hasCoords) return;
      setAutoStatus("定位中…");
      const found = await searchPlaces(trimmed, { destination });
      const best = found[0];
      if (best) {
        if (latitudeRef.current) latitudeRef.current.value = String(best.latitude);
        if (longitudeRef.current) longitudeRef.current.value = String(best.longitude);
        if (addressEl && !addressEl.value) addressEl.value = best.placeName;
        setAutoStatus(`已自動定位：${best.placeName}`);
      } else {
        setAutoStatus("找不到對應座標，請手動填寫經緯度");
      }
    }

    const handlePlaceNameBlur = () => void autoGeocode(placeNameEl?.value ?? "");
    const handleAddressBlur = () => void autoGeocode(addressEl?.value ?? "");
    placeNameEl?.addEventListener("blur", handlePlaceNameBlur);
    addressEl?.addEventListener("blur", handleAddressBlur);
    return () => {
      placeNameEl?.removeEventListener("blur", handlePlaceNameBlur);
      addressEl?.removeEventListener("blur", handleAddressBlur);
    };
  }, [placeNameRef, addressRef, latitudeRef, longitudeRef, destination]);

  return (
    <fieldset>
      <legend>搜尋地點（選填，也可直接在下方填寫地點名稱或地址，系統會自動定位座標）</legend>
      <label>
        關鍵字
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例如：清水寺、池袋站"
        />
      </label>
      <button type="button" onClick={handleSearch} disabled={searching || !query.trim()}>
        {searching ? "搜尋中…" : "搜尋"}
      </button>
      {results.length > 0 ? (
        <ul>
          {results.map((result) => (
            <li key={result.id}>
              <button type="button" onClick={() => applyResult(result)}>
                {result.placeName}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {autoStatus ? <p role="status">{autoStatus}</p> : null}
    </fieldset>
  );
}
