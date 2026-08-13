"use client";

import { useActionState } from "react";
import { updateTripAction, type TripActionState } from "@/features/trips/actions";
import type { Trip } from "@/types/domain";

export function EditTripForm({ trip }: { trip: Trip }) {
  const [state, formAction, pending] = useActionState(updateTripAction, {} as TripActionState);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={trip.id} />
      <label>旅程名稱<input name="title" defaultValue={trip.title} required /></label>
      <label>目的地<input name="destination" defaultValue={trip.destination} required /></label>
      <label>開始日期<input name="startDate" type="date" defaultValue={trip.startDate} required /></label>
      <label>結束日期<input name="endDate" type="date" defaultValue={trip.endDate} required /></label>
      {state.error ? <p role="alert">{state.error}</p> : null}
      <button type="submit" disabled={pending}>{pending ? "儲存中…" : "儲存變更"}</button>
    </form>
  );
}
