# Tasks: Go Anywhere 旅行行程規劃器

**輸入**：`specs/001-go-anywhere/` 中的 plan.md、spec.md、research.md、data-model.md、contracts/ 與 quickstart.md

**前置條件**：plan.md、spec.md、research.md、data-model.md、contracts/、quickstart.md

**測試策略**：本功能明確要求測試；任務包含 Vitest 單元/整合測試、PostgreSQL RLS 驗證與 Playwright 端對端測試。

**產品語言**：所有使用者可見文字預設使用繁體中文。

## Phase 1: Setup（共享基礎設施）

**目的**：建立 Next.js App Router、TypeScript、測試、PWA 與環境設定基礎。

- [X] T001 建立 Next.js App Router TypeScript 專案與 `package.json`，加入 Next.js、React、Supabase、Mapbox GL JS、Zod、Sentry、Vitest、Playwright 與 PWA tooling 依賴
- [X] T002 [P] 建立 `tsconfig.json`、`next.config.ts`、`eslint.config.mjs` 與專案共用 TypeScript/ESLint 設定
- [X] T003 [P] 建立 `vitest.config.ts`、`playwright.config.ts` 與 `tests/fixtures/` 測試基礎設定，包含可隔離的 Supabase Auth 測試帳號與登入 session fixture
- [X] T004 [P] 建立 `.env.example`，區分公開 Supabase/Mapbox/Sentry 變數與僅 server 使用的 `SUPABASE_SERVICE_ROLE_KEY`
- [X] T005 [P] 建立 `app/layout.tsx`、`app/globals.css`、`app/manifest.ts` 與 `public/icons/` 的繁體中文 PWA metadata、主題色與手機 viewport 設定
- [X] T006 [P] 建立 `components/ui/`、`components/layout/`、`components/navigation/`、`components/forms/` 與 `components/feedback/` 的初始目錄與共用 UI 匯出邊界

## Phase 2: Foundational（阻塞性基礎）

**目的**：建立所有使用者故事共用的資料庫、身份授權、領域型別、錯誤處理、PWA 靜態快取與測試工具。

**⚠️ 重要**：本階段完成前不得開始使用者故事實作。

- [X] T007 建立 `supabase/config.toml`、初始 migration 與 `supabase/seed.sql`，定義 trips、places、itinerary_items、bookings、trip_notes 表、`itinerary_items.place_id` 關聯、`date`/`start_time`/`end_time` 欄位、索引、外鍵、enum、timestamps 與 cascade 規則；位置名稱、地址與座標只保存在 places
- [X] T008 建立 `supabase/migrations/` 的 PostgreSQL RLS policies，限制 trips 與所有旅程子資料只能由 `auth.uid()` 對應的擁有者讀寫
- [X] T009 [P] 建立 `types/database.ts`、`types/domain.ts` 與 `types/ui.ts`，定義 Trip、Place、ItineraryItem、Booking、TripNote、view mode 與 workspace state
- [X] T010 [P] 建立 `lib/supabase/browser.ts`、`lib/supabase/server.ts` 與 `lib/supabase/middleware.ts`，分離瀏覽器 anon client、Server Components/Actions client 與 Auth session refresh
- [X] T011 [P] 建立 `middleware.ts`、`app/(auth)/login/page.tsx` 與 `app/(auth)/callback/route.ts`，實作 Supabase Auth 登入、callback、登出、session 過期導向與未登入保護，且不在錯誤回應暴露私人旅程資訊
- [X] T012 [P] 建立 `lib/validation/` 的共用 Zod 基礎 schema，包含 UUID、日期、時間、座標範圍、旅程類型、URL 與部分完成資料規則
- [X] T013 [P] 建立 `lib/errors/` 的錯誤分類與繁體中文訊息映射，涵蓋驗證、session、RLS、網路、Supabase 儲存與外部服務失敗，並移除敏感欄位
- [X] T014 [P] 建立 `lib/dates/` 的 `YYYY-MM-DD`/`HH:mm` 解析、日期範圍、旅程當地時間與穩定排序工具，明確處理無日期、無時間及相同時間項目
- [X] T015 建立 `components/feedback/LoadingState.tsx`、`EmptyState.tsx`、`ErrorState.tsx`、`SaveError.tsx` 與 `DeleteConfirmDialog.tsx`，統一 loading、empty、success、retry、network 與刪除確認狀態
- [X] T016 [P] 建立 `lib/sentry/` 的 Client/Server 初始化與敏感資料 scrubber，避免標題、地址、筆記、預訂確認碼、token 與 request body 進入事件
- [X] T017 [P] 建立 `service-worker.ts` 與 `lib/pwa/` 的版本化靜態資產/App Shell 快取策略，不快取私人 API、不建立離線 mutation queue，並提供更新與失敗處理
- [X] T018 建立 `tests/integration/rls.test.ts` 與 Supabase 測試 fixture，驗證匿名、其他使用者與擁有者對 trips、itinerary_items、bookings、places、trip_notes 的讀寫邊界
- [X] T019 [P] 建立 `components/navigation/BottomNavigation.tsx` 與 `(app)` layout shell，提供 `探索`、`行程`、`新增`、`預訂`、`我的` 的手機優先導航與最小 44px 觸控目標

