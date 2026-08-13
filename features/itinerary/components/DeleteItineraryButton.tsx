"use client";

import { useState } from "react";
import { deleteItineraryAction } from "@/features/itinerary/actions";

export function DeleteItineraryButton({ itemId, tripId, title }: { itemId: string; tripId: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) return <button type="button" onClick={() => setConfirming(true)}>刪除行程</button>;
  return <span role="group" aria-label="刪除行程確認"><span>確定刪除「{title}」？</span><button type="button" onClick={() => setConfirming(false)}>取消</button><form action={() => deleteItineraryAction(itemId, tripId)}><button type="submit">確認刪除</button></form></span>;
}
