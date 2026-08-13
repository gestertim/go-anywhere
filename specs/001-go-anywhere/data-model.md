# 資料模型：Go Anywhere

## 概念模型

### User

由 Supabase Auth 管理的身份。應用程式不重複建立可與 Auth 身份分離的使用者主資料表；所有私有資料透過 `auth.uid()` 授權。

### Trip

使用者的私人旅程容器。

| 欄位 | 規則 |
|---|---|
| `id` | UUID 主鍵，建立後不可變更 |
| `owner_id` | UUID，關聯 Supabase Auth user，必填且不可由客戶端任意指定 |
| `title` | 必填字串；前端與 Server 均驗證長度 |
| `destination` | 必填字串；前端與 Server 均驗證長度 |
| `start_date` | 必填日期 |
| `end_date` | 必填日期，須大於或等於 `start_date` |
| `created_at` | Server 產生 |
| `updated_at` | Server 更新 |

關係：一個 User 擁有多個 Trip；一個 Trip 有多個 Itinerary Item、最多一筆 Trip Note。

### Place

行程項目的位置實體。V1 以行程專屬位置為主，不建立可被公開搜尋的地點目錄；每個行程項目最多關聯一個 Place。

| 欄位 | 規則 |
|---|---|
| `id` | UUID 主鍵 |
| `name` | 可選地點名稱 |
| `address` | 可選完整地址 |
| `latitude` | 可選數值，範圍 -90 至 90 |
| `longitude` | 可選數值，範圍 -180 至 180 |

座標必須成對存在且通過範圍驗證；缺少或無效座標不使行程失效，只使其不出現在地圖 marker。

### Itinerary Item

Trip 中的單一活動、交通或預訂。

| 欄位 | 規則 |
|---|---|
| `id` | UUID 主鍵 |
| `trip_id` | 必填，關聯 Trip，刪除旅程時級聯刪除或受明確交易控制 |
| `type` | enum：`flight`、`accommodation`、`transportation`、`attraction`、`restaurant`、`other` |
| `title` | 可保存的描述字串；若允許部分完成，未填時顯示待補完狀態 |
| `date` | 可選，`YYYY-MM-DD`，使用旅程所在地的當地日期 |
| `start_time` | 可選，`HH:mm`，使用旅程所在地的當地時間 |
| `end_time` | 可選，`HH:mm`；若與開始時間同日存在，須不早於 `start_time` |
| `place_id` | 可選，關聯同一擁有者旅程中的 Place |
| `notes` | 可選文字 |
| `created_at` | Server 產生 |
| `updated_at` | Server 更新 |

位置資料只透過 `place_id` 關聯 Place，避免在 Itinerary Item 與 Place 之間形成兩份可互相矛盾的名稱、地址或座標。日期與時間欄位使用旅程所在地的當地語意；V1 不進行跨時區轉換，也不支援跨午夜時間的自動推導。時間軸排序必須使用確定性規則：日期 ASC、有開始時間優先、開始時間 ASC、結束時間 ASC、created_at ASC、id ASC。未填日期的部分完成項目顯示為待補完，未填時間項目仍顯示於其日期群組。

### Booking

Itinerary Item 的可選預訂資料，不是第二份行程資料。

| 欄位 | 規則 |
|---|---|
| `id` | UUID 主鍵 |
| `itinerary_item_id` | 必填且唯一，一對一關聯行程 |
| `confirmation_code` | 可選，敏感資料不得進入公開日誌 |
| `provider_name` | 可選 |
| `reference_url` | 可選 URL |
| `details` | 可選文字或受限 JSON；不得作為任意未驗證資料容器 |
| `created_at` / `updated_at` | Server 產生或更新 |

預訂檢視以 itinerary item join booking 產生；編輯與刪除必須回到原行程項目。

### Trip Note

Trip 層級的簡單文字筆記。

| 欄位 | 規則 |
|---|---|
| `id` | UUID 主鍵 |
| `trip_id` | 必填且唯一，一趟旅程最多一筆 V1 筆記 |
| `content` | 可選文字，儲存空內容時可刪除或保留空狀態，行為需一致 |
| `created_at` / `updated_at` | Server 產生或更新 |

## 狀態與衍生資料

- `active_date`：由旅程日期範圍與 URL 查詢參數決定；不存成資料庫欄位。
- `view_mode`：`timeline`、`map`、`bookings`、`notes`；屬 UI 路由狀態。
- `selected_item_id`：目前選取的行程 ID；由時間軸與地圖共用。
- `has_booking`：由 Booking 關聯衍生，不另存 Boolean，避免與 Booking 不一致。
- `has_coordinates`：由有效 latitude/longitude 衍生，不另存 Boolean。
- `is_incomplete`：可由必填資料完整度或明確完成狀態衍生；若需要資料層持久化，必須定義 migration 與規則，不能由各視圖自行判定。

## 授權規則

- `trips`：`owner_id = auth.uid()` 才能 SELECT/INSERT/UPDATE/DELETE。
- `itinerary_items`、`bookings`、`trip_notes`、`places`：只能透過所屬 Trip 的 owner 查詢或變更；Place 的關聯不得跨使用者或跨旅程。
- INSERT 必須忽略或驗證客戶端傳入的 owner 欄位，避免冒用其他身份。
- 未授權查詢不可回傳其他使用者資料，也不可藉由錯誤訊息洩露旅程存在性。

## 向後相容

- 所有 schema 變更使用版本化 migration。
- 新增可選欄位優先於重命名或刪除欄位。
- 破壞性變更必須提供資料回填、雙讀/雙寫或回復策略，並在 staging 使用既有旅程資料驗證。
- 刪除旅程及級聯子資料必須在 UI 明確確認，並在資料層以交易或可靠的 cascade 保持一致。
