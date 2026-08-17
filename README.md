# Go Anywhere ✈️

**Go Anywhere** 是一款手機優先、繁體中文介面的旅行行程規劃器。從探索下一站、建立旅程，到每日時間軸、地圖、預訂與筆記，一站管理你的旅行細節。

## 目錄

- [功能特色](#功能特色)
- [技術棧](#技術棧)
- [快速開始](#快速開始)
- [環境變數](#環境變數)
- [環境分離](#環境分離)
- [地圖服務（Mapbox）](#地圖服務mapbox)
- [錯誤追蹤（Sentry）](#錯誤追蹤sentry)
- [PWA 與離線限制](#pwa-與離線限制)
- [測試](#測試)
- [專案結構](#專案結構)

## 功能特色

- 🧭 **探索與行程列表**：一覽所有旅程，快速建立新的行程
- 🗺️ **每日時間軸**：依日期分段呈現航班、住宿、交通、景點、餐廳等行程
- 📍 **地圖檢視**：整合 Mapbox，依日期顯示當日行程定位，並支援地址／地點名稱自動定位座標
- 🎫 **預訂管理**：集中檢視有預訂資料的航班與住宿
- 📝 **旅程筆記**：為每趟旅程留下想記住的事
- 👤 **帳戶與私人旅程**：登入後管理僅屬於自己的旅程資料
- 📱 **PWA 支援**：可加入主畫面，離線時仍可瀏覽已載入內容

## 技術棧

| 分類 | 技術 |
| --- | --- |
| 框架 | [Next.js 15](https://nextjs.org/)（App Router）、React 19、TypeScript |
| 資料層 | [Supabase](https://supabase.com/)（Postgres、Auth、Row Level Security） |
| 地圖 | [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) |
| 驗證 | [Zod](https://zod.dev/) |
| 錯誤追蹤 | [Sentry](https://sentry.io/) |
| PWA | next-pwa |
| 測試 | Vitest（單元／整合測試）、Playwright（端對端測試） |

## 快速開始

需要 Node.js 20 LTS、npm 10、Docker Desktop，以及本機 Supabase CLI。

```bash
npm install
npm run dev
```

開發伺服器預設在 http://localhost:3000 啟動。

### 本機資料層（Supabase）

```powershell
$env:Path = "C:\Users\<user>\AppData\Local\Programs\DockerDesktop\resources\bin;" + $env:Path
npx supabase start
npx supabase db reset --yes
npx supabase status -o env
```

將 `supabase status -o env` 輸出的 `API_URL`、`ANON_KEY` 與 `SERVICE_ROLE_KEY` 暫時注入 shell 環境變數；**請勿**把 service-role key 寫入檔案或提交到版本庫。

## 環境變數

複製 [.env.example](.env.example) 為 `.env.local` 並依需求填入：

| 變數 | 說明 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名金鑰（可公開） |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token，用於地圖與地點搜尋 |
| `GOOGLE_PLACES_API_KEY` | 選填，伺服器端使用；設定後地點搜尋會優先改用 Google Places |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry 專案 DSN |
| `SENTRY_ENVIRONMENT` / `SENTRY_RELEASE` | Sentry 環境與版本標記 |
| `SUPABASE_SERVICE_ROLE_KEY` | 僅限 server-side migration／管理流程使用 |
| `E2E_AUTH_SECRET` | 僅限 development／test 的 Playwright 驗證流程 |

## 環境分離

Development 與 Production **必須**使用不同的 Supabase 專案。Production 不得使用本機 URL、測試帳號或本機 service-role key。公開瀏覽器變數只允許 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`NEXT_PUBLIC_MAPBOX_TOKEN` 與 `NEXT_PUBLIC_SENTRY_DSN`。

`SUPABASE_SERVICE_ROLE_KEY` 只可存在於 server-side migration、fixture 或管理流程；它不得出現在 Client Component、`NEXT_PUBLIC_*` 變數或瀏覽器 bundle。

## 地圖服務（Mapbox）

Mapbox public token 不是 server secret，但必須在 Mapbox 後台限制：

- localhost 開發來源
- Vercel Preview 網域
- Production 網域
- 必要的 token scope 與用量上限

地點搜尋預設透過 `/api/places/search`（伺服器端）呼叫 Mapbox geocoding，並支援依地點名稱／地址自動定位座標；若設定 `GOOGLE_PLACES_API_KEY`，會優先改用 Google Places 以提升地標比對準確度。

沒有 token、WebGL 或地圖網路服務時，Timeline 與行程詳情仍然可用；系統會顯示可恢復的地圖 unavailable 狀態。

## 錯誤追蹤（Sentry）

設定 `NEXT_PUBLIC_SENTRY_DSN`、`SENTRY_ENVIRONMENT` 與 `SENTRY_RELEASE`。事件送出前會移除旅程標題、地址、筆記、預訂確認碼、token 與 request body 等敏感欄位。Development、Preview、Production 應使用可區分的 environment/release 值。

## PWA 與離線限制

Service worker 只快取版本化 static shell，不快取 Supabase API、Auth、私人旅程資料或 Mapbox tiles。V1 不支援離線 mutation queue、衝突解決或假裝 mutation 成功；網路中斷時，表單輸入應保留並提示使用者稍後重試。

## 測試

```bash
npm test              # 單元測試（Vitest）
npm run test:integration
npm run lint
npm run build
npm run test:e2e      # Playwright 端對端測試
```

真實 Supabase integration tests 需要本機 Supabase 與 Docker Desktop。Playwright authenticated fixtures 需要暫時的 `E2E_AUTH_SECRET`，只可在 development/test 使用；測試專用 auth route 在 production 會回傳 404。

完整操作與發布前檢核請參考 [specs/001-go-anywhere/quickstart.md](specs/001-go-anywhere/quickstart.md)。

## 專案結構

```text
app/                    # Next.js App Router 頁面與路由
  (app)/                # 已登入使用者的主要頁面（探索、行程、地圖、帳戶…）
  (auth)/                # 登入／註冊
  api/                   # 伺服器端 API routes（例如地點搜尋）
components/             # 跨頁面共用元件（導覽、空狀態、錯誤狀態…）
features/                # 依業務領域切分的邏輯與元件（trips、itinerary、map、bookings、notes）
lib/                     # 共用工具（Supabase client、日期處理等）
tests/                   # 單元、整合與端對端測試
specs/                   # 功能規格與 quickstart 文件
```