**Checkpoint**：資料庫、Auth、RLS、驗證、錯誤狀態、PWA 與測試基礎完成後，使用者故事可獨立開發。

## Phase 3: User Story 1 - 建立並管理私人旅程（Priority: P1）🎯 MVP

**目標**：使用者能建立、查看、編輯與確認刪除自己的旅程，且成功儲存後重新載入仍可恢復。

**獨立測試**：登入後建立含標題、目的地、開始/結束日期的旅程，重新載入確認資料，再編輯並取消/確認刪除。

### User Story 1 測試

- [X] T048 [P] [US4] 建立 `tests/unit/map-selectors.test.ts`，先驗證 active date 篩選、有效成對座標、無效座標排除、marker 順序與空結果
- [X] T049 [P] [US4] 建立 `tests/integration/workspace-sync.test.ts`，先驗證 Timeline/Map 使用同一 ItineraryItem、切換不重設日期、選取 item ID 解析一致與刪除後清除選取
- [X] T050 [P] [US4] 建立 `tests/e2e/timeline-map-sync.spec.ts`，先定義日期保留、marker 詳情、回到 Timeline、無座標項目保留與 Mapbox failure fallback

- [X] T020 [P] [US1] 建立 `tests/unit/trip-schemas.test.ts`，先驗證旅程必填欄位、日期範圍與繁體中文表單錯誤
- [X] T021 [P] [US1] 建立 `tests/integration/trips-crud.test.ts`，先覆蓋擁有者的建立、讀取、更新、刪除、重新載入持久性與取消刪除不變更
- [X] T051 [P] [US4] 建立 `features/map/selectors.ts` 的 active-date coordinate filter 與 marker view model，僅由共享 ItineraryItem selector 衍生
- [X] T052 [P] [US4] 建立 `features/map/mapbox-client.ts` 的 client-only Mapbox 初始化、token/底圖/WebGL/網路錯誤分類與 cleanup
- [X] T053 [US4] 建立 `features/map/components/MapView.tsx`、`MapMarker.tsx` 與 `MapPreview.tsx`，呈現日期 marker 順序、簡短預覽與相同詳情入口
- [X] T054 [US4] 建立 `features/map/components/MapUnavailableState.tsx`，提供 Mapbox 不可用、無座標與無當日 marker 狀態，並提供回到時間軸操作
- [X] T055 [US4] 建立 `features/itinerary/components/WorkspaceViewSwitcher.tsx` 與 `features/itinerary/components/TripWorkspace.tsx`，同步 `view`、`date`、`item` URL 狀態且切換 Timeline/Map 不重設日期
- [X] T056 [US4] 更新 `app/(app)/trips/[tripId]/page.tsx`，分離旅程資料載入與 Mapbox 載入，確保 Mapbox 失敗時 Timeline 與 item detail 仍可操作
- [X] T022 [P] [US1] 建立 `tests/e2e/trip-crud.spec.ts`，先定義登入、建立旅程、重新載入、編輯及刪除確認流程

### User Story 1 實作

