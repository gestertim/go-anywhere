"use client";

import { useActionState } from "react";
import { createTripAction, type TripActionState } from "@/features/trips/actions";

const initialState: TripActionState = {};

export function TripForm() {
  const [state, formAction, pending] = useActionState(createTripAction, initialState);
  return (
    <form action={formAction}>
      <label>旅程名稱<input name="title" placeholder="例如：夏日京都" required /></label>
      <label>目的地<input name="destination" placeholder="例如：京都，日本" required /></label>
      <label>開始日期<input name="startDate" type="date" required /></label>
      <label>結束日期<input name="endDate" type="date" required /></label>
      {state.error ? <p role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending}>{pending ? "儲存中…" : "建立旅程"}</button>
    </form>
  );
}
