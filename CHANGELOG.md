# 變更記錄

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