- [X] T023 [P] [US1] 建立 `features/trips/schemas.ts` 的建立/更新旅程 schema 與部分欄位錯誤映射
- [X] T024 [P] [US1] 建立 `features/trips/queries.ts` 的擁有者旅程清單與單一旅程查詢，將未授權與不存在統一為安全結果
- [X] T025 [US1] 建立 `features/trips/actions.ts` 的建立、更新、刪除 Server Actions，重複執行時維持 ID 一致並在成功後重新驗證路由
- [X] T026 [US1] 建立 `features/trips/components/TripForm.tsx` 與 `app/(app)/trips/new/page.tsx`，提供手機優先旅程建立表單、日期錯誤、loading、儲存失敗保留輸入與 retry
- [X] T027 [P] [US1] 建立 `features/trips/components/TripCard.tsx`、`TripList.tsx` 與 `app/(app)/trips/page.tsx`，提供旅程清單、載入狀態、空狀態與前往工作區入口
- [X] T028 [US1] 建立 `app/(app)/trips/[tripId]/settings/page.tsx` 與編輯旅程表單，串接更新 action、網路錯誤重試及刪除確認對話框
- [X] T029 [US1] 建立 `app/(app)/layout.tsx`、`app/(app)/page.tsx` 與 `app/(app)/explore/page.tsx` 的登入後旅程入口；`探索` 在 V1 顯示旅程摘要與建立旅程入口，不引入公開內容或推薦資料

**Checkpoint**：US1 可在沒有其他使用者故事的情況下完成旅程建立、編輯、刪除確認與持久性驗證。

## Phase 4: User Story 2 - 建立與維護行程項目（Priority: P1）

**目標**：使用者先選擇六種行程類型，再以分流表單建立、編輯、保存部分完成資料與刪除行程項目。

**獨立測試**：在既有旅程中逐一確認六種類型入口、建立部分完成景點，補充內容、模擬儲存失敗重試，最後取消及確認刪除。

### User Story 2 測試

- [X] T057 [P] [US5] 建立 `tests/unit/booking-note-selectors.test.ts`，先驗證只聚合含 Booking 的現有行程、無 Booking 空狀態與 Note 草稿狀態
- [X] T058 [P] [US5] 建立 `tests/integration/bookings-notes.test.ts`，先驗證 Booking/Note RLS、持久性、更新後與 Timeline/Detail 一致及失敗保留輸入
- [X] T059 [P] [US5] 建立 `tests/e2e/bookings-notes.spec.ts`，先定義預訂檢視回到詳情、空狀態、筆記儲存與重新載入流程

- [X] T030 [P] [US2] 建立 `tests/unit/itinerary-schemas.test.ts`，先驗證六種 type、部分完成欄位、開始/結束時間、座標成對與範圍規則
- [X] T031 [P] [US2] 建立 `tests/integration/itinerary-crud.test.ts`，先覆蓋行程建立、讀取、更新、刪除、部分完成持久性、Booking/Place 關聯與 RLS
- [X] T060 [P] [US5] 建立 `features/bookings/selectors.ts` 的 Booking join/filter selector，從同一份 ItineraryItem 資料衍生預訂檢視
- [X] T061 [P] [US5] 建立 `features/bookings/components/BookingList.tsx`、`BookingCard.tsx` 與空狀態，支援航班/住宿等預訂資訊回到原行程詳情
- [X] T062 [US5] 建立 `app/(app)/bookings/page.tsx` 與旅程工作區 `view=bookings` 檢視，保持 active trip 與共享資料來源
- [X] T063 [P] [US5] 建立 `features/notes/actions.ts`、`features/notes/components/NoteEditor.tsx` 與 `NoteEmptyState.tsx`，提供 Trip Note 儲存、編輯、成功狀態、失敗保留草稿與重試
- [X] T064 [US5] 建立旅程工作區 `view=notes` 與 `app/(app)/trips/[tripId]/notes/page.tsx` 的 Notes 入口，確保重新開啟旅程可恢復已保存筆記
- [X] T032 [P] [US2] 建立 `tests/e2e/itinerary-crud.spec.ts`，先定義類型選擇、分流表單、儲存失敗保留輸入、編輯與刪除確認流程

### User Story 2 實作

- [X] T033 [P] [US2] 建立 `features/itinerary/schemas.ts` 的共用與六種 type-specific Zod schema，定義可保存未完成項目與必要欄位錯誤
- [X] T034 [P] [US2] 建立 `features/itinerary/queries.ts` 的旅程行程查詢，載入同一份 ItineraryItem 並關聯 Place/Booking，不建立 map-specific store
- [X] T035 [US2] 建立 `features/itinerary/actions.ts` 的建立、更新、刪除行程 actions，執行 Server-side Zod 驗證、RLS 操作與成功後共享資料 revalidation
- [X] T036 [P] [US2] 建立 `features/itinerary/components/ItineraryTypePicker.tsx` 與 `app/(app)/trips/[tripId]/items/new/page.tsx`，第一步只呈現航班、住宿、交通、景點、餐廳、其他
- [X] T037 [US2] 建立 `features/itinerary/components/ItineraryForm.tsx` 與六種 type-specific field sections，透過 Place 編輯位置名稱、地址與座標，並提供日期、時間、備註、Booking、loading、save failure 保留輸入與 retry
- [X] T038 [US2] 建立 `features/itinerary/components/ItineraryCard.tsx` 與 `app/(app)/trips/[tripId]/items/[itemId]/edit/page.tsx`，支援行程編輯、未完成標示與手機觸控操作
- [X] T039 [US2] 建立 `features/itinerary/components/DeleteItineraryDialog.tsx`，在 `app/(app)/trips/[tripId]/items/[itemId]/page.tsx` 串接明確刪除確認、取消保留與失敗重試

