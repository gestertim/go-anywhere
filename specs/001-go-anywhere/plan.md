# 實作計畫：Go Anywhere 旅行行程規劃器

**分支**：`001-go-anywhere` | **日期**：2026-08-13 | **規格**：[spec.md](spec.md)

**輸入**：來自 [spec.md](spec.md) 的核准功能規格與介面需求

**Note**: This template is filled in by the `/speckit.plan` command; its definition describes the execution workflow.

## 摘要

Go Anywhere 是以手機旅途中使用為優先的 Next.js App Router Web App / PWA。V1 提供私人旅程、分流式行程建立、時間軸、地圖、預訂彙整、旅程筆記與完整 CRUD。Supabase Auth 與 PostgreSQL RLS 保護資料；Timeline、Map、Bookings 與 Detail 消費同一份 Itinerary Item 資料；Mapbox 是可失敗的增強檢視，不會阻斷 Timeline。使用 Zod 驗證，Vitest 覆蓋領域規則與整合行為，Playwright 覆蓋主要旅程 E2E，Vercel 部署並以 Sentry 進行隱私最小化的錯誤觀測。

## 技術上下文

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**：TypeScript 5.x、Node.js 20 LTS、Next.js App Router（V1 採專案支援的穩定版本）

**主要依賴**：Next.js、React、Supabase SSR/Auth client、Mapbox GL JS、Zod、Sentry SDK、PWA manifest/service worker tooling

**儲存**：Supabase PostgreSQL；版本化 migration、RLS、索引與 constraints

**測試**：Vitest 單元/整合測試、Playwright 端對端測試、Next.js build/lint

**目標平台**：Vercel 上的 Next.js Web App / PWA；手機優先並支援響應式桌面瀏覽器

**專案類型**：全端 Web application / PWA

**效能目標**：旅程工作區初始內容在一般行動網路下優先顯示文字資料；目前日期只渲染可見行程與 marker；100 個行程項目的日期分組與排序不造成可感知阻塞

**限制**：RLS 為唯一資料授權邊界；不得把 server secrets 送入瀏覽器；Mapbox 失敗不得阻斷 Timeline；PWA 不做離線 mutation queue、衝突解決或複雜同步；預設 UI 為繁體中文

**規模/範圍**：V1 個人私人旅程；核心領域為 Trip、Itinerary Item、Place、Booking、Note；不包含 AI、社群、付款、公開分享、多人協作、完整預算或進階文件管理

## 憲章檢核

*Gate：Phase 0 研究前必須通過；Phase 1 設計完成後再次檢核。*

- **核心體驗優先**：PASS。計畫直接覆蓋建立旅程、行程 CRUD、Timeline、Map。
- **資料正確性與持久性**：PASS。Supabase PostgreSQL、共享 selector、確定性排序與整合/E2E 測試。
- **預設隱私**：PASS。Supabase Auth + PostgreSQL RLS；service-role key 僅 server。
- **優雅降級**：PASS。Mapbox client-only 且可失敗；Timeline 與 Detail 不依賴地圖。
- **清楚的產品狀態**：PASS。所有主要讀寫流程規劃 loading、empty、success、recoverable error、network failure。
- **核心行為測試**：PASS。Vitest、RLS integration、Playwright 主要流程均列入。
- **清楚領域邊界**：PASS。features 依產品領域切分，資料模型分離 Trip/Item/Place/Booking/Note。
- **不提前擴張平台**：PASS。V1 不加入 AI、社群、付款、協作、公開分享或離線 mutation sync。
- **向後安全資料變更**：PASS。版本化 migration、staging 驗證、可回復策略與可選欄位優先。
- **行動優先品質**：PASS。手機 viewport E2E、底部導航、觸控目標與繁中長文字驗證。

## 專案結構

### 本功能文件

```text
specs/001-go-anywhere/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
  ├── workspace-ui.md
  └── data-access.md
```

### 原始碼（專案根目錄）

