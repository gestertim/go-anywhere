export function getNoteDraftState(currentContent: string, savedContent: string) {
  const current = currentContent.trim();
  const saved = savedContent.trim();
  return {
    isEmpty: current.length === 0,
    isDirty: current !== saved,
  };
}