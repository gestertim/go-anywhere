"use client";

import { useState, type RefObject } from "react";
import { searchPlaces, type GeocodeResult } from "@/features/map/geocoding";

export function PlaceSearch({
  placeNameRef,
  addressRef,
  latitudeRef,
  longitudeRef,
}: {
  placeNameRef: RefObject<HTMLInputElement | null>;
  addressRef: RefObject<HTMLInputElement | null>;
  latitudeRef: RefObject<HTMLInputElement | null>;
  longitudeRef: RefObject<HTMLInputElement | null>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    setSearching(true);
    const found = await searchPlaces(query);
    setResults(found);
    setSearching(false);
  }

  function applyResult(result: GeocodeResult) {
    if (placeNameRef.current) placeNameRef.current.value = result.name;
    if (addressRef.current) addressRef.current.value = result.placeName;
    if (latitudeRef.current) latitudeRef.current.value = String(result.latitude);
    if (longitudeRef.current) longitudeRef.current.value = String(result.longitude);
    setResults([]);
  }

  return (
    <fieldset>
      <legend>搜尋地點（選填，也可直接手動填寫地址與經緯度）</legend>
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
    </fieldset>
  );
}
