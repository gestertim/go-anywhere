import { NextResponse } from "next/server";

type PlaceResult = {
  id: string;
  name: string;
  placeName: string;
  latitude: number;
  longitude: number;
};

async function searchGoogle(query: string, apiKey: string): Promise<PlaceResult[]> {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
    },
    body: JSON.stringify({ textQuery: query, languageCode: "zh-TW" }),
  });
  if (!response.ok) throw new Error(`Google Places search failed: ${response.status}`);
  const data = (await response.json()) as {
    places?: Array<{ id: string; displayName?: { text: string }; formattedAddress?: string; location?: { latitude: number; longitude: number } }>;
  };
  return (data.places ?? [])
    .filter((place) => place.location)
    .map((place) => ({
      id: place.id,
      name: place.displayName?.text ?? place.formattedAddress ?? query,
      placeName: place.formattedAddress ?? place.displayName?.text ?? query,
      latitude: place.location!.latitude,
      longitude: place.location!.longitude,
    }));
}

type MapboxV5Feature = { id: string; text: string; place_name: string; center: [number, number] };

// Mapbox Geocoding v5 (v6 requires an account-level scope this token doesn't
// have — confirmed via a 403). We compensate for v5's weaker CJK POI ranking
// with a real proximity bias instead of text tricks: resolve the trip
// destination to coordinates once, then rank the actual query near it.
async function geocodeV5(query: string, token: string, referer: string, opts: { types: string; proximity?: { longitude: number; latitude: number } }): Promise<PlaceResult[]> {
  const params = new URLSearchParams({
    access_token: token,
    language: "zh-Hant",
    autocomplete: "true",
    types: opts.types,
    limit: "8",
  });
  if (opts.proximity) params.set("proximity", `${opts.proximity.longitude},${opts.proximity.latitude}`);
  // This token has a Mapbox account URL restriction, so a server-side fetch
  // (no browser Referer) gets a 403. Forward the page's own Referer/origin,
  // which is already allow-listed since the client-side map view works.
  const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`, { headers: { Referer: referer } });
  if (!response.ok) throw new Error(`Mapbox geocoding failed: ${response.status}`);
  const data = (await response.json()) as { features?: MapboxV5Feature[] };
  return (data.features ?? []).map((feature) => ({
    id: feature.id,
    name: feature.text,
    placeName: feature.place_name,
    latitude: feature.center[1],
    longitude: feature.center[0],
  }));
}

// Resolves the trip destination (e.g. "台北") to coordinates once, then uses
// them as a proximity bias so the actual query ranks nearby landmarks first
// — the geographic equivalent of Google Maps searching "near <city>".
async function resolveProximity(destination: string, token: string, referer: string) {
  const matches = await geocodeV5(destination, token, referer, { types: "place,locality,region,country" });
  const first = matches[0];
  return first ? { longitude: first.longitude, latitude: first.latitude } : null;
}

async function searchMapbox(query: string, token: string, referer: string, destination?: string): Promise<PlaceResult[]> {
  const proximity = destination ? await resolveProximity(destination, token, referer) : null;
  const poiResults = await geocodeV5(query, token, referer, { types: "poi", proximity: proximity ?? undefined });
  if (poiResults.length > 0) return poiResults;
  return geocodeV5(query, token, referer, { types: "poi,address,place", proximity: proximity ?? undefined });
}

// Server-side place search so the client never needs a provider-specific API
// key. Prefers Google Places (better CJK landmark matching, e.g. "國父紀念館")
// and falls back to Mapbox geocoding when no Google key is configured.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const destination = searchParams.get("destination")?.trim();
  if (!query) return NextResponse.json({ results: [] });

  const googleKey = process.env.GOOGLE_PLACES_API_KEY;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const referer = request.headers.get("referer") ?? `${new URL(request.url).origin}/`;
  // Google's Places Text Search understands multi-term queries well, so
  // grounding the search with the trip destination (e.g. "國父紀念館 台北")
  // genuinely improves relevance here — Mapbox instead gets a real proximity
  // bias below since its CJK text matching is per-character, not per-word.
  const searchText = destination && !query.includes(destination) ? `${query} ${destination}` : query;

  try {
    if (googleKey) return NextResponse.json({ results: await searchGoogle(searchText, googleKey), provider: "google" });
    if (mapboxToken) return NextResponse.json({ results: await searchMapbox(query, mapboxToken, referer, destination), provider: "mapbox" });
    return NextResponse.json({ results: [] });
  } catch (error) {
    console.error("place search failed", error);
    return NextResponse.json({ results: [] }, { status: 502 });
  }
}
