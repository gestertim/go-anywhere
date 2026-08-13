export type AppErrorCode =
  | "validation"
  | "unauthenticated"
  | "unauthorized"
  | "network"
  | "storage"
  | "map-unavailable"
  | "unknown";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorMessages: Record<AppErrorCode, string> = {
  validation: "請檢查輸入內容。",
  unauthenticated: "請先登入後繼續。",
  unauthorized: "找不到這項私人資料。",
  network: "目前無法連線，請稍後重試。",
  storage: "儲存失敗，已保留你的輸入內容。",
  "map-unavailable": "目前無法載入地圖，你仍可使用時間軸。",
  unknown: "發生未預期的錯誤，請稍後重試。",
};
