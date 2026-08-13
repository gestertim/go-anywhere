import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";

describe("PWA manifest", () => {
  it("defines a Traditional Chinese standalone install experience", () => {
    const result = manifest();
    expect(result.name).toBe("Go Anywhere");
    expect(result.short_name).toBe("Go Anywhere");
    expect(result.lang).toBe("zh-Hant");
    expect(result.display).toBe("standalone");
    expect(result.start_url).toBe("/");
    expect(result.theme_color).toBeTruthy();
    expect(result.background_color).toBeTruthy();
    expect(result.icons?.some((icon) => icon.src === "/icons/icon.svg")).toBe(true);
  });
});
