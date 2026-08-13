"use client";

import { useState } from "react";
import { deleteTripAction } from "@/features/trips/actions";

export function DeleteTripButton({ tripId, title }: { tripId: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  return confirming ? (
    <span role="group" aria-label="刪除確認">
      <span>確定刪除「{title}」？</span>
      <button type="button" onClick={() => setConfirming(false)}>取消</button>
      <form action={() => deleteTripAction(tripId)}><button type="submit">確認刪除</button></form>
    </span>
  ) : <button type="button" onClick={() => setConfirming(true)}>刪除旅程</button>;
}
