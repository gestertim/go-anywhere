import { beforeEach, describe, expect, it, vi } from "vitest";
import { signOutAction } from "@/lib/auth/actions";

const mockSignOut = vi.fn();
const mockClient = { auth: { signOut: mockSignOut } };

vi.mock("next/navigation", () => ({ redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }) }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn(async () => mockClient) }));

describe("auth session safety", () => {
  beforeEach(() => mockSignOut.mockReset());

  it("clears the Supabase session before redirecting to login", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    await expect(signOutAction()).rejects.toThrow("REDIRECT:/login");
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it("does not report a successful logout when Supabase returns an error", async () => {
    mockSignOut.mockResolvedValue({ error: new Error("network failure") });
    await expect(signOutAction()).rejects.toThrow("REDIRECT:/login");
    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});