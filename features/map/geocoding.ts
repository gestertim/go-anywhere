"use client";

export type GeocodeResult = {
  id: string;
  name: string;
  placeName: string;
  latitude: number;
  longitude: number;
};

// Delegates to /api/places/search so the provider (Google Places or Mapbox
// fallback) is chosen server-side without exposing any provider-specific key
// to the client.
export async function searchPlaces(query: string, options?: { destination?: string }): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const params = new URLSearchParams({ q: trimmed });
  if (options?.destination) params.set("destination", options.destination);
  const response = await fetch(`/api/places/search?${params.toString()}`);
  if (!response.ok) return [];
  const data = (await response.json()) as { results?: GeocodeResult[] };
  return data.results ?? [];
}

