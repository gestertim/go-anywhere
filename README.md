# Go Anywhere

Go Anywhere 是手機優先的繁體中文旅行行程規劃器，提供私人旅程、行程項目、每日時間軸、地圖、預訂與旅程筆記。

## 開發

需要 Node.js 20 LTS、npm 10、Docker Desktop，以及本機 Supabase CLI。

```bash
npm install
npm run dev
```

本機資料層：

```powershell
$env:Path = "C:\Users\<user>\AppData\Local\Programs\DockerDesktop\resources\bin;" + $env:Path
npx supabase start
npx supabase db reset --yes
npx supabase status -o env
```

將 `supabase status -o env` 的 `API_URL`、`ANON_KEY` 與 `SERVICE_ROLE_KEY` 暫時注入 shell；不要把 service-role key 寫入檔案或版本庫。

## 環境分離

Development 與 Production 必須使用不同 Supabase 專案。Production 不得使用本機 URL、測試帳號或本機 service-role key。公開瀏覽器變數只允許 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`NEXT_PUBLIC_MAPBOX_TOKEN` 與 `NEXT_PUBLIC_SENTRY_DSN`。

`SUPABASE_SERVICE_ROLE_KEY` 只可存在於 server-side migration、fixture 或管理流程；它不得出現在 Client Component、`NEXT_PUBLIC_*` 變數或瀏覽器 bundle。

## Mapbox

Mapbox public token 不是 server secret，但必須在 Mapbox 設定中限制：

- localhost 開發來源
- Vercel Preview 網域
- Production 網域
- 必要的 token scope 與用量上限

沒有 token、WebGL 或地圖網路服務時，Timeline 與行程詳情仍然可用；系統會顯示可恢復的地圖 unavailable 狀態。

## Sentry

設定 `NEXT_PUBLIC_SENTRY_DSN`、`SENTRY_ENVIRONMENT` 與 `SENTRY_RELEASE`。事件送出前會移除旅程標題、地址、筆記、預訂確認碼、token 與 request body 等敏感欄位。Development、Preview、Production 應使用可區分的 environment/release 值。

## PWA 與離線限制

Service worker 只快取版本化 static shell，不快取 Supabase API、Auth、私人旅程資料或 Mapbox tiles。V1 不支援離線 mutation queue、衝突解決或假裝 mutation 成功；網路中斷時，表單輸入應保留並提示使用者稍後重試。

## 測試

```bash
npm test
npm run test:integration
npm run lint
npm run build
npm run test:e2e
```

真實 Supabase integration tests 需要本機 Supabase 與 Docker Desktop。Playwright authenticated fixtures 需要暫時的 `E2E_AUTH_SECRET`，只可在 development/test 使用；測試專用 auth route 在 production 會回傳 404。

完整操作與發布前檢核請參考 [specs/001-go-anywhere/quickstart.md](specs/001-go-anywhere/quickstart.md)。
