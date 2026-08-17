"use client";

import { useActionState } from "react";
import { createTripAction, type TripActionState } from "@/features/trips/actions";
import styles from "./new-trip.module.css";

const initialState: TripActionState = {};

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NewTripForm() {
  const [state, formAction, pending] = useActionState(createTripAction, initialState);
  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="title">旅程名稱<span className={styles.hint}>必填</span></label>
        <input id="title" className={styles.input} name="title" placeholder="例如：夏日京都" required />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="destination">目的地<span className={styles.hint}>必填</span></label>
        <input id="destination" className={styles.input} name="destination" placeholder="例如：京都，日本" required />
      </div>
      <div className={styles.dateGroup}>
        <span className={styles.dateGroupLabel}>旅程日期</span>
        <div className={styles.dateRow}>
          <div className={styles.dateField}>
            <label className={styles.dateFieldLabel} htmlFor="startDate">開始日期</label>
            <input id="startDate" className={styles.input} name="startDate" type="date" required />
          </div>
          <div className={styles.dateField}>
            <label className={styles.dateFieldLabel} htmlFor="endDate">結束日期</label>
            <input id="endDate" className={styles.input} name="endDate" type="date" required />
          </div>
        </div>
      </div>
      {state.error ? <p role="alert" className={styles.alert}><AlertIcon />{state.error}</p> : null}
      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? <><span className={styles.spinner} aria-hidden="true" />儲存中…</> : <><CheckIcon />建立旅程</>}
      </button>
    </form>
  );
}
