import { NoteEditor } from "@/features/notes/components/NoteEditor";
import { getTripNote } from "@/features/notes/queries";
import { cookies } from "next/headers";
import { noteDraftCookieName } from "@/lib/notes/drafts";

export default async function TripNotesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const note = await getTripNote(tripId);
  const draft = (await cookies()).get(noteDraftCookieName(tripId))?.value;
  return <main><h1>旅程筆記</h1><NoteEditor tripId={tripId} content={draft ? decodeURIComponent(draft) : note?.content ?? ""} /></main>;
}
