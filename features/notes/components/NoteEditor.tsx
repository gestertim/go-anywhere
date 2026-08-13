"use client";

import React from "react";
import { useEffect, useRef, useState } from "react";

export function NoteEditor({ tripId, content = "" }: { tripId: string; content?: string }) {
  const [state, setState] = useState<{ error?: string; success?: boolean }>({});
  const [pending, setPending] = useState(false);
  const draftKey = `go-anywhere-note-draft:${tripId}`;
  const initialDraft = typeof window === "undefined" ? content : window.sessionStorage.getItem(draftKey) ?? content;
  const draftRef = useRef(initialDraft);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
    if (state.success) window.sessionStorage.removeItem(draftKey);
  }, [draftKey, state.success]);
  function updateDraft(value: string) {
    draftRef.current = value;
  }

  async function saveDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({});
    try {
      const response = await fetch(`/api/trips/${tripId}/note`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: draftRef.current }) });
      const result = await response.json() as { error?: string; success?: boolean };
      if (!response.ok || result.error) setState({ error: result.error ?? "儲存失敗，你的筆記仍保留。" });
      else setState({ success: true });
    } catch {
      setState({ error: "儲存失敗，你的筆記仍保留。" });
    } finally {
      setPending(false);
    }
  }
  return <form data-hydrated={hydrated ? "true" : "false"} onSubmit={saveDraft}><label>旅程筆記<textarea name="content" defaultValue={initialDraft} onChange={(event) => updateDraft(event.target.value)} rows={8} placeholder="記下旅途中想留住的事。" /></label>{state.error ? <p role="alert">{state.error}</p> : null}{state.success ? <p role="status">筆記已儲存。</p> : null}<button type="submit" disabled={pending}>{pending ? "儲存中…" : state.error ? "重試儲存" : "儲存筆記"}</button></form>;
}
