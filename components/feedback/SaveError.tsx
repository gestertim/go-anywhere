export function SaveError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert">
      <p>儲存失敗，你的輸入內容仍保留。</p>
      <button type="button" onClick={onRetry}>重試儲存</button>
    </div>
  );
}
