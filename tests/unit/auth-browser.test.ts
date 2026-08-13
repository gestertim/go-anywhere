// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearPrivateBrowserState } from "@/lib/auth/browser";

describe("browser private state cleanup", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal("caches", {
      keys: vi.fn(async () => ["go-anywhere-shell-v1", "unrelated-cache"]),
      delete: vi.fn(async () => true),
    });
  });

  it("clears browser storage and only deletes Go Anywhere caches", async () => {
    localStorage.setItem("selected-trip", "private-trip");
    sessionStorage.setItem("draft", "private-draft");
    await clearPrivateBrowserState();

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(caches.delete).toHaveBeenCalledWith("go-anywhere-shell-v1");
    expect(caches.delete).not.toHaveBeenCalledWith("unrelated-cache");
  });

  it("is safe when called outside a browser", async () => {
    const originalWindow = globalThis.window;
    vi.stubGlobal("window", undefined);
    await expect(clearPrivateBrowserState()).resolves.toBeUndefined();
    vi.stubGlobal("window", originalWindow);
  });
});