**Checkpoint**：US2 可獨立完成六種類型分流、新增/編輯/刪除、部分完成保存及錯誤重試；資料可供後續 Timeline、Map、Bookings 使用。

## Phase 5: User Story 3 - 以每日時間軸掌握旅程（Priority: P1）

**目標**：依目前日期分組與穩定排序行程，讓使用者快速找到下一個時間、標題、類型與地點，並從卡片進入詳情。

**獨立測試**：建立跨多日、相同時間及無時間項目，切換日期驗證無遺漏、排序穩定、空狀態與詳情內容。

### User Story 3 測試

- [X] T040 [P] [US3] 建立 `tests/unit/timeline-selectors.test.ts`，先驗證日期分組、日期範圍、開始時間排序、無時間項目、相同時間 tie-breaker 與 100 筆資料
- [X] T041 [P] [US3] 建立 `tests/integration/timeline-data.test.ts`，先驗證時間軸使用已保存 ItineraryItem、更新後資料立即一致與載入錯誤不偽裝為空
- [X] T042 [P] [US3] 建立 `tests/e2e/timeline.spec.ts`，先定義日期切換、時間軸空狀態、卡片詳情與手機 viewport 流程

### User Story 3 實作

- [X] T043 [US3] 建立 `features/itinerary/selectors.ts` 的 `groupByDate`、`sortByTime` 與 active-date selector，採用確定性排序並保留無時間項目
- [X] T044 [P] [US3] 建立 `features/itinerary/components/DateSwitcher.tsx` 與 `DaySummary.tsx`，提供低互動成本的日期切換、目前日期與旅程範圍提示
- [X] T045 [US3] 建立 `features/itinerary/components/Timeline.tsx`、`TimelineDay.tsx` 與 `TimelineEmptyState.tsx`，優先顯示時間、標題、類型、地點、Booking 狀態，長內容移至詳情
- [X] T046 [US3] 更新 `app/(app)/trips/[tripId]/page.tsx` 與 `features/itinerary/queries.ts`，以 `view=timeline&date=YYYY-MM-DD` 載入共享資料並在日期變更時保留 URL 狀態
- [X] T047 [US3] 完善 `app/(app)/trips/[tripId]/items/[itemId]/page.tsx` 詳情體驗，優先呈現標題、日期、時間、地點，並顯示地址、Booking、Notes 與 type-specific details

**Checkpoint**：US3 可獨立提供每日時間軸、空狀態、穩定排序與完整詳情入口。

## Phase 6: User Story 4 - 在時間軸與地圖之間切換（Priority: P1）

**目標**：地圖與時間軸共享同一份資料及 active date，marker 顯示順序並開啟相同詳情；Mapbox 失敗不阻斷 Timeline。

**獨立測試**：在特定日期建立含/不含座標項目，Timeline 切換 Map、選 marker、回 Timeline，並注入 Mapbox 失敗驗證文字行程仍可用。

### User Story 4 測試


### User Story 4 實作


**Checkpoint**：US4 完成後，Timeline 與 Map 可互換且保持日期/項目一致，Mapbox 失敗不會阻斷核心旅程資訊。

## Phase 7: User Story 5 - 集中查看預訂與旅程筆記（Priority: P2）

**目標**：從現有行程資料集中查看 Booking，並保存旅程層級筆記，不建立第二份行程資料。

**獨立測試**：建立含與不含 Booking 的行程，確認預訂篩選與詳情回鏈；建立、修改、重新載入旅程筆記。

### User Story 5 測試


### User Story 5 實作


**Checkpoint**：US5 完成後，預訂與筆記可獨立使用，並與既有旅程/行程資料保持一致。

## Phase 8: Polish & Cross-Cutting Concerns

