"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { PasswordField } from "@/app/(auth)/PasswordField";

const minimumPendingMs = 600;

async function waitForMinimumPending(startedAt: number) {
  const remainingMs = minimumPendingMs - (performance.now() - startedAt);
  if (remainingMs > 0) await new Promise((resolve) => setTimeout(resolve, remainingMs));
}

function signupErrorMessage(code?: string) {
  if (code === "over_email_send_rate_limit") return "驗證信寄送次數已達上限，請稍後再試。";
  if (code === "user_already_exists") return "此電子信箱已註冊，請返回登入。";
  if (code === "weak_password") return "密碼強度不足，請改用更安全的密碼。";
  if (code === "signup_disabled") return "目前暫停開放註冊。";
  return "註冊失敗，請確認電子信箱與密碼後再試。";
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
        setError(signupErrorMessage(result.error.code));
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
        <PasswordField label="密碼" autoComplete="new-password" minLength={8} value={password} onChange={setPassword} />
        <PasswordField label="確認密碼" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={setConfirmPassword} />
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
