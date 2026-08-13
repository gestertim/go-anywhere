"use client";

import { clearPrivateBrowserState } from "@/lib/auth/browser";
import { signOutAction } from "@/lib/auth/actions";

export function LogoutButton() {
  async function prepareLogout() {
    await clearPrivateBrowserState();
  }

  return <form action={signOutAction} onSubmit={() => { void prepareLogout(); }}><button type="submit">登出</button></form>;
}