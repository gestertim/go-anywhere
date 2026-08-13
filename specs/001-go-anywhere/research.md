# 研究：Go Anywhere 技術決策

**日期**：2026-08-13

## 決策摘要

### 1. Server / Client 邊界

- Next.js App Router 以 Server Components 負責頁面與初始資料載入。
- 表單互動、日期切換、時間軸與地圖切換、Mapbox 及瀏覽器狀態使用 Client Components。
- Supabase SSR client 只在 Server Component、Server Action 或 Route Handler 透過 request cookies 建立。
- 瀏覽器端只使用 anon key 與受 RLS 保護的 Supabase client，不使用 service-role key。
- Mapbox 以 client-only dynamic import 載入，避免 SSR 存取 `window` 或 WebGL。

**理由**：保留 App Router 的伺服器渲染與認證上下文，同時把瀏覽器專屬能力限制在必要範圍。

**替代方案**：全部使用 Client Components 會增加初始 JavaScript 與認證閃爍；自建完整 API 會重複 Supabase 授權與資料存取邏輯。

### 2. Supabase Auth 與 RLS

- 使用 Supabase Auth；所有主要資料表的存取由 PostgreSQL RLS policy 依 `auth.uid()` 強制授權。
- `trips` 以 `owner_id` 直接授權；子資料以 `trip_id` 關聯至擁有者。
- RLS 必須覆蓋 `SELECT`、`INSERT`、`UPDATE`、`DELETE`，並測試匿名、其他使用者與擁有者三種情境。
- 未授權或不存在的旅程統一成無資料或一般授權錯誤，不透露旅程是否存在。

**理由**：授權位於資料層，符合憲章的隱私原則，不依賴 UI 過濾。

**替代方案**：只在 Server Action 檢查容易漏掉新查詢路徑；service-role API 會繞過 RLS 並增加自建授權風險。

### 3. 資料模型與查詢

- 核心表為 `trips`、`places`、`itinerary_items`、`bookings`、`trip_notes`。
- `booking` 是 itinerary item 的附屬資料；預訂檢視以 join 或巢狀查詢彙整，不複製行程。
- 行程使用 `date`、`start_time`、`end_time` 分開保存；格式分別為 `YYYY-MM-DD` 與 `HH:mm`，均採旅程所在地的當地語意。V1 不引入時區欄位、跨時區轉換或跨午夜自動推導。
- 時間軸明確排序：日期、是否有時間、開始時間、結束時間、建立時間、ID。

**理由**：領域責任清楚，支援部分完成行程，且相同時間項目有穩定結果。

**替代方案**：全塞進 itinerary JSONB 或每種類型一張表會削弱 constraint、索引、RLS 與共享檢視的一致性。

### 4. 時間軸與地圖共享狀態

- 所有檢視消費同一份 itinerary item 查詢結果。
- `tripId`、active date、view mode、selected item ID 以 route/search params 表達；Client workspace state 只負責互動同步。
- 共享純函式 selector 負責日期分組、排序與「目前日期且座標有效」的地圖篩選。
- 時間軸和地圖使用同一個 itinerary item ID 開啟詳情。

**理由**：URL 支援重新整理、返回與深連結；共享 selector 避免兩套篩選規則。

**替代方案**：只用 Context 會在重新整理遺失日期；地圖自行查詢會產生第二資料來源。

### 5. Mapbox 優雅失敗

- 使用受 allowed URLs、scope 與用量限制的公開 Mapbox token；不得把它當作 server secret。
- 捕捉初始化、style、WebGL、網路與 token 失敗，顯示地圖不可用狀態並提供回到時間軸或詳情的入口。
- 無效或缺少座標的項目不建立 marker，但維持在時間軸、預訂與詳情。
- 地圖載入不得決定旅程資料是否成功載入。

**理由**：地圖是增強檢視，不是核心資料來源。

**替代方案**：整頁地圖錯誤會阻斷核心資訊；靜態地圖無法滿足互動 marker 詳情需求。

### 6. PWA 快取

- 提供 `manifest.webmanifest`，含繁中名稱、standalone 顯示、主題色、背景色、圖示與手機設定。
- Service worker 只對靜態資產採 precache/cache-first，App shell 可 stale-while-revalidate。
- Supabase API、Auth、私人資料、mutation 與 Mapbox tiles 不做離線寫入佇列或長期個資快取。
- 網路中斷時保留元件中的表單輸入，必要時使用短期 `sessionStorage` 草稿；清楚標示尚未儲存。

**理由**：滿足 PWA 與重試需求，不引入 V1 不需要的衝突解決。

**替代方案**：完整 offline-first queue 會引入認證過期、重試順序與衝突解決複雜度。

### 7. 驗證與錯誤

- Zod schema 依旅程、行程類型、Booking、Note 與座標拆分；Client 與 Server 均驗證。
- 開始日期晚於結束日期拒絕；非核心行程欄位缺漏可保存並標示未完成；無效座標只排除 marker，不拒絕行程。
- 錯誤分類為驗證、登入/session、授權、網路/逾時、Supabase 儲存與 Mapbox 載入失敗。
- 儲存失敗不清空表單，成功後才刷新共享資料與關閉表單；錯誤訊息為繁體中文且不洩漏敏感資料。

### 8. 測試分層

- Vitest 單元測試：日期分組、穩定排序、座標篩選、類型 schema、Booking selector。
- 整合測試：Trip/Itinerary CRUD、RLS、migration、共享資料行為、儲存失敗保留輸入。
- Playwright E2E：登入、建立旅程、建立景點、時間軸、切換地圖、選 marker、編輯、刪除；另測手機 viewport 與 Mapbox 失敗降級。
- Mapbox 外部失敗使用可控 mock 或故障注入，不依賴真實供應商狀態。

### 9. 部署與可觀測性

- Vercel 部署；Preview 與 Production 使用分離 Supabase 環境。
- 可公開環境變數限於 Supabase URL、anon key、Mapbox public token、Sentry DSN；service-role key、migration/admin credentials 僅 server。
- Sentry 追蹤錯誤與效能，先遮罩標題、地址、預訂確認碼、筆記、token 與 request body。
- Mapbox public token 設定來源限制、用量告警；migration 先在 staging 驗證並具備回復策略。

## 結論

V1 架構基線是「Server 驗證與 Supabase RLS 保護資料、共享 selector 保證時間軸與地圖一致、Mapbox 可失敗、PWA 只快取靜態內容、不做離線寫入同步」。此方案符合規格與憲章，並避免 AI、社群、付款、協作及離線衝突同步等推測性架構。
