"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setError("登入失敗，請確認帳號與密碼。");
      else window.location.assign("/explore");
    } catch {
      setError("登入失敗，請稍後再試。");
    } finally {
      setPending(false);
    }
  }

  return (
    <main>
      <p>Go Anywhere</p>
      <h1>回到你的旅程</h1>
      <form onSubmit={submit}>
        <label>電子信箱<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>密碼<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error ? <p role="alert">{error}</p> : null}
        <button className="login-submit" type="submit" disabled={pending} aria-busy={pending}>
          {pending ? <><span className="spinner" aria-hidden="true" />登入中…</> : "登入"}
        </button>
      </form>
    </main>
  );
}
