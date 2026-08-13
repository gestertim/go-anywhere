# Go Anywhere 實作完成計畫

**建立日期**：2026-08-13

**目前狀態**：Setup、Foundational 核心與 US1/US2 大部分功能已建立；Docker Desktop、Supabase migration 與真實 RLS 已驗證。目前 `npm test`（38 tests）、`npm run lint` 與 `npm run build` 可通過。尚未達到可發布狀態。

## 目標

將 Go Anywhere 從目前可編譯的功能骨架，推進到具備真實資料持久性、RLS 授權、每日時間軸、同步地圖、預訂、筆記、手機品質與發布驗證的 V1。

## 執行順序

### 第一階段：穩定資料與授權基礎

**優先級：Critical**

- 啟動本機 Supabase，套用 `supabase/migrations/202608130001_initial.sql`。
- 使用 Supabase CLI 產生正式的 `types/database.ts`，取代目前的手寫型別與暫時型別轉接。
- 驗證 trips、places、itinerary_items、bookings、trip_notes 的外鍵、constraint、cascade 與 index。
- 建立真實的 RLS integration tests：匿名使用者、其他使用者與旅程擁有者。
- 建立可隔離的 Supabase Auth 測試帳號與 Playwright session fixture。

**完成意義**：目前程式可以 build，但資料層尚未被真實 PostgreSQL 與 RLS 證明。這一階段完成後，隱私與持久性才有可靠基礎。

### 第二階段：完成 Trip 與 Itinerary CRUD MVP

**優先級：Critical**

- 完成 Trip 建立、讀取、編輯、刪除與重新載入持久性測試。
- 完成 Itinerary Item 編輯流程，包含 Place 的名稱、地址、緯度與經度。
- 確認部分完成行程可以儲存並清楚標示待補資訊。
- 確認刪除行程只刪除該行程，不會刪除整趟旅程。
- 移除 feature action 中重複的 Supabase 型別轉接，改用正式 generated types。

**完成意義**：這是最小可用產品。使用者可以安全地建立與維護私人旅程及行程資料。

### 第三階段：完成每日時間軸

**優先級：Critical**

- 使用共享 selector 依 `date` 分組。
- 依 `start_time`、`end_time`、`created_at`、`id` 穩定排序。
- 保留沒有日期或時間的部分完成項目。
- 建立日期切換器，將 active date 放入 URL。
- 顯示每日空狀態與新增行程入口。
- 卡片只優先顯示時間、標題、類型、地點與預訂狀態。
- 詳情頁顯示完整地址、備註與次要資料。

**完成意義**：回答旅途中最重要的問題：「今天去哪裡？下一個行程是什麼？幾點開始？」

### 第四階段：加入共享狀態的 Mapbox 地圖

**優先級：Critical**

- 建立 workspace state：`tripId`、`activeDate`、`view`、`selectedItemId`。
- Map 只從 Timeline 使用的同一份 Itinerary Item 資料衍生 marker。
- 只顯示目前日期且 Place 座標有效的項目。
- marker 顯示行程順序、時間與標題。
- marker preview 開啟與 Timeline 相同的詳情。
- Timeline 與 Map 切換時保留日期與選取項目。
- 處理 Mapbox token、WebGL、網路、style 載入失敗及無座標狀態。
- Mapbox 失敗時，Timeline 與詳情仍保持可用。

**完成意義**：讓使用者同時理解時間順序與地理位置，而且不會因地圖服務故障失去旅程資料。

### 第五階段：完成預訂與筆記

**優先級：High**

- 建立 Booking schema、selector 與儲存流程。
- 預訂檢視只從現有 Itinerary Item + Booking 關聯衍生，不建立第二份行程資料。
- 每筆預訂可返回原行程詳情。
- 建立 Trip Note 儲存、編輯、重新載入與儲存失敗重試。
- 補上預訂與筆記空狀態。

**完成意義**：完成旅程工作區的四個檢視：時間軸、地圖、預訂、筆記。

### 第六階段：產品狀態、手機品質與 PWA

**優先級：High**

- 驗證 loading、empty、save failure、network failure、Map unavailable、delete confirmation 與 retry。
- 確認儲存失敗時表單輸入不會消失。
- 使用手機 viewport 驗證底部導航、日期切換、表單與詳情。
- 檢查長繁體中文標題、地址與備註不重疊。
- 驗證 manifest 安裝、service worker 註冊與版本更新。
- 確認 service worker 不快取私人 API，也不假裝完成離線 mutation。
- 決定是否移除 `next-pwa`，因其相依鏈造成 npm audit 警告。

**完成意義**：讓產品適合旅客在手機與不穩定網路環境中使用。

### 第七階段：自動化驗收與發布

**優先級：Release Gate**

執行完整 Playwright 流程：

```text
登入
→ 建立旅程
→ 建立景點
→ 在時間軸確認
→ 切換到地圖
→ 選取 marker
→ 開啟相同行程詳情
→ 編輯行程
→ 刪除行程
```

接著執行：

```text
npm run lint
npm test
npm run test:integration
npm run test:e2e
npm run build
```

發布前確認：

- development 與 production 使用不同 Supabase 環境。
- Supabase service-role key 沒有進入瀏覽器 bundle。
- Mapbox public token 已限制來源與用量。
- Sentry 已設定 environment/release，且不送出旅程標題、地址、備註或預訂確認碼。
- Vercel Preview 通過所有核心驗證。
- 所有已完成任務在 `tasks.md` 標記為 `[X]`。
- 最終憲章合規檢查通過。

## 下一個具體動作

第一階段的本機 Supabase、migration 與真實 RLS 已完成。下一步依序執行：

1. 完成 T021：使用本機 Supabase Auth session 驗證 Trip 建立、讀取、更新、刪除、重新載入持久性與取消刪除不變更。
2. 完成 T022：以 Playwright 驗證登入後的 Trip CRUD 使用者流程。
3. 完成 T031/T032：驗證 Itinerary Item、Place、Booking 的整合資料與手機操作流程。
4. 完成 T050/T059：驗證 Map/Timeline 與 Bookings/Notes 的端對端共享狀態。
5. 最後執行 Phase 8 發布檢核，包含產品狀態、PWA、Sentry、完整 workflow、手機版面與 Vercel Preview。

測試命令需要先從 `supabase status -o env` 取得本機暫存環境變數；不得將 service-role key 寫入版本庫。
