"use client";

import { useActionState, useRef } from "react";
import { createItineraryAction } from "@/features/itinerary/actions";
import { PlaceSearch } from "@/features/itinerary/components/PlaceSearch";
import type { ItineraryType } from "@/types/domain";

const labels: Record<ItineraryType, string> = { flight: "航班", accommodation: "住宿", transportation: "交通", attraction: "景點", restaurant: "餐廳", other: "其他" };
export function ItineraryForm({ tripId, type, destination }: { tripId: string; type: ItineraryType; destination?: string }) {
  const [state, action, pending] = useActionState(createItineraryAction, {});
  const isAccommodation = type === "accommodation";
  const placeNameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const latitudeRef = useRef<HTMLInputElement>(null);
  const longitudeRef = useRef<HTMLInputElement>(null);
  return <form action={action}>
    <input type="hidden" name="tripId" value={tripId} /><input type="hidden" name="type" value={type} />
    <p>類型：{labels[type]}</p>
    <label>標題<input name="title" placeholder="例如：清水寺散步" /></label>
    {isAccommodation ? (
      <>
        <label>入住日期<input name="date" type="date" /></label>
        <label>退房日期<input name="endDate" type="date" /></label>
      </>
    ) : (
      <>
        <label>日期<input name="date" type="date" /></label>
        <label>開始時間<input name="startTime" type="time" /></label>
        <label>結束時間<input name="endTime" type="time" /></label>
      </>
    )}
    <PlaceSearch placeNameRef={placeNameRef} addressRef={addressRef} latitudeRef={latitudeRef} longitudeRef={longitudeRef} destination={destination} />
    <label>地點名稱<input ref={placeNameRef} name="placeName" placeholder="例如：清水寺" /></label>
    <label>地址<input ref={addressRef} name="address" placeholder="填寫地點名稱或地址後會自動定位" /></label>
    <label>緯度（通常不需手動填寫，系統會自動帶入）<input ref={latitudeRef} name="latitude" type="number" step="any" /></label>
    <label>經度（通常不需手動填寫，系統會自動帶入）<input ref={longitudeRef} name="longitude" type="number" step="any" /></label>
    <label>備註<textarea name="notes" /></label>
    <fieldset><legend>預訂資訊（選填）</legend><label>供應商<input name="providerName" /></label><label>確認碼<input name="confirmationCode" /></label><label>參考網址<input name="referenceUrl" type="url" /></label><label>預訂備註<textarea name="bookingDetails" /></label></fieldset>
    {state.error ? <p role="alert">{state.error}</p> : null}
    <button type="submit" disabled={pending}>{pending ? "儲存中…" : "儲存行程"}</button>
  </form>;
}
