"use client";

import { useActionState } from "react";
import { updateItineraryAction } from "@/features/itinerary/actions";
import type { ItineraryItem } from "@/types/domain";

export function EditItineraryForm({ item }: { item: ItineraryItem }) {
  const [state, action, pending] = useActionState(updateItineraryAction, {});
  return <form action={action}>
    <input type="hidden" name="itemId" value={item.id} /><input type="hidden" name="tripId" value={item.tripId} />
    <label>標題<input name="title" defaultValue={item.title ?? ""} /></label>
    <label>日期<input name="date" type="date" defaultValue={item.date ?? ""} /></label>
    <label>開始時間<input name="startTime" type="time" defaultValue={item.startTime ?? ""} /></label>
    <label>結束時間<input name="endTime" type="time" defaultValue={item.endTime ?? ""} /></label>
    <label>備註<textarea name="notes" defaultValue={item.notes ?? ""} /></label>
    <fieldset><legend>地點資訊</legend><label>地點名稱<input name="placeName" defaultValue={item.place?.name ?? ""} /></label><label>地址<input name="address" defaultValue={item.place?.address ?? ""} /></label><label>緯度<input name="latitude" type="number" step="any" defaultValue={item.place?.latitude ?? ""} /></label><label>經度<input name="longitude" type="number" step="any" defaultValue={item.place?.longitude ?? ""} /></label></fieldset>
    <fieldset><legend>預訂資訊（選填）</legend><label>供應商<input name="providerName" defaultValue={item.booking?.providerName ?? ""} /></label><label>確認碼<input name="confirmationCode" defaultValue={item.booking?.confirmationCode ?? ""} /></label><label>參考網址<input name="referenceUrl" type="url" defaultValue={item.booking?.referenceUrl ?? ""} /></label><label>預訂備註<textarea name="bookingDetails" defaultValue={item.booking?.details ?? ""} /></label></fieldset>
    {state.error ? <p role="alert">{state.error}</p> : null}
    <button type="submit" disabled={pending}>{pending ? "儲存中…" : "儲存變更"}</button>
  </form>;
}
