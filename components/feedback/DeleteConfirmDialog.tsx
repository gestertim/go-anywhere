"use client";

export function DeleteConfirmDialog({
  open,
  title,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="delete-title">
      <h2 id="delete-title">刪除「{title}」？</h2>
      <p>刪除後無法復原。</p>
      <button type="button" onClick={onCancel}>取消</button>
      <button type="button" onClick={onConfirm}>確認刪除</button>
    </div>
  );
}
