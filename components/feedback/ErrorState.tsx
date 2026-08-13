export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <section role="alert">
      <p>{message}</p>
      {retry ? <button type="button" onClick={retry}>再試一次</button> : null}
    </section>
  );
}