**目的**：完成跨故事的安全性、PWA、可觀測性、響應式品質、發布檢核與完整 E2E 流程。

- [X] T065 [P] 建立 `tests/e2e/main-trip-workflow.spec.ts`，覆蓋登入 → 建立旅程 → 建立景點 → Timeline → Map → marker 詳情 → 編輯 → 刪除的完整發布前流程
- [X] T066 [P] 建立 `tests/e2e/product-states.spec.ts`，覆蓋 loading、empty trip、save failure、offline/network failure、Mapbox unavailable、delete confirmation 與 retry
- [X] T067 [P] 建立 `tests/e2e/mobile-layout.spec.ts`，使用手機 viewport 驗證底部導航、日期切換、表單、詳情、長繁中標題/地址與 44px 觸控目標不重疊
- [X] T068 [P] 建立 `tests/unit/pwa-manifest.test.ts` 與 `tests/integration/service-worker.test.ts`，驗證 manifest、靜態資產快取、私人 API 不快取與不建立離線 mutation queue
- [X] T069 [P] 建立 `app/api/health/route.ts` 與健康檢查測試，回傳不含敏感資訊的服務狀態並區分可恢復外部服務失敗
- [X] T070 [P] 建立 `lib/auth/` 的 session 過期、登出、帳號切換與瀏覽器快取清理測試，避免跨帳號顯示前一位使用者的私人旅程
- [X] T071 [P] 建立 `lib/sentry/` 的 release/environment 設定與錯誤事件 scrub 測試，確認旅程標題、地址、筆記、Booking confirmation code 不會被送出
- [X] T072 執行 `pnpm lint`、`pnpm test`、`pnpm test:integration`、`pnpm test:e2e` 與 `pnpm build`，修正與本功能相關的失敗並記錄結果於 `specs/001-go-anywhere/quickstart.md`
- [X] T073 [P] 更新 `README.md`、`.env.example` 與 `specs/001-go-anywhere/quickstart.md`，補充 development/production Supabase 分離、Mapbox origin restriction、Vercel、Sentry 與不支援離線 mutation sync 的操作說明
- [X] T074 在 Vercel Preview 以 development Supabase 驗證部署設定，再檢查 `NEXT_PUBLIC_*` bundle 不含 server-only secrets 並記錄發布前憲章合規結果於 `specs/001-go-anywhere/plan.md`
- [X] T075 [P] 建立 `tests/e2e/acceptance-timing.spec.ts`，以固定手機 viewport、測試資料與起訖事件量測 SC-001 的 2 分鐘旅程建立與 SC-002 的 90 秒行程建立門檻
- [X] T076 [P] 建立 `tests/usability/acceptance-protocol.md`，依 spec.md 的驗收協議定義至少 10 位受測者、任務成功判定、測試裝置、外部協助規則與 95%/90% 通過計算方式
- [X] T077 [P] 建立 `tests/usability/results-template.md`，記錄每輪 Timeline/Map 日期保留與下一行程時間/地點查找結果，支援發布前重現 SC-004 與 SC-008

## 相依性與執行順序

### Phase 相依性

- **Phase 1 Setup**：無相依，可立即開始；T002、T003、T004、T005、T006 可平行。
- **Phase 2 Foundational**：依賴 Phase 1；T009-T017、T019 可在 T007/T008 的資料 schema 基礎完成後分批平行，但所有使用者故事都依賴 Phase 2 完成。
- **Phase 3 US1**：依賴 Phase 2；是推薦 MVP，完成後可獨立展示私人旅程 CRUD。
- **Phase 4 US2**：依賴 Phase 2 與 US1 的既有旅程工作區入口；US2 測試與 schema/queries 可先平行，頁面整合依賴 US1 路由。
- **Phase 5 US3**：依賴 Phase 2、US2 的 ItineraryItem 查詢與 US1 的 Trip workspace；selector 與測試可先平行。
- **Phase 6 US4**：依賴 Phase 5 的共享 Timeline、active date 與 item detail；Mapbox client 與 map selector 可平行開發。
- **Phase 7 US5**：依賴 Phase 2 與 US2 的 Booking/Note 資料操作；Booking selector 與 Note editor 可平行，頁面整合後驗證共享資料。
- **Phase 8 Polish**：依賴所有要發布的使用者故事；T065-T071、T075-T077 可平行，T072-T074 在前述變更完成後執行。

### 使用者故事相依性

