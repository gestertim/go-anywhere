import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NoteEditor } from "@/features/notes/components/NoteEditor";
import { saveTripNoteAction } from "@/features/notes/actions";

const mockUpsert = vi.fn();
const mockFrom = vi.fn(() => ({ upsert: mockUpsert }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ from: mockFrom })),
}));

describe("note save failure handling", () => {
  beforeEach(() => {
    mockUpsert.mockReset();
    mockFrom.mockClear();
  });

  it("returns a retryable error without reporting success when persistence fails", async () => {
    mockUpsert.mockResolvedValue({ error: new Error("network failure") });
    const formData = new FormData();
    formData.set("tripId", "trip-1");
    formData.set("content", "尚未送出的私人筆記");

    await expect(saveTripNoteAction({}, formData)).resolves.toEqual({ error: "儲存失敗，你的筆記仍保留。", content: "尚未送出的私人筆記" });
    expect(mockUpsert).toHaveBeenCalledWith({ trip_id: "trip-1", content: "尚未送出的私人筆記" }, { onConflict: "trip_id" });
  });

  it("renders the existing draft value so a failed submit does not clear it", () => {
    render(<NoteEditor tripId="trip-1" content="原本已輸入的筆記" />);
    expect(screen.getByRole("textbox", { name: "旅程筆記" })).toHaveValue("原本已輸入的筆記");
    expect(screen.getByRole("button", { name: "儲存筆記" })).toBeVisible();
  });
});
