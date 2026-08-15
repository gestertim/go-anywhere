"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const minimumPendingMs = 600;

async function waitForMinimumPending(startedAt: number) {
  const remainingMs = minimumPendingMs - (performance.now() - startedAt);
  if (remainingMs > 0) await new Promise((resolve) => setTimeout(resolve, remainingMs));
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致。");
      return;
    }

    const startedAt = performance.now();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const result = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/callback` },
      });
      await waitForMinimumPending(startedAt);

      if (result.error) {
        setError("註冊失敗，請確認電子信箱與密碼後再試。");
      } else if (result.data.session) {
        window.location.assign("/explore");
      } else {
        setMessage("註冊成功，請前往信箱完成驗證後再登入。");
      }
    } catch {
      await waitForMinimumPending(startedAt);
      setError("註冊失敗，請稍後再試。");
    } finally {
      setPending(false);
    }
  }

  return (
    <main>
      <p>Go Anywhere</p>
      <h1>建立你的帳號</h1>
      <form onSubmit={submit}>
        <label>電子信箱<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>密碼<input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <label>確認密碼<input type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
        {error ? <p role="alert">{error}</p> : null}
        {message ? <p role="status">{message}</p> : null}
        <button className="login-submit" type="submit" disabled={pending} aria-busy={pending}>
          {pending ? <><span className="spinner" aria-hidden="true" />註冊中…</> : "建立帳號"}
        </button>
      </form>
      <p className="auth-alternative">已經有帳號？ <Link href="/login">返回登入</Link></p>
    </main>
  );
}
