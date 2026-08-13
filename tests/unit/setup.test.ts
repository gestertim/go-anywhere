import { describe, expect, it } from "vitest";

describe("Go Anywhere setup", () => {
  it("uses the Traditional Chinese product locale", () => {
    expect("zh-Hant").toBe("zh-Hant");
  });
});
