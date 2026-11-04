# 變更記錄

## 2026-11-04 14:56 Asia/Taipei — Codex — 恢復 Firebase Google 登入流程

- AI 執行者：Codex。依照使用者需求，恢復原本 Firebase Authentication Google 登入、登出與 Firestore 帳號資料流程；保留 `prompt=select_account`，讓網站再次登入時要求使用者選擇 Google 帳號。
- Netlify 繼續負責網站部署；移除網站端未使用的 Netlify Identity／Netlify Database profile API 程式、資料表 migration 及其套件依賴。Netlify 雲端 Identity、Database 與其中現有資料未刪除或修改。
- 新增 `docs/TESTING_AND_DEPLOYMENT.md`，明定登入和雲端功能在部署後由使用者透過外部 Chrome 或手機測試；一般排版與文字修改可先本機檢查。
- 程式建置、正式部署與使用者外部登入驗收：待完成。

## 2026-11-04 14:52 Asia/Taipei — Codex — 明確登入測試與部署流程

- AI 執行者：Codex。新增 `docs/TESTING_AND_DEPLOYMENT.md`，區分需部署到外部網站驗收的登入／雲端功能，以及可先在本機檢查的一般介面修改。
- 明定 Codex 內建瀏覽器的登入結果不作為外部網站驗收依據；部署結果、外部測試及使用者驗收須分開記錄。
- 本次僅修改流程文件，未修改登入程式、雲端服務設定或正式網站部署。

## 2026-11-04 14:14 Asia/Taipei — Codex — 登入 API 錯誤處理加固

- AI 執行者：Codex。將登入錯誤提示改為不輸出底層錯誤內容；資料庫函式遇到格式錯誤 Origin 會拒絕請求，資料庫暫時不可用時回覆一般化 503。
- Commit ID：`6d93c4205f0c81014cb912ecbb2bbd843e6f6525`。程式已隨正式版本發布；登入驗收仍待使用者完成 Google OAuth。

## 2026-11-04 14:15 Asia/Taipei — Codex — Netlify 正式部署

- AI 執行者：Codex。正式部署 Commit `71db9781c7c75bafcdb417b6ee7661bfd27d8931` 已成功發布，Netlify Deploy ID `6aeacd98e500ed20ddd3ad72`，建置及部署耗時 15 秒。
- 正式網站 `https://xiaoxue-ai-world.netlify.app/` 已載入新版；按 Google 登入已到達 Google 帳戶選擇頁，確認不再呼叫 Firebase OAuth 彈窗。
- 使用者尚未完成 Google 帳戶選擇與授權，因此 Identity 回呼及資料庫實際寫入仍待使用者完成登入後確認。Firebase 專案和舊資料未刪除。
- 本紀錄只更新文件，提交訊息使用 `[skip netlify]`，避免再次觸發部署。

## 2026-11-04 14:09 Asia/Taipei — Codex — 接入 Netlify Google 登入與帳號資料庫

- AI 執行者：Codex。以 Netlify Identity 的 Google OAuth 取代網站執行階段的 Firebase 登入；載入時處理 OAuth 回呼，並依 Identity 回報的提供者設定確認 Google 登入是否可用。
- 新增 `/api/profile` Netlify Function：伺服器端驗證 Identity 使用者，只以已驗證的使用者 ID 寫入自己的帳號資料；未登入請求回覆 401，寫入請求限定同源，SQL 使用參數化查詢。
- 新增 `user_profiles` 資料表遷移；網站建置會打包 Identity 用戶端，不再把 Firebase 設定或 Firebase SDK 放進發布輸出。Firebase 設定檔與雲端資料仍保留，尚未清理或轉移。
- 本機建置、前端與 Function 語法檢查成功；依賴鎖定檔離線安全稽核顯示 0 vulnerabilities。OAuth 與正式資料庫寫入仍待部署後在 HTTPS 網址驗收。
- 工作分支：`codex/netlify-auth-implementation`。程式碼 Commit ID：`1376a56de26b98b4fac74ce9a3b22b3eac06920d`。正式部署與登入待驗收狀態見本紀錄後續項目。

## 2026-11-04 13:52 Asia/Taipei — Codex — Netlify 登入與資料庫服務啟用

- AI 執行者：Codex。於 Netlify 專案 `xiaoxue-ai-world` 啟用 Identity，並加入預設 Google OAuth 提供者；註冊目前為 Open，Email confirmation 為 Required。
- 在同一個 Netlify 專案建立 Netlify Database；控制台顯示 `Your database is ready!`，Production 分支已建立，目前 0 bytes、尚未建立應用資料表。
- 資料庫控制台目前顯示 1 compute unit、閒置 5 分鐘後休眠；資料庫運作會依 Netlify 的計費方案消耗 credits。
- 此次只完成 Netlify 服務層設定。正式網站程式仍使用 Firebase Auth 與 Firestore，Netlify Identity 登入流程及 Netlify Database API 尚未接入，故尚未完成網站端登入驗證。
- Firebase 專案及資料未刪除、未修改；網站程式碼與正式部署未變動。

## AI 協作與備份節點記錄方式

- 每次 AI 完成修改時，新增一筆紀錄：日期時間與時區、AI 名稱、分支、修改摘要、驗證結果及未完成事項。
- AI 名稱照實記錄，例如 `Codex`、`DeepSeek`、`Claude`；使用者本人所做的修改標記為 `User`，不推測歷史項目的執行者。
- 重要交接點推送到獨立 GitHub 分支，並建立具名 checkpoint tag。回溯時從記錄的 Commit ID 或 tag 建立新分支，不重寫 `main` 歷史。
- 此紀錄涵蓋程式碼與文件；Firebase、Netlify 等雲端資料須另行備份，不會因 GitHub 備份而自動保存。

