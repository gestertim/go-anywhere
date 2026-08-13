# 資料存取契約

## 服務邊界

- Server Components、Server Actions 或 Route Handlers 使用 Supabase SSR client。
- Client Components 只使用公開 anon client，且所有資料存取仍受 PostgreSQL RLS 約束。
- service-role key、migration credentials 與管理 API 僅存在 server runtime，不得進入瀏覽器 bundle。

## 主要操作

| 操作 | 輸入 | 成功結果 | 失敗行為 |
|---|---|---|---|
| 建立旅程 | title、destination、start_date、end_date、可選 cover | 回傳新 Trip | 驗證錯誤回欄位；網路/DB 失敗保留表單 |
| 更新旅程 | Trip ID 與部分可編輯欄位 | 回傳更新後 Trip | 不屬於擁有者時視為無權限/不存在；保留輸入 |
| 刪除旅程 | Trip ID、使用者確認 | Trip 與子資料一致刪除 | 取消不變更；失敗顯示可重試錯誤 |
| 建立行程 | trip ID、六種 type 之一與可選欄位 | 回傳 Itinerary Item 及可選 Booking/Place | Zod 驗證；允許部分完成；保留輸入 |
| 更新行程 | Item ID 與變更欄位 | 回傳同一 ID 的更新資料 | 受 RLS 限制；保留輸入 |
| 刪除行程 | Item ID、使用者確認 | 從所有衍生檢視消失 | 取消不變更；失敗可重試 |
| 儲存筆記 | Trip ID、content | 回傳同一 Trip 的 Note | 受 RLS 限制；保留草稿 |
| 查詢工作區 | Trip ID、active date | 一份共享 ItineraryItem 集合及關聯資料 | 載入錯誤不偽裝為空資料 |

## 讀取一致性

- Timeline、Map、Bookings、Detail 由同一份查詢/快取資料或同一個重新驗證來源產生。
- mutation 成功後必須重新驗證相關路由或更新共享 query cache；不能只更新單一視圖。
- Map marker 是從目前日期資料與有效座標 selector 衍生，不能另查一份 itinerary store。

## 授權與錯誤

- 所有讀寫操作以登入 session 執行。
- PostgreSQL RLS 是最終授權邊界；UI 隱藏或 client-side filter 不是安全控制。
- 其他使用者的 ID、旅程標題、錯誤細節與存在性不得在 response 或日誌洩露。
- 對使用者顯示穩定的繁體中文錯誤類別；Sentry/Vercel 僅記必要的 request ID、錯誤類別與環境資訊。

## PWA / 網路契約

- Service worker 可快取版本化靜態資產與安全的 app shell。
- 不離線提交 Supabase mutation，不快取個人 API 回應作為跨帳號資料來源。
- 網路失敗時表單維持目前輸入，使用者可在恢復網路後重試。
