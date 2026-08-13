export function LoadingState({ label = "載入中…" }: { label?: string }) {
  return <p role="status">{label}</p>;
}
