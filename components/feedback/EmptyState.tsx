export function EmptyState({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <section aria-live="polite">
      <h2>{title}</h2>
      {action}
    </section>
  );
}
