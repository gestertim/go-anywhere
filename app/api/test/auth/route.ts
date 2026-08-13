import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const productionE2EOptIn = process.env.NODE_ENV === "production" && process.env.PLAYWRIGHT_USE_PROD === "1";
  if ((process.env.NODE_ENV === "production" && !productionE2EOptIn) || request.headers.get("x-e2e-auth-secret") !== process.env.E2E_AUTH_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as { access_token?: string; refresh_token?: string };
  if (!body.access_token || !body.refresh_token) return NextResponse.json({ error: "Invalid session" }, { status: 400 });

  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => pendingCookies.push(...cookiesToSet),
      },
    },
  );

  const { error } = await supabase.auth.setSession({ access_token: body.access_token, refresh_token: body.refresh_token });
  if (error) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  for (const cookie of pendingCookies) response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}