## 2026-11-04 13:41 Asia/Taipei — Codex — Netlify 部署後交接檢查點

- AI 記錄者：Codex。`dlcs/dlc_spellbook/` 的刪除由使用者明確執行，本檢查點只保存該狀態，不將刪除歸因於 AI。
- 基礎版本：`main`，Commit `098ca36`（Netlify 靜態部署設定）。
- 備份分支：`codex/checkpoint-2026-11-04`。
- 備份標籤：`checkpoint/codex-2026-11-04`。
- 本檢查點包含使用者刻意刪除的 `dlcs/dlc_spellbook/` 檔案，以及本紀錄；根目錄 `啟動本地網站.bat` 的刪除目前未納入備份，待確認後再處理。
- Netlify 網站 `https://xiaoxue-ai-world.netlify.app/` 已成功載入；此檢查點不改動已部署的 `main`。
- 未執行自動化測試；檢查點 Commit ID：`145d8599330acc5e820ed6b382e97ca619af0c7b`。標籤指向此檢查點提交。

## v2.2.0 — 2026-11-03 — 首頁 MP3 播放器

- 在「小雪起居室」橫幅與八個功能格子之間新增小型音樂播放橫板，沿用首頁深色卡片樣式並使用瀏覽器原生播放控制。
- MP3 路徑由 `config.json` 的 `music_player.audio_file` 設定管理。
- 預設音檔路徑為 `assets/audio/homepage-music.mp3`；本次備份包含目前 MP3 檔與資料夾說明，後續以相同檔名覆蓋即可更新音樂。
- 採用瀏覽器原生播放器，保留靜音功能；音符圖示與播放器並排，不顯示標題或副標題文字，並關閉下載和播放速度控制。
- 播放器不會自動播放，訪客需按播放鍵啟動。
- 頁面讀取時會檢查設定的 MP3 檔案是否存在；存在才顯示播放器，移除檔案後重新載入頁面則會隱藏。

### 2026-11-03 備份前檢查

- `node --check main.js` 與 `node --check firebase-connection.js` 通過；`config.json` 可正常解析；`git diff --check` 通過。
- 確認 `assets/audio/homepage-music.mp3` 存在，檔案大小約 4.65 MB；本次一併納入備份。
- 未執行自動化瀏覽器測試。

## v2.1.1 — 2026-11-03 — 登入位置與本機啟動便利性

- 將 Google 登入／登出按鈕移至頁面頂端右側圓形按鈕；登出時顯示 Google 圖示，登入後顯示 Google 帳號頭像，不在介面上顯示帳號名稱或電子郵件。
- 移除「小雪起居室」卡片內原有的登入按鈕，修為狀態框維持在標題下方靠上排列。
- Google 登入要求顯示帳號選擇器，方便選擇其他 Google 帳號；使用者已確認重新載入後登入流程正常，登出確認流程正常。
- 新增 `啟動本地網站.bat`，雙擊後開啟 `http://localhost:8000/index.html` 並啟動本機 HTTP 伺服器；使用期間需保持命令視窗開啟。
- 將 `config.json` 版本更新為 `v2.1.1`，更新日期為 `2026-11-03`。

### 本次備份前檢查

- `node --check main.js` 與 `node --check firebase-connection.js` 通過。
- `config.json`、`firebase-config.json`、`.firebaserc`、`firebase.json` 均可解析為 JSON。
- `git diff --check` 通過；未執行自動化瀏覽器測試。使用者已在瀏覽器確認登入、帳號選擇器與登出流程正常。

## 2026-11-03 — 母專案 Firebase Google 登入

- 加入 Firebase Web 設定與共用連線程式，母專案使用 Firebase Authentication 和 `(default)` Firestore。
- Google 登入成功後，以 `/users/{uid}` 儲存或更新帳號 UID、顯示名稱、電子郵件、頭像網址和登入時間。
- 登入與登出改由同一顆按鈕依狀態切換。登入後顯示 Google 帳號名稱、電子郵件與頭像；點擊後會先確認再登出。
- 右上角未登入時顯示 Google 圖示，登入後顯示 Google 帳號頭像。
- 加入 Firestore 規則：使用者只能讀寫自己的 `/users/{uid}` 文件；未來 DLC 資料可放在該使用者文件下的 `dlcs` 子集合。
- 加入 `firebase.json`、`.firebaserc`、`firebase-config.json`、`firebase-connection.js`、`firestore.rules` 和 Google 圖示資源。
- Firebase Console 中的 Google 登入提供者及支援信箱由使用者手動啟用；此 Console 狀態不會由 Git 記錄。
- 本機測試需透過 HTTP 開啟，例如 `py -m http.server 8000 --bind localhost`，再瀏覽 `http://localhost:8000/index.html`；直接以 `file://` 開啟無法載入 Firebase 設定。

### 工作區原有的母程式／DLC 分離變更

- 從母程式移除 Spellbook 的內嵌場景、控制邏輯、樣式及主畫面連結；獨立的 `dlcs/dlc_spellbook/` 專案原始碼未修改。
- `dlcs/data_bundle.js`、`implementation_plan.md`、`task.md` 在本次備份前已處於刪除狀態；本次記錄並納入目前工作區版本。

### 掃描紀錄

- `main.js` 語法檢查通過；`config.json`、`firebase-config.json`、`.firebaserc`、`firebase.json` 均可解析。
- `git diff --check` 通過，並檢查了 Firebase 設定、Firestore 規則、主程式登入狀態切換及刪除項目的引用。
- 使用者已確認登入介面目前可以運作；本次未執行自動化測試。
