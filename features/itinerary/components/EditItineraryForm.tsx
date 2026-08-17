"use client";

import { useActionState, useRef } from "react";
import { updateItineraryAction } from "@/features/itinerary/actions";
import { PlaceSearch } from "@/features/itinerary/components/PlaceSearch";
import type { ItineraryItem } from "@/types/domain";

export function EditItineraryForm({ item, destination }: { item: ItineraryItem; destination?: string }) {
  const [state, action, pending] = useActionState(updateItineraryAction, {});
  const isAccommodation = item.type === "accommodation";
  const placeNameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const latitudeRef = useRef<HTMLInputElement>(null);
  const longitudeRef = useRef<HTMLInputElement>(null);
  return <form action={action}>
    <input type="hidden" name="itemId" value={item.id} /><input type="hidden" name="tripId" value={item.tripId} />
    <label>標題<input name="title" defaultValue={item.title ?? ""} /></label>
    {isAccommodation ? (
      <>
        <label>入住日期<input name="date" type="date" defaultValue={item.date ?? ""} /></label>
        <label>退房日期<input name="endDate" type="date" defaultValue={item.endDate ?? ""} /></label>
      </>
    ) : (
      <>
        <label>日期<input name="date" type="date" defaultValue={item.date ?? ""} /></label>
        <label>開始時間<input name="startTime" type="time" defaultValue={item.startTime ?? ""} /></label>
        <label>結束時間<input name="endTime" type="time" defaultValue={item.endTime ?? ""} /></label>
      </>
    )}
    <label>備註<textarea name="notes" defaultValue={item.notes ?? ""} /></label>
    <PlaceSearch placeNameRef={placeNameRef} addressRef={addressRef} latitudeRef={latitudeRef} longitudeRef={longitudeRef} destination={destination} />
    <fieldset><legend>地點資訊</legend><label>地點名稱<input ref={placeNameRef} name="placeName" defaultValue={item.place?.name ?? ""} /></label><label>地址<input ref={addressRef} name="address" defaultValue={item.place?.address ?? ""} placeholder="填寫地點名稱或地址後會自動定位" /></label><label>緯度（通常不需手動填寫，系統會自動帶入）<input ref={latitudeRef} name="latitude" type="number" step="any" defaultValue={item.place?.latitude ?? ""} /></label><label>經度（通常不需手動填寫，系統會自動帶入）<input ref={longitudeRef} name="longitude" type="number" step="any" defaultValue={item.place?.longitude ?? ""} /></label></fieldset>
    <fieldset><legend>預訂資訊（選填）</legend><label>供應商<input name="providerName" defaultValue={item.booking?.providerName ?? ""} /></label><label>確認碼<input name="confirmationCode" defaultValue={item.booking?.confirmationCode ?? ""} /></label><label>參考網址<input name="referenceUrl" type="url" defaultValue={item.booking?.referenceUrl ?? ""} /></label><label>預訂備註<textarea name="bookingDetails" defaultValue={item.booking?.details ?? ""} /></label></fieldset>
    {state.error ? <p role="alert">{state.error}</p> : null}
    <button type="submit" disabled={pending}>{pending ? "儲存中…" : "儲存變更"}</button>
  </form>;
}
