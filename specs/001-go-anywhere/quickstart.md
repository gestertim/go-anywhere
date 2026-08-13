# Go Anywhere 快速驗證指南

## 前置條件

- Node.js 20 LTS 或專案支援的 LTS 版本。
- npm 10 或相容版本。
- Supabase CLI 與 Docker（執行本機資料庫、Auth、RLS 整合測試時）。
- Mapbox public token，並設定 localhost 與部署網域限制。
- Playwright 所需瀏覽器。
- Vercel、Sentry 與兩個 Supabase 環境（development、production）帳號/專案。

## 環境變數

建立 `.env.local`，只填入本機值；不要提交 secrets：

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ENVIRONMENT=development
SENTRY_RELEASE=go-anywhere-local
SUPABASE_SERVICE_ROLE_KEY=
E2E_AUTH_SECRET=
```

`SUPABASE_SERVICE_ROLE_KEY` 僅供 server-side migration/admin 流程使用，不得在 Client Component 或 `NEXT_PUBLIC_*` 變數使用。
`E2E_AUTH_SECRET` 僅供本機 Playwright session fixture 使用；測試 auth route 在 production 會停用，不能使用正式環境密鑰。

Development 與 Production 必須使用不同 Supabase 專案與不同 Sentry environment/release。Preview deploy 使用 development Supabase，Production deploy 只使用 production Supabase。

## 安裝與本機啟動

```bash
npm install
npm run dev
```

預期結果：應用程式可在本機開啟，未登入時進入登入流程；已登入但沒有旅程時顯示空狀態與建立旅程入口。

## 單元與整合驗證

```bash
npm test
npm run test:coverage
npm run test:integration
```

應驗證：

- Zod 輸入驗證與部分完成行程。
- 日期分組、未填時間與相同時間的穩定排序。
- 地圖目前日期與有效座標篩選。
- Trip/Itinerary CRUD。
- RLS 對匿名、其他使用者及擁有者的讀寫限制。
- Timeline、Map、Bookings、Detail 使用同一行程資料。

詳見 [data-model.md](data-model.md) 與 [contracts/data-access.md](contracts/data-access.md)。

## 端對端驗證

```bash
npx playwright install webkit
npm run test:e2e
```

至少通過以下流程：

1. 使用測試帳號登入。
2. 建立旅程。
3. 選擇 `景點` 並建立含座標的行程。
4. 在時間軸確認項目與日期。
5. 切換到地圖，確認 active date 未改變且 marker 出現。
6. 選取 marker，開啟同一項目詳情。
7. 編輯標題或時間，確認時間軸與地圖資料同步。
8. 刪除項目並完成確認，確認兩個檢視都移除該項目。

另需注入 Mapbox 失敗、網路失敗與儲存失敗，確認時間軸仍可用、表單輸入保留且可重試。

## PWA 與手機驗證

- 使用 Playwright 手機 viewport 檢查底部導航、觸控目標、日期切換、表單與詳情沒有遮擋。
- 確認 manifest 可被瀏覽器辨識並可觸發安裝。
- 重新載入時驗證已成功儲存的旅程、行程與筆記可恢復。
- 在離線狀態確認不會假裝 mutation 成功；未送出的表單仍保留並標示待重試。

## 預備發布驗證

```bash
npm run lint
npm run build
```

在 Vercel Preview 使用 development Supabase 與 Mapbox domain restriction 驗證後，才允許 Production deploy。確認 production 只使用 production Supabase、Sentry environment 與公開 Mapbox token；server-only secrets 不出現在瀏覽器 bundle。

## 目前本機驗證紀錄

- `npm test`：58 個單元與整合測試通過，包含本機 Supabase RLS、Booking/Note、PWA、Auth 與 Sentry 測試。
- `npm run lint`：通過。
- `npm run build`：通過。
- `npm run test:e2e`：12 個 mobile E2E 通過，包含 Trip CRUD、Timeline、Timeline/Map、Booking/Note、產品狀態、手機版面與 PWA smoke；Playwright 使用單 worker 避免 Next dev route compilation race。
- T065 main workflow：在 `npm run build` 後以 `PLAYWRIGHT_USE_PROD=1`、`npm run start` production server 執行，setup + workflow 2 tests 通過；production test auth route 預設關閉，只有明確 opt-in 且提供 `E2E_AUTH_SECRET` 才啟用。
- `npm run test:e2e -- --grep "首頁與 PWA manifest 可用|登入頁在手機上保留清楚的核心操作"`：2 個 mobile smoke tests 通過。
- Supabase CLI `2.114.0` 與 Docker Desktop `4.86.0` 已可用；`supabase db reset` 成功套用 migration。
- 真實 RLS integration 已驗證 owner 可操作自己的 trips、places、itinerary_items、bookings、trip_notes，其他使用者無法讀取或冒用 owner 建立資料。
- generated types 已可由 `npx supabase gen types typescript --local` 產生；完整 mutation E2E 已通過，仍有部分 failure/offline retry 與完整發布 workflow 待補。