```text
app/
├── (auth)/
│   ├── login/page.tsx
│   └── callback/route.ts
├── (app)/
│   ├── layout.tsx
│   ├── explore/page.tsx
│   ├── trips/page.tsx
│   ├── trips/new/page.tsx
│   ├── trips/[tripId]/page.tsx
│   ├── trips/[tripId]/settings/page.tsx
│   ├── trips/[tripId]/items/new/page.tsx
│   ├── trips/[tripId]/items/[itemId]/page.tsx
│   ├── trips/[tripId]/items/[itemId]/edit/page.tsx
│   ├── bookings/page.tsx
│   └── settings/page.tsx
├── api/
│   └── health/route.ts
├── manifest.ts
├── layout.tsx
└── page.tsx

features/
├── trips/
│   ├── components/
│   ├── actions.ts
│   ├── queries.ts
│   └── schemas.ts
├── itinerary/
│   ├── components/
│   ├── actions.ts
│   ├── queries.ts
│   ├── selectors.ts
│   └── schemas.ts
├── map/
│   ├── components/
│   ├── selectors.ts
│   └── mapbox-client.ts
├── bookings/
│   ├── components/
│   └── selectors.ts
└── notes/
  ├── components/
  └── actions.ts

components/
├── navigation/
├── layout/
├── feedback/
├── forms/
└── ui/

lib/
├── supabase/
│   ├── browser.ts
│   ├── server.ts
│   └── middleware.ts
├── auth/
├── dates/
├── errors/
├── validation/
├── sentry/
└── pwa/

types/
├── database.ts
├── domain.ts
└── ui.ts

supabase/
├── migrations/
├── seed.sql
└── config.toml

tests/
├── unit/
├── integration/
├── e2e/
└── fixtures/

public/
├── icons/
└── offline-fallback.html

middleware.ts
service-worker.ts
vitest.config.ts
playwright.config.ts
.env.example
```

**結構決策**：採用單一 Next.js 專案，使用 App Router 作為認證、頁面與 route entry points；`features/` 依產品領域承載查詢、actions、selector 與元件；`components/` 僅放跨領域 UI；`lib/` 集中基礎設施整合；`supabase/` 管理 schema/migration；`tests/` 按單元、整合、E2E 分層。這個結構不建立獨立 backend/frontend 專案，也不預留 AI、社群、付款或協作模組。

登入流程使用 Supabase Auth；登入頁、callback、登出與 session 過期處理是 V1 的必要基礎，不得只以 middleware 或測試 fixture 取代。

## 複雜度追蹤

> 憲章檢核沒有 violation，因此本節不新增例外。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| 無 | 不適用 | 不適用 |

## Phase 1 設計後檢核

- **核心體驗與行動優先**：PASS。工作區契約固定底部導航、Timeline/Map 同等主要檢視、日期保留、觸控與繁中狀態。
- **資料與隱私**：PASS。資料模型與 data-access 契約明確定義 RLS、單一來源、穩定排序、migration 與 secrets 邊界。
- **優雅降級與狀態**：PASS。Mapbox、網路、儲存、載入、空狀態、刪除確認均有明確契約與 quickstart 驗證。
- **測試**：PASS。單元、整合、RLS 與 Playwright 流程覆蓋憲章要求。
- **範圍控制**：PASS。未引入離線 mutation sync、AI、社群、付款、協作或公開分享架構。

## T074 Vercel 發布驗證

- Vercel Production deployment：PASS；`main` branch deployment 顯示 `Ready`。
- Production root entry：PASS；根網址會導向登入頁，未登入保護路由會導向 `/login`。
- Development Supabase authentication and CRUD：待手動驗證。
- RLS 跨帳號資料隔離：待手動驗證。
- Frontend bundle server-only secret scan：待手動驗證；確認 `SUPABASE_SERVICE_ROLE_KEY` 與其他 server-only secrets 未進入公開資產後，再完成 T074。
