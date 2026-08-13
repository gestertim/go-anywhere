import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const productionE2EOptIn = process.env.NODE_ENV === "production" && process.env.PLAYWRIGHT_USE_PROD === "1";
  if ((process.env.NODE_ENV === "production" && !productionE2EOptIn) || request.headers.get("x-e2e-auth-secret") !== process.env.E2E_AUTH_SECRET) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("e2e-fail-note-once", "1", { httpOnly: true, maxAge: 60, path: "/" });
  return response;
}