- **US1（P1）**：依賴 Foundational；提供 MVP 的 Trip CRUD。
- **US2（P1）**：依賴 Foundational 與 US1 的 Trip context；資料 CRUD 本身可獨立測試。
- **US3（P1）**：依賴 US2 的 ItineraryItem 查詢；時間軸 selector 可單獨測試。
- **US4（P1）**：依賴 US3 的 active date 與 item detail；地圖不可用時仍依賴 US3 作為降級檢視。
- **US5（P2）**：依賴 US2 的 Booking/Itinerary 關聯與 Trip context；可在 US3 完成後與 US4 平行實作。

### 各故事內順序

- 測試任務先建立並確認失敗，再實作 schema、queries/actions、元件與頁面整合。
- 資料庫/RLS 與共用型別先於 feature schema；schema 先於 actions；actions/queries 先於頁面；共享 selector 先於 Timeline/Map/Bookings UI。
- 每個故事到達 checkpoint 前，必須通過該故事的 unit、integration 與 E2E 測試。

## 平行執行範例

### Setup / Foundational

```text
T002 Configure TypeScript/Next.js/ESLint files
T003 Configure Vitest/Playwright files
T004 Configure .env.example
T005 Configure manifest and global styling
T006 Create shared UI directories
```

```text
T009 Define shared domain types in types/
T010 Configure Supabase clients in lib/supabase/
T012 Define Zod validation primitives in lib/validation/
T013 Define error taxonomy in lib/errors/
T014 Implement date utilities in lib/dates/
T016 Configure Sentry scrubbing in lib/sentry/
T017 Implement safe service-worker strategy in service-worker.ts and lib/pwa/
T019 Build shared mobile navigation shell in components/navigation/
```

### User Story 1

```text
T020 tests/unit/trip-schemas.test.ts
T021 tests/integration/trips-crud.test.ts
T022 tests/e2e/trip-crud.spec.ts
```

```text
T023 features/trips/schemas.ts
T024 features/trips/queries.ts
T027 features/trips/components/TripCard.tsx and TripList.tsx
```

### User Story 2

```text
T030 tests/unit/itinerary-schemas.test.ts
T031 tests/integration/itinerary-crud.test.ts
T032 tests/e2e/itinerary-crud.spec.ts
```

```text
T033 features/itinerary/schemas.ts
T034 features/itinerary/queries.ts
T036 features/itinerary/components/ItineraryTypePicker.tsx
```

### User Story 3 / 4

```text
T040 tests/unit/timeline-selectors.test.ts
T041 tests/integration/timeline-data.test.ts
T042 tests/e2e/timeline.spec.ts
T048 tests/unit/map-selectors.test.ts
T049 tests/integration/workspace-sync.test.ts
T050 tests/e2e/timeline-map-sync.spec.ts
```

```text
T043 features/itinerary/selectors.ts
T044 DateSwitcher and DaySummary components
T051 features/map/selectors.ts
T052 features/map/mapbox-client.ts
```

### User Story 5 / Polish

```text
T057 tests/unit/booking-note-selectors.test.ts
T058 tests/integration/bookings-notes.test.ts
T059 tests/e2e/bookings-notes.spec.ts
T065 main-trip-workflow.spec.ts
T066 product-states.spec.ts
T067 mobile-layout.spec.ts
T068 PWA tests
T069 health route
T070 auth/session safety tests
T071 Sentry scrub tests
```

## 實作策略

### MVP 優先（只交付 User Story 1）

1. 完成 Phase 1 Setup。
2. 完成 Phase 2 Foundational，尤其是 Supabase Auth、RLS、Trip schema、錯誤狀態與測試 fixture。
3. 完成 Phase 3 US1。
4. 獨立執行 Trip CRUD integration/E2E，確認重新載入持久性、刪除確認與未授權存取。
5. 若品質 gate 通過，可先在 Vercel Preview 展示私人旅程清單與 CRUD。

### 增量交付

1. Setup + Foundational：建立可授權、可測試的基礎。
2. US1：私人旅程 CRUD MVP。
3. US2：六種類型行程建立與維護。
4. US3：每日時間軸與詳情。
5. US4：與時間軸同步的 Mapbox 地圖及優雅降級。
6. US5：預訂彙整與旅程筆記。
7. Polish：完整主要流程、產品狀態、手機品質、PWA、Sentry 與 Vercel 發布檢核。

每個故事完成後都必須先獨立測試，再進入下一個故事；不得以只通過整體 E2E 取代領域單元與 RLS 整合測試。
