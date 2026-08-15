"use client";

import { getMapboxToken } from "@/features/map/mapbox-client";

export type GeocodeResult = {
  id: string;
  name: string;
  placeName: string;
  latitude: number;
  longitude: number;
};

export async function searchPlaces(query: string): Promise<GeocodeResult[]> {
  const token = getMapboxToken();
  const trimmed = query.trim();
  if (!token || !trimmed) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?access_token=${token}&language=zh-Hant&limit=5`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = (await response.json()) as {
    features?: Array<{ id: string; text: string; place_name: string; center: [number, number] }>;
  };
  return (data.features ?? []).map((feature) => ({
    id: feature.id,
    name: feature.text,
    placeName: feature.place_name,
    latitude: feature.center[1],
    longitude: feature.center[0],
  }));
}
