// @vitest-environment node

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { middleware } from "@/middleware";

const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({ auth: { getUser: mockGetUser } })),
}));

describe("middleware session boundary", () => {
  beforeEach(() => mockGetUser.mockReset());

  it("redirects an expired session away from private routes", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await middleware(new NextRequest("http://localhost:3000/trips"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("allows an authenticated session to continue", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const response = await middleware(new NextRequest("http://localhost:3000/trips"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("does not protect the public login route", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const response = await middleware(new NextRequest("http://localhost:3000/login"));

    expect(response.status).toBe(200);
  });
});