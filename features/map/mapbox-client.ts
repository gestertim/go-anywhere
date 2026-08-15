"use client";

export function getMapboxToken() {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? null;
}

export function isMapboxAvailable() {
  return Boolean(getMapboxToken());
}
